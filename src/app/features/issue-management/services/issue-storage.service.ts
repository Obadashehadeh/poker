import { Injectable } from '@angular/core';
import { BaseStorageService } from '../../../shared/services/base-storage.service';
import { JiraTicket } from '../../../core/interfaces/ticket.interface';
import { STORAGE_KEYS } from '../../../core/constants/app.constants';
import { BehaviorSubject, Observable } from 'rxjs';
import { ValidationUtil } from '../../../shared/utils/validation.util';

@Injectable({
  providedIn: 'root'
})
export class IssueStorageService extends BaseStorageService {
  private ticketsSubject = new BehaviorSubject<JiraTicket[]>([]);
  private selectedTicketSubject = new BehaviorSubject<JiraTicket | null>(null);
  private syncVersionSubject = new BehaviorSubject<number>(0);

  public tickets$ = this.ticketsSubject.asObservable();
  public selectedTicket$ = this.selectedTicketSubject.asObservable();
  public syncVersion$ = this.syncVersionSubject.asObservable();

  constructor() {
    super();
    this.loadStoredData();
  }

  private loadStoredData(): void {
    const tickets = this.getStoredTickets();
    const selectedTicket = this.getStoredSelectedTicket();
    const syncVersion = this.getSyncVersion();

    this.ticketsSubject.next(tickets);
    this.selectedTicketSubject.next(selectedTicket);
    this.syncVersionSubject.next(syncVersion);
  }

  storeTickets(tickets: JiraTicket[]): void {
    try {
      const { valid, invalid } = ValidationUtil.validateTickets(tickets);

      if (invalid.length > 0) {
        console.warn(`${invalid.length} invalid tickets were filtered out`);
      }

      const normalizedTickets = valid.map(ticket => this.normalizeTicket(ticket));

      this.setItem(STORAGE_KEYS.TICKETS, normalizedTickets);
      this.setItem(STORAGE_KEYS.LAST_UPDATE, Date.now());
      this.updateSyncVersion();

      this.ticketsSubject.next(normalizedTickets);

      const storedTickets = this.getStoredTickets();
      if (storedTickets.length !== normalizedTickets.length) {
        this.forceStoreTickets(normalizedTickets);
      }
    } catch (error) {
      this.handleStorageError('storeTickets', STORAGE_KEYS.TICKETS, error);
      throw new Error('Failed to store tickets');
    }
  }

  getStoredTickets(): JiraTicket[] {
    try {
      const tickets = this.getItem<JiraTicket[]>(STORAGE_KEYS.TICKETS, []);
      return Array.isArray(tickets) ? tickets : [];
    } catch (error) {
      this.handleStorageError('getStoredTickets', STORAGE_KEYS.TICKETS, error);
      return [];
    }
  }

  storeSelectedTicket(ticket: JiraTicket | null): void {
    try {
      if (ticket && !ValidationUtil.isValidTicket(ticket)) {
        throw new Error('Invalid ticket data');
      }

      this.setItem(STORAGE_KEYS.SELECTED_TICKET, ticket);
      this.selectedTicketSubject.next(ticket);
    } catch (error) {
      this.handleStorageError('storeSelectedTicket', STORAGE_KEYS.SELECTED_TICKET, error);
      throw new Error('Failed to store selected ticket');
    }
  }

  getStoredSelectedTicket(): JiraTicket | null {
    try {
      const ticket = this.getItem<JiraTicket>(STORAGE_KEYS.SELECTED_TICKET);
      return ticket && ValidationUtil.isValidTicket(ticket) ? ticket : null;
    } catch (error) {
      this.handleStorageError('getStoredSelectedTicket', STORAGE_KEYS.SELECTED_TICKET, error);
      return null;
    }
  }

  updateTicketStoryPoints(ticketKey: string, storyPoints: number): void {
    const tickets = this.getStoredTickets();
    const ticketIndex = tickets.findIndex(t => t.Key === ticketKey);

    if (ticketIndex !== -1) {
      tickets[ticketIndex]['Story point'] = storyPoints;
      this.storeTickets(tickets);

      const selectedTicket = this.selectedTicketSubject.value;
      if (selectedTicket && selectedTicket.Key === ticketKey) {
        selectedTicket['Story point'] = storyPoints;
        this.selectedTicketSubject.next({ ...selectedTicket });
      }
    }
  }

