import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateLinkDto {
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  targetUrl!: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  title?: string;
}
