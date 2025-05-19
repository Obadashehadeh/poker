export enum TicketStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export interface TicketStatusConfig {
  status: TicketStatus;
  label: string;
  cssClass: string;
  color: string;
}

export const TICKET_STATUS_CONFIGS: TicketStatusConfig[] = [
  {
    status: TicketStatus.TODO,
    label: 'To Do',
    cssClass: 'status-todo',
    color: '#1976d2'
  },
  {
    status: TicketStatus.IN_PROGRESS,
    label: 'In Progress',
    cssClass: 'status-progress',
    color: '#f57c00'
  },
  {
    status: TicketStatus.DONE,
    label: 'Done',
    cssClass: 'status-done',
    color: '#388e3c'
  },
  {
    status: TicketStatus.OPEN,
    label: 'Open',
    cssClass: 'status-todo',
    color: '#1976d2'
  },
  {
    status: TicketStatus.CLOSED,
    label: 'Closed',
    cssClass: 'status-done',
    color: '#388e3c'
  }
];

export function getTicketStatusClass(status: string): string {
  if (!status) return 'status-todo';

  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus.includes('open') || normalizedStatus.includes('to do') || normalizedStatus.includes('todo')) {
    return 'status-todo';
  } else if (normalizedStatus.includes('progress') || normalizedStatus.includes('doing') || normalizedStatus.includes('in dev')) {
    return 'status-progress';
  } else if (normalizedStatus.includes('done') || normalizedStatus.includes('completed') || normalizedStatus.includes('closed')) {
    return 'status-done';
  }

  return 'status-todo';
}
