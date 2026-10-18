import React, { useState, useEffect } from 'react';
import { ArenaId, CatId, MatchState, PlayerLoadout, RoomData, UserProfile } from './types/game';
import { BotDifficulty } from './engine/botAI';
import { CATS } from './config/cats';
import { socketClient } from './network/socketClient';
import { soundEngine } from './audio/soundEngine';
import { MainMenu } from './components/MainMenu';
import { Lobby } from './components/Lobby';
import { BattleScreen } from './components/BattleScreen';
import { VictoryDefeatModal } from './components/VictoryDefeatModal';
import { CollectionScreen } from './components/CollectionScreen';
import { SettingsModal } from './components/SettingsModal';
import { SkillSelectionModal } from './components/SkillSelectionModal';
import { EditProfileModal } from './components/EditProfileModal';

type AppView = 'MENU' | 'LOBBY' | 'BATTLE' | 'COLLECTION';

export const App: React.FC = () => {
  const [view, setView] = useState<AppView>('MENU');

  // Persistent User Profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('catclash_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return {
      id: 'player_' + Math.random().toString(36).substring(2, 8),
      name: 'CatWarrior_' + Math.floor(Math.random() * 900 + 100),
      level: 1,
      xp: 0,
      wins: 0,
      losses: 0,
      matchesPlayed: 0,
      unlockedSkins: ['default'],
      history: [],
    };
  });

  // Selected Cat & Loadout
  const [selectedCatId, setSelectedCatId] = useState<CatId>('shadow');
  const [loadout, setLoadout] = useState<PlayerLoadout>(() => CATS.shadow.defaultLoadout);

  // Match Session Tracker & Bot Configurations
  const [matchSessionId, setMatchSessionId] = useState<number>(1);
  const [trainingBotDifficulty, setTrainingBotDifficulty] = useState<BotDifficulty>('normal');
  const [trainingBotCatId, setTrainingBotCatId] = useState<CatId>('fire');

  // Online Multiplayer State
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [isOnlineMatch, setIsOnlineMatch] = useState<boolean>(false);
  const [activeMatchState, setActiveMatchState] = useState<MatchState | null>(null);
  const [completedMatchState, setCompletedMatchState] = useState<MatchState | null>(null);
  const [waitingForRematch, setWaitingForRematch] = useState<boolean>(false);

  // Settings & Modals
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showLoadoutModal, setShowLoadoutModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showMobileControls, setShowMobileControls] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const isTouch = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
      const isNarrow = window.innerWidth <= 1024;
      return Boolean(isTouch || isNarrow);
    }
    return false;
  });
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Save profile helper (persists to localStorage + updates active lobby)
  const saveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    try {
      localStorage.setItem('catclash_profile', JSON.stringify(newProfile));
    } catch (e) {
      // ignore
    }
    // If in an active room, update our name on the server
    if (roomData) {
      socketClient.updateLobby({ name: newProfile.name });
    }
  };

  // Prevent accidental pull-to-refresh or navigation in active session
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (view === 'LOBBY' || view === 'BATTLE') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [view]);

  // Keep loadout synced when switching cat in menu
  const handleSelectCat = (catId: CatId) => {
    setSelectedCatId(catId);
    setLoadout(CATS[catId]?.defaultLoadout || CATS.shadow.defaultLoadout);
  };

  // Socket Room Listeners & Session Restoration
  useEffect(() => {
    socketClient.init();

    socketClient.onRoomUpdated((updatedRoom) => {
      setRoomData(updatedRoom);
    });

    socketClient.onMatchStarted((ms) => {
      setActiveMatchState(ms);
      setCompletedMatchState(null);
      setWaitingForRematch(false);
      setIsOnlineMatch(true);
      setMatchSessionId((id) => id + 1);
      setView('BATTLE');
    });

    socketClient.onRematchStatus(({ waitingForOther }) => {
      setWaitingForRematch(waitingForOther);
    });

    socketClient.onOpponentDisconnected(({ message, room }) => {
      setRoomData(room);
      setAlertMessage(message);
      if (view === 'BATTLE') {
        setView('LOBBY');
      }
    });

    // Attempt to restore persistent room session if user refreshed the page
    try {
      const savedRoomJson = sessionStorage.getItem('catclash_active_room');
      if (savedRoomJson) {
        const savedRoom = JSON.parse(savedRoomJson);
        if (savedRoom?.roomCode) {
          console.log('Restoring active bout frequency:', savedRoom.roomCode);
          socketClient.rejoinRoom(
            savedRoom.roomCode,
            profile.name,
            selectedCatId,
            loadout,
            profile.id
          ).then((res) => {
            if (res.success && res.room) {
              setRoomData(res.room);
              setView('LOBBY');
            } else {
              sessionStorage.removeItem('catclash_active_room');
            }
          });
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Online Flow: Create Private Room
  const handleCreateRoom = async () => {
    const res = await socketClient.createRoom(
      profile.name,
      selectedCatId,
      loadout,
      'rooftop',
      profile.id
    );
    if (res.success && res.room) {
      setRoomData(res.room);
      try {
        sessionStorage.setItem(
          'catclash_active_room',
          JSON.stringify({ roomCode: res.room.roomCode, role: 'host' })
        );
      } catch (e) {
        // ignore
      }
      setView('LOBBY');
    } else {
      setAlertMessage(res.error || 'Failed to create room.');
    }
  };

  // Online Flow: Join Private Room
  const handleJoinRoom = async (code: string) => {
    const res = await socketClient.joinRoom(
      code,
      profile.name,
      selectedCatId,
      loadout,
      profile.id
    );
    if (res.success && res.room) {
      setRoomData(res.room);
      try {
        sessionStorage.setItem(
          'catclash_active_room',
          JSON.stringify({ roomCode: res.room.roomCode, role: 'guest' })
        );
      } catch (e) {
        // ignore
      }
      setView('LOBBY');
    } else {
      setAlertMessage(res.error || 'Failed to join room.');
    }
  };

  // Offline Training Flow
  const handleStartTraining = () => {
    setIsOnlineMatch(false);
    setActiveMatchState(null);
    setCompletedMatchState(null);
    setMatchSessionId((id) => id + 1);
    setView('BATTLE');
  };

  // Match End Handler (grants XP and shows Victory/Defeat Modal)
  const handleMatchEnd = (finalMs: MatchState) => {
    setCompletedMatchState(finalMs);

    const localId = isOnlineMatch ? socketClient.socket?.id || profile.id : 'p1';
    const isWinner = finalMs.stats?.winnerId === localId;

    // Grant XP
    const xpGained = isWinner ? 150 : 60;
    const newXp = profile.xp + xpGained;
    const newLevel = Math.floor(newXp / 300) + 1;
    const updatedProfile: UserProfile = {
      ...profile,
      xp: newXp,
      level: newLevel,
      wins: profile.wins + (isWinner ? 1 : 0),
      losses: profile.losses + (isWinner ? 0 : 1),
      matchesPlayed: profile.matchesPlayed + 1,
      history: [
        {
          date: new Date().toLocaleDateString(),
          result: isWinner ? 'VICTORY' : 'DEFEAT',
          opponent: isOnlineMatch ? 'Online Challenger' : 'Training Bot',
          catUsed: selectedCatId,
          duration: `${finalMs.stats?.matchDuration ?? 30}s`,
        },
        ...profile.history.slice(0, 9),
      ],
    };
    saveProfile(updatedProfile);
  };

  // Rematch Request
  const handleRematch = () => {
    if (isOnlineMatch) {
      socketClient.requestRematch();
      setWaitingForRematch(true);
    } else {
      setCompletedMatchState(null);
      setActiveMatchState(null);
      setMatchSessionId((id) => id + 1);
      setView('BATTLE');
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#07060f] text-[#f4f4f0] font-game selection:bg-cyan-400 selection:text-black overflow-x-hidden">
      {/* Alert Banner */}
      {alertMessage && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 clip-chamfer glass-panel border border-red-500/80 text-red-200 px-6 py-2.5 shadow-2xl flex items-center gap-4 text-xs font-title font-bold tracking-wider animate-fade-in">
          <span>⚠️ {alertMessage}</span>
          <button
            onClick={() => setAlertMessage(null)}
            className="text-[10px] uppercase tracking-wider px-2.5 py-1 clip-chamfer bg-red-950 border border-red-500/60 hover:bg-red-900 text-red-100 transition"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* VIEW ROUTER */}
      {view === 'MENU' && (
        <MainMenu
          profile={profile}
          selectedCatId={selectedCatId}
          onSelectCat={handleSelectCat}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onStartTraining={handleStartTraining}
          onOpenCollection={() => setView('COLLECTION')}
          onOpenSettings={() => setShowSettings(true)}
          onEditProfile={() => setShowProfileModal(true)}
        />
      )}

      {view === 'LOBBY' && roomData && (
        <Lobby
          roomData={roomData}
          localPlayerId={socketClient.socket?.id || ''}
          localProfileId={profile.id}
          onStartMatch={() => {}}
          onLeaveRoom={() => {
            try {
              sessionStorage.removeItem('catclash_active_room');
            } catch (e) {
              // ignore
            }
            socketClient.leaveRoom();
            setRoomData(null);
            setView('MENU');
          }}
        />
      )}

      {view === 'BATTLE' && (
        <BattleScreen
          key={`battle-${matchSessionId}`}
          isOnline={isOnlineMatch}
          arenaId={roomData?.arenaId || 'rooftop'}
          localPlayerId={isOnlineMatch ? socketClient.socket?.id || profile.id : 'p1'}
          initialMatchState={activeMatchState || undefined}
          trainingCatId={selectedCatId}
          trainingLoadout={loadout}
          trainingBotDifficulty={trainingBotDifficulty}
          onChangeBotDifficulty={setTrainingBotDifficulty}
          trainingBotCatId={trainingBotCatId}
          onChangeBotCat={setTrainingBotCatId}
          showMobileControls={showMobileControls}
          onToggleMobileControls={() => setShowMobileControls((prev) => !prev)}
          onMatchEnd={handleMatchEnd}
          onExit={() => {
            if (isOnlineMatch) {
              try {
                sessionStorage.removeItem('catclash_active_room');
              } catch (e) {
                // ignore
              }
              socketClient.leaveRoom();
            }
            setRoomData(null);
            setActiveMatchState(null);
            setCompletedMatchState(null);
            setView('MENU');
          }}
        />
      )}

      {view === 'COLLECTION' && (
        <CollectionScreen profile={profile} onClose={() => setView('MENU')} />
      )}

      {/* VICTORY / DEFEAT MODAL OVERLAY */}
      {completedMatchState && (
        <VictoryDefeatModal
          matchState={completedMatchState}
          localPlayerId={isOnlineMatch ? socketClient.socket?.id || profile.id : 'p1'}
          onRematch={handleRematch}
          onChangeLoadout={() => setShowLoadoutModal(true)}
          onLeave={() => {
            if (isOnlineMatch) {
              try {
                sessionStorage.removeItem('catclash_active_room');
              } catch (e) {
                // ignore
              }
              socketClient.leaveRoom();
            }
            setCompletedMatchState(null);
            setRoomData(null);
            setView('MENU');
          }}
          waitingForRematch={waitingForRematch}
        />
      )}

      {/* SKILL LOADOUT MODAL */}
      {showLoadoutModal && (
        <SkillSelectionModal
          catId={selectedCatId}
          currentLoadout={loadout}
          onSave={(newLoadout) => {
            setLoadout(newLoadout);
            if (isOnlineMatch && roomData) {
              socketClient.updateLobby({ loadout: newLoadout });
            }
          }}
          onClose={() => setShowLoadoutModal(false)}
        />
      )}

      {/* EDIT PROFILE MODAL */}
      {showProfileModal && (
        <EditProfileModal
          profile={profile}
          selectedCatId={selectedCatId}
          onSave={saveProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          showMobileControls={showMobileControls}
          setShowMobileControls={setShowMobileControls}
          profile={profile}
          onEditProfile={() => {
            setShowSettings(false);
            setShowProfileModal(true);
          }}
        />
      )}
    </div>
  );
};
