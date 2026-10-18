# 🐱⚔️ CAT CLASH — Battle of the Felines

An epic, high-octane 2D real-time multiplayer feline fighting game. Players customize their combat cats with elemental martial arts, jump into online lobbies, customize abilities, and fight in competitive 1v1 arenas.

---

## 🎮 Features Implemented

### 1. Real-Time Online Multiplayer
- **Lobby System**: Authoritative private room creation with easy-to-share 5-character codes (e.g. `CAT-XXXX`).
- **2-Player Limit Enforced**: Authoritative room capacity checking prevents unauthorized 3rd players.
- **Ready System & Host Match Start**: Both players select cats, customize loadouts, toggle Ready, and host launches match.
- **Authoritative Combat Simulation**: 30Hz server-side physics and hit validation for positions, damage, combos, cooldowns, and energy limits.
- **Rematch Agreement**: Seamless rematch flow without recreating room; handles player disconnects gracefully.

### 2. Six Playable Cats
- **Shadow Cat** (*Assassin & Evasion*): High speed, shadow teleportation, lethal combo crits, *Shadow Realm* ultimate.
- **Thunder Cat** (*Speed & Electricity*): Fast attack speed, lightning dashes, chain shock stuns, *Thunderstorm Fury* ultimate.
- **Frost Cat** (*Control & Freezing*): Glacial ice shards, freezing ground traps, attack slows, *Absolute Zero* ultimate.
- **Fire Cat** (*High Damage & Burn*): Scorching claws, bouncy fireball projectiles, explosive dashes, *Inferno Cataclysm* ultimate.
- **Ninja Cat** (*Combos & Deception*): Smoke decoys, kunai volleys, continuous combo flow, *Thousand Paw Strike* ultimate.
- **Tank Cat** (*Defense & Knockback*): Colossal Maine-Coon bulk, 25% innate damage reduction, ground slams, *Catastrophic Slam* ultimate.

### 3. Pre-Match Skill Selection System
Players customize 5 active combat slots + 1 ultimate:
- **Basic Attack Style**: Claw Slash, Heavy Paw Slam, Dual Fang Flurry
- **Normal Ability 1 (Offensive / Projectiles)**: Fireball, Lightning Bolt, Ice Shard, Shadow Projectile, Kunai Flurry, Ground Slam
- **Normal Ability 2 (Control & Burst)**: Whirlwind Spin, Sonic Energy Wave, Glacial Ice Trap, Electric Pulse, Smoke Veil, Gravity Vortex
- **Movement Ability**: Cat Dash, Shadow Teleport, Acrobatic Air Dash, Wall Bounce
- **Defensive Ability**: Paw Shield, Invulnerable Dome, Perfect Counter, Smoke Substitution
- **Ultimate Ability (100% Energy)**: Screen-clearing elemental spectacles

### 4. Dynamic Energy & Power System
- Health & Energy meters (0 - 100).
- Energy earned through aggressive play (landing attacks, combos, abilities), blocking, and perfect dodging.
- **Rage Mode**: Below 30% HP, cats enter Rage Mode with crimson aura and bonus passive energy regen.
- **Ultimate Power**: At 100% Energy, cat enters fully charged state with radiant glowing aura and unlocked ultimate finisher.

### 5. Four Distinct Arenas
- **Neon Rooftop**: Cyberpunk skyline with animated rain streaks and glowing neon advertisements.
- **Magical Forest**: Ancient trees, floating bioluminescent mushroom caps, and glowing wisp spores.
- **Frozen Temple**: Glacial ruins with sharp icicles, glowing frost runes, and drifting blizzards.
- **Volcanic Arena**: Obsidian platforms floating over molten magma crevasses with rising embers.

### 6. Procedural Web Audio Sound Engine
- Zero external audio assets required; uses the HTML5 Web Audio API.
- Generates punchy synthesized hits, heavy impacts, slashes, whooshes, shields, parries, elemental projectile hums, and ultimates.
- Dynamic chiptune / synthwave background music loops tailored to each arena and menu.
- Independent volume controls for Master, Music, and SFX, plus one-click mute.

