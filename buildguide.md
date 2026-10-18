# GAME DEVELOPMENT PROMPT: CAT CLASH — EPIC ONLINE CAT FIGHTING GAME 🐱⚔️

## 1. YOUR ROLE

Act as a professional multiplayer game developer, game designer, gameplay programmer, UI/UX designer, and animation specialist.

Build a complete, playable, real-time multiplayer fighting game called **CAT CLASH**, where two players control powerful cats and fight each other in exciting 1v1 online battles.

The game should combine the fun of a fighting game, the strategy of an ability-based combat game, and the excitement of building a custom character with different powers.

The cats should be cute, expressive, and funny, but their combat abilities should be powerful, flashy, and satisfying.

**Important:** Do not create just a static design, landing page, or UI prototype. Build an actual playable game with working combat, functional buttons, real online multiplayer, character animations, abilities, health systems, and victory conditions.

Make sensible development decisions without repeatedly asking for clarification.

---

# 2. CORE GAME CONCEPT

The game is called **CAT CLASH: Battle of the Felines**.

Two players enter the game, create or join a private room, select their cats, choose their combat abilities, and fight each other in a real-time 1v1 battle.

Each player controls one cat.

Players can:

* Move around the arena.
* Jump, dodge, and dash.
* Perform basic attacks and combos.
* Block or counter enemy attacks.
* Use unique cat powers.
* Build up energy by fighting.
* Unlock powerful special moves during the match.
* Choose different skill combinations before the battle.
* Win by defeating the opponent.

Every cat should feel different depending on its selected skills and combat style.

A match should be fast, exciting, strategic, and replayable.

**Main gameplay loop:**

Enter game → Create or join room → Choose cat → Select abilities → Enter arena → Fight → Build energy → Use special attacks → Defeat opponent → Show results → Rematch.

---

# 3. ONLINE MULTIPLAYER SYSTEM

Online multiplayer is one of the most important parts of the game.

Implement actual online multiplayer so that two people on different devices can play against each other over the internet.

## A. Main Menu

Create an attractive main menu with the following options:

* PLAY ONLINE
* CREATE PRIVATE ROOM
* JOIN ROOM
* TRAINING MODE
* COLLECTION
* SETTINGS

Display the player's cat, player name, profile avatar, and available progression information.

Make the interface visually polished and easy to navigate.

## B. Create Room

When a player selects "Create Private Room":

1. Create a unique room ID or room code.
2. Place the creator in a waiting lobby.
3. Display the room code prominently.
4. Provide a COPY ROOM CODE button.
5. Allow the creator to share the code with a friend.
6. Wait for the second player to join.
7. Display both players' names, selected cats, and connection status.
8. Enable the START MATCH button when both players are ready.

Each room must support exactly two active players.

Prevent unauthorized third players from joining a full room.

## C. Join Room

When the second player selects "Join Room":

1. Provide an input field for the room code.
2. Validate the room code.
3. Connect the player to the correct room.
4. Display both players in the lobby.
5. Allow both players to ready up.
6. Start the match when both players are ready and the host starts the game.

Show clear error messages if the room does not exist, is full, or has expired.

## D. Real-Time Multiplayer

Use a proper networking system, such as:

* Frontend: TypeScript, React, and Phaser 3.
* Backend: Node.js.
* Networking: Socket.IO over WebSockets.
* Rendering: Phaser 3 using Canvas or WebGL.

You may adjust the technology if the existing development environment requires it, but preserve the same functionality.

Synchronize both players' movements, attacks, health, energy, cooldowns, status effects, and match state.

The game must not simply display a fake second player controlled by the frontend.

Use an authoritative server for important gameplay actions such as damage calculations, cooldown validation, ability usage, match results, and win conditions.

Implement appropriate synchronization, latency handling, reconnection handling, and room cleanup.

Players should receive immediate visual feedback when attacking, dodging, taking damage, or using abilities.

