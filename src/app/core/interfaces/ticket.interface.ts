export interface JiraTicket {
  Key: string;
  Summary: string;
  Status: string;
  Assignee: string;
  Description: string;
  'Story point': number | string;
}

export interface TicketEstimate {
  ticketKey: string;
  estimate: number;
  timestamp: number;
  voters: string[];
}

export interface TicketSelection {
  ticket: JiraTicket;
  selectedBy: string;
  timestamp: number;
}
