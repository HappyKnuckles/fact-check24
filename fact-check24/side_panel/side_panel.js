chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== "audio-bits") return;
  log(msg.bits.slice(0, 10).join(" "));
});

chrome.runtime.onMessage.addListener(({ target, type, transcript }) => {
  if (target === "audio-transcript" && type === "transcript") {
    const outputElement = document.querySelector("#audio-transcript-output");
    if (outputElement) {
      outputElement.textContent += transcript;
    }
  }
});

function log(msg) {
  const div = document.getElementById("fact");

  if (div) {
    const p = document.createElement("p");

    p.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;

    while (div.childNodes.length > 20) {
      div.removeChild(div.firstChild);
    }

    div.appendChild(p);

    div.scrollTop = div.scrollHeight;
  } else {
    console.log("Log element not found in side panel.");
  }
}
