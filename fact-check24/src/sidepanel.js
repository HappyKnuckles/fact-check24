'use strict';

import './sidepanel.css';

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'transcription-result') {
    const results = msg.result.results;
    console.log('Transcription result:', results);
    if (results && results.length > 0) {
      const transcript = results.map(r => r.alternatives[0].transcript).join('\n');
      log(`🗣️ Transcript: ${transcript}`);
    } else {
      log('⚠️ No transcription result.');
    }
  }
});

function log(msg) {
  const div = document.getElementById('fact');

  if (div) {
    const p = document.createElement('p');
    p.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;

    while (div.childNodes.length > 20) {
      div.removeChild(div.firstChild);
    }

    div.appendChild(p);
    div.scrollTop = div.scrollHeight;
  } else {
    console.warn('Log element not found in side panel.');
  }
}
