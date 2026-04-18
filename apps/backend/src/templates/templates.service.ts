import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';
import { normalizeSchemaContent } from '../common/schema-version';

@Injectable()
export class TemplatesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createTemplateDto: CreateTemplateDto) {
    const id = this.generateTemplateId();
    const existing = this.databaseService.getTemplate(id);
    if (existing) {
      throw new ConflictException(`Template ${id} already exists`);
    }

    await this.databaseService.createTemplate({
      id,
      ...createTemplateDto,
      content: normalizeSchemaContent(createTemplateDto.content),
    });
    return { success: true, data: { id } };
  }

  findAll() {
    const templates = this.databaseService.listTemplates().map((template) => ({
      ...template,
      content: normalizeSchemaContent(template.content),
    }));
    return { success: true, data: templates };
  }

  findOne(id: string) {
    const template = this.databaseService.getTemplate(id);
    if (!template) {
      throw new NotFoundException(`Template ${id} not found`);
    }
    return {
      success: true,
      data: {
        ...template,
        content: normalizeSchemaContent(template.content),
      },
    };
  }

  async update(id: string, updateTemplateDto: UpdateTemplateDto) {
    const existing = this.databaseService.getTemplate(id);
    if (!existing) {
      throw new NotFoundException(`Template ${id} not found`);
    }

    await this.databaseService.updateTemplate(id, {
      ...updateTemplateDto,
      ...(updateTemplateDto.content !== undefined
        ? { content: normalizeSchemaContent(updateTemplateDto.content) }
        : {}),
    });
    return { success: true, data: { id } };
  }

  async remove(id: string) {
    const existing = this.databaseService.getTemplate(id);
    if (!existing) {
      throw new NotFoundException(`Template ${id} not found`);
    }
    await this.databaseService.deleteTemplate(id);
    return { success: true, data: { id } };
  }

  private generateTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}
