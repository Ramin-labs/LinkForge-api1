import { randomBytes } from 'crypto';

import { Injectable, Inject, BadRequestException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateLinkDto } from './dto/create-link.dto';

@Injectable()
export class LinkService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  // Unambiguous, human-friendly alphabet (no 0, O, I, l, 1)
  private readonly CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

  private generateCode(length = 7): string {
    const alphabet = this.CODE_ALPHABET;
    const base = alphabet.length; // 57
    const maxByte = 256 - (256 % base); // rejection sampling to avoid modulo bias
    let id = '';
    while (id.length < length) {
      const b = randomBytes(1).readUInt8(0);
      if (b < maxByte) {
        id += alphabet[b % base];
      }
    }
    return id;
  }

  private async generateUniqueCode(length = 7, maxAttempts = 10): Promise<string> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const code = this.generateCode(length);
      const existing = await this.prisma.link.findFirst({ where: { code } });
      if (!existing) return code;
    }
    throw new Error('Unable to generate a unique code at this time. Please try again.');
  }

  async createLink(dto: CreateLinkDto) {
    if (!dto || !dto.targetUrl) {
      throw new BadRequestException('targetUrl is required');
    }
    const code = await this.generateUniqueCode();
    return this.prisma.link.create({
      data: {
        targetUrl: dto.targetUrl,
        title: dto.title ?? null,
        code: code,
      },
      select: {
        id: true,
        targetUrl: true,
        title: true,
        code: true,
        createdAt: true,
        totalClicks: true,
        enabled: true,
      },
    });
  }
}
