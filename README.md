# FactCHECK24

**GenDev2025 Hackathon Submission**  
*Check24, Vienna*  

---

## 🎯 Goal
In the era of rampant misinformation and propaganda, FactCHECK24 empowers users with real‑time verification of spoken claims. Our browser extension listens to the active tab’s audio, identifies factual statements, evaluates their veracity, and, when necessary, provides corrections with credible sources.

## 🚀 Solution Overview
1. **Activation**: Press `Ctrl+B` to open a chat‑style side panel in your browser.  
2. **Audio Capture**: The extension records the audio from the active tab.  
3. **Streaming**: Audio is streamed via WebSocket to our backend.  
4. **Transcription**: Google Speech‑to‑Text converts audio chunks into text.  
5. **Fact Analysis**: Every 30 words, we send a targeted prompt to Google Gemini.  
6. **Feedback**: Results appear in the side panel—statements flagged as **True** or **False**, with corrections and source links for any inaccuracies.

## 🛠 Tech Stack
- **Frontend**: JavaScript (Browser Extension API, React)  
- **Communication**: WebSocket for low‑latency audio streaming  
- **Transcription**: Google Speech‑to‑Text API  
- **Fact Checking**: Google Gemini (LLM) with custom prompts  
- **Backend**: Node.js server handling audio processing & LLM requests

<!-- ## ⚙️ Installation & Usage
1. Clone this repository:
   ```bash
   git clone https://github.com/HappyKnuckles/factcheck24-api.git
   cd factcheck24
   ```  
2. Install backend dependencies:
   ```bash
   cd server && npm install
   ```  
3. Configure credentials:
   - Copy `server/.env.example` to `server/.env`
   - Add your Google Cloud and Gemini API keys
4. Start the backend server:
   ```bash
   npm run dev
   ```  
5. Load the extension in your browser (Chrome/Edge):
   - Go to `chrome://extensions`
   - Enable **Developer mode**
   - Click **Load unpacked** and select the `extension/` folder
6. Press **Ctrl+B** on any tab with audio to begin fact checking. -->

## 🧠 How It Works
```mermaid
flowchart LR
  A[Browser Tab Audio] -->|WebSocket| B(Audio Ingest Server)
  B --> C[Speech-to-Text]
  C --> D[Text Buffer (30 words)]
  D --> E[Google Gemini Fact Check]
  E --> F[Result: True / False + Sources]
  F --> G[Extension Side Panel]
```

## 📈 Outlook & Next Steps
- **Enhanced Contextualization**: Implement an NLP pipeline (summarization, coreference resolution) to improve prompt context and reduce false positives.  
- **Streaming Optimization**: Fine‑tune chunk sizes and buffering to lower latency and increase transcription accuracy.  
- **Source Ranking**: Integrate multiple fact‑databases (e.g., FactCheck.org, Snopes) and rank sources by credibility.  
- **UI/UX Improvements**: Add confidence scores, user feedback loop, and customizable alert thresholds.

## 🤝 Contributing
We welcome feedback and pull requests! Please open an issue or submit a PR with improvements, bug fixes, or new features.

---
*Built with ❤️ at GenDev2025, Check24 Vienna Hackathon*

