console.log('✅ offscreen.js geladen');

chrome.runtime.onMessage.addListener((msg) => {
  console.log('📩 offscreen.js Nachricht:', msg);
  if (msg.type === 'START_CAPTURE') {
    // …
  }
});

// Wartet auf Nachricht vom Service Worker
chrome.runtime.onMessage.addListener((msg) => {
  console.log('Offscreen: Nachricht empfangen:', msg);

  if (msg.type !== 'start-capture') return;

  navigator.mediaDevices
    .getUserMedia({
      video: false,
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: msg.streamId,
        },
      },
    })
    .then((stream) => {
      const audioCtx = new AudioContext();
      const src = audioCtx.createMediaStreamSource(stream);

      // Optional: connect to destination so audio is still audible
      src.connect(audioCtx.destination);

      // Create ScriptProcessor to access raw audio data
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        const inputBuffer = e.inputBuffer.getChannelData(0); // Mono channel
        const bits = Array.from(inputBuffer).map((sample) => {
          // Normalize float [-1.0, 1.0] to int16 and convert to binary string
          const intSample = Math.max(-1, Math.min(1, sample)) * 32767;
          const int16 = intSample | 0;
          return int16.toString(2).padStart(16, '0'); // 16-bit binary
        });

        console.log('🎧 Audio Bits:', bits.slice(0, 10).join(' '), '...');
        chrome.runtime.sendMessage({
          type: 'audio-bits',
          bits: bits,
        });
      };

      src.connect(processor);
      processor.connect(audioCtx.destination);

      console.log('Offscreen: Audio-Capture läuft und wird geloggt als Bits');
    })
    .catch((err) => console.error('Offscreen getUserMedia-Fehler:', err));
});


