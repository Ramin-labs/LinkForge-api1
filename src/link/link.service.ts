import { randomBytes } from 'crypto';

import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';

import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../prisma/prisma.service';

import { CreateLinkDto } from './dto/create-link.dto';

const CODE_CACHE_TTL_SEC = 60 * 60 * 24; // 24h

@Injectable()
export class LinkService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(CacheService) private readonly cache: CacheService,
  ) {}

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

  async listLinks() {
    return this.prisma.link.findMany({
      orderBy: { createdAt: 'desc' },
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

  async listLinksPaginated(limit = 10, cursor?: string) {
    const take = Math.min(Math.max(limit, 1), 50);

    const items = await this.prisma.link.findMany({
      take,
      skip: cursor ? 1 : 0, // skip the cursor item itself
      ...(cursor ? { cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        targetUrl: true,
        createdAt: true,
        title: true,
        totalClicks: true,
        enabled: true,
      },
    });

    let nextCursor: string | null = null;
    if (items.length === take) {
      const last = items[items.length - 1];
      if (last) nextCursor = last.id;
    }

    return { items, nextCursor };
  }

  async getByCode(code: string) {
    const link = await this.prisma.link.findUnique({
      where: {
        code,
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
    if (!link) throw new BadRequestException('Link not found');
    return link;
  }

  private cacheKeyFor(code: string) {
    return `lf:code:${code}`;
  }

  async getTargetUrlByCodeFast(code: string): Promise<string> {
    // 1) Cache first
    const key = this.cacheKeyFor(code);
    const cached = await this.cache.get(key);
    if (cached) return cached;

    // 2) DB fallback
    const link = await this.prisma.link.findUnique({
      where: { code },
      select: { targetUrl: true, enabled: true },
    });

    if (!link || !link.enabled) {
      throw new NotFoundException('Link not found');
    }

    // 3) Fill cache
    await this.cache.set(key, link.targetUrl, CODE_CACHE_TTL_SEC);
    return link.targetUrl;
  }
}
