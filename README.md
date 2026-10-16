# KeepItON

<div align="center">
  <img src="./public/favicon.svg" width="96" height="96" alt="KeepItON Logo" />
  <h3>Keep Your Screen Awake • OLED Cosmic Anti-Burn Engine</h3>
  <p>An Apple-inspired, client-side web utility with frosted liquid glass aesthetics, dual-engine wake lock, session timers, and a dedicated 60fps OLED cosmic screen protector.</p>

  <p>
    <a href="https://p19racha.github.io/KeepItON/"><strong>🌐 Launch Live Web App</strong></a>
  </p>
</div>

---

## Highlights

- 🍏 **Apple Design System**: Cupertino-inspired frosted glass (`backdrop-blur-2xl`), SF typography, liquid segmented control pills, iOS-style spring switches, and subtle specular borders.
- 🌌 **OLED Cosmic Anti-Burn Engine**: Continuous, 60fps procedural cosmic nebulas with true `#000000` deep blacks (physically turning off OLED pixels to conserve battery) and organic floating clock coordinates to completely prevent OLED image retention.
- ⚡ **Dual-Engine Wake Lock**:
  - **Primary**: Native W3C [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API) (`navigator.wakeLock`).
  - **Fallback**: Canvas-generated looping video stream for iOS Safari and unsupported browsers.
  - **Smart Reacquisition**: Automatically restores the screen wake lock when returning to the tab via `visibilitychange`.
- ⏳ **Customizable Sleep Timers**: Presets for `15m`, `30m`, `45m`, `1h`, `2h`, `Custom minutes`, and `Always ON` with an Apple Watch-style progress ring and procedural glass marimba completion chime.
- 🔋 **Battery Guard**: Monitors battery percentage and charging state via `navigator.getBattery()`, with configurable auto-shutoff below 20% to prevent unexpected battery drain when unplugged.
- 🎧 **Ambient Focus Audio**: Procedural Web Audio synthesizer featuring **Brown Noise** (deep focus), **Gentle Rain**, and **White Noise** without downloading heavy audio files.
- 📱 **Installable PWA**: Works offline and can be installed directly to the macOS Dock, iOS Home Screen, Android, or Windows.
- 🚀 **100% Client-Side Privacy**: Runs completely inside your browser with zero analytics, cookies, or backend servers.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Space</kbd> | Toggle Keep-Awake ON / OFF |
| <kbd>O</kbd> | Launch / Exit OLED Cosmic Anti-Burn Mode |
| <kbd>F</kbd> | Toggle Fullscreen Mode |
| <kbd>M</kbd> | Toggle Ambient Audio (Mute / Unmute) |
| <kbd>1</kbd> – <kbd>6</kbd> | Quick switch timer presets (`Always ON`, `15m`, `30m`, `45m`, `1h`, `2h`) |
| <kbd>Esc</kbd> | Exit OLED Mode or close popups |

---

## 🛠️ Local Development

```bash
# Clone repository
git clone https://github.com/p19racha/KeepItON.git
cd KeepItON

# Install dependencies
pnpm install

# Start local development server
pnpm dev

# Build production static bundle for GitHub Pages
pnpm build

# Preview production build locally
pnpm preview
```

---

## 🌐 Deploy to GitHub Pages

1. Push to the `main` branch.
2. In your GitHub repository settings:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. The included `.github/workflows/deploy.yml` workflow will automatically build and publish KeepItON at:
   `https://<your-username>.github.io/KeepItON/`

---

## 📄 License

MIT License © 2026 [p19racha](https://github.com/p19racha)
