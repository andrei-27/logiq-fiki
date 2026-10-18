'use strict';

// Handwritten, deterministic examples. No content is sent to an external service.
const examples = {
  popularity: {
    before: '“Thousands of people shared this claim, ',
    highlight: 'so it must be true.',
    after: '”',
    label: 'Potential appeal to popularity',
    explanation: 'A claim’s popularity tells us how widely it has spread, not whether the evidence supports it. People can share something for many reasons.',
    question: 'What evidence supports the claim beyond the number of shares?',
    context: 'Popularity can tell us what people believe. It becomes a reasoning problem when it is used as sufficient proof that a factual claim is true. The claim might still be true; this argument does not establish it.'
  },
  attack: {
    before: '“Her proposal cannot work. ',
    highlight: 'She is an idiot.',
    after: '”',
    label: 'Potential personal attack',
    explanation: 'The statement attacks the person instead of evaluating the proposal. An insult does not explain why the proposed idea would fail.',
    question: 'Which assumption or piece of evidence in the proposal is actually wrong?',
    context: 'A person’s expertise or a conflict of interest can sometimes be relevant to evaluating testimony. Here, however, the insult supplies no reason to reject the proposal itself.'
  },
  choice: {
    before: '“',
    highlight: 'Either you support this policy, or you don’t care about the future.',
    after: '”',
    label: 'Potential false dilemma',
    explanation: 'The statement presents only two options. Someone could care deeply about the future and still disagree with this particular policy or prefer another approach.',
    question: 'What other positions or solutions does this framing leave out?',
    context: 'Some decisions really do have only two available options. The issue here is treating disagreement with one policy as proof of indifference, without establishing that these are the only possibilities.'
  }
};

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
