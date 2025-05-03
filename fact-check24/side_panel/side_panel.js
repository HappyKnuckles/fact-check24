// chrome.runtime.onMessage.addListener((msg) => {
//   if (msg.type !== "audio-bits") return;
//   // log(msg.bits.slice(0, 10).join(" "));
// });
let wrongCounter = 0;
let rightCounter = 0;

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

// ...existing code...
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

  // Calculate percentages, handling division by zero
  const truePercent = fullCounter === 0 ? 0 : Math.round((rightCounter / fullCounter) * 100);
  const falsePercent = fullCounter === 0 ? 0 : Math.round((wrongCounter / fullCounter) * 100);

  // Update the percentage display elements
  document.getElementById('true').textContent = truePercent + '%';
  document.getElementById('false').textContent = falsePercent + '%';
}

/**
 * Adds a fact card to the container in the side panel.
 *
 * @param {string} descriptionText - The main text content of the card.
 * @param {string} [title='Transcribed Segment'] - The title of the card.
 * @param {string[]} [sourceUrls=['#']] - An array of source URLs.
 * @param {string} [cardClass='card-true'] - The class to apply ('card-true' or 'card-false') for styling and icon selection.
 */
function addFactCard(
  descriptionText,
  title = 'Transcribed Segment',
  sourceUrls = ['#'],
  cardClass = 'card-true'
) {
  const container = document.getElementById("cards-container");

  if (container) {
    const cardDiv = document.createElement('div');
    // Add base card class and specific type class (e.g., 'card-true')
    cardDiv.classList.add('card', cardClass);

    // --- Title and Icon Container ---
    const titleContainer = document.createElement('div');
    // Style container for inline alignment
    titleContainer.style.display = 'flex'; // Use flexbox for horizontal layout
    titleContainer.style.alignItems = 'center'; // Vertically center items in the container
    titleContainer.style.marginBottom = '8px'; // Add space below the title/icon line

    // --- Title Element ---
    const titleH2 = document.createElement('h2');
    titleH2.classList.add('fact-title');
    titleH2.textContent = title;
    // Add space between title and icon
    titleH2.style.marginRight = '8px'; // Changed from 5px to 8px for slightly more space
    titleH2.style.marginBlock = '0'; // Remove default browser margins for h2

    // --- Icon Element ---
    const iconImg = document.createElement('img');
    iconImg.style.width = '25px'; // Slightly smaller icon size
    iconImg.style.height = '25px';
    iconImg.style.flexShrink = '0'; // Prevent icon from shrinking if title is long
    iconImg.style.float = 'right'

    // --- *** KEY CHANGE: Use chrome.runtime.getURL for reliable asset paths *** ---
    try {
      if (cardClass === 'card-true') {
        // Generate the correct extension URL for the asset
        iconImg.src = chrome.runtime.getURL('assets/thumb_up.svg');
        iconImg.alt = 'True Fact Icon';
      } else {
        // Generate the correct extension URL for the asset
        iconImg.src = chrome.runtime.getURL('assets/thumb_down.svg');
        iconImg.alt = 'False Fact Icon';
      }
    } catch (error) {
        console.error("Error getting extension asset URL. Is 'chrome.runtime.getURL' available in this context?", error);
        // Provide a fallback or hide the icon
        iconImg.style.display = 'none';
    }


    // Append title and icon to their container
    titleContainer.appendChild(titleH2);
    titleContainer.appendChild(iconImg);

    // --- Description Element ---
    const descriptionP = document.createElement('p');
    descriptionP.classList.add('fact-description');
    descriptionP.textContent = descriptionText;
    descriptionP.style.marginBottom = '12px'; // Space below description

    // --- Separator ---
    const hrElement = document.createElement('hr');
    hrElement.style.opacity = '0.5'; // Make it less prominent
    hrElement.style.border = 'none';
    hrElement.style.borderTop = '1px solid #ccc'; // Style the hr
    hrElement.style.marginBlock = '8px'; // Space around hr

    // --- Sources Element ---
    const sourcesSpan = document.createElement('span');
    sourcesSpan.classList.add('fact-source');
    sourcesSpan.style.fontSize = '0.8em'; // Smaller font for sources
    sourcesSpan.style.opacity = '0.8'; // Slightly faded sources
    sourcesSpan.style.wordBreak = 'break-all'; // Prevent long hostnames from overflowing
    sourcesSpan.appendChild(iconImg);

    sourceUrls.forEach((url, index) => {
      const sourceA = document.createElement('a');
      sourceA.href = url;
      sourceA.target = '_blank'; // Open in new tab
      sourceA.rel = 'noopener noreferrer'; // Security best practice
      sourceA.title = url; // Show full URL on hover
      sourceA.style.color = 'inherit'; // Inherit color
      sourceA.style.textDecoration = 'underline'; // Make it look like a link
      sourceA.textContent = url; // Display the URL text
 

      sourcesSpan.appendChild(sourceA);

      // Add line break between links for clarity, but not after the last one
      if (index < sourceUrls.length - 1) {
        sourcesSpan.appendChild(document.createElement('br'));
      }
    });

    // --- Assemble the Card ---
    cardDiv.appendChild(titleContainer); // Add title/icon container
    cardDiv.appendChild(descriptionP);   // Add description
    cardDiv.appendChild(hrElement);      // Add separator
    cardDiv.appendChild(sourcesSpan);    // Add sources


    // --- Manage Max Cards ---
    const maxCards = 20;
    // Remove oldest card if container exceeds max capacity
    while (container.childNodes.length >= maxCards) {
      if (container.firstChild) {
        container.removeChild(container.firstChild);
      } else {
        break; // Should not happen, but safety break
      }
    }

    // --- Add New Card and Scroll ---
    container.appendChild(cardDiv);
    // Scroll to the bottom to show the new card
    container.scrollTop = container.scrollHeight;

  } else {
    console.error(
      "Card container element (#cards-container) not found in side panel."
    );
  }
}

