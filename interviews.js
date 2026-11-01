'use strict';

// Google Form responses, read from the response sheet published as CSV. Renders a card per
// consented response wherever #response-list exists (interviews.html and M2 on index.html), and
// a single response on interviews.html?response=<id>.
const responseFeedUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4MmRmc0AGn-9r2FPGD1cXoxYTsavpeh1iqycy8k1IHjdfFQ2_KYfOemNDMt9aBmypl3E4C02GM012/pub?gid=177077202&single=true&output=csv';
const publicConsent = 'I consent to public display of my full response on the LogiQ Fiki website.';
// Submitted before the form asked for consent; approved individually. Only the first row with
// each tag counts, so a later submission reusing the name still needs the consent box.
const legacyApprovedTags = new Set(['matias']);
const recordedInterviews = { gabi: './transcripts/gabi.html', baldo: './transcripts/baldo.html' };

const responseList = document.getElementById('response-list');
const responseDetail = document.getElementById('response-detail');
const responseStatus = document.getElementById('response-status');

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

function createResponseCard(response, headingLevel) {
  const card = document.createElement('article');
  card.className = 'response-card';
  const heading = document.createElement(`h${headingLevel}`);
  heading.append(makeLink('', `./interviews.html?response=${encodeURIComponent(response.id)}`, response.tag));
  card.append(heading);
  const metadata = [response.age, response.occupation].filter(Boolean).join(' · ');
  if (metadata) card.append(makeTextElement('p', 'response-metadata', metadata));
  const links = makeTextElement('p', 'response-card-links', '');
  links.append(makeLink('response-card-link', `./interviews.html?response=${encodeURIComponent(response.id)}`, 'Read form responses →'));
  if (recordedInterviews[response.key]) links.append(makeLink('response-card-link', recordedInterviews[response.key], 'Recorded interview →'));
  card.append(links);
  return card;
}

function renderResponseDetail(response) {
  responseList.hidden = true;
  responseStatus.hidden = true;
  responseDetail.hidden = false;
  responseDetail.replaceChildren(makeLink('text-link response-back', './interviews.html#form-responses', '← All form responses'));
  responseDetail.append(makeTextElement('p', 'eyebrow', 'GOOGLE FORM RESPONSE'));
  const heading = makeTextElement('h3', 'response-title', response.tag);
  heading.tabIndex = -1;
  responseDetail.append(heading);

  const metadata = [response.age, response.occupation, response.timestamp].filter(Boolean).join(' · ');
  if (metadata) responseDetail.append(makeTextElement('p', 'response-metadata', metadata));
  if (recordedInterviews[response.key]) {
    responseDetail.append(makeLink('text-link', recordedInterviews[response.key], 'Recorded interview and transcript →'));
  }

  const answerList = document.createElement('div');
  answerList.className = 'response-answers';
  for (const item of response.answers) {
    const answer = document.createElement('article');
    answer.className = 'response-answer';
    answer.append(makeTextElement('h4', '', item.question));
    answer.append(makeTextElement('p', '', item.answer || 'No response provided.'));
    answerList.append(answer);
  }
  responseDetail.append(answerList);
  document.title = `Form responses: ${response.tag} — LogiQ`;
  heading.focus({ preventScroll: true });
  responseDetail.scrollIntoView({ block: 'start' });
}

async function loadResponses() {
  if (!responseList || !responseStatus) return;
  try {
    const feed = await fetch(`${responseFeedUrl}&refresh=${Date.now()}`, { cache: 'no-store' });
    if (!feed.ok) throw new Error(`The response feed returned ${feed.status}.`);
    const responses = parseResponses(await feed.text());
    const requestedId = responseDetail && new URLSearchParams(window.location.search).get('response');

    if (requestedId) {
      const selected = responses.find((response) => response.id === requestedId);
      if (selected) {
        renderResponseDetail(selected);
        return;
      }
      responseStatus.textContent = 'This response is unavailable or has not been approved for public display. ';
      responseStatus.append(makeLink('text-link', './interviews.html#form-responses', 'See all form responses'));
    }

    const headingLevel = Number(responseList.dataset.headingLevel) || 3;
    responseList.replaceChildren(...responses.map((response) => createResponseCard(response, headingLevel)));
    if (!requestedId) {
      responseStatus.textContent = responses.length
        ? `${responses.length} consented response${responses.length === 1 ? '' : 's'}.`
        : 'No consented responses are available yet.';
    }
  } catch (error) {
    responseStatus.textContent = 'Form responses could not be loaded right now. Please try again later.';
    console.error(error);
  }
}

loadResponses();
