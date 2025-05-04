let wrongCounter = 0;
let rightCounter = 0;

chrome.runtime.onMessage.addListener(({ target, type, factCheckMessage }) => {
  if (target === 'side-panel' && type === 'fact-check') {
    console.log('Received fact:', factCheckMessage);
    if (factCheckMessage.verified !== 'no_fact_found') {
      console.log("checked message", factCheckMessage);
      let cardClass = 'card-false';
      if (factCheckMessage.verified === 'verified_fact') {
        cardClass = 'card-true';
        updateCounter('right');
      } else {
        updateCounter('wrong');
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

function updateCounter(counter){
  if(counter === 'wrong'){
    wrongCounter++;
    document.getElementById('false-count').textContent = wrongCounter;
  }
  else if(counter === 'right'){
    rightCounter++;
    document.getElementById('true-count').textContent = rightCounter;
  }
  let fullCounter = wrongCounter + rightCounter;

  const truePercent = fullCounter === 0 ? 0 : Math.round((rightCounter / fullCounter) * 100);
  const falsePercent = fullCounter === 0 ? 0 : Math.round((wrongCounter / fullCounter) * 100);

  document.getElementById('true').textContent = truePercent + '%';
  document.getElementById('false').textContent = falsePercent + '%';
}

/**
 * Adds a fact card to the container in the side panel.
 *
 * @param {string} correction - The  of the card.
 * @param {string} [statement='Fact'] - The title of the card.
 * @param {string[]} [sourceUrls=['#']] - An array of source URLs.
 * @param {string} [cardClass='card-true'] - The class to apply ('card-true' or 'card-false') for styling and icon selection.
 */
function addFactCard(
  correction,
  statement = 'Fact',
  sourceUrls = ['#'],
  cardClass = 'card-true'
) {
  const container = document.getElementById("cards-container");

  if (container) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card', cardClass);

    // --- Title and Icon Container ---
    const titleContainer = document.createElement('div');
    // Style container for inline alignment
    titleContainer.style.display = 'flex'; 
    titleContainer.style.alignItems = 'center'; 
    titleContainer.style.marginBottom = '8px'; 

    // --- Title Element ---
    const titleH2 = document.createElement('h2');
    titleH2.classList.add('fact-title');
    titleH2.textContent = statement;
    // Add space between title and icon
    titleH2.style.marginRight = '8px'; 
    titleH2.style.marginBlock = '0';

    // --- Icon Element ---
    const iconImg = document.createElement('img');
    iconImg.style.width = '25px'; // Slightly smaller icon size
    iconImg.style.height = '25px';
    iconImg.style.flexShrink = '0'; // Prevent icon from shrinking if title is long
    iconImg.style.float = 'right'

    try {
      if (cardClass === 'card-true') {
        iconImg.src = chrome.runtime.getURL('assets/thumb_up.svg');
        iconImg.alt = 'True Fact Icon';
      } else {
        iconImg.src = chrome.runtime.getURL('assets/thumb_down.svg');
        iconImg.alt = 'False Fact Icon';
      }
    } catch (error) {
        console.error("Error getting extension asset URL. Is 'chrome.runtime.getURL' available in this context?", error);
        iconImg.style.display = 'none';
    }

    titleContainer.appendChild(titleH2);
    titleContainer.appendChild(iconImg);

    // --- Description Element ---
    const descriptionP = document.createElement('p');
    descriptionP.classList.add('fact-description');
    descriptionP.textContent = correction;
    descriptionP.style.marginBottom = '12px'; 

    // --- Separator ---
    const hrElement = document.createElement('hr');
    hrElement.style.opacity = '0.5'; 
    hrElement.style.border = 'none';
    hrElement.style.borderTop = '1px solid #ccc'; 
    hrElement.style.marginBlock = '8px'; 

    // --- Sources Element ---
    const sourcesSpan = document.createElement('span');
    sourcesSpan.classList.add('fact-source');
    sourcesSpan.style.fontSize = '0.8em'; 
    sourcesSpan.style.opacity = '0.8';
    sourcesSpan.style.wordBreak = 'break-all';
    sourcesSpan.appendChild(iconImg);

    sourceUrls.forEach((url, index) => {
      const sourceA = document.createElement('a');
      sourceA.href = url;
      sourceA.target = '_blank'; 
      sourceA.rel = 'noopener noreferrer';
      sourceA.title = url; 
      sourceA.style.color = 'inherit'; 
      sourceA.style.textDecoration = 'underline';
      sourceA.textContent = url;

      sourcesSpan.appendChild(sourceA);

      // Add line break between links for clarity, but not after the last one
      if (index < sourceUrls.length - 1) {
        sourcesSpan.appendChild(document.createElement('br'));
      }
    });

    // --- Assemble the Card ---
    cardDiv.appendChild(titleContainer); 
    cardDiv.appendChild(descriptionP);  
    cardDiv.appendChild(hrElement);      
    cardDiv.appendChild(sourcesSpan);   


    // --- Manage Max Cards ---
    const maxCards = 20;
    while (container.childNodes.length >= maxCards) {
      if (container.firstChild) {
        container.removeChild(container.firstChild);
      } else {
        break; 
      }
    }

    // --- Add New Card and Scroll ---
    container.appendChild(cardDiv);
    container.scrollTop = container.scrollHeight;

  } else {
    console.error(
      "Card container element (#cards-container) not found in side panel."
    );
  }
}

