export interface Vote {
  participantId: string;
  participantName: string;
  cardValue: number;
  timestamp: number;
  ticketKey?: string;
}

export interface VotingRound {
  ticketKey: string;
  startTime: number;
  endTime?: number;
  votes: Vote[];
  isRevealed: boolean;
  finalEstimate?: number;
}

export interface VotingState {
  currentRound?: VotingRound;
  isActive: boolean;
  countdown?: {
    value: number;
    isActive: boolean;
  };
  participantVotes: Record<string, number>;
}

export interface VotingResults {
  average: number;
  consensus: boolean;
  distribution: Record<number, number>;
  participantVotes: Record<string, number>;
  suggestedEstimate: number;
}
