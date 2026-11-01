'use strict';

// Google Form responses, read from the response sheet published as CSV. Renders one collapsible
// entry per consented response wherever #response-list exists (interviews.html and M2 on
// index.html); interviews.html#response-<id> opens a single response.
const responseFeedUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4MmRmc0AGn-9r2FPGD1cXoxYTsavpeh1iqycy8k1IHjdfFQ2_KYfOemNDMt9aBmypl3E4C02GM012/pub?gid=177077202&single=true&output=csv';
const publicConsent = 'I consent to public display of my full response on the LogiQ Fiki website.';
// Submitted before the form asked for consent; approved individually. Only the first row with
// each tag counts, so a later submission reusing the name still needs the consent box.
const legacyApprovedTags = new Set(['matias']);
const recordedInterviews = { gabi: './transcripts/gabi.html', baldo: './transcripts/baldo.html' };

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
  const firstAnswerIndex = column(/online claim or argument/i);
  if (tagIndex < 0 || consentIndex < 0 || firstAnswerIndex < 0) {
    throw new Error('The response sheet no longer has the expected name, consent and question columns.');
  }
  const lastAnswerIndex = consentIndex > firstAnswerIndex ? consentIndex : headers.length;
  const answerIndexes = [];
  for (let index = firstAnswerIndex; index < lastAnswerIndex; index += 1) {
    if (![timestampIndex, ageIndex, occupationIndex, tagIndex].includes(index)) answerIndexes.push(index);
  }

  const seenTags = new Set();
  const usedIds = new Map();
  const responses = [];
  for (const row of rows) {
    const cell = (index) => (index >= 0 ? normalize(row[index]) : '');
    const tag = cell(tagIndex);
    const key = slugify(tag);
    const isFirstWithTag = tag && !seenTags.has(key);
    seenTags.add(key);
    const consented = cell(consentIndex) === publicConsent || (isFirstWithTag && legacyApprovedTags.has(key));
    if (!tag || !consented || cell(ageIndex) === 'Under 18') continue;

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
  return responses;
}

// M2 findings: one line per consented respondent, linking to their answers on the same page.
function renderSurveyFindings(responses) {
  if (!surveyFindings) return;
  if (!responses.length) {
    surveyFindings.replaceChildren(makeTextElement('li', '', 'No consented survey responses yet.'));
    return;
  }
  surveyFindings.replaceChildren(...responses.map((response) => {
    const item = document.createElement('li');
    item.append(makeLink('', `#response-${response.id}`, response.tag));
    const metadata = [response.age, response.occupation].filter(Boolean).join(' · ');
    if (metadata) item.append(` (${metadata})`);
    item.append(' — full answers in the survey section.');
    return item;
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

async function loadResponses() {
  if (!responseList || !responseStatus) return;
  try {
    const feed = await fetch(`${responseFeedUrl}&refresh=${Date.now()}`, { cache: 'no-store' });
    if (!feed.ok) throw new Error(`The response feed returned ${feed.status}.`);
    const responses = parseResponses(await feed.text());
    const headingLevel = Number(responseList.dataset.headingLevel) || 3;
    responseList.replaceChildren(...responses.map((response) => createResponseItem(response, headingLevel)));
    responseStatus.textContent = responses.length
      ? `${responses.length} consented response${responses.length === 1 ? '' : 's'}. Select a name to read the answers.`
      : 'No consented responses are available yet.';
    renderSurveyFindings(responses);
    openRequestedResponse();
    window.addEventListener('hashchange', openRequestedResponse);
  } catch (error) {
    responseStatus.textContent = 'Form responses could not be loaded right now. Please try again later.';
    if (surveyFindings) surveyFindings.replaceChildren(makeTextElement('li', '', 'Survey responses could not be loaded right now.'));
    console.error(error);
  }
}

loadResponses();
