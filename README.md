# NeuroSync: Anime AI Companion

![Project Banner](./assets/banner.png) <!-- Replace with actual banner path -->

A cyberpunk-themed AI chat application featuring anime characters with distinct personalities, powered by Ollama's local AI models.

## 🌟 Features

- 🎭 Multiple AI characters with unique response styles
- 🎙️ Voice input support with real-time transcription
- 🌡️ Character-specific temperature controls
- 💬 Context-aware conversation memory
- 🎨 Dynamic character expressions
- 📱 Cross-platform desktop app
- 🔌 Local AI processing via Ollama

## 🛠️ Technologies

- **Frontend**: React + TypeScript + Vite
- **Backend**: Rust (Tauri)
- **AI**: Ollama with custom-tuned models
- **Styling**: CSS Modules
- **Speech**: Web Speech API

## 📦 Installation

1. **Prerequisites**:
   - [Rust](https://www.rust-lang.org/)
   - [Node.js](https://nodejs.org/)
   - [Ollama](https://ollama.ai/) (running locally)
   - Ollama model: `ollama pull deepseek-r1:7b`

2. **Clone & Setup**:

   ```bash
   git clone https://github.com/yourusername/neurosync.git
   cd neurosync
   npm install
   ```

3. **Run development:**

```bash
npm run tauri dev

```

## 🖥️ Usage

1. Select your AI companion from the sidebar
2. Chat via text or voice input (🎤 button)
3. Switch personalities in Settings
4. Characters maintain 5-message context memory

## Character Profiles

| Character | Personality Style       | Temperature |
|-----------|-------------------------|-------------|
| Lain      | Cryptic/philosophical   | 0.92        |
| Mikasa    | Direct/protective       | 0.75        |
| Saber     | Noble/formal            | 1.0         |
| Asuna     | Supportive/emotional    | 0.85        |
| Erza      | Confident/loyal         | 0.88        |

## 🎨 Customization

To add new characters:

1. Edit `CHARACTER_PROFILES` in `src-tauri/src/main.rs`
2. Add character sprites in `/public/sprites/`
3. Update the Settings component

## 📜 License

MIT License - see [LICENSE](./LICENSE)

## 🤝 Contributing

I don't think that it's a important project to contribute, but just mail me or send me a message for that first.

## 🌐 Roadmap

- Add character animation system

- Implement emotional state tracking

- Add multi-language support

- Create model training guides

- Develop battle simulation mode

## 🔗 Contact

For feature requests or collaborations:

- mail:      <ferivonus@gmail.com>
- instagram: fahrettinb1

"Present day... present time..." - Lain
Project created with ❤️ by ferivonus
Not affiliated with any anime studios. Character assets for demonstration purposes only.
