document.getElementById('start-check').addEventListener('click', () => {
  // Erfasse nur Audio, kein Video
  chrome.tabCapture.capture(
    { audio: true, video: false }, // CaptureOptions → audio: true :contentReference[oaicite:12]{index=12}
    (stream) => {
      if (chrome.runtime.lastError) {
        console.error('Capture-Fehler:', chrome.runtime.lastError.message);
        return;
      }
      // stream ist vom Typ LocalMediaStream (MediaStream)
      handleAudioStream(stream);
    }
  );
});
function handleAudioStream(stream) {
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(audioContext.destination);
  console.log('Audio-Capture läuft und wird wiedergegeben');
}

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg === 'capture-audio') {
    chrome.tabCapture.capture({ audio: true, video: false }, (stream) => {
      if (chrome.runtime.lastError) {
        console.error('Capture-Fehler:', chrome.runtime.lastError.message);
        return;
      }
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(audioContext.destination);
      console.log('Audio-Capture im Sidepanel läuft');
    });
  }
});

