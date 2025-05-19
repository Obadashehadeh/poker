export const APP_CONSTANTS = {
  APP_NAME: 'Planning Poker Online',
  VERSION: '1.0.0',
  STORAGE_PREFIX: 'poker_',

  SESSION: {
    HEARTBEAT_INTERVAL: 3000,
    CONNECTION_TIMEOUT: 10000,
    SYNC_RETRY_ATTEMPTS: 15,
    SYNC_RETRY_DELAYS: [100, 300, 600, 1000, 1500, 2000, 3000, 4000, 5000, 7000, 10000, 15000, 20000, 25000, 30000],
    MAX_PARTICIPANTS: 20
  },

  VOTING: {
    COUNTDOWN_DURATION: 3,
    AUTO_REVEAL_TIMEOUT: 30000,
    MIN_VOTES_FOR_CONSENSUS: 2,
    CONSENSUS_THRESHOLD: 0.8
  },

  FILE_UPLOAD: {
    ACCEPTED_TYPES: ['.xlsx', '.xls'],
    MAX_SIZE_MB: 10,
    REQUIRED_COLUMNS: ['Key', 'Summary'],
    OPTIONAL_COLUMNS: ['Status', 'Assignee', 'Description', 'Story point']
  },

  UI: {
    NOTIFICATION_DURATION: 3000,
    SIDEBAR_BREAKPOINT: 768,
    ANIMATION_DURATION: 200
  },

  ERROR_MESSAGES: {
    CONNECTION_FAILED: 'Connection failed. Please check your network.',
    FILE_UPLOAD_FAILED: 'File upload failed. Please try again.',
    INVALID_FILE_TYPE: 'Invalid file type. Please upload an Excel file.',
    SYNC_FAILED: 'Synchronization failed. Please refresh and try again.',
    SESSION_EXPIRED: 'Session expired. Please create a new game.'
  },

  SUCCESS_MESSAGES: {
    FILE_UPLOADED: 'File uploaded successfully!',
    ESTIMATE_SAVED: 'Estimate saved successfully!',
    INVITE_COPIED: 'Invitation link copied to clipboard!',
    SYNC_COMPLETED: 'Synchronization completed!'
  }
} as const;

export const STORAGE_KEYS = {
  SESSION_ID: `${APP_CONSTANTS.STORAGE_PREFIX}sessionId`,
  CLIENT_ID: `${APP_CONSTANTS.STORAGE_PREFIX}clientId`,
  DISPLAY_NAME: `${APP_CONSTANTS.STORAGE_PREFIX}displayName`,
  GAME_NAME: `${APP_CONSTANTS.STORAGE_PREFIX}gameName`,
  GAME_TYPE: `${APP_CONSTANTS.STORAGE_PREFIX}gameType`,
  TICKETS: `${APP_CONSTANTS.STORAGE_PREFIX}tickets`,
  SELECTED_TICKET: `${APP_CONSTANTS.STORAGE_PREFIX}selectedTicket`,
  SELECTED_CARDS: `${APP_CONSTANTS.STORAGE_PREFIX}selectedCards`,
  SYNC_VERSION: `${APP_CONSTANTS.STORAGE_PREFIX}syncVersion`,
  LAST_UPDATE: `${APP_CONSTANTS.STORAGE_PREFIX}lastUpdate`
} as const;

export const BROADCAST_EVENTS = {
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  VOTE: 'vote',
  REVEAL: 'reveal',
  RESET_VOTING: 'reset_voting',
  SELECT_TICKET: 'select_ticket',
  UPDATE_ISSUES: 'update_issues',
  FULL_STATE: 'full_state',
  HEARTBEAT: 'heartbeat',
  REQUEST_STATE: 'request_state',
  FORCE_SYNC: 'force_sync',
  CLIENT_JOINED: 'client_joined',
  PING: 'ping',
  PONG: 'pong'
} as const;
