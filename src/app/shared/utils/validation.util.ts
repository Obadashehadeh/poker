import { JiraTicket } from '../../core/interfaces/ticket.interface';

export class ValidationUtil {
  static isNotEmpty(value: string): boolean {
    return value && value.trim().length > 0;
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidExcelFile(file: File): boolean {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/octet-stream'
    ];

    return validTypes.includes(file.type) ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls');
  }

  static isValidFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  static validateRequiredColumns(data: any[], requiredColumns: string[]): string[] {
    if (!data || data.length === 0) return [];

    const firstRow = data[0];
    return requiredColumns.filter(col => !(col in firstRow));
  }

  static isValidTicket(ticket: any): ticket is JiraTicket {
    return ticket &&
      typeof ticket.Key === 'string' &&
      typeof ticket.Summary === 'string' &&
      ticket.Key.trim().length > 0 &&
      ticket.Summary.trim().length > 0;
  }

  static validateTickets(tickets: any[]): { valid: JiraTicket[], invalid: any[] } {
    const valid: JiraTicket[] = [];
    const invalid: any[] = [];

    tickets.forEach(ticket => {
      if (this.isValidTicket(ticket)) {
        valid.push(ticket);
      } else {
        invalid.push(ticket);
      }
    });

    return { valid, invalid };
  }

  static isValidCardValue(value: any, allowedValues: number[]): boolean {
    return typeof value === 'number' && allowedValues.includes(value);
  }

  static isValidSessionId(sessionId: string): boolean {
    return sessionId && sessionId.length >= 16 && /^[a-zA-Z0-9]+$/.test(sessionId);
  }

  static isValidDisplayName(name: string): boolean {
    return this.isNotEmpty(name) && name.trim().length <= 50;
  }

  static isValidGameName(name: string): boolean {
    return this.isNotEmpty(name) && name.trim().length <= 100;
  }

  static sanitizeInput(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  static isPositiveNumber(value: any): boolean {
    return typeof value === 'number' && value > 0 && isFinite(value);
  }

  static isNonNegativeNumber(value: any): boolean {
    return typeof value === 'number' && value >= 0 && isFinite(value);
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
