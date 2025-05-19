export class IdGenerator {
  static generateSessionId(): string {
    return this.generateId(16) + Date.now().toString(36);
  }

  static generateClientId(): string {
    let clientId = localStorage.getItem('clientId');
    if (!clientId) {
      clientId = this.generateId(12) + Date.now().toString(36);
      localStorage.setItem('clientId', clientId);
    }
    return clientId;
  }

  static generateInvitationId(): string {
    return this.generateId(8);
  }

  static generateId(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  static generateShortId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  static generateTimestampId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  }
}