### 7. Offline Training Mode & Bot AI
- Playable instantly without an internet connection or multiplayer server.
- Optional AI Bot with 4 difficulty settings: **Dummy** (Stationary), **Easy**, **Normal**, and **Hard** (reactive blocking, counterattacks, spacing).
- Diagnostics: DPS meter, Total Damage counter, Infinite Energy cheat toggle, Instant Cooldown reset, and Fighter Position reset.

### 8. Desktop & Mobile Touch Controls
- **Desktop Keyboard**:
  - `A` / `D` or `Arrow Keys`: Move Left / Right
  - `W` / `Space` / `Arrow Up`: Jump
  - `J`: Basic Attack / Claw Slash
  - `K`: Heavy Paw Slam
  - `L`: Normal Ability 1
  - `U`: Normal Ability 2
  - `Shift`: Movement Skill / Dash / Teleport
  - `I`: Defensive Skill / Shield / Counter
  - `O`: Ultimate Finisher (requires 100 Energy)
  - `Esc`: Pause / Settings Menu
- **Mobile Touch Controls**: Responsive on-screen joystick and circular action buttons, usable on phones, tablets, or forced on desktop via Settings.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
git clone <repository-url>
cd catgame
npm install
```

### Running Locally (Concurrent Dev Mode)
Starts both the backend Socket.IO authoritative server on port 3001 and the Vite frontend dev server on port 3000:
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

To test 1v1 multiplayer on the same computer:
1. Open a regular browser tab at `http://localhost:3000` and click **CREATE PRIVATE ROOM**.
2. Copy the room code (e.g. `CAT-A4X9`).
3. Open an Incognito/Private window at `http://localhost:3000`, click **JOIN ROOM WITH CODE**, enter the code.
4. Pick your cats, customize abilities, click **READY UP**, and start the match!

---

## 🌐 Production Build & Deployment

### Deploying Frontend to Vercel
This project is configured out-of-the-box for instant **Vercel** deployment with `vercel.json`:
1. Push this repository to GitHub.
2. In [Vercel](https://vercel.com), click **Add New Project** and import your `catclash` repository.
3. Vercel automatically detects the **Vite** framework preset with:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**!
5. **(Optional for Online Multiplayer)**: If you host the Socket.IO authoritative server on Render, Railway, or Fly.io, add the environment variable `VITE_SERVER_URL=https://your-server-backend.com` in your Vercel Project Settings. (Offline Dojo & Bot Training mode works 100% in-browser with zero backend required).

### Local Production Server
```bash
npm run build
npm start
```
The server will automatically serve the production frontend from `dist/` and handle real-time WebSockets on port 3000 (or `process.env.PORT`).

### Environment Variables
- `PORT`: (Optional) Port for the Node.js server (defaults to 3000 in production, 3001 in dev).
- `VITE_SERVER_URL`: (Optional) Custom WebSocket backend URL for online multiplayer when frontend is hosted separately on Vercel.

---

## 📋 Acceptance Tests Verified (Section 21)
- [x] **Test 1: Room Creation**: Player receives valid unique room code.
- [x] **Test 2: Room Joining**: Player 2 connects using code, both appear in lobby.
- [x] **Test 3: Two-Player Restriction**: 3rd player is rejected with clear error.
- [x] **Test 4: Match Start**: Readiness check and match countdown.
- [x] **Test 5: Movement Synchronization**: Synchronized positions, jumps, and dashes.
- [x] **Test 6: Combat Synchronization**: Authoritative hitboxes, damage, and knockback.
- [x] **Test 7: Energy System**: Energy generation rules, caps at 100.
- [x] **Test 8: Ability Validation**: Cooldown and energy requirement enforcement.
- [x] **Test 9: Victory Condition**: Match concludes when health reaches 0.
- [x] **Test 10: Rematch Flow**: Both players can agree to rematch in the same room.
- [x] **Test 11: Disconnection Handling**: Graceful forfeit and cleanup on disconnect.
- [x] **Test 12: Mobile Controls**: Virtual touch d-pad and action buttons.
- [x] **Test 13: Offline Training Mode**: Works completely independent of server.
- [x] **Test 14: Deployment**: Single command `npm start` serves full game and multiplayer backend.
