import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  IsIn,
  IsArray,
  IsInt,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

const PAGE_STATUS = ['draft', 'published'] as const;
const PAGE_SORT_BY = ['updated_at', 'created_at', 'name'] as const;
const PAGE_SORT_ORDER = ['asc', 'desc'] as const;

export class PublishRecordDto {
  @ApiProperty({ description: '动作', enum: ['published', 'unpublished'] })
  @IsString()
  @IsIn(['published', 'unpublished'])
  action: 'published' | 'unpublished';

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ description: '操作人', required: false })
  @IsOptional()
  @IsString()
  operator?: string;

  @ApiProperty({ description: '操作时间' })
  @IsString()
  timestamp: string;
}

export class CreatePageDto {
  @ApiProperty({ description: '页面名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '页面描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '页面内容' })
  @IsObject()
  content: any;

  @ApiProperty({ description: '缩略图', required: false })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({ description: '是否为模板', required: false })
  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;

  @ApiProperty({ description: '状态', required: false, enum: PAGE_STATUS })
  @IsOptional()
  @IsIn(PAGE_STATUS)
  status?: string;

  @ApiProperty({ description: '发布备注', required: false })
  @IsOptional()
  @IsString()
  publishNote?: string;

  @ApiProperty({ description: '发布操作人', required: false })
  @IsOptional()
  @IsString()
  publishOperator?: string;
}

export class UpdatePageDto {
  @ApiProperty({ description: '页面名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '页面描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '页面内容', required: false })
  @IsOptional()
  @IsObject()
  content?: any;

  @ApiProperty({ description: '缩略图', required: false })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({ description: '状态', required: false, enum: PAGE_STATUS })
  @IsOptional()
  @IsIn(PAGE_STATUS)
  status?: string;

  @ApiProperty({ description: '发布备注', required: false })
  @IsOptional()
  @IsString()
  publishNote?: string;

  @ApiProperty({ description: '发布操作人', required: false })
  @IsOptional()
  @IsString()
  publishOperator?: string;

  @ApiProperty({ description: '发布流转记录', required: false, type: [PublishRecordDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PublishRecordDto)
  flowHistory?: PublishRecordDto[];
}

export class PageListQueryDto {
  @ApiProperty({ description: '页码（从 1 开始）', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ description: '每页条数', required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @ApiProperty({ description: '状态过滤', required: false, enum: PAGE_STATUS })
  @IsOptional()
  @IsIn(PAGE_STATUS)
  status?: string;

  @ApiProperty({ description: '关键词（名称/描述/ID）', required: false })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ description: '排序字段', required: false, enum: PAGE_SORT_BY })
  @IsOptional()
  @IsIn(PAGE_SORT_BY)
  sortBy?: string;

  @ApiProperty({ description: '排序方向', required: false, enum: PAGE_SORT_ORDER })
  @IsOptional()
  @IsIn(PAGE_SORT_ORDER)
  sortOrder?: string;
}
