import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto';

@Injectable()
export class PagesService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(createPageDto: CreatePageDto) {
    this.databaseService.createPage(createPageDto);
    return { success: true, data: { id: createPageDto.id } };
  }

  findAll() {
    const pages = this.databaseService.listPages();
    return { success: true, data: pages };
  }

  findOne(id: string) {
    const page = this.databaseService.getPage(id);
    if (!page) {
      throw new NotFoundException(`Page ${id} not found`);
    }
    return { success: true, data: page };
  }

  update(id: string, updatePageDto: UpdatePageDto) {
    const existing = this.databaseService.getPage(id);
    if (!existing) {
      throw new NotFoundException(`Page ${id} not found`);
    }
    this.databaseService.updatePage(id, updatePageDto);
    return { success: true, data: { id } };
  }

  remove(id: string) {
    const existing = this.databaseService.getPage(id);
    if (!existing) {
      throw new NotFoundException(`Page ${id} not found`);
    }
    this.databaseService.deletePage(id);
    return { success: true, data: { id } };
  }
}
