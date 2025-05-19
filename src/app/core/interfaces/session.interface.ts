export interface SessionParticipant {
  id: string;
  displayName: string;
  isHost: boolean;
  isOnline: boolean;
  joinedAt: number;
  lastSeen: number;
}

export interface SessionMessage {
  type: SessionMessageType;
  data: any;
  sender: {
    id: string;
    isHost: boolean;
    sessionId: string;
  };
  timestamp: number;
}

export interface SessionState {
  sessionId: string;
  gameConfig: import('./game-config.interface').GameConfig;
  participants: SessionParticipant[];
  currentTicket?: import('./ticket.interface').JiraTicket;
  isVotingActive: boolean;
  votes: Record<string, number>;
  lastActivity: number;
}

export enum SessionMessageType {
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  VOTE = 'vote',
  REVEAL = 'reveal',
  RESET_VOTING = 'reset_voting',
  SELECT_TICKET = 'select_ticket',
  UPDATE_ISSUES = 'update_issues',
  FULL_STATE = 'full_state',
  HEARTBEAT = 'heartbeat',
  REQUEST_STATE = 'request_state',
  FORCE_SYNC = 'force_sync'
}
