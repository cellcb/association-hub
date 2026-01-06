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
  ExternalLink
} from 'lucide-react';
import { PageType } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Carousel } from './Carousel';
import { MembershipApplicationModal } from './auth/MembershipApplicationModal';
import { useState } from 'react';

interface HomeProps {
  onNavigate: (page: PageType) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);

  // Carousel slides data
  const carouselSlides = [
    {
      image: 'https://images.unsplash.com/photo-1633431303895-8236f0a04b46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGNvbmZlcmVuY2UlMjBoYWxsfGVufDF8fHx8MTc2NjU3MjcyNXww&ixlib=rb-4.1.0&q=80&w=1080',
      title: '2024年度技术交流大会',
      subtitle: '年度盛会',
      description: '汇聚500+行业精英，共话技术创新与产业发展',
      buttonText: '了解详情',
      buttonAction: () => onNavigate('activities'),
    },
    {
      image: 'https://images.unsplash.com/photo-1694702740570-0a31ee1525c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBidWlsZGluZ3xlbnwxfHx8fDE3NjY1MzMxODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      title: '优秀案例展示',
      subtitle: '案例展示',
      description: '200+标杆案例，分享成功经验与创新实践',
      buttonText: '查看案例',
      buttonAction: () => onNavigate('projects'),
    },
    {
      image: 'https://images.unsplash.com/photo-1728933102332-a4f1a281a621?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwc2VtaW5hcnxlbnwxfHx8fDE3NjY1NzI3MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      title: '技术沙龙与专家分享',
      subtitle: '知识分享',
      description: '定期举办技术沙龙，邀请行业专家深度分享',
      buttonText: '参与活动',
      buttonAction: () => onNavigate('activities'),
    },
    {
      image: 'https://images.unsplash.com/photo-1696841750205-1aab62d90bef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b3Jrc2hvcHxlbnwxfHx8fDE3NjY0OTI3NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      title: '专业培训与认证',
      subtitle: '能力提升',
      description: '提供系统化专业培训，助力会员能力提升',
      buttonText: '了解更多',
      buttonAction: () => onNavigate('activities'),
    },
    {
      image: 'https://images.unsplash.com/photo-1711390811443-ae5a33144f7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyeSUyMGV4aGliaXRpb258ZW58MXx8fHwxNzY2NTcyNzI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      title: '给排水技术产品',
      subtitle: '产品展示',
      description: '泵、阀、管件等给排水专业产品，促进厂商与专业人士交流',
      buttonText: '查看产品',
      buttonAction: () => onNavigate('products'),
    },
  ];

  const features = [
    {
      icon: FileText,
      title: '优秀案例',
      description: '展示行业典型案例与创新成果',
      color: 'bg-green-500',
      page: 'projects' as PageType,
    },
    {
      icon: Calendar,
      title: '活动中心',
      description: '年度会议、沙龙、分享会等精彩活动',
      color: 'bg-purple-500',
      page: 'activities' as PageType,
    },
    {
      icon: Package,
      title: '产品展示',
      description: '泵阀管件等给排水专业产品',
      color: 'bg-orange-500',
      page: 'products' as PageType,
    },
    {
      icon: Users,
      title: '专家风采',
      description: '汇聚行业顶尖专家，提供专业技术指导',
      color: 'bg-blue-500',
      page: 'experts' as PageType,
    },
  ];

  const stats = [
    { label: '会员单位', value: '300+', icon: Users, color: 'text-blue-600' },
    { label: '专家团队', value: '150+', icon: Award, color: 'text-purple-600' },
    { label: '优秀案例', value: '200+', icon: TrendingUp, color: 'text-green-600' },
    { label: '年度活动', value: '50+', icon: Calendar, color: 'text-orange-600' },
  ];

  const upcomingActivities = [
    {
      title: '2024年度技术交流大会',
      date: '2024年12月28日',
      location: '北京国际会议中心',
      type: '年度会议',
      participants: '500+',
      image: 'https://images.unsplash.com/photo-1687945727613-a4d06cc41024?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb25mZXJlbmNlJTIwbWVldGluZ3xlbnwxfHx8fDE3NjY1NzIyMzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: '智能建筑技术沙龙',
      date: '2025年1月15日',
      location: '上海科技馆',
      type: '技术沙龙',
      participants: '80+',
      image: 'https://images.unsplash.com/photo-1758518732175-5d608ba3abdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHRlYW18ZW58MXx8fHwxNzY2NTQ4MzQ4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      title: 'BIM技术应用分享会',
      date: '2025年1月22日',
      location: '线上直播',
      type: '分享会',
      participants: '200+',
      image: 'https://images.unsplash.com/photo-1609619385076-36a873425636?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwaW5ub3ZhdGlvbnxlbnwxfHx8fDE3NjY1MDEwMTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  const newsItems = [
    {
      title: '专委会成功举办2024年度技术创新论坛',
      date: '2024-12-20',
      category: '新闻动态',
      excerpt: '本次论坛汇聚了200余位行业专家，围绕智能建筑、绿色建筑等热点话题展开深入探讨...',
    },
    {
      title: '新增5家单位会员，会员规模持续扩大',
      date: '2024-12-18',
      category: '会员动态',
      excerpt: '本月新增5家优质单位会员，涵盖设备单位、设计单位等多个领域，会员总数突破300家...',
    },
    {
      title: '《建筑智能化技术应用指南》正式发布',
      date: '2024-12-15',
      category: '技术成果',
      excerpt: '由专委会组织编写的《建筑智能化技术应用指南》正式发布，为行业提供权威技术参考...',
    },
  ];

  const memberTypes = [
    {
      icon: Building2,
      title: '设备单位',
      description: '设备制造商、供应商',
      count: '120+',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Briefcase,
      title: '建设单位',
      description: '工程公司、施工单位',
      count: '85+',
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: GraduationCap,
      title: '事业单位',
      description: '科研院所、高校',
      count: '60+',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: BookOpen,
      title: '设计单位',
      description: '设计院、咨询公司',
      count: '45+',
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  const testimonials = [
    {
      name: '张建国',
      title: '教授级高级工程师',
      organization: '中国建筑科学研究院',
      content: '通过专委会平台，我们与行业同仁建立了深度合作，共同推进了多个重大技术创新项目。',
      avatar: 'https://images.unsplash.com/photo-1695067438561-75492f7b6a9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcmNoaXRlY3R1cmUlMjBidWlsZGluZ3xlbnwxfHx8fDE3NjY1MjYxMjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: '李明华',
      title: '教授、博士生导师',
      organization: '清华大学建筑学院',
      content: '专委会的学术交流活动为我们提供了很好的平台，促进了产学研深度融合。',
      avatar: 'https://images.unsplash.com/photo-1695067438561-75492f7b6a9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcmNoaXRlY3R1cmUlMjBidWlsZGluZ3xlbnwxfHx8fDE3NjY1MjYxMjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: '王芳',
      title: '高级工程师',
      organization: '上海建筑设计研究院',
      content: '在这里结识了众多行业精英，获得了宝贵的项目经验和技术资源。',
      avatar: 'https://images.unsplash.com/photo-1695067438561-75492f7b6a9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcmNoaXRlY3R1cmUlMjBidWlsZGluZ3xlbnwxfHx8fDE3NjY1MjYxMjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  const highlights = [
    {
      icon: Star,
      title: '权威认证',
      description: '国家级行业协会背书，专业可信赖',
    },
    {
      icon: Sparkles,
      title: '创新驱动',
      description: '聚焦前沿技术，推动行业创新发展',
    },
    {
      icon: Users,
      title: '资源整合',
      description: '连接产学研用，打通产业链上下游',
    },
    {
      icon: Award,
      title: '专业服务',
      description: '提供全方位专业技术支持与咨询',
    },
  ];

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
                <span className="text-sm">专业 · 权威 · 创新</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight">
                技术专委会<br />数字化平台
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed">
                连接行业精英，推动技术创新<br />
                为会员提供专业服务与交流平台
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg" onClick={() => setApplicationModalOpen(true)}>
                  <Users className="w-5 h-5" />
                  申请入会
                </button>
                <button className="px-8 py-4 bg-transparent text-white rounded-lg hover:bg-white/10 transition-all border-2 border-white/30 backdrop-blur-sm flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  了解更多
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
            {stats.map((stat, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform ${stat.color}`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-3xl md:text-4xl text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organization Introduction Section - New */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-600">关于我们</span>
            </div>
            <h2 className="text-3xl md:text-4xl text-gray-900 mb-4">组织介绍</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              广东省土木建筑学会给水排水专业委员会是广东省内给排水行业权威专业组织
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            {/* Left: Content */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all border border-blue-100">
                <h3 className="text-xl text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  专业定位
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  专委会隶属于广东省土木建筑学会，专注于建筑给排水和市政给排水领域的技术研究、学术交流和行业服务。汇聚省内外顶尖专家学者，为行业发展提供智力支持和技术指导。
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all border border-green-100">
                <h3 className="text-xl text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  核心使命
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  推动给排水技术创新与应用，促进产学研深度融合，加强行业内专业人士与设备厂商的交流合作，提升行业整体技术水平，服务广东省城市建设和民生工程。
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all border border-purple-100">
                <h3 className="text-xl text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  服务范围
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  涵盖建筑给排水设计、市政供水系统、市政排水工程、二次供水、智慧水务、海绵城市建设等多个专业领域，为会员提供技术咨询、标准编制、培训认证等全方位服务。
                </p>
              </div>
            </div>

            {/* Right: Image and Highlights */}
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1664575602554-2087b04935a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBidWlsZGluZyUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3MzY1NzI3Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="组织介绍"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-2xl mb-2">专业·权威·创新</h3>
                  <p className="text-sm text-white/90">服务行业发展，推动技术进步</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="text-3xl mb-2">10+年</div>
                  <div className="text-sm text-blue-100">行业服务经验</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="text-3xl mb-2">300+</div>
                  <div className="text-sm text-green-100">会员单位</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="text-3xl mb-2">150+</div>
                  <div className="text-sm text-purple-100">行业专家</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                  <div className="text-3xl mb-2">50+</div>
                  <div className="text-sm text-orange-100">年度活动</div>
                </div>
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

      {/* Highlights Section - New */}
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
            {highlights.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all group cursor-pointer border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guangdong Pump Valve Exhibition - Highlight Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-3xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Content */}
              <div className="p-8 md:p-12 lg:p-16 text-white">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                  <Star className="w-4 h-4" />
                  <span className="text-sm">十年合作 · 行业盛会</span>
                </div>
                <h2 className="text-3xl md:text-5xl mb-6 leading-tight">
                  广东国际泵管阀展览会
                </h2>
                <p className="text-lg text-white/90 mb-8 leading-relaxed">
                  连续10年与上海荷瑞展览有限公司成功合作，打造华南地区最具影响力的泵管阀行业展览会。汇聚国内外知名品牌，搭建供需对接平台，促进技术交流与商业合作。
                </p>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <div className="text-4xl mb-2">10年</div>
                    <div className="text-sm text-white/80">连续举办</div>
                  </div>
                  <div>
                    <div className="text-4xl mb-2">500+</div>
                    <div className="text-sm text-white/80">参展企业</div>
                  </div>
                  <div>
                    <div className="text-4xl mb-2">20,000+</div>
                    <div className="text-sm text-white/80">专业观众</div>
                  </div>
                  <div>
                    <div className="text-4xl mb-2">50,000㎡</div>
                    <div className="text-sm text-white/80">展览面积</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="px-8 py-4 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>查看展会详情</span>
                  </button>
                  <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all border-2 border-white/30 flex items-center justify-center gap-2">
                    <ExternalLink className="w-5 h-5" />
                    <span>展位预订</span>
                  </button>
                </div>
              </div>

              {/* Image */}
              <div className="relative h-64 lg:h-auto">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleGhpYml0aW9uJTIwaGFsbHxlbnwxfHx8fDE3MzY1NzI3Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="广东泵阀展"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent lg:hidden"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Digital Tools Connection Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4">
              <Smartphone className="w-4 h-4" />
              <span className="text-sm">数字化赋能</span>
            </div>
            <h2 className="text-3xl md:text-4xl mb-4">多平台互联互通</h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              通过视频号和智能体，打造全方位数字化服务体系
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* WEB Platform */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/15 transition-all group border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl mb-3">WEB平台</h3>
              <p className="text-blue-100 mb-6 leading-relaxed">
                专业门户网站，提供会员管理、项目展示、活动组织等全面服务
              </p>
              <div className="space-y-2 text-sm text-blue-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>会员服务与管理</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>项目与产品展示</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>活动组织与报名</span>
                </div>
              </div>
            </div>

            {/* Video Account */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/15 transition-all group border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl mb-3">视频号</h3>
              <p className="text-blue-100 mb-6 leading-relaxed">
                专业技术视频分享，打造行业知识传播阵地
              </p>
              <div className="space-y-2 text-sm text-blue-200 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>技术讲座与分享</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>项目案例解析</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>行业动态速递</span>
                </div>
              </div>
              <button className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg transition-all flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" />
                <span>关注视频号</span>
              </button>
            </div>

            {/* AI Agent */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/15 transition-all group border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl mb-3">智能体</h3>
              <p className="text-blue-100 mb-6 leading-relaxed">
                AI驱动的专业咨询助手，7x24小时智能服务
              </p>
              <div className="space-y-2 text-sm text-blue-200 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>技术问题咨询</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>智能推荐服务</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>行业知识问答</span>
                </div>
              </div>
              <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg">
                <Bot className="w-4 h-4" />
                <span>体验智能体</span>
              </button>
            </div>
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

      {/* Features Section - Enhanced */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl text-gray-900 mb-4">平台核心功能</h2>
            <p className="text-lg text-gray-600">为会员提供全方位的专业服务</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                onClick={() => onNavigate(feature.page)}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                <div className="flex items-center text-blue-600 group-hover:gap-2 transition-all">
                  <span className="text-sm">了解更多</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Member Types Section - New */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl text-gray-900 mb-4">会员体系</h2>
            <p className="text-lg text-gray-600">汇聚产业链上下游优质企业与机构</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {memberTypes.map((type, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all group">
                <div className={`w-12 h-12 ${type.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <type.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg text-gray-900 mb-2">{type.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                <div className="text-2xl text-gray-900">{type.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Activities - Enhanced */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl text-gray-900 mb-2">近期活动</h2>
              <p className="text-lg text-gray-600">精彩活动，不容错过</p>
            </div>
            <button
              onClick={() => onNavigate('activities')}
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>查看��部</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {upcomingActivities.map((activity, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all group">
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={activity.image}
                    alt={activity.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-600 rounded-full text-sm">
                      {activity.type}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg text-gray-900 mb-3 line-clamp-2">{activity.title}</h3>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>{activity.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>{activity.participants} 预计参与</span>
                    </div>
                  </div>
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg">
                    即报名
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('activities')}
            className="md:hidden w-full mt-8 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>查看全部活动</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* News Section - New */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl text-gray-900 mb-2">最新动态</h2>
              <p className="text-lg text-gray-600">了解专委会最���资讯</p>
            </div>
            <button 
              onClick={() => onNavigate('news')}
              className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>查看更多</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newsItems.map((news, index) => (
              <div key={index} className="bg-white rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">
                    {news.category}
                  </span>
                  <span className="text-xs text-gray-500">{news.date}</span>
                </div>
                <h3 className="text-lg text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {news.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {news.excerpt}
                </p>
                <div className="flex items-center text-blue-600 text-sm group-hover:gap-2 transition-all">
                  <span>阅读全文</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={() => onNavigate('news')}
            className="md:hidden w-full mt-8 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>查看更多动态</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Testimonials Section - New */}
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
            {testimonials.map((testimonial, index) => (
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 md:p-16 border border-blue-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 text-blue-600 mb-4">
                  <Lightbulb className="w-6 h-6" />
                  <span className="text-sm">核心价值</span>
                </div>
                <h2 className="text-3xl md:text-4xl text-gray-900 mb-6">
                  专业的技术服务平台
                </h2>
                <p className="text-gray-700 mb-8 leading-relaxed text-lg">
                  我们致力于搭建行业最专业的技术交流平台，汇聚行业精英，分享前沿技术，推动产业创新。通过年度会议、技术沙龙、专家分享等多种形式，为会员提供全方位的专业服务。
                </p>
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>立即加入</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl text-gray-900 mb-2">150+</div>
                  <div className="text-sm text-gray-600">权威专家团队<br />技术指导</div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl text-gray-900 mb-2">50+</div>
                  <div className="text-sm text-gray-600">年度专业活动<br />技术交流</div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl text-gray-900 mb-2">200+</div>
                  <div className="text-sm text-gray-600">优质项目案例<br />经验分享</div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl text-gray-900 mb-2">300+</div>
                  <div className="text-sm text-gray-600">会员单位<br />资源共享</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - New */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl text-white mb-6">
            准备好加入我们了吗？
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            与300+优质企业和150+行业专家一起，共建行业技术流平台
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2" onClick={() => setApplicationModalOpen(true)}>
              <Users className="w-5 h-5" />
              <span>申请入会</span>
            </button>
            <button className="px-8 py-4 bg-transparent text-white rounded-lg hover:bg-white/10 transition-all border-2 border-white flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>预约咨询</span>
            </button>
          </div>
        </div>
      </section>

      {/* Carousel Section - New */}
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