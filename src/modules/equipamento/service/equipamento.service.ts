import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { EquipamentoRepository } from '../repository/equipamento.repository';

export interface PixabayImage {
  sourceId: string;
  imageUrl: string;
  photographer: string;
  pageUrl: string;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isPixabayImage(value: unknown): value is PixabayImage {
  if (typeof value !== 'object' || value === null) return false;
  return (
    'sourceId' in value &&
    typeof value.sourceId === 'string' &&
    'imageUrl' in value &&
    typeof value.imageUrl === 'string' &&
    'photographer' in value &&
    typeof value.photographer === 'string' &&
    'pageUrl' in value &&
    typeof value.pageUrl === 'string'
  );
}

@Injectable()
export class EquipamentoService {
  constructor(private readonly equipamentoRepository: EquipamentoRepository) {}

  async findById(equipmentId: string, tenantId: string): Promise<{ id: string; name: string; category: string; patrimony: string | null; status: string } | null> {
    const equipamento = await this.equipamentoRepository.findById(equipmentId, tenantId);
    if (!equipamento) return null;

    return {
      id: equipamento.id,
      name: equipamento.name,
      category: equipamento.category,
      patrimony: equipamento.patrimony,
      status: equipamento.status,
    };
  }

  async findAvailableByTenant(tenantId: string): Promise<{ id: string; name: string; category: string; patrimony: string | null }[]> {
    const equipments = await this.equipamentoRepository.findAvailableByTenant(tenantId);
    return equipments.map((e) => ({
      id: e.id,
      name: e.name,
      category: e.category,
      patrimony: e.patrimony,
    }));
  }

  async countByTenantAndStatus(tenantId: string, status: string): Promise<number> {
    return this.equipamentoRepository.countByTenantAndStatus(tenantId, status);
  }

  async findAllByTenant(tenantId: string, status?: string, cursor?: string) {
    if (cursor && !UUID_PATTERN.test(cursor)) {
      throw new BadRequestException('Cursor de equipamento inválido.');
    }
    return this.equipamentoRepository.findAllByTenant(tenantId, status, cursor);
  }

  async searchImages(query: string): Promise<PixabayImage[]> {
    const apiKey = process.env.PIXABAY_API_KEY;
    if (!apiKey) {
      throw new ServiceUnavailableException('PIXABAY_API_KEY não está configurada.');
    }
    const term = query.trim();
    if (term.length < 2 || term.length > 100) {
      throw new BadRequestException('O termo de busca deve ter entre 2 e 100 caracteres.');
    }

    let response: Response;
    try {
      const url = new URL('https://pixabay.com/api/');
      url.search = new URLSearchParams({
        key: apiKey,
        q: term,
        image_type: 'photo',
        safesearch: 'true',
        per_page: '20',
      }).toString();
      response = await fetch(url);
    } catch {
      throw new ServiceUnavailableException('O provedor de imagens está indisponível.');
    }
    if (!response.ok) {
      throw new BadGatewayException('O provedor de imagens rejeitou a busca.');
    }

    const data: unknown = await response.json();
    if (typeof data !== 'object' || data === null || !('hits' in data) || !Array.isArray(data.hits)) {
      throw new BadGatewayException('O provedor retornou uma resposta inválida.');
    }

    return data.hits.flatMap((hit): PixabayImage[] => {
      if (
        typeof hit !== 'object' ||
        hit === null ||
        !('id' in hit) ||
        !('largeImageURL' in hit) ||
        !('user' in hit) ||
        !('pageURL' in hit) ||
        typeof hit.id !== 'number' ||
        typeof hit.largeImageURL !== 'string' ||
        typeof hit.user !== 'string' ||
        typeof hit.pageURL !== 'string' ||
        !this.isPixabayUrl(hit.largeImageURL) ||
        !this.isPixabayUrl(hit.pageURL)
      ) {
        return [];
      }
      return [{
        sourceId: String(hit.id),
        imageUrl: hit.largeImageURL,
        photographer: hit.user,
        pageUrl: hit.pageURL,
      }];
    });
  }

  async setImage(
    equipmentId: string,
    tenantId: string,
    image: unknown,
  ): Promise<void> {
    if (!UUID_PATTERN.test(equipmentId)) {
      throw new BadRequestException('Identificador de equipamento inválido.');
    }
    if (!isPixabayImage(image)) {
      throw new BadRequestException('Os dados da imagem do Pixabay são inválidos.');
    }
    if (
      !/^\d+$/.test(image.sourceId) ||
      typeof image.photographer !== 'string' ||
      image.photographer.trim().length === 0 ||
      image.photographer.length > 100 ||
      !this.isPixabayUrl(image.imageUrl) ||
      !this.isPixabayUrl(image.pageUrl)
    ) {
      throw new BadRequestException('Os dados da imagem do Pixabay são inválidos.');
    }

    if (!await this.equipamentoRepository.findById(equipmentId, tenantId)) {
      throw new NotFoundException('Equipamento não encontrado neste tenant.');
    }
    const updated = await this.equipamentoRepository.setImage(equipmentId, tenantId, image);
    if (updated !== 1) {
      throw new NotFoundException('Equipamento não encontrado neste tenant.');
    }
  }

  private isPixabayUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return (
        url.protocol === 'https:' &&
        (url.hostname === 'pixabay.com' || url.hostname.endsWith('.pixabay.com')) &&
        !url.username &&
        !url.password
      );
    } catch {
      return false;
    }
  }
}