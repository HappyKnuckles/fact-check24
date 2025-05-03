// chrome.runtime.onMessage.addListener((msg) => {
//   if (msg.type !== "audio-bits") return;
//   // log(msg.bits.slice(0, 10).join(" "));
// });

chrome.runtime.onMessage.addListener(({ target, type, factCheckMessage }) => {
  if (target === 'audio-transcript' && type === 'transcript') {
    // const outputElement = document.querySelector("#audio-transcript-output");
    // if (outputElement) {
    //   outputElement.textContent += transcript;
    // }
    console.log('Received transcript:', factCheckMessage);
    if (factCheckMessage.verified !== 'no_fact_found') {
      console.log("checked message", factCheckMessage);
      let cardClass = 'card-false';
      if (factCheckMessage.verified === 'verified_fact') {
        cardClass = 'card-true';
      }
      addFactCard(
        factCheckMessage.corrected,
        factCheckMessage.statement,
        factCheckMessage.sources,
        cardClass
      );
    }
  }
});

function addFactCard(
  descriptionText,
  title = 'Transcribed Segment',
  sourceUrls = ['#'],
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

    cardDiv.appendChild(descriptionP);
    descriptionP.appendChild(document.createElement('hr'));

    // Create a span to hold the source links
    const sourcesSpan = document.createElement('span');
    sourcesSpan.classList.add('fact-source');

    sourceUrls.forEach((url, index) => {
      const sourceA = document.createElement('a');
      sourceA.href = url;
      sourceA.textContent = url;
      sourceA.target = '_blank';
      sourceA.rel = 'noopener noreferrer';

      sourcesSpan.appendChild(sourceA);
      // Add comma between links, but not after the last one
      if (index < sourceUrls.length - 1) {
        sourcesSpan.appendChild(document.createTextNode(', '));
        sourcesSpan.appendChild(document.createElement('br'));
      }      
    });

    cardDiv.appendChild(titleH2);
    cardDiv.appendChild(descriptionP);
    cardDiv.appendChild(sourcesSpan);

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

