import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FileHandlerService } from '../../../shared/services/file-handler.service';
import { IssueStorageService } from '../services/issue-storage.service';
import { JiraTicket } from '../../../core/interfaces/ticket.interface';
import { ValidationUtil } from '../../../shared/utils/validation.util';

export interface ImportResult {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  warnings: string[];
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class IssueImportService {
  constructor(
    private fileHandler: FileHandlerService,
    private issueStorage: IssueStorageService
  ) {}

  async importFromExcel(file: File): Promise<ImportResult> {
    try {
      const fileValidation = this.fileHandler.validateFileBeforeUpload(file);
      if (!fileValidation.valid) {
        return {
          success: false,
          importedCount: 0,
          skippedCount: 0,
          warnings: [],
          error: fileValidation.error
        };
      }

      const processingResult = await this.fileHandler.processExcelFile(file);

      if (!processingResult.success) {
        return {
          success: false,
          importedCount: 0,
          skippedCount: 0,
          warnings: [],
          error: processingResult.error
        };
      }

      const convertResult = this.convertToTickets(processingResult.data || []);

      if (convertResult.validTickets.length > 0) {
        this.issueStorage.storeTickets(convertResult.validTickets);
      }

      return {
        success: true,
        importedCount: convertResult.validTickets.length,
        skippedCount: convertResult.invalidTickets.length,
        warnings: [
          ...(processingResult.warnings || []),
          ...convertResult.warnings
        ]
      };
    } catch (error) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        warnings: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private convertToTickets(data: any[]): {
    validTickets: JiraTicket[];
    invalidTickets: any[];
    warnings: string[];
  } {
    const validTickets: JiraTicket[] = [];
    const invalidTickets: any[] = [];
    const warnings: string[] = [];

    data.forEach((row, index) => {
      try {
        const ticket = this.normalizeRowToTicket(row);

        if (ValidationUtil.isValidTicket(ticket)) {
          validTickets.push(ticket);
        } else {
          invalidTickets.push(row);
          warnings.push(`Row ${index + 2}: Invalid ticket data - missing required fields`);
        }
      } catch (error) {
        invalidTickets.push(row);
        warnings.push(`Row ${index + 2}: Error processing row - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    const uniqueTickets = this.removeDuplicateTickets(validTickets, warnings);

    return {
      validTickets: uniqueTickets,
      invalidTickets,
      warnings
    };
  }

  private normalizeRowToTicket(row: any): JiraTicket {
    return {
      Key: this.getFieldValue(row, ['Key', 'key', 'ID', 'id']),
      Summary: this.getFieldValue(row, ['Summary', 'summary', 'Title', 'title', 'Subject']),
      Status: this.getFieldValue(row, ['Status', 'status', 'State']) || 'To Do',
      Assignee: this.getFieldValue(row, ['Assignee', 'assignee', 'Assigned To', 'Owner']) || '',
      Description: this.getFieldValue(row, ['Description', 'description', 'Details']) || '',
      'Story point': this.getFieldValue(row, ['Story point', 'Story Point', 'StoryPoint', 'Points', 'Estimate']) || ''
    };
  }

  private getFieldValue(row: any, fieldNames: string[]): string {
    for (const fieldName of fieldNames) {
      if (row[fieldName] !== undefined && row[fieldName] !== null) {
        return String(row[fieldName]).trim();
      }
    }
    return '';
  }

  private removeDuplicateTickets(tickets: JiraTicket[], warnings: string[]): JiraTicket[] {
    const uniqueTickets: JiraTicket[] = [];
    const seenKeys = new Set<string>();

    tickets.forEach((ticket, index) => {
      if (seenKeys.has(ticket.Key)) {
        warnings.push(`Duplicate ticket key found: ${ticket.Key} - keeping first occurrence`);
      } else {
        seenKeys.add(ticket.Key);
        uniqueTickets.push(ticket);
      }
    });

    return uniqueTickets;
  }

  exportToExcel(): void {
    const tickets = this.issueStorage.getStoredTickets();

    if (tickets.length === 0) {
      throw new Error('No tickets to export');
    }

    const filename = `planning_poker_issues_${new Date().toISOString().slice(0, 10)}.xlsx`;
    this.fileHandler.exportToExcel(tickets, filename);
  }

  exportToCSV(): void {
    const tickets = this.issueStorage.getStoredTickets();

    if (tickets.length === 0) {
      throw new Error('No tickets to export');
    }

    const filename = `planning_poker_issues_${new Date().toISOString().slice(0, 10)}.csv`;
    this.fileHandler.exportToCSV(tickets, filename);
  }

  downloadImportTemplate(): void {
    const templateData = [
      {
        Key: 'PROJ-001',
        Summary: 'Example user story',
        Status: 'To Do',
        Assignee: 'john.doe@example.com',
        Description: 'This is an example user story for the import template',
        'Story point': ''
      },
      {
        Key: 'PROJ-002',
        Summary: 'Another example task',
        Status: 'In Progress',
        Assignee: 'jane.smith@example.com',
        Description: 'This is another example to show the expected format',
        'Story point': '5'
      }
    ];

    const filename = 'planning_poker_import_template.xlsx';
    this.fileHandler.exportToExcel(templateData, filename);
  }

  async validateImportData(file: File): Promise<{
    valid: boolean;
    preview: JiraTicket[];
    warnings: string[];
    error?: string;
  }> {
    try {
      const processingResult = await this.fileHandler.processExcelFile(file);

      if (!processingResult.success) {
        return {
          valid: false,
          preview: [],
          warnings: [],
          error: processingResult.error
        };
      }

      const convertResult = this.convertToTickets(processingResult.data || []);

      return {
        valid: convertResult.validTickets.length > 0,
        preview: convertResult.validTickets.slice(0, 5),
        warnings: convertResult.warnings
      };
    } catch (error) {
      return {
        valid: false,
        preview: [],
        warnings: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  getSupportedFileTypes(): string[] {
    return ['.xlsx', '.xls'];
  }

  getImportStatistics(): Observable<{
    totalTickets: number;
    lastImport: Date | null;
    importHistory: any[];
  }> {
    return new Observable(observer => {
      const stats = {
        totalTickets: this.issueStorage.getTicketsCount(),
        lastImport: this.getLastImportDate(),
        importHistory: this.getImportHistory()
      };

      observer.next(stats);
      observer.complete();
    });
  }

  private getLastImportDate(): Date | null {
    const timestamp = this.issueStorage.getLastUpdateTimestamp();
    return timestamp ? new Date(timestamp) : null;
  }

  private getImportHistory(): any[] {
    return [];
  }

  clearAllIssues(): void {
    this.issueStorage.clearTickets();
  }

  async mergeImport(file: File, replaceExisting: boolean = false): Promise<ImportResult> {
    try {
      const importResult = await this.importFromExcel(file);

      if (!importResult.success) {
        return importResult;
      }

      if (!replaceExisting) {
        const existingTickets = this.issueStorage.getStoredTickets();
        const newTickets = [];
      }

      return importResult;
    } catch (error) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        warnings: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}
