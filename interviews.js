'use strict';

// Google Form responses, read live from the response sheet published as CSV (re-read every two
// minutes and whenever the tab becomes visible). interviews.html shows one collapsible entry per
// consented response (#response-<id> opens one); findings.html lists every respondent with the
// team's summary, or marks the response as new until it has been reviewed.
const responseFeedUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4MmRmc0AGn-9r2FPGD1cXoxYTsavpeh1iqycy8k1IHjdfFQ2_KYfOemNDMt9aBmypl3E4C02GM012/pub?gid=177077202&single=true&output=csv';
const publicConsent = 'I consent to public display of my full response on the LogiQ Fiki website.';
// Submitted before the form asked for consent; approved individually. Only the first row with
// each tag counts, so a later submission reusing the name still needs the consent box.
const legacyApprovedTags = new Set(['matias']);
const recordedInterviews = { gabi: './transcripts/gabi.html', baldo: './transcripts/baldo.html' };
// Team-written summaries of reviewed survey responses, keyed by response id (as in #response-<id>).
// Responses without an entry are shown as new and not yet reviewed.
const reviewedSummaries = {};
const refreshInterval = 2 * 60 * 1000;

const responseList = document.getElementById('response-list');
const responseStatus = document.getElementById('response-status');
const surveyFindings = document.getElementById('survey-findings');

const normalize = (text) => (text || '').replace(/\s+/g, ' ').trim();
const slugify = (text) => normalize(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'response';

function makeTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function makeLink(className, href, text) {
  const link = makeTextElement('a', className, text);
  link.href = href;
  return link;
}

// RFC 4180 CSV, as exported by Google Sheets: quoted fields may contain commas, quotes and newlines.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = text.charCodeAt(0) === 0xfeff ? 1 : 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(field); field = ''; }
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((cells) => cells.some((cell) => cell.trim()));
}

function parseResponses(csvText) {
  const [headers = [], ...rows] = parseCsv(csvText);
  const column = (pattern) => headers.findIndex((header) => pattern.test(header));
  const timestampIndex = column(/^\s*timestamp\s*$/i);
  const ageIndex = column(/age range/i);
  const occupationIndex = column(/occupation|field of study/i);
  const tagIndex = column(/participant name or tag/i);
  const consentIndex = column(/consent to public display/i);
  if (consentIndex < 0) throw new Error('The response sheet no longer has the public-display consent column.');
  // Every other column is an answer, so questions added to the form later are never dropped.
  // Email addresses are never shown.
  const metadataIndexes = new Set([timestampIndex, ageIndex, occupationIndex, tagIndex, consentIndex]);
  const answerIndexes = headers.map((header, index) => index)
    .filter((index) => !metadataIndexes.has(index) && !/e-?mail/i.test(headers[index]));

  const seenTags = new Set();
  const usedIds = new Map();
  const responses = [];
  let hidden = 0;
  for (const row of rows) {
    const cell = (index) => (index >= 0 ? normalize(row[index]) : '');
    const tag = cell(tagIndex) || 'Anonymous respondent';
    const key = slugify(tag);
    const isFirstWithTag = cell(tagIndex) && !seenTags.has(key);
    seenTags.add(key);
    const consented = cell(consentIndex) === publicConsent || (isFirstWithTag && legacyApprovedTags.has(key));
    if (!consented || cell(ageIndex) === 'Under 18') {
      hidden += 1;
      continue;
    }

    const count = (usedIds.get(key) || 0) + 1;
    usedIds.set(key, count);
    responses.push({
      id: count === 1 ? key : `${key}-${count}`,
      key,
      tag,
      timestamp: cell(timestampIndex),
      age: cell(ageIndex),
      occupation: cell(occupationIndex),
      answers: answerIndexes.map((index) => ({ question: normalize(headers[index]), answer: (row[index] || '').trim() }))
    });
  }
  return { responses, hidden };
}

// findings.html: every consented respondent, with the team's summary once the response is reviewed.
function renderSurveyFindings(responses) {
  if (!surveyFindings) return;
  if (!responses.length) {
    surveyFindings.replaceChildren(makeTextElement('p', 'small-note', 'No consented survey responses yet.'));
    return;
  }
  surveyFindings.replaceChildren(...responses.map((response) => {
    const entry = document.createElement('article');
    entry.className = 'survey-finding';
    const heading = makeTextElement('h3', '', response.tag);
    const summary = reviewedSummaries[response.id];
    heading.append(makeTextElement('span', summary ? 'review-badge review-badge-done' : 'review-badge', summary ? 'Reviewed' : 'New response · not yet reviewed'));
    entry.append(heading);
    const metadata = [response.age, response.occupation, response.timestamp && `submitted ${response.timestamp}`].filter(Boolean).join(' · ');
    if (metadata) entry.append(makeTextElement('p', 'response-metadata', metadata));
    if (summary) {
      const list = document.createElement('ul');
      list.className = 'evidence-list';
      list.append(...summary.map((point) => makeTextElement('li', '', point)));
      entry.append(list);
    } else {
      entry.append(makeTextElement('p', 'small-note', 'This response appeared automatically and has not been summarised yet.'));
    }
    entry.append(makeLink('text-link', `./interviews.html#response-${response.id}`, 'Read the full answers →'));
    return entry;
  }));
}

