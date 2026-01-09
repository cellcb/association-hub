import {
  Calendar,
  Users,
  FileText,
  Package,
  ArrowRight,
  TrendingUp,
  Award,
  Lightbulb,
  Star,
  CheckCircle,
  Sparkles,
  Building2,
  Briefcase,
  GraduationCap,
  BookOpen,
  Quote,
  Play,
  Video,
  Bot,
  Smartphone,
  ExternalLink,
  Loader2,
  LucideIcon
} from 'lucide-react';
import { PageType, NavigationParams } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Carousel } from './Carousel';
import { MembershipApplicationModal } from './auth/MembershipApplicationModal';
import { useState, useMemo } from 'react';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import type {
  CarouselItem,
  StatItem,
  FeatureItem,
  MemberType,
  Testimonial,
  HighlightItem,
  HeroContent,
  OrganizationIntro,
  ExhibitionInfo,
  DigitalPlatformsConfig,
  CoreValue,
  CTASection
} from '@/types/config';

interface HomeProps {
  onNavigate: (page: PageType, params?: NavigationParams) => void;
}

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, LucideIcon> = {
  Calendar,
  Users,
  FileText,
  Package,
  ArrowRight,
  TrendingUp,
  Award,
  Lightbulb,
  Star,
  CheckCircle,
  Sparkles,
  Building2,
  Briefcase,
  GraduationCap,
  BookOpen,
  Quote,
  Play,
  Video,
  Bot,
  Smartphone,
  ExternalLink,
};

// Helper to get icon component from string name
const getIcon = (iconName: string): LucideIcon => {
  return iconMap[iconName] || Star;
};

// Default fallback data
const defaultCarouselSlides: CarouselItem[] = [
  {
    image: 'https://images.unsplash.com/photo-1633431303895-8236f0a04b46?w=1080',
    title: '2024年度技术交流大会',
    subtitle: '年度盛会',
    description: '汇聚500+行业精英，共话技术创新与产业发展',
    buttonText: '了解详情',
    buttonLink: 'activities',
  },
];

const defaultStats: StatItem[] = [
  { label: '会员单位', value: '300+', icon: 'Users', color: 'text-blue-600' },
  { label: '专家团队', value: '150+', icon: 'Award', color: 'text-purple-600' },
  { label: '优秀案例', value: '200+', icon: 'TrendingUp', color: 'text-green-600' },
  { label: '年度活动', value: '50+', icon: 'Calendar', color: 'text-orange-600' },
];

const defaultFeatures: FeatureItem[] = [
  { icon: 'FileText', title: '优秀案例', description: '展示行业典型案例与创新成果', color: 'bg-green-500', link: 'projects' },
  { icon: 'Calendar', title: '活动中心', description: '年度会议、沙龙、分享会等精彩活动', color: 'bg-purple-500', link: 'activities' },
  { icon: 'Package', title: '产品展示', description: '泵阀管件等给排水专业产品', color: 'bg-orange-500', link: 'products' },
  { icon: 'Users', title: '专家风采', description: '汇聚行业顶尖专家，提供专业技术指导', color: 'bg-blue-500', link: 'experts' },
];

const defaultHighlights: HighlightItem[] = [
  { icon: 'Star', title: '权威认证', description: '国家级行业协会背书，专业可信赖' },
  { icon: 'Sparkles', title: '创新驱动', description: '聚焦前沿技术，推动行业创新发展' },
  { icon: 'Users', title: '资源整合', description: '连接产学研用，打通产业链上下游' },
  { icon: 'Award', title: '专业服务', description: '提供全方位专业技术支持与咨询' },
];

const defaultHero: HeroContent = {
  badge: '专业 · 权威 · 创新',
  title: '技术专委会\n数字化平台',
  subtitle: '连接行业精英，推动技术创新\n为会员提供专业服务与交流平台',
  primaryButton: { text: '申请入会', icon: 'Users' },
  secondaryButton: { text: '了解更多', icon: 'Play' },
};

