'use strict';

const buttons = document.querySelectorAll('[data-example]');
buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const example = examples[button.dataset.example];
    if (!example) return;
    buttons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    const mark = document.createElement('mark');
    mark.textContent = example.highlight;
    document.getElementById('example-quote').replaceChildren(
      document.createTextNode(example.before), mark, document.createTextNode(example.after)
    );
    ['label', 'explanation', 'question', 'context'].forEach((field) => {
      document.getElementById(`example-${field}`).textContent = example[field];
    });
    document.getElementById('example-detail').open = false;
  });
});