If a player disconnects during combat, show a connection warning and implement a sensible reconnection or match-forfeit rule.

Do not require players to be on the same Wi-Fi network.

The game should be structured to work over the internet when deployed with a reachable multiplayer server.

---

# 4. CAT CHARACTER DESIGN

Create an appealing collection of cats with distinct appearances, animations, personalities, and combat identities.

Do not make the characters look like ordinary human fighters wearing cat costumes. They must visibly look and move like cats.

Use a colorful, polished 2D fighting-game art style with expressive faces, exaggerated movements, and satisfying combat effects.

The art direction should feel original and memorable.

## Initial Playable Cats

Include at least six selectable cats:

### 1. SHADOW CAT

Combat style: Assassin.

* Dark fur.
* Glowing purple eyes.
* Fast movement.
* Shadow teleportation.
* Quick claw combos.
* Temporary invisibility.
* Special move: Shadow Realm.

### 2. THUNDER CAT

Combat style: Speed and electricity.

* Yellow or orange fur.
* Electric effects around the paws.
* Lightning-fast dashes.
* Electrified claw attacks.
* Chain lightning.
* Special move: Thunderstorm Fury.

### 3. FROST CAT

Combat style: Control and freezing.

* White or icy-blue fur.
* Frost effects.
* Ice projectiles.
* Temporary freezing attacks.
* Ice barriers.
* Special move: Absolute Zero.

### 4. FIRE CAT

Combat style: High damage.

* Orange and red fur.
* Fiery paws.
* Burning claw attacks.
* Fireball projectiles.
* Explosive dashes.
* Special move: Inferno Cataclysm.

### 5. NINJA CAT

Combat style: Combos and deception.

* Ninja-inspired cat appearance.
* Fast attacks.
* Smoke bombs.
* Kunai-like energy projectiles.
* Clone decoys.
* Special move: Thousand Paw Strike.

### 6. TANK CAT

Combat style: Defense and counterattacks.

* Larger and sturdier body.
* Heavy punches and paw slams.
* Damage reduction.
* Ground shockwaves.
* Knockback resistance.
* Special move: Catastrophic Slam.

Each cat should have a distinct appearance and playstyle. These differences must affect actual gameplay rather than being purely cosmetic.

If sophisticated character art is unavailable, use polished original 2D sprite designs, layered character drawings, or custom vector graphics with animated poses. Do not leave the game using plain circles or colored rectangles as its final character designs.

---

# 5. PRE-MATCH SKILL SELECTION SYSTEM

Before every match, players must enter a character and skill selection screen.

This should be one of the game's most important strategic features.

Players must be able to customize their combat style before the fight begins.

## Skill Loadout

Each player can equip:

* 1 basic attack style.
* 2 normal abilities.
* 1 movement ability.
* 1 defensive ability.
* 1 ultimate ability.

Allow players to experiment with different combinations.

For example:

A player using Shadow Cat could equip:

* Shadow Dash.
* Poison Claws.
* Smoke Escape.
* Shadow Counter.
* Shadow Realm.

Another player could use Shadow Cat with a completely different setup focused on quick combos and counterattacks.

The same cat should support multiple strategies.

## Skill Categories

Organize the abilities into categories.

**OFFENSIVE SKILLS**

* Claw Slash.
* Triple Paw Strike.
* Fireball.
* Lightning Bolt.
* Ice Shard.
* Shadow Projectile.
* Spin Attack.
* Ground Slam.
* Energy Wave.
* Exploding Paw.

**MOVEMENT SKILLS**

* Cat Dash.
* Shadow Teleport.
* Double Jump.
* Wall Bounce.
* Air Dash.
* Quick Retreat.
* Blink Strike.

**DEFENSIVE SKILLS**

* Paw Shield.
* Energy Barrier.
* Perfect Guard.
* Counterattack.
* Smoke Escape.
* Temporary Damage Reduction.
* Emergency Dodge.

