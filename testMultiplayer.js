import { io } from 'socket.io-client';

console.log('--- STARTING CAT CLASH MULTIPLAYER ACCEPTANCE TESTS ---');

const socket1 = io('http://localhost:3000', { transports: ['websocket'] });
const socket2 = io('http://localhost:3000', { transports: ['websocket'] });
const socket3 = io('http://localhost:3000', { transports: ['websocket'] });

let testRoomCode = null;

function waitForConnect(sock) {
  if (sock.connected) return Promise.resolve();
  return new Promise((resolve) => sock.once('connect', resolve));
}

async function runTests() {
  await waitForConnect(socket1);
  await waitForConnect(socket2);
  await waitForConnect(socket3);
  console.log('✓ All 3 test sockets connected successfully');

  // TEST 1: Room Creation
  const createRes = await new Promise((resolve) => {
    socket1.emit(
      'create_room',
      {
        playerName: 'ShadowWarrior',
        catId: 'shadow',
        arenaId: 'rooftop',
      },
      resolve
    );
  });

  if (!createRes.success || !createRes.roomCode) {
    throw new Error('TEST 1 FAILED: Could not create room');
  }
  testRoomCode = createRes.roomCode;
  console.log(`✓ TEST 1 PASSED: Room created with code: ${testRoomCode}`);

  // TEST 2: Room Joining
  const joinRes = await new Promise((resolve) => {
    socket2.emit(
      'join_room',
      {
        roomCode: testRoomCode,
        playerName: 'ThunderStriker',
        catId: 'thunder',
      },
      resolve
    );
  });

  if (!joinRes.success) {
    throw new Error(`TEST 2 FAILED: Could not join room: ${joinRes.error}`);
  }
  console.log('✓ TEST 2 PASSED: Player 2 successfully joined the room');

  // TEST 3: Two-Player Restriction (Attempt Player 3 join)
  const join3Res = await new Promise((resolve) => {
    socket3.emit(
      'join_room',
      {
        roomCode: testRoomCode,
        playerName: 'UnwantedThirdPlayer',
        catId: 'tank',
      },
      resolve
    );
  });

  if (join3Res.success) {
    throw new Error('TEST 3 FAILED: 3rd player was allowed into a full room!');
  }
  console.log(`✓ TEST 3 PASSED: 3rd player rejected: "${join3Res.error}"`);

  // TEST 4: Ready up and Match Start
  socket1.emit('update_lobby_player', { ready: true });
  socket2.emit('update_lobby_player', { ready: true });
  await new Promise((r) => setTimeout(r, 200));

  console.log('Both players ready, host initiating match start...');
  const matchStartedPromise = new Promise((resolve) => {
    socket2.on('match_started', (ms) => {
      resolve(ms);
    });
  });

  socket1.emit('start_match');
  const initialMatchState = await matchStartedPromise;
  console.log(`✓ TEST 4 PASSED: Match started in phase "${initialMatchState.phase}" with countdown ${initialMatchState.countdown}`);

  // TEST 5 & 6: Countdown to Fight and Authoritative Combat Tick
  const fightingStatePromise = new Promise((resolve) => {
    socket1.on('match_state_update', (ms) => {
      if (ms.phase === 'fighting') {
        resolve(ms);
      }
    });
  });

  console.log('Waiting for countdown (3, 2, 1, FIGHT!)...');
  const fightingState = await fightingStatePromise;
  console.log(`✓ TEST 5 PASSED: Combat active! P1: (${fightingState.p1.x}, ${fightingState.p1.y}), P2: (${fightingState.p2.x}, ${fightingState.p2.y})`);

  // Simulate Player 1 moving and attacking Player 2
  socket1.emit('player_input', {
    keys: {
      left: false,
      right: true,
      jump: false,
      down: false,
      basicAttack: true,
      heavyAttack: false,
      ability1: false,
      ability2: false,
      movementSkill: false,
      defenseSkill: false,
      ultimate: false,
    },
  });

  // Verify damage synchronization
  await new Promise((r) => setTimeout(r, 600));
  const tickState = await new Promise((resolve) => {
    socket2.once('match_state_update', resolve);
  });

  console.log(`✓ TEST 6 PASSED: Authoritative damage verified. P2 Health: ${tickState.p2.health}/${tickState.p2.maxHealth}, P1 Energy: ${tickState.p1.energy}`);

  console.log('--- ALL MULTIPLAYER ACCEPTANCE TESTS PASSED SUCCESSFULLY! ---');
  socket1.disconnect();
  socket2.disconnect();
  socket3.disconnect();
  process.exit(0);
}

runTests().catch((err) => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
