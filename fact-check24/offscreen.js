let recorder;
let audioCtx;
let processor;
let stream;

let isRecording = false;
chrome.runtime.sendMessage({ type: 'offscreen-ready' });

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.target === 'offscreen') {
    switch (msg.type) {
      case 'is-recording':
        sendResponse({ recording: isRecording });
        return true;
      case 'start-capture':
        isRecording = true;
        startCapture(msg.streamId);
        break;
      case 'stop-capture':
        isRecording = false;
        stopCapture();
        break;
    }
  }
});

function startCapture(streamId) {
  if (recorder?.state === 'recording') {
    throw new Error('Recorder is already recording');
  }

  navigator.mediaDevices
    .getUserMedia({
      video: false,
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId,
        },
      },
    })
    .then((s) => {
      stream = s;

      audioCtx = new AudioContext();
      const src = audioCtx.createMediaStreamSource(stream);

      processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processor.onaudioprocess = (e) => {
        const inputBuffer = e.inputBuffer.getChannelData(0);
        const bits = Array.from(inputBuffer).map((sample) => {
          const intSample = Math.max(-1, Math.min(1, sample)) * 32767;
          const int16 = intSample | 0;
          return int16.toString(2).padStart(16, '0');
        });

        chrome.runtime.sendMessage({
          type: 'audio-bits',
          bits: bits,
        });
      };

      src.connect(processor);
      processor.connect(audioCtx.destination);

    })
    .catch((err) => console.error('Offscreen getUserMedia-Fehler:', err));
}

function stopCapture() {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }

  if (processor) {
    processor.disconnect();
    processor.onaudioprocess = null;
    processor = null;
  }

  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
}