**CONTROL SKILLS**

* Ice Trap.
* Electric Stun.
* Gravity Paw.
* Slow Field.
* Knockback Blast.
* Shadow Snare.

**ULTIMATE SKILLS**

* Dragon Cat Blast.
* Meteor Paw.
* Thunderstorm Fury.
* Absolute Zero.
* Shadow Realm.
* Inferno Cataclysm.
* Thousand Paw Strike.
* Cataclysmic Shockwave.

Implement these as actual abilities with effects, animations, damage rules, cooldowns, and appropriate counterplay.

Avoid making every ability function as a simple projectile with a different color.

## Skill Selection Interface

Every skill should have:

* Skill name.
* Icon.
* Short description.
* Damage rating.
* Cooldown.
* Energy cost, if applicable.
* Range.
* Skill category.
* Rarity or unlock requirement, where appropriate.

Display skill previews and explain how they work.

Allow players to switch between skills and compare their options.

Clearly indicate which skills have been selected and which slots remain empty.

Players must confirm their loadout before the match starts.

Both players should have a reasonable time limit to prepare so that matches do not remain stuck in character selection.

---

# 6. ENERGY AND POWER GENERATION SYSTEM

Design an exciting combat energy system that rewards aggressive play, defensive skill, and good timing.

Each player has two primary combat resources:

1. HEALTH.
2. ENERGY.

Health determines how close the cat is to defeat.

Energy allows players to activate special abilities.

## How Energy Works

Players begin each match with a partially charged energy meter or a configurable starting energy amount.

Players gain energy by:

* Landing basic attacks.
* Completing combos.
* Successfully hitting enemies with abilities.
* Dodging an attack at the correct moment.
* Successfully blocking or countering an attack.
* Taking a small amount of damage, within a carefully balanced limit.

Reward skilled play more than passive behavior.

Do not allow unlimited energy farming by repeatedly attacking an opponent who is not fighting back.

Add a maximum energy limit.

Display energy gain with animated meter fills, glowing effects, and small indicators.

## Energy-Based Abilities

Some abilities use normal cooldowns only.

Some abilities require energy.

Ultimate abilities require a high energy threshold.

Example energy costs:

* Quick Dash: 0 energy, cooldown-based.
* Fireball: 15 energy.
* Shadow Teleport: 20 energy.
* Electric Burst: 30 energy.
* Paw Shield: 20 energy.
* Meteor Paw: 60 energy.
* Ultimate Cataclysm: 100 energy.

Adjust costs during balancing.

The exact energy values should be configurable rather than hardcoded throughout the game.

## Ultimate Power

When the energy meter reaches 100%, the cat enters a fully charged state.

Create a strong visual effect:

* The cat begins glowing.
* Energy particles surround its body.
* The ultimate icon lights up.
* A subtle charging sound plays.
* The interface displays an "ULTIMATE READY" indicator.

The player can activate an ultimate only when its requirements are satisfied.

Ultimate attacks should feel extremely powerful without automatically guaranteeing victory.

Include readable telegraphs, dodge opportunities, blocking interactions, or other appropriate counterplay.

---

# 7. ACTUAL FIGHTING SYSTEM

Create a responsive real-time fighting system.

The controls must be easy for beginners to understand while still allowing skilled players to master combos, spacing, counters, and resource management.

## Basic Controls

For desktop keyboard play:

* A / D: Move left and right.
* W or Space: Jump.
* J: Basic attack.
* K: Secondary attack or combo finisher.
* L: Use ability 1.
* U: Use ability 2.
* I: Use defensive ability.
* Shift: Dash or dodge.
* O: Activate ultimate when ready.
* Esc: Open pause or settings menu.

Display the available controls in the interface.

Prevent keyboard input conflicts and ensure actions respond immediately.

Support remapping controls where practical.

## Mobile Controls

Create a separate touch-control layout for mobile devices.

Include:

