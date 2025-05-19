import { Injectable } from '@angular/core';
import { Observable, Subject, interval, fromEvent } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { ConnectionStatus } from '../../core/enums/connection-status.enum';
import { SessionMessage, SessionMessageType } from '../../core/interfaces/session.interface';
import { IdGenerator } from '../utils/id-generator.util';
import { APP_CONSTANTS } from '../../core/constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class PeerJSConnectionService {
  private peer: any = null;
  private connections: Map<string, any> = new Map();
  private isHost = false;
  private peerId: string | null = null;
  private hostPeerId: string | null = null;

  private connectionStatus$ = new Subject<ConnectionStatus>();
  private messageReceived$ = new Subject<SessionMessage>();
  private participantJoined$ = new Subject<string>();
  private participantLeft$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  private heartbeatInterval: any = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.initializePeerJS();
  }

  private async initializePeerJS(): Promise<void> {
    try {
      const { Peer } = await import("peerjs");

      this.peerId = IdGenerator.generateClientId();
      this.peer = new Peer(this.peerId, {
        host: 'localhost',
        port: 9000,
        path: '/myapp',
        secure: false,
        debug: 0
      });

      this.setupPeerEventHandlers();
      this.connectionStatus$.next(ConnectionStatus.CONNECTING);
    } catch (error) {
      console.error('Failed to initialize PeerJS:', error);
      this.connectionStatus$.next(ConnectionStatus.ERROR);
    }
  }

  private setupPeerEventHandlers(): void {
    if (!this.peer) return;

    this.peer.on('open', (id: string) => {
      console.log('PeerJS connection opened with ID:', id);
      this.peerId = id;
      this.connectionStatus$.next(ConnectionStatus.CONNECTED);
      this.startHeartbeat();
    });

    this.peer.on('connection', (conn: any) => {
      this.handleIncomingConnection(conn);
    });

    this.peer.on('error', (error: any) => {
      console.error('PeerJS error:', error);
      this.connectionStatus$.next(ConnectionStatus.ERROR);
      this.handleReconnection();
    });

    this.peer.on('disconnected', () => {
      console.log('PeerJS disconnected');
      this.connectionStatus$.next(ConnectionStatus.DISCONNECTED);
      this.handleReconnection();
    });

    this.peer.on('close', () => {
      console.log('PeerJS connection closed');
      this.connectionStatus$.next(ConnectionStatus.DISCONNECTED);
    });
  }

  private handleIncomingConnection(conn: any): void {
    this.connections.set(conn.peer, conn);

    conn.on('data', (data: any) => {
      this.handleReceivedMessage(data);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      this.participantLeft$.next(conn.peer);
    });

    conn.on('error', (error: any) => {
      console.error('Connection error with peer:', conn.peer, error);
      this.connections.delete(conn.peer);
    });

    this.participantJoined$.next(conn.peer);
  }

  private handleReceivedMessage(data: any): void {
    try {
      if (this.isValidSessionMessage(data)) {
        this.messageReceived$.next(data);
      }
    } catch (error) {
      console.error('Error handling received message:', error);
    }
  }

  private isValidSessionMessage(data: any): data is SessionMessage {
    return data &&
      typeof data.type === 'string' &&
      data.sender &&
      typeof data.timestamp === 'number';
  }

  createGameSession(): Observable<string> {
    return new Observable(observer => {
      if (!this.peer || !this.peerId) {
        observer.error('PeerJS not initialized');
        return;
      }

      this.isHost = true;
      observer.next(this.peerId);
      observer.complete();
    });
  }

  joinGameSession(hostPeerId: string): Observable<boolean> {
    return new Observable(observer => {
      if (!this.peer) {
        observer.error('PeerJS not initialized');
        return;
      }

      this.isHost = false;
      this.hostPeerId = hostPeerId;

      try {
        const conn = this.peer.connect(hostPeerId);

        conn.on('open', () => {
          this.connections.set(hostPeerId, conn);
          this.setupConnectionHandlers(conn);
          observer.next(true);
          observer.complete();
        });

        conn.on('error', (error: any) => {
          console.error('Error connecting to host:', error);
          observer.error(error);
        });
      } catch (error) {
        observer.error(error);
      }
    });
  }

  private setupConnectionHandlers(conn: any): void {
    conn.on('data', (data: any) => {
      this.handleReceivedMessage(data);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      if (conn.peer === this.hostPeerId) {
        this.connectionStatus$.next(ConnectionStatus.DISCONNECTED);
      }
    });

    conn.on('error', (error: any) => {
      console.error('Connection error:', error);
      this.connections.delete(conn.peer);
    });
  }

  broadcastMessage(type: SessionMessageType, data: any): void {
    const message: SessionMessage = {
      type,
      data,
      sender: {
        id: this.peerId || '',
        isHost: this.isHost,
        sessionId: this.peerId || ''
      },
      timestamp: Date.now()
    };

    this.connections.forEach((conn, peerId) => {
      try {
        if (conn.open) {
          conn.send(message);
        } else {
          // Connection is closed, remove it
          this.connections.delete(peerId);
        }
      } catch (error) {
        console.error(`Error sending message to ${peerId}:`, error);
        this.connections.delete(peerId);
      }
    });
  }

  sendMessageToPeer(peerId: string, type: SessionMessageType, data: any): void {
    const conn = this.connections.get(peerId);
    if (!conn || !conn.open) {
      console.warn(`No open connection to peer ${peerId}`);
      return;
    }

    const message: SessionMessage = {
      type,
      data,
      sender: {
        id: this.peerId || '',
        isHost: this.isHost,
        sessionId: this.peerId || ''
      },
      timestamp: Date.now()
    };

    try {
      conn.send(message);
    } catch (error) {
      console.error(`Error sending message to ${peerId}:`, error);
      this.connections.delete(peerId);
    }
  }

  getConnectionStatus(): Observable<ConnectionStatus> {
    return this.connectionStatus$.asObservable();
  }

  getMessageReceived(): Observable<SessionMessage> {
    return this.messageReceived$.asObservable();
  }

  getParticipantJoined(): Observable<string> {
    return this.participantJoined$.asObservable();
  }

  getParticipantLeft(): Observable<string> {
    return this.participantLeft$.asObservable();
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      this.broadcastMessage(SessionMessageType.HEARTBEAT, {
        timestamp: Date.now(),
        peerId: this.peerId,
        isHost: this.isHost
      });
    }, APP_CONSTANTS.SESSION.HEARTBEAT_INTERVAL);
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);

    setTimeout(() => {
      console.log(`Reconnection attempt ${this.reconnectAttempts}`);
      this.reconnect();
    }, delay);
  }

  private reconnect(): void {
    if (this.peer && !this.peer.destroyed) {
      this.peer.reconnect();
    } else {
      this.initializePeerJS();
    }
  }

  getPeerId(): string | null {
    return this.peerId;
  }

  isHostPeer(): boolean {
    return this.isHost;
  }

  getConnectedPeers(): string[] {
    return Array.from(this.connections.keys());
  }

  getConnectionCount(): number {
    return this.connections.size;
  }
  disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    this.connections.forEach((conn) => {
      try {
        if (conn.open) {
          conn.close();
        }
      } catch (error) {
        console.error('Error closing connection:', error);
      }
    });
    this.connections.clear();

    if (this.peer && !this.peer.destroyed) {
      this.peer.destroy();
    }

    this.isHost = false;
    this.peerId = null;
    this.hostPeerId = null;
    this.reconnectAttempts = 0;

    this.destroy$.next();
    this.destroy$.complete();

    this.connectionStatus$.next(ConnectionStatus.DISCONNECTED);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
