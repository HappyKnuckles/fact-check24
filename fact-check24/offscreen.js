let recorder;
let audioCtx;
let processor;
let stream;

let isRecording = false;

let currentLanguage = "en-US";


chrome.runtime.sendMessage({ type: "offscreen-ready" });

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.target === "offscreen") {
    if (msg.languageCode) {
      currentLanguage = msg.languageCode;
    }
    switch (msg.type) {
      case "set-language":
        currentLanguage = handleLanguageSwitch(msg);
        break;
      case "is-recording":
        sendResponse({ recording: isRecording });
        return true;
      case "start-capture":
        isRecording = true;
        connectToWebSocket(currentLanguage);
        startCapture(msg.streamId);
        break;
      case "stop-capture":
        isRecording = false;
        stopCapture();
        break;
    }
  }
});


function connectToWebSocket(lang) {
  // establish a WS connection
  ws = new WebSocket("ws://localhost:3000/ws");

  ws.addEventListener("open", () => {
    sendWS(
      JSON.stringify({
        type: "set-language",
        languageCode: lang,
      })
    );
  });

  ws.addEventListener("message", (event) => {
    // all your server messages are JSON, so:
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch (err) {
      console.warn("Non-JSON ws message:", event.data);
      return;
    }

    if (msg.transcript) {
      console.log("🗣️ Transcript from server:", msg.transcript);

      // if you want to forward it back through the extension messaging:
      chrome.runtime.sendMessage({
        target: "audio-transcript",
        type: "transcript",
        transcript: msg.transcript,
      });
    }
    if (msg.error) {
      console.error("Server error:", msg.error);
    }
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
        const input = e.inputBuffer.getChannelData(0);
        const int16 = new Int16Array(input.length);

        for (let i = 0; i < input.length; i++) {
          const s = Math.max(-1, Math.min(1, input[i]));
          // scale to int16 range
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // send over WebSocket
        if (ws && ws.readyState === WebSocket.OPEN) {
          sendWS(int16.buffer);
        }
      };

      src.connect(processor);
      src.connect(audioCtx.destination);
      processor.connect(audioCtx.destination);
    })
    .catch((err) => console.error("Offscreen getUserMedia-Fehler:", err));
}

function sendWS(msg) {
  if (msg.type === "set-language") {
    // send text
    ws.send(msg);
    // ws.send(JSON.stringify(msg));
  } else {
    // send binary
    ws.send(msg);
  }
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