* A virtual movement joystick or directional pad.
* Jump button.
* Basic attack button.
* Ability buttons.
* Dash button.
* Defense button.
* Ultimate button.

Buttons should be large enough for comfortable use.

Allow simultaneous movement and attacks.

Automatically adapt the layout to portrait or landscape orientation, with the primary battle layout optimized for landscape.

The game must remain playable without a physical keyboard.

## Basic Attacks

Implement:

* Quick claw attacks.
* Heavy paw attacks.
* Aerial attacks.
* Combo finishers.
* Knockback attacks.

Support simple attack combinations such as:

Quick Claw → Quick Claw → Heavy Paw → Dash Attack.

Combos should use timing windows and appropriate animations.

Attacks must have real hit detection rather than dealing damage simply because a button was pressed.

## Movement

Implement:

* Smooth horizontal movement.
* Jumping with gravity.
* Air control.
* Dashing.
* Dodging.
* Knockback.
* Landing animations.
* Arena boundary handling.

Use appropriate acceleration and stopping behavior so movement feels controlled.

Make combat readable, with no unintended movement through solid arena boundaries.

## Blocking and Counterattacks

Allow players to defend against attacks.

A successful block should reduce or prevent some damage, depending on the attack type.

A perfectly timed defense may trigger a parry or counterattack opportunity.

Powerful attacks should be able to break guards or punish predictable defensive play where appropriate.

---

# 8. SKILL COOLDOWNS AND COMBAT BALANCING

Every ability should have a meaningful purpose.

Implement:

* Cooldowns.
* Energy requirements.
* Attack range.
* Damage.
* Startup time.
* Active attack duration.
* Recovery time.
* Hit stun.
* Knockback.
* Invulnerability frames for appropriate dodges.
* Status effects where appropriate.

For example, Shadow Teleport could provide rapid repositioning but have a longer cooldown.

Fireball could inflict solid ranged damage but be avoidable.

Ice Trap could temporarily restrict movement but deal limited direct damage.

Perfect Guard could create a counter opportunity but require precise timing.

Heavy attacks should feel powerful but be easier to anticipate.

Fast attacks should be useful for combos but deal less damage individually.

Create a central, editable combat configuration so abilities can be tuned without rewriting the combat system.

Prevent infinite combos, permanent stun locks, and abilities that can be spammed without meaningful trade-offs.

---

# 9. ARENAS AND ENVIRONMENTS

Create at least four visually distinct fighting arenas.

### ARENA 1: NEON ROOFTOP

A futuristic city at night.

* Neon lights.
* Glowing advertisements.
* Distant skyscrapers.
* Dynamic city ambience.

### ARENA 2: MAGICAL FOREST

A mystical forest.

* Glowing mushrooms.
* Floating particles.
* Enchanted trees.
* Magical background effects.

### ARENA 3: FROZEN TEMPLE

An ancient icy arena.

* Frozen stone.
* Blue crystal formations.
* Snow particles.
* Cold visual atmosphere.

### ARENA 4: VOLCANIC ARENA

A fiery battlefield.

* Lava.
* Glowing cracks.
* Volcanic particles.
* Dramatic orange lighting.

Arenas should be visually distinct without obscuring combat.

Use layered backgrounds, environmental animation, and subtle particle effects.

Avoid excessive visual effects that make it difficult to see either player or understand incoming attacks.

Start with a stable, playable arena and then add further arenas.

If environmental hazards are implemented, make them predictable, balanced, and clearly communicated.

---

# 10. MATCH FLOW

Build a complete match lifecycle.

### PHASE 1: LOBBY

Both players connect to a room.

They select their cats and customize their skill loadouts.

Both players confirm readiness.

### PHASE 2: COUNTDOWN

Display a dramatic countdown:

3... 2... 1... FIGHT!

Play countdown sound effects and a short character introduction.

Prevent attacks before the match begins.

### PHASE 3: COMBAT

Display:

