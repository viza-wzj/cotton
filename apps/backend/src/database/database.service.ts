import { Injectable, OnModuleInit } from '@nestjs/common';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import * as path from 'path';
import * as fs from 'fs';

interface DatabaseSchema {
  pages: Page[];
  templates: Template[];
}

export interface PageFlowRecord {
  action: 'published' | 'unpublished';
  note?: string;
  operator?: string;
  timestamp: string;
}

interface Page {
  id: string;
  name: string;
  description?: string;
  content: any;
  thumbnail?: string;
  isTemplate?: boolean;
  status?: string;
  flowHistory?: PageFlowRecord[];
  created_at: string;
  updated_at: string;
}

interface Template {
  id: string;
  name: string;
  description?: string;
  category?: string;
  content: any;
  thumbnail?: string;
  tags?: string[];
  isPublic?: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class DatabaseService implements OnModuleInit {
  private db: Low<DatabaseSchema>;
  private writeQueue: Promise<void> = Promise.resolve();

  async onModuleInit() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = path.join(dataDir, 'cotton-db.json');
    const adapter = new JSONFile<DatabaseSchema>(dbPath);
    this.db = new Low<DatabaseSchema>(adapter, this.getInitialData());

    await this.db.read();
    console.log(`✅ Database connected: ${dbPath}`);
    console.log('✅ Database tables initialized');
  }

  private getInitialData(): DatabaseSchema {
    return {
      pages: [],
      templates: [],
    };
  }

  private enqueueWriteTask<T>(task: () => Promise<T>): Promise<T> {
    const nextTask = this.writeQueue.then(task, task);
    this.writeQueue = nextTask.then(
      () => undefined,
      () => undefined,
    );
    return nextTask;
  }

  // 页面相关操作
  async createPage(page: Omit<Page, 'created_at' | 'updated_at'>) {
    return this.enqueueWriteTask(async () => {
      const now = new Date().toISOString();
      const newPage: Page = {
        ...page,
        flowHistory: page.flowHistory ?? [],
        created_at: now,
        updated_at: now,
      };
      this.db.data.pages.push(newPage);
      await this.db.write();
      return newPage;
    });
  }

  getPage(id: string): Page | undefined {
    return this.db.data.pages.find((p) => p.id === id);
  }

  listPages(): Page[] {
    return [...this.db.data.pages].sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }

  async updatePage(id: string, updates: Partial<Page>) {
    return this.enqueueWriteTask(async () => {
      const index = this.db.data.pages.findIndex((p) => p.id === id);
      if (index === -1) return null;

      this.db.data.pages[index] = {
        ...this.db.data.pages[index],
        ...updates,
        flowHistory: updates.flowHistory ?? this.db.data.pages[index].flowHistory ?? [],
        updated_at: new Date().toISOString(),
      };
      await this.db.write();
      return this.db.data.pages[index];
    });
  }

  async deletePage(id: string) {
    return this.enqueueWriteTask(async () => {
      const index = this.db.data.pages.findIndex((p) => p.id === id);
      if (index === -1) return false;

      this.db.data.pages.splice(index, 1);
      await this.db.write();
      return true;
    });
  }

  // 模板相关操作
  async createTemplate(template: Omit<Template, 'created_at' | 'updated_at'>) {
    return this.enqueueWriteTask(async () => {
      const now = new Date().toISOString();
      const newTemplate: Template = {
        ...template,
        created_at: now,
        updated_at: now,
      };
      this.db.data.templates.push(newTemplate);
      await this.db.write();
      return newTemplate;
    });
  }

  getTemplate(id: string): Template | undefined {
    return this.db.data.templates.find((t) => t.id === id);
  }

  listTemplates(): Template[] {
    return [...this.db.data.templates].sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }

  async updateTemplate(id: string, updates: Partial<Template>) {
    return this.enqueueWriteTask(async () => {
      const index = this.db.data.templates.findIndex((t) => t.id === id);
      if (index === -1) return null;

      this.db.data.templates[index] = {
        ...this.db.data.templates[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      await this.db.write();
      return this.db.data.templates[index];
    });
  }

  async deleteTemplate(id: string) {
    return this.enqueueWriteTask(async () => {
      const index = this.db.data.templates.findIndex((t) => t.id === id);
      if (index === -1) return false;

      this.db.data.templates.splice(index, 1);
      await this.db.write();
      return true;
    });
  }
}
