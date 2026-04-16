import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePageDto {
  @ApiProperty({ description: '页面 ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: '页面名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '页面描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '页面内容' })
  content: any;

  @ApiProperty({ description: '缩略图', required: false })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({ description: '是否为模板', required: false })
  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsString()
  status?: string;
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
  content?: any;

  @ApiProperty({ description: '缩略图', required: false })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsString()
  status?: string;
}