* Both cats.
* Both health bars.
* Both energy meters.
* Active skill icons.
* Cooldown indicators.
* Remaining match time.
* Player names.
* Connection status.

Players fight in real time.

### PHASE 4: VICTORY OR DEFEAT

A player loses when their health reaches zero.

Stop active attacks and prevent additional damage.

Display a dramatic victory or defeat screen.

Show:

* Winning cat.
* Losing cat.
* Player names.
* Match duration.
* Damage dealt.
* Successful hits.
* Successful dodges.
* Combos performed.
* Final result.

### PHASE 5: REMATCH

Give both players three options:

* REMATCH.
* CHANGE LOADOUT.
* RETURN TO LOBBY.

A rematch should reset the appropriate match state and start a new fight without requiring players to recreate their room.

Handle the situation where one player requests a rematch and the other does not.

---

# 11. UNIQUE COMBAT MECHANICS

Make CAT CLASH feel more memorable than a generic fighting game.

Implement the following mechanics where feasible.

## A. Combo Meter

Reward consecutive hits with a combo counter.

Display labels such as:

* NICE!
* PAWESOME!
* CLAW MACHINE!
* FURIOUS COMBO!
* LEGENDARY CAT COMBO!

Higher combo counts can award small amounts of bonus energy, with limits that prevent exploits.

## B. Perfect Dodge

If a player dodges just before an incoming attack connects, trigger a brief slow-motion effect or other visual highlight.

Reward the timing with bonus energy.

Keep the gameplay fair for both players. Avoid making the entire match dependent on unreliable client-side timing.

## C. Clash Mechanic

When certain equally timed heavy attacks meet, trigger a dramatic clash effect.

Pause the relevant attack interactions briefly, show sparks or energy waves, and resolve the clash according to deterministic combat rules.

## D. Rage Mode

When a cat's health becomes critically low, offer a limited comeback mechanic.

For example, the cat may gain a small temporary increase in energy generation or access to a special rage ability.

Keep the advantage limited so that being low on health is not automatically better than being ahead.

## E. Ultimate Clash

If both players activate compatible ultimate attacks at approximately the same time, trigger a special clash sequence when supported by the ability definitions.

Use dramatic animation and visual effects, while preserving a clear and fair result.

Do not let cinematic sequences cause the multiplayer state to become desynchronized.

---

# 12. PROGRESSION AND CAT COLLECTION

Add a lightweight progression system that makes players want to return.

Include:

* Player level.
* XP earned from completed matches.
* Match history.
* Win and loss statistics.
* Cat collection.
* Unlockable skins.
* Victory poses.
* Emotes.
* Cosmetic effects.

Players should earn XP after a completed match.

Reward victories more than defeats, but grant a small participation reward for completed matches.

Do not reward disconnecting or abandoning a match in the same way as completing one.

Initially, make all core combat abilities available in training or otherwise clearly explain their unlock conditions.

**Fair-play rule:** Paid or unlocked content should not make one player overwhelmingly stronger than another. Competitive power should come from skill, strategy, and balanced loadouts.

Make the collection system functional even if some cosmetic unlocks are initially limited.

Do not implement real-money purchases unless they are specifically requested later.

---

# 13. TRAINING MODE

Create an offline training mode so players can learn the combat system.

Include:

* A selectable practice cat.
* A stationary training dummy.
* A moving training opponent or simple bot.
* Unlimited practice energy as an optional setting.
* Cooldown reset.
* Damage display.
* Combo counter.
* Skill descriptions.
* A basic tutorial.

Allow players to test every core ability without waiting for another person.

Training mode should remain usable when the multiplayer server is unavailable.

Keep the online room creation flow separate from local training.

---

# 14. BOT OPPONENT

Implement an optional AI-controlled opponent for practice and testing.

The bot should support several difficulty settings.

**EASY**

* Uses basic attacks.
* Moves occasionally.
* Rarely blocks or dodges.

**NORMAL**

