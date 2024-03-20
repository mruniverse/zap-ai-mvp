import { Injectable } from '@nestjs/common';
import { SimpleDirectoryReader, storageContextFromDefaults, VectorStoreIndex, Document } from 'llamaindex';
import type { StorageContext } from 'llamaindex';

@Injectable()
export class ContextService {
  private storageContext: StorageContext;

  constructor() {
    storageContextFromDefaults({ persistDir: './storage' }).then((context) => {
      this.storageContext = context;
    });
  }

  async storeIndexFromFolder() {
    const reader = new SimpleDirectoryReader();
    const documents = await reader.loadData('./data');
    return await VectorStoreIndex.fromDocuments(documents, { storageContext: this.storageContext });
  }

  async storeIndexFromString(context: string) {
    const document = new Document({ text: context });
    return await VectorStoreIndex.fromDocuments([document], { storageContext: this.storageContext });
  }

  async searchIndex(query: string) {
    const index = await VectorStoreIndex.fromDocuments([], { storageContext: this.storageContext });
    const queryEngine = index.asQueryEngine();
    return (await queryEngine.query({ query })).toString();
  }
}
