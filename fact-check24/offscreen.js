let recorder;
let audioCtx;
let processor;
let stream;

let isRecording = false;
chrome.runtime.sendMessage({ type: "offscreen-ready" });

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.target === "offscreen") {
    switch (msg.type) {
      case "is-recording":
        sendResponse({ recording: isRecording });
        return true;
      case "start-capture":
        isRecording = true;
        connectToWebSocket();
        startCapture(msg.streamId);
        break;
      case "stop-capture":
        isRecording = false;
        stopCapture();
        break;
    }
  }
});

function connectToWebSocket() {
  // establish a WS connection
  ws = new WebSocket("ws://localhost:3000/ws");

  ws.addEventListener("open", () => {
    console.log("WebSocket connected to ws://localhost:3000/ws");
  });

  ws.addEventListener("error", (err) => {
    console.error("WebSocket error:", err);
  });

  ws.addEventListener("close", () => {
    console.log("WebSocket closed");
    ws = null;
  });
}

function startCapture(streamId) {
  if (recorder?.state === "recording") {
    throw new Error("Recorder is already recording");
  }

  navigator.mediaDevices
    .getUserMedia({
      video: false,
      audio: {
        mandatory: {
          chromeMediaSource: "tab",
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
          return int16.toString(2).padStart(16, "0");
        });

        chrome.runtime.sendMessage({
          type: "audio-bits",
          bits: bits,
        });
        // also send over WebSocket
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(bits));
        }
      };

      src.connect(processor);
      processor.connect(audioCtx.destination);
    })
    .catch((err) => console.error("Offscreen getUserMedia-Fehler:", err));
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

  // close WS if open
  if (ws) {
    ws.close();
    ws = null;
  }
}
