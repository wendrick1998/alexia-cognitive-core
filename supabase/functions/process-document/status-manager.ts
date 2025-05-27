
import { updateDocumentStatus } from './database-service.ts';
import { ProcessingLogger } from './logger.ts';

export class StatusManager {
  private logger: ProcessingLogger;

  constructor(logger: ProcessingLogger) {
    this.logger = logger;
  }

  async setProcessing(documentId: string): Promise<void> {
    await updateDocumentStatus(documentId, 'processing');
    this.logger.log('🎯 Status atualizado para processing');
  }

  async setCompleted(documentId: string): Promise<void> {
    await updateDocumentStatus(documentId, 'completed');
    this.logger.log('📝 Status atualizado para completed');
  }

  async setFailed(documentId: string, errorMessage: string): Promise<void> {
    await updateDocumentStatus(documentId, 'failed', errorMessage);
    this.logger.log('📝 Status atualizado para failed');
  }
}
