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
  - **OpenRouter Cloud LLM Integration**: Connect any state-of-the-art model (Euryale 70B, Claude 3.5 Sonnet, Llama 3.3, DeepSeek) for deep, uncensored, immersive roleplay.
- **Dynamic Relationship & Affinity System**:
  - Track real-time affinity (-100 to +100) and tiers (`nemesis` to `soulmate`) across characters.
  - Characters react to user posts and DMs based on their archetype (shitposters love memes, agitators respect ruthless boldness, corporate shills demand compliance).
- **Living World Memory & 1-2 NPC Dilemmas**:
  - Persistent timeline memory recording everything you post, DM, and decide.
  - Interactive Dilemma Encounters with 1 or at most 2 NPCs with custom write-in actions evaluated for social tone and consequences.
- **Player Social Reputation**:
  - Live tracking of 5 core attributes: Aura, Charm, Humor, Ruthless, and Dark / Edge.
- **Autonomous Living Timeline & Day Progression**:
  - Four-phase day cycle (`morning`, `afternoon`, `evening`, `night`) with sleeping transitions and daily gazettes.

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
- **AI**: OpenRouter Cloud LLM API / Procedural Simulation Engine