* Uses basic combos.
* Attempts to dodge incoming attacks.
* Uses abilities when appropriate.

**HARD**

* Uses attacks based on distance.
* Blocks predictable attacks.
* Uses defensive skills.
* Attempts combos and counters.
* Uses energy strategically.

The bot is for single-player practice and must not be mistaken for a real online opponent.

The main multiplayer mode must always connect to a real player in the room.

---

# 15. USER INTERFACE AND VISUAL STYLE

Design the game to look like a polished indie fighting game.

Use a dark, futuristic interface combined with bright magical colors, animated skill icons, glowing outlines, and playful feline personality.

The interface should be visually rich but readable.

## Main Menu

Include:

* Animated logo.
* Animated cat artwork.
* Play Online button.
* Create Room button.
* Join Room button.
* Training button.
* Collection button.
* Settings button.

Add subtle ambient motion to the background.

## Character Selection Screen

Show each cat as an individual character card.

Each card should contain:

* Character art.
* Character name.
* Combat class.
* Difficulty rating.
* Main strengths.
* Preview animation.

Highlight the selected cat.

## Skill Selection Screen

Display skills in a clean grid.

Use distinct icons and colors to represent different skill categories.

Show the selected loadout in a separate panel.

Include cooldown and energy information in the skill descriptions.

## Battle Interface

Make the battle screen immersive and easy to understand.

Place each player's health bar at opposite sides of the screen.

Place energy meters directly below the health bars.

Show cooldown states on skill icons.

Use hit effects, screen shake, particle effects, and short impact animations sparingly to make successful hits satisfying.

Create readable animations for taking damage, blocking, dodging, attacking, and being knocked back.

## UI Quality

Use:

* Smooth transitions.
* Hover effects.
* Responsive layouts.
* Loading indicators.
* Error messages.
* Clear disabled states.
* Consistent typography.
* Reusable components.

Avoid generic unstyled HTML buttons.

Never leave the player stuck on an empty screen if a request fails.

---

# 16. SOUND AND ANIMATION

Add appropriate game audio.

Include:

* Menu music.
* Background arena music.
* Basic attack sounds.
* Heavy hit sounds.
* Dash sounds.
* Jump sounds.
* Elemental ability sounds.
* Ultimate attack sounds.
* Victory music.
* Defeat effects.
* Button interaction sounds.

Provide separate volume controls for music and sound effects.

Include a mute option.

Prevent audio from becoming excessively loud or repetitive.

If original sound assets are unavailable, use appropriate royalty-free assets or generated procedural effects that can legally be included in the project.

## Character Animations

Provide distinct visual states for each cat.

At minimum, support:

* Idle.
* Walking.
* Running or dashing.
* Jumping.
* Falling.
* Landing.
* Basic attack.
* Heavy attack.
* Skill cast.
* Taking damage.
* Blocking.
* Dodging.
* Victory.
* Defeat.

Animations should communicate the timing and direction of attacks.

Make the characters face their opponents when appropriate.

---

# 17. TECHNICAL ARCHITECTURE

Build the game with maintainability, performance, and multiplayer correctness in mind.

Use a modular architecture.

Separate the code into logical systems such as:

* Authentication or player identity.
* Lobby management.
* Room management.
* Character definitions.
* Ability definitions.
* Combat engine.
* Damage calculation.
* Energy generation.
* Cooldown management.
* Character movement.
* Match lifecycle.
* Multiplayer synchronization.
* Bot AI.
* User interface.
* Audio.
* Persistence.
* Error handling.

Represent characters and skills as configuration-driven data where possible.

Avoid putting all game logic into one enormous file.

## Server Responsibilities

The server should authoritatively manage:

* Room membership.
* Match readiness.
* Match starting.
* Important combat validation.
* Health and energy values.
* Cooldowns.
* Damage results.
* Victory conditions.
* Match-ending state.
* Rematch requests.
* Match statistics.

