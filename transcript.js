'use strict';

// Transcript pages: each timestamp button plays the recording from the start of that turn.
const recording = document.querySelector('.transcript-audio');

document.querySelectorAll('.timestamp[data-time]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!recording) return;
    recording.currentTime = Number(button.dataset.time);
    recording.play().catch(() => {});
  });
});
