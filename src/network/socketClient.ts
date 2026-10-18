import { io, Socket } from 'socket.io-client';
import { ArenaId, CatId, ControlKeys, MatchState, PlayerLoadout, RoomData } from '../types/game';

class SocketClient {
  public socket: Socket | null = null;
  public latency: number = 0;
  private pingInterval: number | null = null;

  public init() {
    if (this.socket) return;

    // Connect to server (configured via VITE_SERVER_URL or current host)
    const serverUrl = (import.meta.env.VITE_SERVER_URL as string) || undefined;
    this.socket = io(serverUrl, {
      // Start with polling (works on all hosting), then upgrade to WS
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      withCredentials: !!serverUrl, // credentials only when cross-origin
    });

    this.socket.on('connect', () => {
      console.log('Connected to Cat Clash server:', this.socket?.id);
      this.startPing();
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.stopPing();
    });
  }

  private startPing() {
    this.stopPing();
    this.pingInterval = window.setInterval(() => {
      if (!this.socket || !this.socket.connected) return;
      const start = Date.now();
      this.socket.emit('latency_ping', start, () => {
        this.latency = Date.now() - start;
      });
    }, 2000);
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  public createRoom(
    playerName: string,
    catId: CatId,
    loadout: PlayerLoadout,
    arenaId: ArenaId
  ): Promise<{ success: boolean; roomCode?: string; room?: RoomData; error?: string }> {
    this.init();
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ success: false, error: 'Socket not initialized' });
      this.socket.emit(
        'create_room',
        { playerName, catId, loadout, arenaId },
        (res: { success: boolean; roomCode?: string; room?: RoomData; error?: string }) => {
          resolve(res);
        }
      );
    });
  }

  public joinRoom(
    roomCode: string,
    playerName: string,
    catId: CatId,
    loadout: PlayerLoadout
  ): Promise<{ success: boolean; roomCode?: string; room?: RoomData; error?: string }> {
    this.init();
    return new Promise((resolve) => {
      if (!this.socket) return resolve({ success: false, error: 'Socket not initialized' });
      this.socket.emit(
        'join_room',
        { roomCode, playerName, catId, loadout },
        (res: { success: boolean; roomCode?: string; room?: RoomData; error?: string }) => {
          resolve(res);
        }
      );
    });
  }

  public updateLobby(data: { catId?: CatId; loadout?: PlayerLoadout; ready?: boolean; arenaId?: ArenaId }) {
    if (!this.socket) return;
    this.socket.emit('update_lobby_player', data);
  }

  public startMatch() {
    if (!this.socket) return;
    this.socket.emit('start_match');
  }

  public sendInput(keys: ControlKeys) {
    if (!this.socket) return;
    this.socket.emit('player_input', { keys });
  }

  public requestRematch() {
    if (!this.socket) return;
    this.socket.emit('request_rematch');
  }

  public leaveRoom() {
    if (!this.socket) return;
    this.socket.emit('leave_room');
  }

  // Event Listeners
  public onRoomUpdated(cb: (room: RoomData) => void) {
    this.socket?.off('room_updated');
    this.socket?.on('room_updated', cb);
  }

  public onMatchStarted(cb: (ms: MatchState) => void) {
    this.socket?.off('match_started');
    this.socket?.on('match_started', cb);
  }

  public onCountdownTick(cb: (num: number | string) => void) {
    this.socket?.off('countdown_tick');
    this.socket?.on('countdown_tick', cb);
  }

  public onMatchStateUpdate(cb: (ms: MatchState) => void) {
    this.socket?.off('match_state_update');
    this.socket?.on('match_state_update', cb);
  }

  public onMatchFinished(cb: (ms: MatchState) => void) {
    this.socket?.off('match_finished');
    this.socket?.on('match_finished', cb);
  }

  public onOpponentDisconnected(cb: (data: { message: string; room: RoomData }) => void) {
    this.socket?.off('opponent_disconnected');
    this.socket?.on('opponent_disconnected', cb);
  }

  public onRematchStatus(cb: (data: { requesterId: string; waitingForOther: boolean }) => void) {
    this.socket?.off('rematch_status');
    this.socket?.on('rematch_status', cb);
  }
}

export const socketClient = new SocketClient();
