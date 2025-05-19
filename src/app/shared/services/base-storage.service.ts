import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../../core/constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseStorageService {
  protected setItem(key: string, value: any): void {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      this.handleStorageError('setItem', key, error);
    }
  }

  protected getItem<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }

      try {
        return JSON.parse(item);
      } catch {
        return item as unknown as T;
      }
    } catch (error) {
      this.handleStorageError('getItem', key, error);
      return defaultValue;
    }
  }

  protected removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      this.handleStorageError('removeItem', key, error);
    }
  }

  protected clearAllItems(): void {
    try {
      const keysToRemove = Object.values(STORAGE_KEYS);
      keysToRemove.forEach(key => this.removeItem(key));
    } catch (error) {
      this.handleStorageError('clearAllItems', 'all', error);
    }
  }

  protected isStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  protected getStorageSize(): number {
    try {
      let totalSize = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }
      return totalSize;
    } catch (error) {
      this.handleStorageError('getStorageSize', 'all', error);
      return 0;
    }
  }

  protected isStorageQuotaExceeded(): boolean {
    try {
      const testKey = '__quota_test__';
      const testValue = 'x'.repeat(1000); // 1KB test
      localStorage.setItem(testKey, testValue);
      localStorage.removeItem(testKey);
      return false;
    } catch (error) {
      return true;
    }
  }

  protected handleStorageError(operation: string, key: string, error: any): void {
    if (this.isStorageQuotaExceeded()) {
      this.handleStorageQuotaExceeded();
    }
  }

  protected handleStorageQuotaExceeded(): void {
    console.warn('Storage quota exceeded, clearing old data...');

    try {
      const nonEssentialKeys = [
        STORAGE_KEYS.SELECTED_CARDS,
        STORAGE_KEYS.SYNC_VERSION,
        STORAGE_KEYS.LAST_UPDATE
      ];

      nonEssentialKeys.forEach(key => this.removeItem(key));
    } catch (error) {
      console.error('Failed to clear storage space:', error);
    }
  }

  public exportStorageData(): Record<string, any> {
    const data: Record<string, any> = {};

    try {
      Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
        data[name] = this.getItem(key);
      });

      data._metadata = {
        timestamp: new Date().toISOString(),
        storageSize: this.getStorageSize(),
        isQuotaExceeded: this.isStorageQuotaExceeded()
      };
    } catch (error) {
      console.error('Failed to export storage data:', error);
    }

    return data;
  }

  public validateStorageHealth(): { isHealthy: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!this.isStorageAvailable()) {
      issues.push('LocalStorage is not available');
    }

    if (this.isStorageQuotaExceeded()) {
      issues.push('Storage quota exceeded');
    }

    const storageSize = this.getStorageSize();
    if (storageSize > 5 * 1024 * 1024) { // 5MB
      issues.push('Storage size is unusually large');
    }

    return {
      isHealthy: issues.length === 0,
      issues
    };
  }
}
