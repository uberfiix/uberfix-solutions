// Catalog Service for UberFix
// Handles service catalog data

import { cacheService } from './cache.service';
import type { ServiceType } from '@/types/uberfix';

export interface ServiceCategory {
  id: ServiceType;
  name: string;
  nameAr: string;
  icon: string;
  description: string;
  basePrice: number;
  estimatedDuration: string;
  popularServices: string[];
}

class CatalogService {
  private readonly CACHE_KEY = 'service-catalog';
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  private readonly catalog: ServiceCategory[] = [
    {
      id: 'electrical',
      name: 'Electrical',
      nameAr: 'كهرباء',
      icon: '⚡',
      description: 'خدمات الكهرباء والتمديدات الكهربائية',
      basePrice: 100,
      estimatedDuration: '1-3 ساعات',
      popularServices: ['تركيب مفاتيح', 'إصلاح أعطال', 'تمديدات جديدة', 'تركيب إضاءة'],
    },
    {
      id: 'plumbing',
      name: 'Plumbing',
      nameAr: 'سباكة',
      icon: '🔧',
      description: 'خدمات السباكة وإصلاح التسريبات',
      basePrice: 120,
      estimatedDuration: '1-4 ساعات',
      popularServices: ['إصلاح تسريبات', 'تركيب حنفيات', 'فتح مجاري', 'تركيب سخانات'],
    },
    {
      id: 'ac',
      name: 'Air Conditioning',
      nameAr: 'تكييف',
      icon: '❄️',
      description: 'خدمات التكييف والتبريد',
      basePrice: 150,
      estimatedDuration: '1-2 ساعات',
      popularServices: ['صيانة دورية', 'تنظيف فلاتر', 'شحن فريون', 'تركيب جديد'],
    },
    {
      id: 'carpentry',
      name: 'Carpentry',
      nameAr: 'نجارة',
      icon: '🪚',
      description: 'خدمات النجارة والأثاث',
      basePrice: 200,
      estimatedDuration: '2-6 ساعات',
      popularServices: ['إصلاح أبواب', 'تركيب خزائن', 'صيانة أثاث', 'تفصيل أثاث'],
    },
    {
      id: 'painting',
      name: 'Painting',
      nameAr: 'دهانات',
      icon: '🎨',
      description: 'خدمات الدهان والديكور',
      basePrice: 250,
      estimatedDuration: '4-8 ساعات',
      popularServices: ['دهان حوائط', 'سقف معلق', 'ورق حائط', 'ديكورات'],
    },
    {
      id: 'general',
      name: 'General Maintenance',
      nameAr: 'صيانة عامة',
      icon: '🛠️',
      description: 'خدمات الصيانة العامة',
      basePrice: 80,
      estimatedDuration: '1-3 ساعات',
      popularServices: ['تركيبات', 'إصلاحات', 'فك وتركيب', 'صيانة دورية'],
    },
  ];

  async fetchCatalog(): Promise<ServiceCategory[]> {
    const cached = cacheService.get<ServiceCategory[]>(this.CACHE_KEY);
    if (cached) return cached;

    // In production, this would fetch from API/database
    await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate network

    cacheService.set(this.CACHE_KEY, this.catalog, this.CACHE_TTL);
    return this.catalog;
  }

  getCategoryById(id: ServiceType): ServiceCategory | undefined {
    return this.catalog.find((c) => c.id === id);
  }

  getAllCategories(): ServiceCategory[] {
    return this.catalog;
  }

  prefetchCatalog(): void {
    // Cache catalog immediately
    cacheService.set(this.CACHE_KEY, this.catalog, this.CACHE_TTL);
  }
}

export const catalogService = new CatalogService();
export default catalogService;