Validate all client requests before applying important gameplay changes.

Do not trust the client to decide that an attack hit or that an ultimate was ready.

## Client Responsibilities

The client should manage:

* Rendering.
* Animations.
* User input.
* UI updates.
* Visual effects.
* Sound playback.
* Responsive controls.
* Local visual prediction where appropriate.

Use sensible network interpolation and client-side prediction when appropriate to make movement feel responsive without compromising the authoritative game state.

## Data Persistence

Use a suitable database or persistent storage system for information that must survive a server restart.

Persist appropriate player progression, unlocked cosmetics, settings, and match history.

For an initial development build, local persistence or a development database is acceptable where clearly appropriate.

Do not store critical competitive game state only in browser storage.

If an external database or service requires credentials, provide environment-variable configuration and setup instructions. Never hardcode production secrets in the frontend.

---

# 18. SECURITY AND RELIABILITY

Implement sensible protections against basic multiplayer abuse.

Include:

* Room code validation.
* Maximum room capacity.
* Server-side cooldown validation.
* Server-side damage validation.
* Rate limiting for important network events.
* Validation of movement and attack requests.
* Handling of duplicate requests.
* Disconnect cleanup.
* Reconnection rules.
* Protection against submitting impossible energy values.
* Prevention of repeatedly claiming the same match reward.

Do not claim that the game is cheat-proof.

Instead, implement a reasonable authoritative architecture that reduces common client-side cheating opportunities.

Avoid duplicate damage caused by repeated collision events.

Ensure a match can end only once, even if several events arrive at nearly the same time.

Handle players disconnecting at important moments, including during matchmaking, character selection, combat, and rematches.

---

# 19. MOBILE AND PERFORMANCE REQUIREMENTS

The game should run smoothly on modern desktop and mobile browsers.

Support:

* Chrome.
* Firefox.
* Edge.
* Safari where practical.

Optimize the game for:

* Stable frame rates.
* Lightweight character rendering.
* Efficient particle effects.
* Low-latency input handling.
* Responsive network synchronization.
* Mobile touch controls.
* Different screen sizes.

Use sprite atlases, pooled effects, or other appropriate optimizations when needed.

Avoid creating excessive particles or objects during combat.

Keep the game playable on ordinary consumer devices.

Provide loading feedback while assets are being downloaded.

If the connection becomes unstable, communicate that clearly to both players.

---

# 20. DEVELOPMENT PRIORITIES

Build the game in functional stages, but the final result must be a coherent, playable project.

### Priority 1: PLAYABLE MULTIPLAYER FOUNDATION

First, implement:

* Main menu.
* Create room.
* Join room by code.
* Two real online players.
* Character movement.
* Basic attacks.
* Health bars.
* Energy bars.
* Damage and knockback.
* Match countdown.
* Win and loss conditions.
* Rematch flow.

Verify that two separate browser sessions can connect to the same room and fight each other.

### Priority 2: COMBAT DEPTH

Add:

* Skill loadouts.
* Cooldowns.
* Energy costs.
* Special abilities.
* Dashing.
* Blocking.
* Dodging.
* Combos.
* Ultimate attacks.
* Combat balancing.

### Priority 3: GAME PRESENTATION

Add:

* Character artwork.
* Character animations.
* Arena backgrounds.
* Particles.
* Sound effects.
* Polished UI.
* Victory and defeat screens.

### Priority 4: ADDITIONAL FEATURES

Add:

* Multiple cats.
* Multiple arenas.
* Training mode.
* Bot opponent.
* XP and progression.
* Cosmetics.
* Match history.
* Advanced combat mechanics.

Do not build elaborate collection or progression screens before the core multiplayer battle works.

---

# 21. ACCEPTANCE TESTS

The game is not finished until the following tests pass.

**TEST 1: ROOM CREATION**

Player A creates a room and receives a valid room code.

**TEST 2: ROOM JOINING**

Player B joins using that room code.

