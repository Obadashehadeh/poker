import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { BaseStorageService } from '../../../shared/services/base-storage.service';
import { GameConfig, GameSession } from '../../../core/interfaces/game-config.interface';
import { GameType, GAME_TYPE_CONFIGS } from '../../../core/enums/game-type.enum';
import { STORAGE_KEYS } from '../../../core/constants/app.constants';
import { IdGenerator } from '../../../shared/utils/id-generator.util';
import { ValidationUtil } from '../../../shared/utils/validation.util';

@Injectable({
  providedIn: 'root'
})
export class GameCreationService extends BaseStorageService {
  private gameConfigSubject = new BehaviorSubject<GameConfig | null>(null);
  public gameConfig$ = this.gameConfigSubject.asObservable();

  private gameSessionSubject = new BehaviorSubject<GameSession | null>(null);
  public gameSession$ = this.gameSessionSubject.asObservable();

  constructor() {
    super();
    this.loadStoredGameConfig();
  }

  private loadStoredGameConfig(): void {
    const storedConfig = this.getStoredGameConfig();
    if (storedConfig) {
      this.gameConfigSubject.next(storedConfig);
    }
  }

  createGame(config: GameConfig): Observable<GameSession> {
    return new Observable(observer => {
      try {
        const validation = this.validateGameConfig(config);
        if (!validation.valid) {
          observer.error(new Error(validation.error));
          return;
        }

        const gameSession: GameSession = {
          id: IdGenerator.generateSessionId(),
          config: config,
          settings: {
            revealTimeout: 30000,
            allowChangeVote: true,
            showVoterNames: true,
            enableChat: false
          },
          hostId: IdGenerator.generateClientId(),
          participants: [],
          createdAt: Date.now()
        };

        this.storeGameConfig(config);
        this.storeGameSession(gameSession);

        this.gameConfigSubject.next(config);
        this.gameSessionSubject.next(gameSession);

        observer.next(gameSession);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }

  private validateGameConfig(config: GameConfig): { valid: boolean; error?: string } {
    if (!ValidationUtil.isValidGameName(config.name)) {
      return { valid: false, error: 'Invalid game name' };
    }

    if (!Object.values(GameType).includes(config.type)) {
      return { valid: false, error: 'Invalid game type' };
    }

    if (!config.cardValues || config.cardValues.length === 0) {
      return { valid: false, error: 'Card values are required' };
    }

    if (!config.cardValues.every(value => typeof value === 'number')) {
      return { valid: false, error: 'All card values must be numbers' };
    }

    return { valid: true };
  }

  getAvailableGameTypes(): typeof GAME_TYPE_CONFIGS {
    return GAME_TYPE_CONFIGS;
  }

  getCardValuesForGameType(gameType: GameType): number[] {
    const config = GAME_TYPE_CONFIGS.find(c => c.type === gameType);
    return config ? config.values : [];
  }

  generateCardValues(gameType: GameType): number[] {
    switch (gameType) {
      case GameType.FIBONACCI:
        return [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
      case GameType.NUMBERS:
        return Array.from({ length: 15 }, (_, i) => i + 1);
      case GameType.POWERS_OF_TWO:
        return [0, 1, 2, 4, 8, 16, 32, 64];
      default:
        return [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
    }
  }

  private storeGameConfig(config: GameConfig): void {
    this.setItem(STORAGE_KEYS.GAME_NAME, config.name);
    this.setItem(STORAGE_KEYS.GAME_TYPE, config.type);
    this.setItem('gameConfig', config);
  }

  getStoredGameConfig(): GameConfig | null {
    const config = this.getItem<GameConfig>('gameConfig');
    if (config) {
      return config;
    }

    const gameName = this.getItem<string>(STORAGE_KEYS.GAME_NAME);
    const gameType = this.getItem<GameType>(STORAGE_KEYS.GAME_TYPE);

    if (gameName && gameType) {
      return {
        name: gameName,
        type: gameType,
        cardValues: this.generateCardValues(gameType)
      };
    }

    return null;
  }

  private storeGameSession(session: GameSession): void {
    this.setItem('gameSession', session);
    this.setItem(STORAGE_KEYS.SESSION_ID, session.id);
  }

  getStoredGameSession(): GameSession | null {
    return this.getItem<GameSession>('gameSession');
  }

  updateGameConfig(config: Partial<GameConfig>): void {
    const currentConfig = this.gameConfigSubject.value;
    if (currentConfig) {
      const updatedConfig = { ...currentConfig, ...config };
      this.storeGameConfig(updatedConfig);
      this.gameConfigSubject.next(updatedConfig);
    }
  }

  updateGameSession(session: Partial<GameSession>): void {
    const currentSession = this.gameSessionSubject.value;
    if (currentSession) {
      const updatedSession = { ...currentSession, ...session };
      this.storeGameSession(updatedSession);
      this.gameSessionSubject.next(updatedSession);
    }
  }

  clearGameData(): void {
    this.removeItem('gameConfig');
    this.removeItem('gameSession');
    this.removeItem(STORAGE_KEYS.GAME_NAME);
    this.removeItem(STORAGE_KEYS.GAME_TYPE);
    this.removeItem(STORAGE_KEYS.SESSION_ID);

    this.gameConfigSubject.next(null);
    this.gameSessionSubject.next(null);
  }

  getCurrentGameName(): string | null {
    const config = this.gameConfigSubject.value;
    return config ? config.name : null;
  }

  getCurrentGameType(): GameType | null {
    const config = this.gameConfigSubject.value;
    return config ? config.type : null;
  }

  getCurrentCardValues(): number[] {
    const config = this.gameConfigSubject.value;
    return config ? config.cardValues : [];
  }

  isGameConfigured(): boolean {
    return this.gameConfigSubject.value !== null;
  }

  getGameTypeDisplayName(gameType: GameType): string {
    const config = GAME_TYPE_CONFIGS.find(c => c.type === gameType);
    return config ? config.label : gameType;
  }

  getGameTypeDescription(gameType: GameType): string {
    const config = GAME_TYPE_CONFIGS.find(c => c.type === gameType);
    return config ? config.description : '';
  }
}
