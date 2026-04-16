import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({ description: '模板 ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: '模板名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '模板描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '模板分类', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: '模板内容' })
  content: any;

  @ApiProperty({ description: '缩略图', required: false })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({ description: '标签', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: '是否公开', required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdateTemplateDto {
  @ApiProperty({ description: '模板名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '模板描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '模板分类', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: '模板内容', required: false })
  @IsOptional()
  content?: any;

  @ApiProperty({ description: '缩略图', required: false })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({ description: '标签', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
