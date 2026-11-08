'use strict';

const screens = [...document.querySelectorAll('.wireframe-screen')];
const screenLinks = [...document.querySelectorAll('[data-screen-link]')];
const sampleChoice = document.getElementById('sample-choice');
const showAll = document.getElementById('show-all');
const feedbackForm = document.getElementById('feedback-form');
const feedbackStatus = document.getElementById('feedback-status');
const copyStatus = document.getElementById('copy-status');
const copyButton = document.getElementById('copy-explanation');
const shareText = document.getElementById('share-text');
let sampleRevision = 0;

function clearFeedback() {
  feedbackForm.reset();
  feedbackStatus.textContent = '';
  copyStatus.textContent = '';
  document.querySelector('.wording-note').open = false;
}

function updateExample() {
  const example = examples[sampleChoice.value];
  if (!example) {
    document.getElementById('screen-status').textContent = 'This sample is unavailable. Choose one of the listed examples.';
    throw new Error(`Unknown prototype sample: ${sampleChoice.value}`);
  }
  sampleRevision += 1;
  document.querySelectorAll('[data-prototype-quote]').forEach((quote) => {
    const mark = document.createElement('mark');
    mark.textContent = example.highlight;
    quote.replaceChildren(document.createTextNode(example.before), mark, document.createTextNode(example.after));
  });
  document.querySelectorAll('[data-prototype-field]').forEach((field) => {
    field.textContent = example[field.dataset.prototypeField];
  });
  shareText.value = [
    'LogiQ illustrative example (handcrafted, not fact-checked).',
    '',
    `Passage: ${example.before}${example.highlight}${example.after}`,
    example.label,
    example.explanation,
    '',
    `Question to consider: ${example.question}`,
    '',
    'A weak argument does not prove a claim false. Check the original context and evidence.'
  ].join('\n');
  clearFeedback();
}

function renderScreen(moveFocus = false) {
  const requested = location.hash.slice(1) || 'reading';
  const active = screens.find((screen) => screen.id === requested) || screens[0];
  screens.forEach((screen) => {
    screen.hidden = !showAll.checked && screen !== active;
  });
  screenLinks.forEach((link) => {
    if (link.dataset.screenLink === active.id) {
      link.setAttribute('aria-current', 'step');
    } else {
      link.removeAttribute('aria-current');
    }
  });
  const position = screens.indexOf(active) + 1;
  document.getElementById('screen-status').textContent = showAll.checked
    ? 'Overview: all five screens. Context, share and feedback are optional.'
    : `Screen ${position} of ${screens.length}: ${active.querySelector('h2').textContent}`;
  if (moveFocus) {
    active.querySelector('h2').focus({ preventScroll: true });
    active.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
}

function returnToReading() {
  if (location.hash === '#reading') {
    renderScreen(true);
  } else {
    location.hash = 'reading';
  }
}

sampleChoice.addEventListener('change', () => {
  updateExample();
  returnToReading();
});
showAll.addEventListener('change', () => renderScreen());
window.addEventListener('hashchange', () => renderScreen(true));

copyButton.addEventListener('click', async () => {
  const revision = sampleRevision;
  copyButton.disabled = true;
  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error('Clipboard access is unavailable in this browser context.');
    }
    await navigator.clipboard.writeText(shareText.value);
    if (revision === sampleRevision) {
      copyStatus.textContent = 'Copied the illustrative explanation and its caveats. Nothing was posted.';
    }
  } catch (error) {
    console.warn('LogiQ prototype could not copy the explanation:', error);
    if (revision === sampleRevision) {
      copyStatus.textContent = 'Could not copy automatically. Select the text above and use your device’s copy command. Nothing was posted.';
      shareText.focus();
      shareText.select();
    }
  } finally {
    copyButton.disabled = false;
  }
});

feedbackForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const rating = new FormData(feedbackForm).get('rating');
  const confirmations = {
    helpful: 'You marked the explanation as helpful.',
    unclear: 'You marked the explanation as unclear.',
    disagree: 'You disagreed with the explanation.'
  };
  if (!Object.hasOwn(confirmations, rating)) {
    feedbackStatus.textContent = 'Choose Helpful, Unclear, or I disagree before previewing the confirmation.';
    return;
  }
  feedbackStatus.textContent = `${confirmations[rating]} Demo only: this response has not been sent or saved.`;
});
feedbackForm.addEventListener('input', () => {
  feedbackStatus.textContent = '';
});
document.getElementById('reset-demo').addEventListener('click', () => {
  sampleChoice.value = 'popularity';
  showAll.checked = false;
  updateExample();
  returnToReading();
});

// Keep every screen populated in HTML for no-script viewing and printing.
updateExample();
renderScreen();
document.querySelectorAll('[data-enhanced]').forEach((control) => {
  control.hidden = false;
});
document.querySelector('.feedback-fallback').hidden = true;