  getTicketsByStatus(hasEstimate: boolean): JiraTicket[] {
    const tickets = this.ticketsSubject.value;
    return hasEstimate
      ? tickets.filter(ticket => ticket['Story point'] && ticket['Story point'] !== '')
      : tickets.filter(ticket => !ticket['Story point'] || ticket['Story point'] === '');
  }

  searchTickets(query: string): JiraTicket[] {
    const tickets = this.ticketsSubject.value;
    const searchQuery = query.toLowerCase();

    return tickets.filter(ticket =>
      ticket.Key.toLowerCase().includes(searchQuery) ||
      ticket.Summary.toLowerCase().includes(searchQuery) ||
      (ticket.Description && ticket.Description.toLowerCase().includes(searchQuery))
    );
  }

  getTicketStatistics(): {
    total: number;
    estimated: number;
    unestimated: number;
    averageEstimate: number;
  } {
    const tickets = this.ticketsSubject.value;
    const estimated = tickets.filter(t => t['Story point'] && t['Story point'] !== '');
    const estimates = estimated
      .map(t => typeof t['Story point'] === 'number' ? t['Story point'] : parseFloat(t['Story point'].toString()))
      .filter(e => !isNaN(e));

    const averageEstimate = estimates.length > 0
      ? estimates.reduce((sum, est) => sum + est, 0) / estimates.length
      : 0;

    return {
      total: tickets.length,
      estimated: estimated.length,
      unestimated: tickets.length - estimated.length,
      averageEstimate: Math.round(averageEstimate * 10) / 10
    };
  }

  clearTickets(): void {
    this.removeItem(STORAGE_KEYS.TICKETS);
    this.removeItem(STORAGE_KEYS.SELECTED_TICKET);
    this.updateSyncVersion();

    this.ticketsSubject.next([]);
    this.selectedTicketSubject.next(null);
  }

  private normalizeTicket(ticket: JiraTicket): JiraTicket {
    return {
      Key: ticket.Key.trim(),
      Summary: ticket.Summary.trim(),
      Status: ticket.Status || 'To Do',
      Assignee: ticket.Assignee || '',
      Description: ticket.Description || '',
      'Story point': ticket['Story point'] || ''
    };
  }

  private forceStoreTickets(tickets: JiraTicket[]): void {
    try {
      this.removeItem(STORAGE_KEYS.TICKETS);

      setTimeout(() => {
        this.setItem(STORAGE_KEYS.TICKETS, tickets);
        this.ticketsSubject.next(tickets);
      }, 100);
    } catch (error) {
      this.handleStorageError('forceStoreTickets', STORAGE_KEYS.TICKETS, error);
    }
  }

  private updateSyncVersion(): void {
    const currentVersion = this.getSyncVersion();
    const newVersion = currentVersion + 1;
    this.setItem(STORAGE_KEYS.SYNC_VERSION, newVersion);
    this.syncVersionSubject.next(newVersion);
  }

  private getSyncVersion(): number {
    try {
      return this.getItem<number>(STORAGE_KEYS.SYNC_VERSION, 0) || 0;
    } catch (error) {
      this.handleStorageError('getSyncVersion', STORAGE_KEYS.SYNC_VERSION, error);
      return 0;
    }
  }

  getLastUpdateTimestamp(): number {
    try {
      return this.getItem<number>(STORAGE_KEYS.LAST_UPDATE, 0) || 0;
    } catch (error) {
      this.handleStorageError('getLastUpdateTimestamp', STORAGE_KEYS.LAST_UPDATE, error);
      return 0;
    }
  }

  exportTickets(): { tickets: JiraTicket[]; metadata: any } {
    return {
      tickets: this.getStoredTickets(),
      metadata: {
        exportDate: new Date().toISOString(),
        ticketCount: this.ticketsSubject.value.length,
        syncVersion: this.getSyncVersion(),
        lastUpdate: this.getLastUpdateTimestamp()
      }
    };
  }

  importTickets(data: { tickets: JiraTicket[]; metadata?: any }): void {
    if (!Array.isArray(data.tickets)) {
      throw new Error('Invalid import data format');
    }

    this.storeTickets(data.tickets);
  }

  getTicketsCount(): number {
    return this.ticketsSubject.value.length;
  }

  hasTickets(): boolean {
    return this.ticketsSubject.value.length > 0;
  }
}