Both players see each other in the waiting lobby.

**TEST 3: TWO-PLAYER RESTRICTION**

A third player cannot enter the already full room.

**TEST 4: MATCH START**

Both players select their cats and abilities, confirm readiness, and begin the match.

**TEST 5: MOVEMENT SYNCHRONIZATION**

Player A moves and jumps. Player B sees the updated movement.

Player B also moves and jumps. Player A sees the updated movement.

**TEST 6: COMBAT SYNCHRONIZATION**

Player A hits Player B.

Both clients display the same authoritative damage result.

**TEST 7: ENERGY SYSTEM**

Successful combat actions generate energy according to the rules.

Energy cannot exceed the configured maximum.

**TEST 8: ABILITY VALIDATION**

An ability cannot be activated if its cooldown or energy requirement has not been satisfied.

**TEST 9: VICTORY CONDITION**

When one player's health reaches zero, the match ends correctly for both players.

**TEST 10: REMATCH**

Both players can agree to a rematch without creating an entirely new room.

**TEST 11: DISCONNECTION**

Disconnecting during combat produces a clear, consistent result and cleans up the room correctly.

**TEST 12: MOBILE CONTROLS**

A player can complete a match using touchscreen controls.

**TEST 13: TRAINING MODE**

The training mode works independently of online multiplayer.

**TEST 14: DEPLOYMENT**

The project starts using documented commands, and two separate browser sessions can connect to the deployed game server.

Do not mark these tests as passed unless they have actually been verified.

---

# 22. FINAL DELIVERABLES

Deliver a complete and organized project containing:

1. The playable frontend game.
2. The multiplayer backend.
3. The real-time communication system.
4. Functional room creation and joining.
5. A working combat system.
6. Multiple cats and abilities.
7. A skill selection interface.
8. Energy and ultimate mechanics.
9. Desktop and mobile controls.
10. A training mode.
11. Necessary game assets.
12. Database configuration if required.
13. Environment variable examples.
14. A README with installation instructions.
15. Commands for running the client and server locally.
16. Deployment instructions.
17. A list of implemented features and known limitations.

Provide a clear project structure and make the game straightforward to run and maintain.

If a feature requires an external service, explain the dependency and provide configuration instructions instead of silently replacing it with a fake implementation.

Do not use placeholder buttons for core gameplay.

Do not simulate online multiplayer with two locally controlled characters.

Do not leave critical functions empty.

Do not claim a feature works unless it has been implemented and tested.

---

# 23. THE MOST IMPORTANT DESIGN PRINCIPLE

**Make every fight feel different.**

Players should not win simply because they selected a particular cat.

Victory should depend on:

* The chosen skill combination.
* Movement and positioning.
* Timing.
* Combo execution.
* Energy management.
* Defensive decisions.
* Reading the opponent.
* Knowing when to use an ultimate.

A Shadow Cat using teleportation and counterattacks should fight differently from a Fire Cat using aggressive close-range attacks.

A defensive player should be able to defeat an aggressive player through smart blocking and counters.

A skilled player should be able to use a creative combination of abilities rather than being forced into one optimal build.

Balance abilities so that each has advantages, disadvantages, and opportunities for counterplay.

Make the game fun to learn but difficult to master.

The animations, sound effects, energy buildup, attack impacts, and ultimate moves should make every successful combination feel rewarding.

## FINAL INSTRUCTION

Start by inspecting the available project and identifying its framework, existing files, and capabilities.

Then implement the actual game in the existing project structure.

Build the working multiplayer foundation first, followed by combat, skills, presentation, and progression.

Run the project, test the primary gameplay loop, fix errors, and verify that two separate clients can complete a real 1v1 match.

The final experience should feel like a polished, colorful, competitive indie fighting game featuring cats with spectacular supernatural abilities.

**The goal is not merely to demonstrate CAT CLASH. The goal is to make CAT CLASH genuinely playable.**
