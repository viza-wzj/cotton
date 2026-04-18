import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService, PageFlowRecord } from '../database/database.service';
import { CreatePageDto, PageListQueryDto, UpdatePageDto } from './dto/page.dto';
import { normalizeSchemaContent } from '../common/schema-version';

@Injectable()
export class PagesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createPageDto: CreatePageDto) {
    const id = this.generatePageId();
    const existing = this.databaseService.getPage(id);
    if (existing) {
      throw new ConflictException(`Page ${id} already exists`);
    }

    const flowHistory = this.buildFlowHistory(
      [],
      undefined,
      createPageDto.status,
      createPageDto.publishNote,
      createPageDto.publishOperator,
    );

    await this.databaseService.createPage({
      id,
      name: createPageDto.name,
      description: createPageDto.description,
      thumbnail: createPageDto.thumbnail,
      isTemplate: createPageDto.isTemplate,
      status: createPageDto.status,
      content: normalizeSchemaContent(createPageDto.content),
      flowHistory,
    });
    return { success: true, data: { id } };
  }

  findAll(query: PageListQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const keyword = query.keyword?.trim().toLowerCase();
    const status = query.status;
    const sortBy = query.sortBy ?? 'updated_at';
    const sortOrder = query.sortOrder ?? 'desc';

    let pages = this.databaseService.listPages().map((pageItem) => ({
      ...pageItem,
      content: normalizeSchemaContent(pageItem.content),
      flowHistory: pageItem.flowHistory ?? [],
    }));

    if (status) {
      pages = pages.filter((item) => (item.status ?? 'draft') === status);
    }

    if (keyword) {
      pages = pages.filter((item) => {
        const text = `${item.name || ''} ${item.description || ''} ${item.id}`.toLowerCase();
        return text.includes(keyword);
      });
    }

    pages.sort((a, b) => {
      if (sortBy === 'name') {
        const result = (a.name || '').localeCompare(b.name || '', 'zh-CN');
        return sortOrder === 'asc' ? result : -result;
      }

      const aValue =
        sortBy === 'created_at'
          ? new Date(a.created_at).getTime()
          : new Date(a.updated_at).getTime();
      const bValue =
        sortBy === 'created_at'
          ? new Date(b.created_at).getTime()
          : new Date(b.updated_at).getTime();

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    const total = pages.length;
    const start = (page - 1) * pageSize;
    const items = pages.slice(start, start + pageSize);

    return {
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
      },
    };
  }

  findOne(id: string) {
    const page = this.databaseService.getPage(id);
    if (!page) {
      throw new NotFoundException(`Page ${id} not found`);
    }
    return {
      success: true,
      data: {
        ...page,
        content: normalizeSchemaContent(page.content),
        flowHistory: page.flowHistory ?? [],
      },
    };
  }

  async update(id: string, updatePageDto: UpdatePageDto) {
    const existing = this.databaseService.getPage(id);
    if (!existing) {
      throw new NotFoundException(`Page ${id} not found`);
    }

    const flowHistory = this.buildFlowHistory(
      existing.flowHistory ?? [],
      existing.status,
      updatePageDto.status,
      updatePageDto.publishNote,
      updatePageDto.publishOperator,
      updatePageDto.flowHistory,
    );

    const payload = {
      ...(updatePageDto.name !== undefined ? { name: updatePageDto.name } : {}),
      ...(updatePageDto.description !== undefined
        ? { description: updatePageDto.description }
        : {}),
      ...(updatePageDto.thumbnail !== undefined
        ? { thumbnail: updatePageDto.thumbnail }
        : {}),
      ...(updatePageDto.status !== undefined ? { status: updatePageDto.status } : {}),
      ...(updatePageDto.content !== undefined
        ? { content: normalizeSchemaContent(updatePageDto.content) }
        : {}),
      flowHistory,
    };

    await this.databaseService.updatePage(id, {
      ...payload,
    });

    return { success: true, data: { id } };
  }

  async remove(id: string) {
    const existing = this.databaseService.getPage(id);
    if (!existing) {
      throw new NotFoundException(`Page ${id} not found`);
    }
    await this.databaseService.deletePage(id);
    return { success: true, data: { id } };
  }

  private buildFlowHistory(
    existingHistory: PageFlowRecord[],
    fromStatus?: string,
    toStatus?: string,
    note?: string,
    operator?: string,
    explicitHistory?: PageFlowRecord[],
  ): PageFlowRecord[] {
    if (explicitHistory) {
      return explicitHistory;
    }

    const from = fromStatus === 'published' ? 'published' : 'draft';
    const to = toStatus === 'published' ? 'published' : from;

    if (from === to) {
      return existingHistory;
    }

    const nextRecord: PageFlowRecord = {
      action: to === 'published' ? 'published' : 'unpublished',
      note: note?.trim() || undefined,
      operator: operator?.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    return [...existingHistory, nextRecord];
  }

  private generatePageId(): string {
    return `page_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}
