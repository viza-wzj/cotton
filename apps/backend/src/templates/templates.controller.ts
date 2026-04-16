import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';

@ApiTags('templates')
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @ApiOperation({ summary: '创建模板' })
  @ApiResponse({ status: 201, description: '模板创建成功' })
  create(@Body() createTemplateDto: CreateTemplateDto) {
    return this.templatesService.create(createTemplateDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有模板' })
  @ApiResponse({ status: 200, description: '获取模板列表成功' })
  findAll() {
    return this.templatesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取模板详情' })
  @ApiResponse({ status: 200, description: '获取模板成功' })
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新模板' })
  @ApiResponse({ status: 200, description: '模板更新成功' })
  update(@Param('id') id: string, @Body() updateTemplateDto: UpdateTemplateDto) {
    return this.templatesService.update(id, updateTemplateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除模板' })
  @ApiResponse({ status: 200, description: '模板删除成功' })
  remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }
}