function createResponseItem(response, headingLevel) {
  const item = document.createElement('details');
  item.className = 'response-item';
  item.id = `response-${response.id}`;

  const summary = document.createElement('summary');
  summary.append(makeTextElement('span', 'response-name', response.tag));
  const metadata = [response.age, response.occupation].filter(Boolean).join(' · ');
  summary.append(makeTextElement('span', 'response-metadata', metadata));
  summary.append(makeTextElement('span', 'expand-icon', '+'));
  summary.lastChild.setAttribute('aria-hidden', 'true');
  item.append(summary);

  const body = document.createElement('div');
  body.className = 'response-body';
  for (const entry of response.answers) {
    const answer = document.createElement('div');
    answer.className = 'response-answer';
    answer.append(makeTextElement(`h${headingLevel}`, '', entry.question));
    answer.append(makeTextElement('p', '', entry.answer || 'No response provided.'));
    body.append(answer);
  }
  const links = makeTextElement('p', 'response-links', '');
  if (recordedInterviews[response.key]) links.append(makeLink('', recordedInterviews[response.key], 'Recorded interview and transcript →'));
  links.append(makeLink('', `./interviews.html#${item.id}`, 'Link to this response'));
  if (response.timestamp) links.append(makeTextElement('span', 'response-timestamp', `Submitted ${response.timestamp}`));
  body.append(links);
  item.append(body);
  return item;
}

// Opens the response named in the URL: #response-<id>, or ?response=<id> from earlier links.
function openRequestedResponse() {
  const requestedId = window.location.hash.startsWith('#response-')
    ? decodeURIComponent(window.location.hash.slice('#response-'.length))
    : new URLSearchParams(window.location.search).get('response');
  if (!requestedId) return;
  const item = document.getElementById(`response-${requestedId}`);
  if (!item) {
    responseStatus.textContent = 'That response is unavailable or has not been approved for public display.';
    return;
  }
  item.open = true;
  item.scrollIntoView({ block: 'start' });
  item.querySelector('summary').focus({ preventScroll: true });
}

function renderResponseList(responses, hidden) {
  if (!responseList) return;
  const openIds = new Set([...responseList.querySelectorAll('details[open]')].map((item) => item.id));
  const headingLevel = Number(responseList.dataset.headingLevel) || 3;
  responseList.replaceChildren(...responses.map((response) => {
    const item = createResponseItem(response, headingLevel);
    item.open = openIds.has(item.id);
    return item;
  }));
  const shown = responses.length
    ? `${responses.length} consented response${responses.length === 1 ? '' : 's'}. Select a name to read the answers.`
    : 'No consented responses are available yet.';
  responseStatus.textContent = hidden
    ? `${shown} ${hidden} other response${hidden === 1 ? ' is' : 's are'} hidden because ${hidden === 1 ? 'it lacks' : 'they lack'} public-display consent or ${hidden === 1 ? 'is' : 'are'} from someone under 18.`
    : shown;
}

let loadedOnce = false;
async function loadResponses() {
  if (!responseList && !surveyFindings) return;
  try {
    const feed = await fetch(`${responseFeedUrl}&refresh=${Date.now()}`, { cache: 'no-store' });
    if (!feed.ok) throw new Error(`The response feed returned ${feed.status}.`);
    const { responses, hidden } = parseResponses(await feed.text());
    renderSurveyFindings(responses);
    renderResponseList(responses, hidden);
    if (!loadedOnce && responseList) {
      openRequestedResponse();
      window.addEventListener('hashchange', openRequestedResponse);
    }
    loadedOnce = true;
  } catch (error) {
    // Keep what is already on screen if a background refresh fails.
    if (!loadedOnce) {
      if (responseStatus) responseStatus.textContent = 'Form responses could not be loaded right now. Please try again later.';
      if (surveyFindings) surveyFindings.replaceChildren(makeTextElement('p', 'small-note', 'Survey responses could not be loaded right now.'));
    }
    console.error(error);
  }
}

loadResponses();
setInterval(loadResponses, refreshInterval);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') loadResponses();
});
