// chrome.runtime.onMessage.addListener((msg) => {
//   if (msg.type !== "audio-bits") return;
//   // log(msg.bits.slice(0, 10).join(" "));
// });

chrome.runtime.onMessage.addListener(({ target, type, transcript }) => {
  if (target === "audio-transcript" && type === "transcript") {
    const outputElement = document.querySelector("#audio-transcript-output");
    if (outputElement) {
      outputElement.textContent += transcript;
    }
    addFactCard(transcript);
  }
});

function addFactCard(
  descriptionText,
  title = 'Transcribed Segment',
  sourceUrl = '#',
  cardClass = 'card-true'
) {
  const container = document.getElementById('cards-container');

  if (container) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card', cardClass);

    const titleH2 = document.createElement('h2');
    titleH2.classList.add('fact-title');
    titleH2.textContent = title;

    const descriptionP = document.createElement('p');
    descriptionP.classList.add('fact-description');
    descriptionP.textContent = descriptionText;

    const sourceA = document.createElement('a');
    sourceA.classList.add('fact-source');
    sourceA.href = sourceUrl;
    sourceA.textContent = 'source';
    sourceA.target = '_blank';
    sourceA.rel = 'noopener noreferrer';

    cardDiv.appendChild(titleH2);
    cardDiv.appendChild(descriptionP);
    cardDiv.appendChild(sourceA);

    const maxCards = 20;
    while (container.childNodes.length >= maxCards) {
      container.removeChild(container.firstChild);
    }

    container.appendChild(cardDiv);

    container.scrollTop = container.scrollHeight;
  } else {
    console.error(
      'Card container element (#cards-container) not found in side panel.'
    );
  }
}
