// Config Response from API
export interface ConfigResponse {
  id: number;
  configKey: string;
  configValue: string;
  category: string;
  description: string;
  sortOrder: number;
  status: number;
  createdTime: string;
  updatedTime: string;
}

// Config Update Request
export interface ConfigUpdateRequest {
  configValue?: string;
  description?: string;
  sortOrder?: number;
  status?: number;
}

// Site Configuration Types

export interface CarouselItem {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export interface StatItem {
  label: string;
  value: string;
  icon: string;
  color: string;
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  color: string;
  link: string;
}

export interface MemberType {
  icon: string;
  title: string;
  description: string;
  count: string;
  color: string;
}

export interface Testimonial {
  name: string;
  title: string;
  organization: string;
  content: string;
  avatar: string;
}

export interface HighlightItem {
  icon: string;
  title: string;
  description: string;
}

export interface OrganizationIntroItem {
  title: string;
  content: string;
  icon: string;
  borderColor: string;
  iconColor: string;
}

export interface QuickStat {
  value: string;
  label: string;
  bgClass: string;
}

export interface OrganizationIntro {
  sectionTitle: string;
  sectionSubtitle: string;
  items: OrganizationIntroItem[];
  image: string;
  imageCaption: { title: string; subtitle: string };
  quickStats: QuickStat[];
}

export interface HeroContent {
  badge: string;
  title: string;
  subtitle: string;
  primaryButton: { text: string; icon: string };
  secondaryButton: { text: string; icon: string };
}

export interface ExhibitionStat {
  value: string;
  label: string;
}

export interface ExhibitionInfo {
  badge: string;
  title: string;
  description: string;
  stats: ExhibitionStat[];
  image: string;
  primaryButton: { text: string; icon: string };
  secondaryButton: { text: string; icon: string };
}

export interface DigitalPlatform {
  icon: string;
  title: string;
  description: string;
  features: string[];
  bgClass: string;
  buttonText?: string;
  highlighted?: boolean;
}

export interface DigitalPlatformsConfig {
  sectionTitle: string;
  sectionSubtitle: string;
  platforms: DigitalPlatform[];
}

export interface CoreValueStat {
  value: string;
  label: string;
  bgColor: string;
}

export interface CoreValue {
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  stats: CoreValueStat[];
}

export interface CTASection {
  title: string;
  subtitle: string;
  primaryButton: { text: string; icon: string };
  secondaryButton: { text: string; icon: string };
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
}

export interface CompanyInfo {
  name: string;
  description: string;
  copyright: string;
}

export interface QuickLink {
  label: string;
  link: string;
}

// Full Site Configuration
export interface SiteConfig {
  // Header
  site_name?: string;
  site_slogan?: string;
  site_name_short?: string;

  // Hero
  hero_content?: HeroContent;

  // Carousel
  carousel_items?: CarouselItem[];

  // Stats
  statistics?: StatItem[];

  // Features
  core_features?: FeatureItem[];

  // About
  organization_intro?: OrganizationIntro;

  // Members
  member_types?: MemberType[];

  // Testimonials
  testimonials?: Testimonial[];

  // Highlights
  platform_highlights?: HighlightItem[];

  // Exhibition
  exhibition_info?: ExhibitionInfo;

  // Digital Platforms
  digital_platforms?: DigitalPlatformsConfig;

  // Core Value
  core_value?: CoreValue;

  // CTA
  cta_section?: CTASection;

  // Footer
  contact_info?: ContactInfo;
  company_info?: CompanyInfo;
  quick_links?: QuickLink[];
}

// Category labels for admin UI
export const configCategoryLabels: Record<string, string> = {
  header: '网站信息',
  hero: '首页横幅',
  carousel: '轮播图',
  stats: '统计数据',
  features: '核心功能',
  about: '组织介绍',
  members: '会员分类',
  testimonials: '会员评价',
  highlights: '平台亮点',
  exhibition: '展览会',
  digital: '数字平台',
  value: '核心价值',
  cta: '行动号召',
  footer: '页脚信息',
};
