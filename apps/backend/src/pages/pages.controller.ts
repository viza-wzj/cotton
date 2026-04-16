import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PagesService } from './pages.service';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto';

@ApiTags('pages')
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @ApiOperation({ summary: '创建页面' })
  @ApiResponse({ status: 201, description: '页面创建成功' })
  create(@Body() createPageDto: CreatePageDto) {
    return this.pagesService.create(createPageDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有页面' })
  @ApiResponse({ status: 200, description: '获取页面列表成功' })
  findAll() {
    return this.pagesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取页面详情' })
  @ApiResponse({ status: 200, description: '获取页面成功' })
  findOne(@Param('id') id: string) {
    return this.pagesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新页面' })
  @ApiResponse({ status: 200, description: '页面更新成功' })
  update(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
    return this.pagesService.update(id, updatePageDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除页面' })
  @ApiResponse({ status: 200, description: '页面删除成功' })
  remove(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }
}