export function Home({ onNavigate }: HomeProps) {
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const { config, loading } = useSiteConfig();

  // Get config values with fallbacks
  const carouselSlides = useMemo(() => {
    const items = config?.carousel_items || defaultCarouselSlides;
    return items.map(item => ({
      ...item,
      buttonAction: () => onNavigate(item.buttonLink as PageType),
    }));
  }, [config?.carousel_items, onNavigate]);

  const stats = config?.statistics || defaultStats;
  const features = config?.core_features || defaultFeatures;
  const highlights = config?.platform_highlights || defaultHighlights;
  const heroContent = config?.hero_content || defaultHero;
  const memberTypes = config?.member_types;
  const testimonials = config?.testimonials;
  const organizationIntro = config?.organization_intro;
  const exhibitionInfo = config?.exhibition_info;
  const digitalPlatforms = config?.digital_platforms;
  const coreValue = config?.core_value;
  const ctaSection = config?.cta_section;

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // Default member types if not configured
  const defaultMemberTypes: MemberType[] = [
    { icon: 'Building2', title: '设备单位', description: '设备制造商、供应商', count: '120+', color: 'bg-blue-50 text-blue-600' },
    { icon: 'Briefcase', title: '建设单位', description: '工程公司、施工单位', count: '85+', color: 'bg-green-50 text-green-600' },
    { icon: 'GraduationCap', title: '事业单位', description: '科研院所、高校', count: '60+', color: 'bg-purple-50 text-purple-600' },
    { icon: 'BookOpen', title: '设计单位', description: '设计院、咨询公司', count: '45+', color: 'bg-orange-50 text-orange-600' },
  ];

  const displayMemberTypes = memberTypes || defaultMemberTypes;

  // Default testimonials if not configured
  const defaultTestimonials: Testimonial[] = [
    {
      name: '张建国',
      title: '教授级高级工程师',
      organization: '中国建筑科学研究院',
      content: '通过专委会平台，我们与行业同仁建立了深度合作，共同推进了多个重大技术创新项目。',
      avatar: '',
    },
  ];

  const displayTestimonials = testimonials || defaultTestimonials;

  return (
    <div>
      {/* Hero Section with Carousel Background */}
      <section className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
        {/* Background Carousel */}
        <div className="absolute inset-0">
          <Carousel slides={carouselSlides} autoPlay={true} interval={5000} showContent={false} />
        </div>

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>

        {/* Content */}
        <div className="relative h-full flex items-center z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl text-white">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">{heroContent.badge}</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight whitespace-pre-line">
                {heroContent.title}
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed whitespace-pre-line">
                {heroContent.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                  onClick={() => setApplicationModalOpen(true)}
                >
                  {(() => { const Icon = getIcon(heroContent.primaryButton.icon); return <Icon className="w-5 h-5" />; })()}
                  {heroContent.primaryButton.text}
                </button>
                <button className="px-8 py-4 bg-transparent text-white rounded-lg hover:bg-white/10 transition-all border-2 border-white/30 backdrop-blur-sm flex items-center justify-center gap-2">
                  {(() => { const Icon = getIcon(heroContent.secondaryButton.icon); return <Icon className="w-5 h-5" />; })()}
                  {heroContent.secondaryButton.text}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Enhanced */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = getIcon(stat.icon);
              return (
                <div key={index} className="text-center group cursor-pointer">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform ${stat.color}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="text-3xl md:text-4xl text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Organization Introduction Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-600">关于我们</span>
            </div>
            <h2 className="text-3xl md:text-4xl text-gray-900 mb-4">
              {organizationIntro?.sectionTitle || '组织介绍'}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {organizationIntro?.sectionSubtitle || '广东省土木建筑学会给水排水专业委员会是广东省内给排水行业权威专业组织'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            {/* Left: Content */}
            <div className="space-y-6">
              {(organizationIntro?.items || [
                { title: '专业定位', content: '专委会隶属于广东省土木建筑学会，专注于建筑给排水和市政给排水领域的技术研究、学术交流和行业服务。汇聚省内外顶尖专家学者，为行业发展提供智力支持和技术指导。', icon: 'CheckCircle', borderColor: 'border-blue-100', iconColor: 'text-blue-600' },
                { title: '核心使命', content: '推动给排水技术创新与应用，促进产学研深度融合，加强行业内专业人士与设备厂商的交流合作，提升行业整体技术水平，服务广东省城市建设和民生工程。', icon: 'CheckCircle', borderColor: 'border-green-100', iconColor: 'text-green-600' },
                { title: '服务范围', content: '涵盖建筑给排水设计、市政供水系统、市政排水工程、二次供水、智慧水务、海绵城市建设等多个专业领域，为会员提供技术咨询、标准编制、培训认证等全方位服务。', icon: 'CheckCircle', borderColor: 'border-purple-100', iconColor: 'text-purple-600' },
              ]).map((item, index) => {
                const Icon = getIcon(item.icon);
                return (
                  <div key={index} className={`bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all border ${item.borderColor}`}>
                    <h3 className="text-xl text-gray-900 mb-3 flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${item.iconColor}`} />
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{item.content}</p>
                  </div>
                );
              })}
            </div>

            {/* Right: Image and Highlights */}
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <ImageWithFallback
                  src={organizationIntro?.image || "https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=1080"}
                  alt="组织介绍"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-2xl mb-2">{organizationIntro?.imageCaption?.title || '专业·权威·创新'}</h3>
                  <p className="text-sm text-white/90">{organizationIntro?.imageCaption?.subtitle || '服务行业发展，推动技术进步'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(organizationIntro?.quickStats || [
                  { value: '10+年', label: '行业服务经验', bgClass: 'from-blue-500 to-blue-600' },
                  { value: '300+', label: '会员单位', bgClass: 'from-green-500 to-green-600' },
                  { value: '150+', label: '行业专家', bgClass: 'from-purple-500 to-purple-600' },
                  { value: '50+', label: '年度活动', bgClass: 'from-orange-500 to-orange-600' },
                ]).map((stat, index) => (
                  <div key={index} className={`bg-gradient-to-br ${stat.bgClass} rounded-xl p-6 text-white`}>
                    <div className="text-3xl mb-2">{stat.value}</div>
                    <div className="text-sm text-white/80">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Organization Advantages */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg text-gray-900 mb-2">权威认证</h3>
              <p className="text-sm text-gray-600">省级专业组织，行业权威背书</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg text-gray-900 mb-2">专家资源</h3>
              <p className="text-sm text-gray-600">汇聚行业顶尖专家学者</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg text-gray-900 mb-2">技术创新</h3>
              <p className="text-sm text-gray-600">推动行业技术进步与应用</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all border border-gray-100">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg text-gray-900 mb-2">产业服务</h3>
              <p className="text-sm text-gray-600">促进产学研用深度融合</p>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full mb-4 shadow-sm">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600">平台优势</span>
            </div>
            <h2 className="text-3xl md:text-4xl text-gray-900 mb-4">为什么选择我们</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              专业、权威、创新的行业技术交流平台
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, index) => {
              const Icon = getIcon(item.icon);
              return (
                <div key={index} className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all group cursor-pointer border border-gray-100">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Guangdong Pump Valve Exhibition - Highlight Section */}
      {exhibitionInfo && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-3xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Content */}
                <div className="p-8 md:p-12 lg:p-16 text-white">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                    <Star className="w-4 h-4" />
                    <span className="text-sm">{exhibitionInfo.badge}</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl mb-6 leading-tight">
                    {exhibitionInfo.title}
                  </h2>
                  <p className="text-lg text-white/90 mb-8 leading-relaxed">
                    {exhibitionInfo.description}
                  </p>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    {exhibitionInfo.stats.map((stat, index) => (
                      <div key={index}>
                        <div className="text-4xl mb-2">{stat.value}</div>
                        <div className="text-sm text-white/80">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      className="px-8 py-4 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      onClick={() => {
                        if (exhibitionInfo.primaryButton.activityId) {
                          onNavigate('activities', { activityId: exhibitionInfo.primaryButton.activityId });
                        }
                      }}
                    >
                      {(() => { const Icon = getIcon(exhibitionInfo.primaryButton.icon); return <Icon className="w-5 h-5" />; })()}
                      <span>{exhibitionInfo.primaryButton.text}</span>
                    </button>
                    <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all border-2 border-white/30 flex items-center justify-center gap-2">
                      {(() => { const Icon = getIcon(exhibitionInfo.secondaryButton.icon); return <Icon className="w-5 h-5" />; })()}
                      <span>{exhibitionInfo.secondaryButton.text}</span>
                    </button>
                  </div>
                </div>

                {/* Image */}
                <div className="relative h-64 lg:h-auto">
                  <ImageWithFallback
                    src={exhibitionInfo.image}
                    alt="广东泵阀展"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent lg:hidden"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Digital Tools Connection Section */}
      {digitalPlatforms && (
        <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4">
                <Smartphone className="w-4 h-4" />
                <span className="text-sm">数字化赋能</span>
              </div>
              <h2 className="text-3xl md:text-4xl mb-4">{digitalPlatforms.sectionTitle}</h2>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                {digitalPlatforms.sectionSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {digitalPlatforms.platforms.map((platform, index) => {
                const Icon = getIcon(platform.icon);
                return (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/15 transition-all group border border-white/20">
                    <div className={`w-16 h-16 bg-gradient-to-br ${platform.bgClass} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl mb-3">{platform.title}</h3>
                    <p className="text-blue-100 mb-6 leading-relaxed">{platform.description}</p>
                    <div className="space-y-2 text-sm text-blue-200 mb-6">
                      {platform.features.map((feature, fIndex) => (
                        <div key={fIndex} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    {platform.buttonText && (
                      <button className={`w-full px-6 py-3 ${platform.highlighted ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg' : 'bg-white/10 hover:bg-white/20 border border-white/30'} rounded-lg transition-all flex items-center justify-center gap-2`}>
                        <Icon className="w-4 h-4" />
                        <span>{platform.buttonText}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Connection Flow */}
            <div className="mt-12 p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="text-center mb-8">
                <h3 className="text-xl mb-2">平台互联互通</h3>
                <p className="text-sm text-blue-200">一站式数字化服务体验</p>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-xs">WEB平台</div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-blue-300 hidden md:block" />
                  <div className="w-1 h-8 bg-blue-300 md:hidden" />
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-2">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-xs">视频号</div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-blue-300 hidden md:block" />
                  <div className="w-1 h-8 bg-blue-300 md:hidden" />
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-2">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-xs">智能体</div>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-blue-200 mt-6">
                无缝切换，数据互通，为您提供全方位专业服务
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Features Section - Enhanced */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl text-gray-900 mb-4">平台核心功能</h2>
            <p className="text-lg text-gray-600">为会员提供全方位的专业服务</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = getIcon(feature.icon);
              return (
                <div
                  key={index}
                  onClick={() => onNavigate(feature.link as PageType)}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                  <div className="flex items-center text-blue-600 group-hover:gap-2 transition-all">
                    <span className="text-sm">了解更多</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Member Types Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl text-gray-900 mb-4">会员体系</h2>
            <p className="text-lg text-gray-600">汇聚产业链上下游优质企业与机构</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayMemberTypes.map((type, index) => {
              const Icon = getIcon(type.icon);
              return (
                <div key={index} className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all group">
                  <div className={`w-12 h-12 ${type.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg text-gray-900 mb-2">{type.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                  <div className="text-2xl text-gray-900">{type.count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4">
              <Quote className="w-4 h-4" />
              <span className="text-sm">会员心声</span>
            </div>
            <h2 className="text-3xl md:text-4xl mb-4">他们这样评价我们</h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              听听会员的真实反馈
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayTestimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all">
                <Quote className="w-8 h-8 text-blue-200 mb-4" />
                <p className="text-white/90 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <div className="text-white">{testimonial.name}</div>
                    <div className="text-sm text-blue-100">{testimonial.title}</div>
                    <div className="text-xs text-blue-200">{testimonial.organization}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition - Enhanced */}
      {coreValue && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 md:p-16 border border-blue-100">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center gap-2 text-blue-600 mb-4">
                    <Lightbulb className="w-6 h-6" />
                    <span className="text-sm">{coreValue.badge}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl text-gray-900 mb-6">
                    {coreValue.title}
                  </h2>
                  <p className="text-gray-700 mb-8 leading-relaxed text-lg">
                    {coreValue.description}
                  </p>
                  <button
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                    onClick={() => setApplicationModalOpen(true)}
                  >
                    <Users className="w-5 h-5" />
                    <span>{coreValue.buttonText}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {coreValue.stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
                      <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl text-gray-900 mb-2">{stat.value}</div>
                      <div className="text-sm text-gray-600 whitespace-pre-line">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {ctaSection && (
        <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl text-white mb-6">
              {ctaSection.title}
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              {ctaSection.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                onClick={() => setApplicationModalOpen(true)}
              >
                {(() => { const Icon = getIcon(ctaSection.primaryButton.icon); return <Icon className="w-5 h-5" />; })()}
                <span>{ctaSection.primaryButton.text}</span>
              </button>
              <button className="px-8 py-4 bg-transparent text-white rounded-lg hover:bg-white/10 transition-all border-2 border-white flex items-center justify-center gap-2">
                {(() => { const Icon = getIcon(ctaSection.secondaryButton.icon); return <Icon className="w-5 h-5" />; })()}
                <span>{ctaSection.secondaryButton.text}</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Carousel Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl text-gray-900 mb-4">精彩活动推荐</h2>
            <p className="text-lg text-gray-600">不容错过的行业盛会</p>
          </div>

          <Carousel slides={carouselSlides} />
        </div>
      </section>

      {/* Membership Application Modal */}
      <MembershipApplicationModal
        isOpen={applicationModalOpen}
        onClose={() => setApplicationModalOpen(false)}
      />
    </div>
  );
}
