import { Search, MapPin, Building2, Calendar, Award, Eye, TrendingUp, X, FileText, Users, Target, Lightbulb, CheckCircle, BarChart3, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Project {
  id: number;
  title: string;
  category: string;
  location: string;
  completionDate: string;
  owner: string;
  designer: string;
  contractor: string;
  description: string;
  highlights: string[];
  awards: string[];
  views: number;
  // Extended details
  background?: string;
  scale?: {
    area: string;
    height?: string;
    investment?: string;
  };
  designConcept?: string;
  technicalFeatures?: {
    title: string;
    description: string;
  }[];
  achievements?: {
    title: string;
    value: string;
    description: string;
  }[];
  images?: string[];
}

export function ProjectShowcase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部类型');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const categories = ['全部类型', '智能建筑', '绿色建筑', 'BIM应用', '装配式建筑', '既有建筑改造'];

  const projects: Project[] = [
    {
      id: 1,
      title: '北京大兴国际机场航站楼',
      category: '智能建筑',
      location: '北京市大兴区',
      completionDate: '2019年6月',
      owner: '首都机场集团公司',
      designer: '扎哈·哈迪德建筑事务所',
      contractor: '中国建筑股份有限公司',
      description: '世界最大单体航站楼，采用先进的智能化系统，实现全流程智能化管理。',
      highlights: [
        '全球首个五星级机场',
        '应用BIM技术实现全生命周期管理',
        '集成智能楼宇管理系统',
        '绿色三星认证'
      ],
      awards: ['鲁班奖', '中国建筑工程詹天佑奖'],
      views: 15230,
      background: '北京大兴国际机场是落实首都城市战略定位、完善首都功能布局、推动京津冀协同发展的国家重大标志性工程。航站楼以"凤凰展翅"为设计理念，采用世界首创的"五指廊"放射状设计，旅客从航站楼中心步行到达任何登机口距离不超过600米，大大缩短了旅客步行时间。',
      scale: {
        area: '70万平方米',
        height: '主航站楼地上5层、地下2层',
        investment: '约800亿元人民币'
      },
      designConcept: '航站楼采用"凤凰展翅"的设计理念，寓意"龙凤呈祥"。五条指廊从中央向四周发散，形似凤凰翅膀，既具有中国传统文化象征意义，又满足了功能需求。建筑造型流线型设计，体现了速度与现代感，同时兼顾了采光、通风等绿色建筑要求。',
      technicalFeatures: [
        {
          title: '智能化系统集成',
          description: '采用先进的楼宇自控系统(BAS)、能源管理系统(EMS)、综合安防系统等，实现全流程智能化管理。通过大数据分析和人工智能技术，优化航站楼运营效率，提升旅客服务体验。'
        },
        {
          title: 'BIM全生命周期应用',
          description: '项目全过程采用BIM技术，建立了包含建筑、结构、机电等全专业的BIM模型。从设计、施工到运维，实现信息的无缝传递和共享，大幅提高了项目管理效率和质量。'
        },
        {
          title: '绿色节能技术',
          description: '采用自然采光设计，中央大厅和指廊顶部设置大面积采光天窗，白天基本不需要人工照明。应用地源热泵、雨水回收、太阳能光伏发电等技术，实现绿色建筑三星标准。'
        },
        {
          title: '抗震与结构创新',
          description: '采用大跨度空间网架结构，最大跨度达200米，创造了超大无柱空间。应用隔震技术，抗震设防烈度达8度，确保建筑安全。'
        }
      ],
      achievements: [
        {
          title: '年旅客吞吐量',
          value: '1亿人次',
          description: '设计年旅客吞吐量1亿人次，远期可达1.3亿人次'
        },
        {
          title: '节能率',
          value: '40%',
          description: '相比传统航站楼，综合节能率达到40%以上'
        },
        {
          title: '施工周期',
          value: '4年',
          description: '从开工到竣工仅用4年时间，创造了建设奇迹'
        }
      ],
      images: [
        'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800',
        'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=800',
        'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800'
      ]
    },
    {
      id: 2,
      title: '上海中心大厦',
      category: '绿色建筑',
      location: '上海市浦东新区',
      completionDate: '2015年3月',
      owner: '上海中心大厦建设发展有限公司',
      designer: 'Gensler建筑设计事务所',
      contractor: '上海建工集团',
      description: '中国第一、世界第二高楼，采用先进的绿色建筑技术，节能率达到40%以上。',
      highlights: [
        '632米超高层建筑',
        '双层幕墙节能系统',
        '雨水收集利用系统',
        '垂直绿化系统'
      ],
      awards: ['中国建设工程鲁班奖', 'LEED铂金级认证'],
      views: 23450,
      background: '上海中心大厦位于上海浦东陆家嘴金融贸易区，与金茂大厦、环球金融中心共同构成"上海三件套"。项目定位为综合性超高层建筑，集办公、酒店、会议、观光、商业等功能于一体，是上海的新地标和中国建筑技术的集大成者。',
      scale: {
        area: '57.6万平方米',
        height: '632米，共128层',
        investment: '约148亿元人民币'
      },
      designConcept: '建筑造型灵感来源于中国传统的龙形意象，采用旋转上升的设计，每层相对于下一层旋转1度，整体呈120度扭转上升。这种设计不仅具有独特的视觉效果，还能有效减少风荷载约24%，降低了结构成本。',
      technicalFeatures: [
        {
          title: '双层幕墙系统',
          description: '创新采用双层幕墙设计，内外幕墙之间形成约1米宽的缓冲空间。这个空间既能起到保温隔热作用，又能作为垂直绿化空间，大幅降低建筑能耗，节能率达40%以上。'
        },
        {
          title: '垂直绿化系统',
          description: '在双层幕墙之间设置21个空中花园，每隔12-15层设置一个，总面积约2.4万平方米。这些空中花园不仅改善了室内环境，还为使用者提供了休憩交流的场所。'
        },
        {
          title: '智能电梯系统',
          description: '采用世界最快的电梯系统，速度达到18米/秒。应用目的楼层控制系统，智能分配电梯，减少等待时间，提高运行效率。'
        },
        {
          title: '雨水回收利用',
          description: '建立完善的雨水收集、净化、储存和利用系统，年回收雨水约2万吨，用于绿化灌溉和景观用水，实现水资源的循环利用。'
        }
      ],
      achievements: [
        {
          title: '绿色认证',
          value: 'LEED铂金级',
          description: '获得美国LEED绿色建筑铂金级认证和中国绿色建筑三星认证'
        },
        {
          title: '节能率',
          value: '40%+',
          description: '相比传统超高层建筑，综合节能率超过40%'
        },
        {
          title: '抗震性能',
          value: '9度',
          description: '采用减震技术，抗震设防烈度达9度，确保超高层建筑安全'
        }
      ],
      images: [
        'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=800',
        'https://images.unsplash.com/photo-1584907797015-7554cd315667?w=800',
        'https://images.unsplash.com/photo-1583001996122-7d6c8fd27a37?w=800'
      ]
    },
    {
      id: 3,
      title: '雄安市民服务中心',
      category: '装配式建筑',
      location: '河北省雄安新区',
      completionDate: '2018年6月',
      owner: '中国雄安集团',
      designer: '中国建筑设计研究院',
      contractor: '中国建筑集团',
      description: '全国首个大规模应用装配式建筑的项目，装配率达到90%以上。',
      highlights: [
        '112天建成投用',
        '90%以上装配率',
        '全过程BIM应用',
        '绿色建筑三星标准'
      ],
      awards: ['中国建筑工程装配式建筑示范工程'],
      views: 18900,
      background: '雄安市民服务中心是雄安新区首个大型公共建筑，承担着新区行政办公、会议接待、市民服务等功能。项目采用装配式建筑技术，实现了高效、环保、高质量的建设目标，是雄安新区绿色建筑的典范。',
      scale: {
        area: '10万平方米',
        height: '主楼地上5层、地下1层',
        investment: '约10亿元人民币'
      },
      designConcept: '建筑采用现代简约风格，外观简洁大方，内部空间布局合理。主楼采用钢结构框架，外墙采用预制混凝土板，内墙采用预制砌块，实现了高装配率。建筑内部设有办公区、会议区、接待区、休息区等功能空间，满足不同使用需求。',
      technicalFeatures: [
        {
          title: '预制构件应用',
          description: '项目主体结构采用预制构件，包括预制柱、预制梁、预制墙板等，装配率达到90%以上。预制构件在工厂生产，现场安装，大大提高了施工效率，减少了现场湿作业。'
        },
        {
          title: 'BIM全过程管理',
          description: '项目全过程采用BIM技术，建立了详细的三维模型。从设计、施工到运维，实现信息的无缝传递和共享，提高了项目管理效率和质量。'
        },
        {
          title: '绿色节能技术',
          description: '采用自然采光设计，主楼顶部设置大面积采光天窗，白天基本不需要人工照明。应用地源热泵、雨水回收、太阳能光伏发电等技术，实现绿色建筑三星标准。'
        },
        {
          title: '抗震与结构创新',
          description: '采用大跨度空间网架结构，最大跨度达200米，创造了超大无柱空间。应用隔震技术，抗震设防烈度达8度，确保建筑安全。'
        }
      ],
      achievements: [
        {
          title: '建设周期',
          value: '112天',
          description: '从开工到竣工仅用112天时间，创造了建设奇迹'
        },
        {
          title: '装配率',
          value: '90%+',
          description: '主体结构装配率达到90%以上'
        },
        {
          title: '节能率',
          value: '40%+',
          description: '相比传统建筑，综合节能率超过40%'
        }
      ],
      images: [
        'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=800',
        'https://images.unsplash.com/photo-1584907797015-7554cd315667?w=800',
        'https://images.unsplash.com/photo-1583001996122-7d6c8fd27a37?w=800'
      ]
    },
    {
      id: 4,
      title: '深圳平安金融中心',
      category: 'BIM应用',
      location: '广东省深圳市',
      completionDate: '2017年1月',
      owner: '中国平安保险（集团）股份有限公司',
      designer: 'KPF建筑师事务所',
      contractor: '中国建筑一局（集团）有限公司',
      description: '599.1米超高层建筑，全过程BIM应用典范项目。',
      highlights: [
        '全球第四高楼',
        'BIM+智慧工地',
        '4D施工模拟',
        '运维阶段BIM应用'
      ],
      awards: ['全国BIM应用示范工程', '鲁班奖'],
      views: 20150,
      background: '深圳平安金融中心是深圳福田中心区的标志性建筑，集办公、会议、商业等功能于一体。项目采用全过程BIM技术，实现了高效、精准的建设管理，是全国BIM应用的典范。',
      scale: {
        area: '44万平方米',
        height: '599.1米，共116层',
        investment: '约500亿元人民币'
      },
      designConcept: '建筑造型简洁大方，采用流线型设计，体现了速度与现代感。主楼采用钢结构框架，外墙采用玻璃幕墙，内部空间布局合理。建筑内部设有办公区、会议区、商业区等功能空间，满足不同使用需求。',
      technicalFeatures: [
        {
          title: 'BIM全过程管理',
          description: '项目全过程采用BIM技术，建立了详细的三维模型。从设计、施工到运维，实现信息的无缝传递和共享，提高了项目管理效率和质量。'
        },
        {
          title: '智慧工地应用',
          description: '采用先进的智慧工地技术，包括无人机巡检、智能监控、物联网等，实现了施工过程的智能化管理。'
        },
        {
          title: '4D施工模拟',
          description: '应用4D施工模拟技术，将时间维度加入三维模型，实现了施工进度的可视化管理。'
        },
        {
          title: '运维阶段BIM应用',
          description: '项目竣工后，继续采用BIM技术进行运维管理，包括设施管理、能耗管理、安全管理等，实现了建筑的全生命周期管理。'
        }
      ],
      achievements: [
        {
          title: '建设周期',
          value: '4年',
          description: '从开工到竣工仅用4年时间，创造了建设奇迹'
        },
        {
          title: 'BIM应用',
          value: '全过程',
          description: '项目全过程采用BIM技术，实现了高效、精准的建设管理'
        },
        {
          title: '节能率',
          value: '40%+',
          description: '相比传统建筑，综合节能率超过40%'
        }
      ],
      images: [
        'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=800',
        'https://images.unsplash.com/photo-1584907797015-7554cd315667?w=800',
        'https://images.unsplash.com/photo-1583001996122-7d6c8fd27a37?w=800'
      ]
    },
    {
      id: 5,
      title: '杭州国际博览中心',
      category: '智能建筑',
      location: '浙江省杭州市',
      completionDate: '2016年4月',
      owner: '杭州市钱江世纪城投资集团',
      designer: '中国建筑设计研究院',
      contractor: '浙江省建工集团',
      description: 'G20峰会主会场，集成先进的智能化会议系统和建筑管理系统。',
      highlights: [
        '85万平方米综合体',
        '智能会议管理系统',
        '集成安防系统',
        '绿色建筑二星'
      ],
      awards: ['中国建设工程鲁班奖'],
      views: 16780,
      background: '杭州国际博览中心是G20峰会的主会场，集会议、展览、办公等功能于一体。项目采用先进的智能化技术，实现了高效、安全、舒适的使用体验，是杭州的新地标。',
      scale: {
        area: '85万平方米',
        height: '主楼地上5层、地下1层',
        investment: '约100亿元人民币'
      },
      designConcept: '建筑造型简洁大方，采用流线型设计，体现了速度与现代感。主楼采用钢结构框架，外墙采用玻璃幕墙，内部空间布局合理。建筑内部设有会议区、展览区、办公区等功能空间，满足不同使用需求。',
      technicalFeatures: [
        {
          title: '智能会议管理系统',
          description: '采用先进的智能会议管理系统，包括视频会议、远程控制、会议记录等，实现了会议的高效管理。'
        },
        {
          title: '集成安防系统',
          description: '采用先进的安防系统，包括视频监控、门禁控制、报警系统等，实现了建筑的安全管理。'
        },
        {
          title: '绿色节能技术',
          description: '采用自然采光设计，主楼顶部设置大面积采光天窗，白天基本不需要人工照明。应用地源热泵、雨水回收、太阳能光伏发电等技术，实现绿色建筑二星标准。'
        },
        {
          title: '抗震与结构创新',
          description: '采用大跨度空间网架结构，最大跨度达200米，创造了超大无柱空间。应用隔震技术，抗震设防烈度达8度，确保建筑安全。'
        }
      ],
      achievements: [
        {
          title: '建设周期',
          value: '4年',
          description: '从开工到竣工仅用4年时间，创造了建设奇迹'
        },
        {
          title: '智能管理',
          value: '全面',
          description: '项目采用先进的智能化技术，实现了高效、安全、舒适的使用体验'
        },
        {
          title: '节能率',
          value: '40%+',
          description: '相比传统建筑，综合节能率超过40%'
        }
      ],
      images: [
        'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=800',
        'https://images.unsplash.com/photo-1584907797015-7554cd315667?w=800',
        'https://images.unsplash.com/photo-1583001996122-7d6c8fd27a37?w=800'
      ]
    },
    {
      id: 6,
      title: '北京城市副中心行政办公区',
      category: '绿色建筑',
      location: '北京市通州区',
      completionDate: '2019年1月',
      owner: '北京城市副中心投资建设集团',
      designer: '中国建筑设计研究院',
      contractor: '北京建工集团',
      description: '全国首个大规模绿色建筑集群，实现绿色建筑全覆盖。',
      highlights: [
        '全部达到绿色建筑标准',
        '海绵城市技术应用',
        '装配式建筑占比70%',
        '综合管廊系统'
      ],
      awards: ['全国绿色建筑创新奖'],
      views: 19200,
      background: '北京城市副中心行政办公区是北京城市副中心的重要组成部分，集办公、会议、商业等功能于一体。项目采用绿色建筑技术，实现了高效、环保、高质量的建设目标，是北京城市副中心的绿色典范。',
      scale: {
        area: '100万平方米',
        height: '主楼地上5层、地下1层',
        investment: '约200亿元人民币'
      },
      designConcept: '建筑造型简洁大方，采用流线型设计，体现了速度与现代感。主楼采用钢结构框架，外墙采用玻璃幕墙，内部空间布局合理。建筑内部设有办公区、会议区、商业区等功能空间，满足不同使用需求。',
      technicalFeatures: [
        {
          title: '绿色建筑标准',
          description: '项目全部达到绿色建筑标准，包括节能、节水、节材、减排等。'
        },
        {
          title: '海绵城市技术应用',
          description: '采用海绵城市技术，包括透水铺装、雨水花园、绿色屋顶等，实现了雨水的自然渗透和利用。'
        },
        {
          title: '装配式建筑占比70%',
          description: '项目主体结构采用预制构件，包括预制柱、预制梁、预制墙板等，装配率达到70%以上。预制构件在工厂生产，现场安装，大大提高了施工效率，减少了现场湿作业。'
        },
        {
          title: '综合管廊系统',
          description: '项目采用综合管廊系统，将电力、通信、给排水等管线集中敷设，实现了管线的统一管理和维护。'
        }
      ],
      achievements: [
        {
          title: '建设周期',
          value: '4年',
          description: '从开工到竣工仅用4年时间，创造了建设奇迹'
        },
        {
          title: '绿色建筑',
          value: '全覆盖',
          description: '项目全部达到绿色建筑标准，实现了高效、环保、高质量的建设目标'
        },
        {
          title: '节能率',
          value: '40%+',
          description: '相比传统建筑，综合节能率超过40%'
        }
      ],
      images: [
        'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=800',
        'https://images.unsplash.com/photo-1584907797015-7554cd315667?w=800',
        'https://images.unsplash.com/photo-1583001996122-7d6c8fd27a37?w=800'
      ]
    },
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '全部类型' || project.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8">
            {/* Modal Header with Project Image */}
            <div className="relative h-64 md:h-96 bg-gradient-to-br from-blue-100 to-blue-200">
              {selectedProject.images && selectedProject.images.length > 0 ? (
                <ImageWithFallback
                  src={selectedProject.images[0]}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="w-24 h-24 text-blue-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Project Title on Image */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                    {selectedProject.category}
                  </span>
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="w-4 h-4" />
                    <span>{selectedProject.views.toLocaleString()} 浏览</span>
                  </div>
                </div>
                <h1 className="text-2xl md:text-4xl mb-4 leading-tight">
                  {selectedProject.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedProject.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>竣工时间：{selectedProject.completionDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-10">
              {/* Project Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="text-sm text-gray-500 mb-2">建设单位</h3>
                  <p className="text-sm text-gray-900">{selectedProject.owner}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-2">设计单位</h3>
                  <p className="text-sm text-gray-900">{selectedProject.designer}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-2">施工单位</h3>
                  <p className="text-sm text-gray-900">{selectedProject.contractor}</p>
                </div>
              </div>

              {/* Project Scale */}
              {selectedProject.scale && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    项目规模
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-600 mb-1">建筑面积</div>
                      <div className="text-lg text-blue-900">{selectedProject.scale.area}</div>
                    </div>
                    {selectedProject.scale.height && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-sm text-blue-600 mb-1">建筑高度</div>
                        <div className="text-lg text-blue-900">{selectedProject.scale.height}</div>
                      </div>
                    )}
                    {selectedProject.scale.investment && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-sm text-blue-600 mb-1">投资规模</div>
                        <div className="text-lg text-blue-900">{selectedProject.scale.investment}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Project Background */}
              {selectedProject.background && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    项目背景
                  </h2>
                  <p className="text-gray-700 leading-relaxed">{selectedProject.background}</p>
                </div>
              )}

              {/* Design Concept */}
              {selectedProject.designConcept && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-600" />
                    设计理念
                  </h2>
                  <p className="text-gray-700 leading-relaxed">{selectedProject.designConcept}</p>
                </div>
              )}

              {/* Technical Features */}
              {selectedProject.technicalFeatures && selectedProject.technicalFeatures.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    技术特点
                  </h2>
                  <div className="space-y-4">
                    {selectedProject.technicalFeatures.map((feature, index) => (
                      <div key={index} className="p-5 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all">
                        <h3 className="text-lg text-gray-900 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed pl-7">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights */}
              <div className="mb-8">
                <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  技术亮点
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedProject.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              {selectedProject.achievements && selectedProject.achievements.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    项目成果
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedProject.achievements.map((achievement, index) => (
                      <div key={index} className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 text-center">
                        <div className="text-3xl text-blue-600 mb-2">{achievement.value}</div>
                        <div className="text-sm text-gray-900 mb-2">{achievement.title}</div>
                        <div className="text-xs text-gray-600">{achievement.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Awards */}
              {selectedProject.awards.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    获奖情况
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedProject.awards.map((award, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                        <Award className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{award}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Images */}
              {selectedProject.images && selectedProject.images.length > 1 && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                    项目图片
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedProject.images.slice(1).map((image, index) => (
                      <div key={index} className="relative h-48 rounded-lg overflow-hidden group">
                        <ImageWithFallback
                          src={image}
                          alt={`${selectedProject.title} - ${index + 2}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-gray-900 mb-2">优秀案例</h1>
          <p className="text-gray-600">展示行业典型案例与创新成果，分享成功经验</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索项目名称、地点或关键词..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            找到 {filteredProjects.length} 个项目
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
            >
              {/* Project Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-blue-400" />
              </div>

              <div className="p-6">
                {/* Category Badge */}
                <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm mb-3">
                  {project.category}
                </div>

                {/* Project Title */}
                <h3 className="text-lg text-gray-900 mb-2">{project.title}</h3>

                {/* Project Info */}
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>竣工时间：{project.completionDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{project.views.toLocaleString()} 浏览</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Highlights */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>技术亮点</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.highlights.slice(0, 3).map((highlight, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Awards */}
                {project.awards.length > 0 && (
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>获奖情况</span>
                    </div>
                    <div className="space-y-1">
                      {project.awards.map((award, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {award}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Participants */}
                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <div><span className="text-gray-600">建设单位：</span>{project.owner}</div>
                  <div><span className="text-gray-600">设计单位：</span>{project.designer}</div>
                  <div><span className="text-gray-600">施工单位：</span>{project.contractor}</div>
                </div>

                {/* Action Button */}
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onClick={() => setSelectedProject(project)}>
                  查看详情
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-600 mb-2">未找到匹配的项目</p>
            <p className="text-sm text-gray-500">请尝试其他搜索条件</p>
          </div>
        )}
      </div>
    </div>
  );
}