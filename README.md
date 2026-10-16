# KeepItON ☕⚡

<div align="center">
  <img src="./public/favicon.svg" width="80" height="80" alt="KeepItON Logo" />
  <h1>KeepItON</h1>
  <p><strong>Because your laptop loves sleeping more than a cat, especially when your AI agents or background servers are in the middle of life-or-death tasks.</strong></p>

  <p>
    <a href="https://p19racha.github.io/KeepItON/"><strong>🚀 Launch Live Web App (No Install Needed)</strong></a>
  </p>
</div>

---

## 💀 The Tragedy You Know Too Well

1. You unleash 8 autonomous AI agents to scrape the internet, re-index 50,000 vector embeddings, and compile a massive Rust monolith.
2. You walk away for 2 minutes to grab a cup of coffee.
3. You return to find: **Screen locked. Laptop suspended. Wi-Fi disconnected. SSH broken. All your agents killed in cold blood by macOS / Windows power-saving demons.**
4. Or worse: You disabled screen lock in your OS settings, left it running overnight, and woke up to find your terminal prompt permanently burned into your $2,000 OLED display like a biblical curse.

**KeepItON solves both problems without requiring sudo permissions, shady executables, or terminal hacks.**

---

## ✨ Features That Prevent Tragedies

- **▶ / ⏸ One-Click Survival Button**: 
  Click Play (`▶`). Your screen stays awake. Your agents stay alive. Your background tasks don't flatline. Click Pause (`⏸`) when you actually want your laptop to take a nap.

- **🌈 OLED Anti-Burn Hypnotic Rave**:
  Got an expensive OLED / AMOLED panel? Hit `OLED ANTI-BURN` (or tap `O`). The whole screen turns into a continuous, full-brightness, smooth color cycle touching literally every single color on the visible spectrum in an infinite loop. Every sub-pixel is exercised uniformly. Zero burn-in. Looks like a modern art installation.

- **🔋 Battery Guard (Anti-Disaster Feature)**:
  Forgot your charger in the living room? If your battery drops below 20% on battery power, KeepItON will gracefully release the lock so your laptop doesn't drain to 0% and die while you sleep.

- **🎧 Built-in Noise Generator**:
  Synthesizes pure procedural **Brown Noise**, **Rainfall**, or **White Noise** using Web Audio to mask the sound of your laptop fans screaming at 7,000 RPM while your agents churn through tokens.

- **📱 Zero Downloads, Zero Bullsh*t**:
  100% static client-side web app hosted on GitHub Pages. No extensions, no electron bloat, no cookies, no tracking. Works on Chrome, Edge, Safari, Firefox, iPhone, iPad, Android, and your fridge if it has a browser.

---

## ⌨️ Hotkeys For The Lazy

| Key | What It Does |
| :---: | :--- |
| <kbd>Space</kbd> | Toggle Keep-Awake (Play / Pause) |
| <kbd>O</kbd> | Enter / Exit OLED Full-Screen Color Cycle |
| <kbd>F</kbd> | Go Fullscreen |
| <kbd>M</kbd> | Toggle Ambient Noise (Mute / Unmute) |
| <kbd>Esc</kbd> | Exit OLED or Fullscreen mode |

---

## 🔬 How Does It Trick The OS?

1. **W3C Screen Wake Lock API**: Uses `navigator.wakeLock.request('screen')` directly.
2. **Invisible Video Fallback**: If you're on a browser that hates wake locks (looking at you, iOS Safari), it silently plays an invisible 1-pixel canvas stream in a loop. The OS thinks you're streaming *The Godfather* and refuses to turn off the display.
3. **Auto-Reacquisition**: If you switch tabs and come back, it automatically re-grabs the wake lock without making you click again.

---

## 🛠️ Local Development

```bash
# Clone it
git clone https://github.com/p19racha/KeepItON.git
cd KeepItON

# Install dependencies (just Vite, React, and Lucide)
pnpm install

# Run locally
pnpm dev

# Build static bundle
pnpm build
```

---

## 📜 License

MIT License © 2026 [p19racha](https://github.com/p19racha) — *Sleep is for mortals, not background daemons.*
