export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  SYNCING = 'syncing',
  ERROR = 'error'
}

export enum ConnectionType {
  HOST = 'host',
  CLIENT = 'client',
  OBSERVER = 'observer'
}
