import { Injectable, OnModuleInit } from '@nestjs/common';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import * as path from 'path';
import * as fs from 'fs';

interface DatabaseSchema {
  pages: Page[];
  templates: Template[];
  componentConfigs: ComponentConfig[];
}

interface Page {
  id: string;
  name: string;
  description?: string;
  content: any;
  thumbnail?: string;
  isTemplate?: boolean;
  status?: string;
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

interface ComponentConfig {
  id: string;
  componentType: string;
  name: string;
  config: any;
  isDefault?: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class DatabaseService implements OnModuleInit {
  private db: Low<DatabaseSchema>;

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
      componentConfigs: [],
    };
  }

  private async write() {
    await this.db.write();
  }

  // 页面相关操作
  async createPage(page: Page) {
    const now = new Date().toISOString();
    const newPage: Page = {
      ...page,
      created_at: now,
      updated_at: now,
    };
    this.db.data.pages.push(newPage);
    await this.write();
    return newPage;
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
    const index = this.db.data.pages.findIndex((p) => p.id === id);
    if (index === -1) return null;

    this.db.data.pages[index] = {
      ...this.db.data.pages[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await this.write();
    return this.db.data.pages[index];
  }

  async deletePage(id: string) {
    const index = this.db.data.pages.findIndex((p) => p.id === id);
    if (index === -1) return false;

    this.db.data.pages.splice(index, 1);
    await this.write();
    return true;
  }

  // 模板相关操作
  async createTemplate(template: Template) {
    const now = new Date().toISOString();
    const newTemplate: Template = {
      ...template,
      created_at: now,
      updated_at: now,
    };
    this.db.data.templates.push(newTemplate);
    await this.write();
    return newTemplate;
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
    const index = this.db.data.templates.findIndex((t) => t.id === id);
    if (index === -1) return null;

    this.db.data.templates[index] = {
      ...this.db.data.templates[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await this.write();
    return this.db.data.templates[index];
  }

  async deleteTemplate(id: string) {
    const index = this.db.data.templates.findIndex((t) => t.id === id);
    if (index === -1) return false;

    this.db.data.templates.splice(index, 1);
    await this.write();
    return true;
  }
}
