# 🐾 Sniffer — Living AI Roleplay Social Network

A living social media platform mirroring the look, feel, and dynamics of Twitter/X, simulated entirely by autonomous AI roleplay.

Every world is a universe with its own lore, atmosphere, factions, and trending topics. Every time you tweet or reply, a wave of roleplayed characters with distinct archetypes and speech styles reacts, debates, memes, and engages in nested comment threads.

---

## ✨ Features

- **Twitter / X Mirror Aesthetic**:
  - Pixel-close desktop 3-column layout and mobile-first experience with sticky headers and bottom navigation.
  - **3 Color Themes**: OLED Pitch Black (`#000000`), Dim Slate (`#15202b`), and Crisp Light (`#ffffff`).
  - Full conversational thread tree linking parent posts and nested character replies with conversation line connectors.
  - Interactive metrics: Likes with heart animation, Reposts (turning green), Bookmarks, and realistic View counts.
  - Verified badges: Blue checkmarks, Gold organization badges, and Official government tags.
- **Living World Engine**:
  - **4 Rich Preset Universes**:
    1. *Neo-Veridia 2088* (Cyberpunk netrunners, megacorps, black market cyberware).
    2. *Silicon Valley 2026* (Tech Twitter satire, e/acc vs decels, rogue local AI agents).
    3. *The Arcane Citadel* (Magic academy, potion influencer drama, rival wizard houses).
    4. *The Galactic Council* (Interstellar diplomacy, alien meme cultures, dyson sphere delays).
  - **Custom World Builder**: Define your own universe, lore, atmosphere, trending hashtags, and simulation directives.
  - **Breaking World Events**: Broadcast breaking news (e.g. *Quantum Grid Overload* or *Forbidden Grimoire Stolen*) and watch characters across the universe immediately erupt on the feed!
- **Character Personas & AI Generator**:
  - Distinct archetypes: `shitposter`, `intellectual`, `agitator`, `corporate_shill`, `wholesome`, `conspiracy_theorist`, `celebrity`, `mystic`, `doomer`, `technocrat`.
  - Dynamic stances towards the player: `admirer`, `rival`, `hater`, `simp`, `skeptic`, `neutral`.
  - Custom speech styles (all-lowercase, internet slang, archaic high-elven, corporate buzzwords).
  - **One-Click Procedural AI Synthesis**: Instantly generate new lore-accurate characters.
  - **Roleplay As Anyone**: Switch your active persona with one click to tweet and reply as any character in the universe.
- **Dual AI Engine**:
  - **Zero-Config Procedural Mode**: High-velocity, offline, rich heuristic engine that works out of the box with zero API keys or external costs.
  - **Live LLM Integration**: Built-in support for **Google Gemini API** (Gemini 2.5 Flash, 2.0 Flash) and **OpenAI-compatible endpoints** (OpenRouter, Groq, Ollama, LM Studio).
- **Autonomous Living Timeline**:
  - Background simulation ticker generating spontaneous character banter, hot takes, and debates even when you're not posting.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
bun install
# or
npm install
```

### 2. Run Development Server
```bash
bun dev
# or
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Automated Tests
```bash
bun run test:run
# or
npm run test:run
```

### 4. Production Build
```bash
bun run build
# or
npm run build
```

---

## 🛠 Tech Stack

- **Framework**: React 18 + Vite 6
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS + Lucide React
- **State Management**: Zustand (with LocalStorage persistence)
- **Testing**: Vitest + React Testing Library + JSDOM
- **AI**: Pluggable Google Gemini REST API / OpenAI-compatible / Procedural Heuristic Generator
