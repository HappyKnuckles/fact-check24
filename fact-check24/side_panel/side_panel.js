document.getElementById('start-check').addEventListener('click', () => {
  chrome.tabCapture.capture({ audio: true, video: false }, (stream) => {
        console.log('Capture stream:', stream);

    if (chrome.runtime.lastError || !stream) {
      return console.error('Capture failed:', chrome.runtime.lastError);
    }


    const audioCtx = new AudioContext();
    const src = audioCtx.createMediaStreamSource(stream);
    src.connect(audioCtx.destination); 

    const startText = document.createElement('p');
    startText.textContent = 'Audio stream started';
    document.body.appendChild(startText);

    debugLogPCM(stream, audioCtx);
  });
});

document.getElementById('stop-check').addEventListener('click', () => {
  chrome.tabCapture.stop();
  const stopText = document.createElement('p');
  stopText.textContent = 'Audio stream stopped';
  document.body.appendChild(stopText);
}
);


function debugLogPCM(stream, audioCtx) {
  const processor = audioCtx.createScriptProcessor(4096, 1, 1);
  const src = audioCtx.createMediaStreamSource(stream);
  src.connect(processor);
  processor.connect(audioCtx.destination);

  processor.onaudioprocess = (e) => {
    const float32 = e.inputBuffer.getChannelData(0);

    console.log('Float32 samples:', float32.slice(0, 5));

    const int16 = new Int16Array(5);
    for (let i = 0; i < 5; i++) {
      int16[i] = Math.max(-1, Math.min(1, float32[i])) * 0x7fff;
    }
    console.log(
      'Int16 bits:',
      Array.from(int16).map((n) => n.toString(2))
    );
  };

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
      console.log('Log element not found in side panel.');
    }
  }
}
