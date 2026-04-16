import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';

@Injectable()
export class TemplatesService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(createTemplateDto: CreateTemplateDto) {
    this.databaseService.createTemplate(createTemplateDto);
    return { success: true, data: { id: createTemplateDto.id } };
  }

  findAll() {
    const templates = this.databaseService.listTemplates();
    return { success: true, data: templates };
  }

  findOne(id: string) {
    const template = this.databaseService.getTemplate(id);
    if (!template) {
      throw new NotFoundException(`Template ${id} not found`);
    }
    return { success: true, data: template };
  }

  update(id: string, updateTemplateDto: UpdateTemplateDto) {
    const existing = this.databaseService.getTemplate(id);
    if (!existing) {
      throw new NotFoundException(`Template ${id} not found`);
    }
    // 先获取现有模板
    const template = this.databaseService.getTemplate(id);
    // 合并更新
    const updated = { ...template, ...updateTemplateDto };
    this.databaseService.createTemplate(updated);
    return { success: true, data: { id } };
  }

  remove(id: string) {
    const existing = this.databaseService.getTemplate(id);
    if (!existing) {
      throw new NotFoundException(`Template ${id} not found`);
    }
    this.databaseService.deleteTemplate(id);
    return { success: true, data: { id } };
  }
}
