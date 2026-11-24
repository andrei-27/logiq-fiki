'use strict';

const newsSamples = window.LOGIQ_NEWS;
const $ = (id) => document.getElementById(id);
const reviewed = new Set();
let readingVisible = false;
let savedReadingTop = 0;
let savedWindowTop = 0;
const state = { sample: 'repair', surface: 'browser', device: 'desktop', view: 'reading', timer: null, revision: 0 };
const key = () => `${state.sample}:${state.surface}:${state.device}`;
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function add(parent, ...nodes) { parent.append(...nodes.filter(Boolean)); return parent; }
function p(text, className = '') { return element('p', className, text); }
function route(view, overrides = {}) {
  const params = new URLSearchParams({ sample: state.sample, surface: state.surface, device: state.device, ...overrides });
  return `#${view}?${params}`;
}
function go(view, overrides = {}, replace = false) {
  const hash = route(view, overrides);
  if (replace) { history.replaceState(null, '', hash); render(); }
  else if (location.hash === hash) render();
  else location.hash = hash;
}
function sourceBlock(source) {
  const box = element('details', 'source-details');
  const summary = element('summary'); add(summary, element('span', '', source.publisher));
  const body = element('div', 'source-detail-body');
  const external = element('a', 'source-original', 'Open original source');
  external.href = source.url; external.target = '_blank'; external.rel = 'noopener noreferrer';
  add(body, element('h4', '', source.title), p(source.date, 'source-date'), p(source.note), p(source.limitation, 'quiet-copy'), external);
  return add(box, summary, body);
}
function claimBlock(claim, sample, number) {
  const block = element('details', 'claim-detail'); block.open = number === 0;
  const summary = element('summary');
  add(summary, element('span', `claim-badge ${claim.status}`, claim.label), element('span', 'claim-text', claim.text));
  const body = element('div', 'claim-detail-body');
  add(body, p(claim.explanation), p(claim.context, 'claim-context'));
  const sources = element('div', 'claim-sources'); add(sources, element('h4', '', claim.evidence.length ? 'Follow the evidence' : 'What is missing?'));
  if (claim.evidence.length) {
    for (const id of claim.evidence) { const source = sample.sources.find(item => item.id === id); if (source) sources.append(sourceBlock(source)); }
  } else add(sources, p('A dated announcement from an identifiable authority. No such source is included in this sample.', 'quiet-copy'));
  add(body, sources, p(claim.question, 'reflection-question'));
  return add(block, summary, body);
}
function renderReview(sample) {
  const body = $('review-content');
  const title = element('h2', '', 'Here’s what needs a closer look.'); title.id = 'review-title'; title.tabIndex = -1;
  const claims = element('div', 'claim-list'); sample.claims.forEach((claim, n) => claims.append(claimBlock(claim, sample, n)));
  const back = element('button', 'button button-dark continue-reading', 'Close and keep reading →'); back.type = 'button'; back.addEventListener('click', closeReview);
  body.replaceChildren(p('THE STORY, IN CONTEXT', 'eyebrow'), title, p(sample.summary, 'panel-description'), claims, back);
}
function renderArticle(sample) {
  const story = $('reading-article');
  const masthead = element('div', 'article-publication'); add(masthead, element('strong', '', 'CIVIC WIRE'), element('span', '', 'Sample edition'));
  story.replaceChildren(masthead, p(sample.topic, 'eyebrow'), element('h2', '', sample.title), p(sample.lead, 'article-lead'), p(sample.publisher, 'article-byline'), ...sample.paragraphs.map(text => p(text, 'article-paragraph')));
}
function feedPost(author, initials, text, className = '') {
  const post = element('article', `feed-post ${className}`);
  const header = element('div', 'post-header');
  const authorBlock = element('div'); add(authorBlock, element('strong', '', author), element('span', '', 'Shared with the community · Sample post'));
  add(header, element('span', 'post-avatar', initials), authorBlock);
  add(post, header, p(text, 'post-text'));
  return post;
}
function renderFeed(sample) {
  const feed = $('social-feed');
  const intro = feedPost('Local community', 'LC', 'A little good news: the weekend repair café is back. What are you hoping to fix?', 'ambient-post');
  const selected = feedPost('Mara S.', 'MS', sample.lead, 'selected-post');
  const preview = element('div', 'shared-story');
  add(preview, p(sample.topic, 'eyebrow'), element('h2', '', sample.title), p(sample.paragraphs[0]), p('civic-wire.example · Sample story', 'story-domain'));
  add(selected, preview, element('div', 'post-reactions', '24 reactions · 6 comments · 3 shares'));
  const comment = element('div', 'sample-comment'); add(comment, element('strong', '', 'Alex'), p('I saw this too. Does anyone have the original source?'));
  add(selected, comment);
  const next = feedPost('Your neighborhood', 'YN', 'The community garden is looking good this week. Thanks to everyone who helped.', 'ambient-post');
  feed.replaceChildren(intro, selected, next);
}
function renderChrome(sample) {
  const chrome = $('scene-context');
  if (state.surface === 'feed') {
    chrome.replaceChildren(element('strong', 'feed-brand', 'community'));
  } else {
    chrome.replaceChildren(element('span', 'address-bar', sample.url.replace('https://', '')));
  }
}
function setIndicator(ready) {
  $('review-indicator').hidden = !ready;
}
function render() {
  clearTimeout(state.timer); state.revision += 1;
  const [requested = 'reading', query = ''] = location.hash.slice(1).split('?');
  const params = new URLSearchParams(query);
  state.sample = Object.hasOwn(newsSamples, params.get('sample')) ? params.get('sample') : 'repair';
  state.surface = params.get('surface') === 'feed' ? 'feed' : 'browser';
  state.device = params.has('device') ? (params.get('device') === 'mobile' ? 'mobile' : 'desktop') : (matchMedia('(max-width: 720px)').matches ? 'mobile' : 'desktop');
  // Direct result links open the expanded review.
  state.view = ['alert', 'review'].includes(requested) ? requested : ['results', 'claim', 'sources', 'share'].includes(requested) ? 'review' : 'reading';
  const sample = newsSamples[state.sample];
  if (state.view !== 'reading') reviewed.add(key());
  const contentKey = `${state.sample}:${state.surface}`;
  if ($('reading-surface').dataset.contentKey !== contentKey) { renderArticle(sample); renderFeed(sample); $('reading-surface').dataset.contentKey = contentKey; $('reading-surface').scrollTop = 0; }
  renderChrome(sample); renderReview(sample);
  $('setting-summary').textContent = `${state.surface === 'feed' ? 'Feed' : 'Browser'} · ${$('news-sample').querySelector(`option[value="${state.sample}"]`).textContent}`;
  $('news-sample').value = state.sample;
  document.querySelectorAll('[data-surface]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.surface === state.surface)));
  document.querySelectorAll('[data-device]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.device === state.device)));
  $('experience-frame').className = `experience-frame ${state.device}-experience ${state.surface}-experience`;
  $('reading-article').hidden = state.surface !== 'browser'; $('social-feed').hidden = state.surface !== 'feed';
  $('scene-layout').classList.toggle('has-review', state.view === 'review');
  $('logiq-alert').hidden = state.view !== 'alert'; $('review-panel').hidden = state.view !== 'review';
  $('expand-alert').setAttribute('aria-expanded', String(state.view === 'review'));
  $('review-indicator').setAttribute('aria-expanded', String(state.view === 'review'));
  $('reading-surface').inert = state.device === 'mobile' && state.view === 'review';
  const issue = sample.claims.find(claim => claim.status !== 'supported') || sample.claims[0];
  $('alert-title').textContent = issue.status === 'uncertain' ? 'This claim needs a source.' : issue.status === 'context' ? 'This story may need context.' : 'A claim may be misleading.';
  setIndicator(reviewed.has(key()));
  syncReviewMode();
  scheduleAlert();
  if (state.view === 'review') { $('review-panel').scrollTop = 0; $('review-title').focus({ preventScroll: true }); }
}
function openReview() {
  savedReadingTop = $('reading-surface').scrollTop; savedWindowTop = window.scrollY; go('review');
}
function closeReview() {
  reviewed.add(key()); go('reading');
  // Return keyboard users to the control that can reopen the completed review.
  requestAnimationFrame(() => { $('reading-surface').scrollTop = savedReadingTop; window.scrollTo({ top: savedWindowTop, behavior: 'instant' }); $('review-indicator').focus({ preventScroll: true }); });
}
document.querySelector('.skip-link').addEventListener('click', event => { event.preventDefault(); $('workspace').focus(); $('workspace').scrollIntoView({ block: 'start' }); });
$('expand-alert').addEventListener('click', openReview);
function dismissAlert() { reviewed.add(key()); go('reading', {}, true); $('review-indicator').focus({ preventScroll: true }); }
$('dismiss-alert').addEventListener('click', dismissAlert);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && state.view !== 'reading') { event.preventDefault(); state.view === 'review' ? closeReview() : dismissAlert(); }
});
$('close-review').addEventListener('click', closeReview);
$('review-indicator').addEventListener('click', () => state.view === 'review' ? closeReview() : openReview());
document.querySelectorAll('[data-surface]').forEach(button => button.addEventListener('click', () => go('reading', { surface: button.dataset.surface })));
document.querySelectorAll('[data-device]').forEach(button => button.addEventListener('click', () => go('reading', { device: button.dataset.device })));
$('news-sample').addEventListener('change', event => go('reading', { sample: event.target.value }));
$('replay').addEventListener('click', () => { reviewed.delete(key()); $('announcement').textContent = ''; go('reading', {}, true); });
window.addEventListener('hashchange', render);
function scheduleAlert() {
  clearTimeout(state.timer);
  $('logiq-alert').classList.toggle('is-offscreen', !readingVisible);
  if (!readingVisible || state.view !== 'reading' || reviewed.has(key())) return;
  const revision = state.revision;
  state.timer = setTimeout(() => {
    if (revision !== state.revision || !readingVisible) return;
    reviewed.add(key()); go('alert', {}, true);
    $('announcement').textContent = 'LogiQ noticed a claim that may need a second look.';
  }, 1100);
}
function syncReviewMode() {
  const modal = state.view === 'review' && state.device === 'mobile' && matchMedia('(max-width:720px)').matches;
  document.body.classList.toggle('review-open', modal);
  const panel = $('review-panel');
  if (modal) { panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); }
  else { panel.removeAttribute('role'); panel.removeAttribute('aria-modal'); }
  document.querySelector('.global-header').inert = modal;
  document.querySelector('.workspace-heading').inert = modal;
  $('demo-settings').inert = modal;
  document.querySelector('.scene-chrome').inert = modal;
  document.querySelector('.app-footer').inert = modal;
  $('reading-surface').inert = state.view === 'review' && state.device === 'mobile';
}
document.addEventListener('keydown', event => {
  if (event.key !== 'Tab' || !document.body.classList.contains('review-open')) return;
  const controls = Array.from($('review-panel').querySelectorAll('button, a[href], summary')).filter(node => node.getClientRects().length);
  const first = controls[0], last = controls[controls.length - 1];
  if (event.shiftKey && (document.activeElement === first || document.activeElement === $('review-title'))) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
$('demo-settings').open = !matchMedia('(max-width:720px)').matches;
$('app').hidden = false; render();
if ('IntersectionObserver' in window) {
  const visibility = new IntersectionObserver(entries => { readingVisible = entries[0].isIntersecting; scheduleAlert(); });
  visibility.observe($('reading-surface'));
} else {
  readingVisible = true;
  scheduleAlert();
}
window.addEventListener('resize', syncReviewMode);
