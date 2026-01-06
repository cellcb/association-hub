import { Search, MapPin, Award, Mail, Phone, ExternalLink, X, BookOpen, Briefcase, FileText, GraduationCap, Trophy, Users as UsersIcon, Building } from 'lucide-react';
import { useState } from 'react';

interface Expert {
  id: number;
  name: string;
  title: string;
  organization: string;
  expertise: string[];
  location: string;
  achievements: string;
  email: string;
  phone: string;
  // Extended details
  bio?: string;
  education?: string[];
  experience?: string[];
  projects?: { name: string; year: string; role: string; description: string }[];
  publications?: { title: string; year: string; journal: string }[];
  awards?: string[];
  researchAreas?: string[];
}

export function ExpertDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState('全部领域');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);

  const fields = ['全部领域', '建筑给排水', '市政供水', '市政排水', '项目管理', '智慧管理'];

  const experts: Expert[] = [
    {
      id: 1,
      name: '张建国',
      title: '教授级高级工程师',
      organization: '中国建筑设计研究院',
      expertise: ['建筑给排水', '绿色建筑', '二次供水'],
      location: '北京',
      achievements: '主持国家重点建筑给排水项目15项，主编国家标准3部，发表论文50余篇',
      email: 'zhang.jg@example.com',
      phone: '138****1234',
      bio: '张建国教授级高级工程师，从事建筑给排水设计及研究工作30余年，是我国建筑给排水领域的权威专家。在绿色建筑给排水系统、二次供水设施优化、建筑节水技术等方面有深入研究，主持完成多项国家级重点工程项目，为推动我国建筑给排水技术进步做出了重要贡献。',
      education: [
        '1992年 清华大学环境工程系 博士',
        '1987年 同济大学给水排水工程 硕士',
        '1984年 哈尔滨工业大学给水排水工程 学士'
      ],
      experience: [
        '2010年至今 中国建筑设计研究院 总工程师',
        '2005-2010年 中国建筑设计研究院 副总工程师',
        '1995-2005年 中国建筑设计研究院 主任工程师',
        '1992-1995年 北京市建筑设计研究院 工程师'
      ],
      projects: [
        {
          name: '北京大兴国际机场航站楼给排水系统',
          year: '2019',
          role: '项目总负责人',
          description: '负责航站楼给排水、消防给水、雨水系统等全专业设计，采用智慧水务管理平台，实现节水率30%以上。'
        },
        {
          name: '上海中心大厦超高层建筑给排水系统',
          year: '2015',
          role: '技术顾问',
          description: '632米超高层建筑给排水系统设计，创新采用分区供水、减压稳压技术，获国家优质工程金奖。'
        },
        {
          name: '深圳平安金融中心给排水工程',
          year: '2017',
          role: '设计负责人',
          description: '600米超高层建筑给排水系统设计，实现绿色建筑三星标准，节水节能效果显著。'
        }
      ],
      publications: [
        { title: '超高层建筑给水系统优化设计研究', year: '2020', journal: '建筑学报' },
        { title: '绿色建筑节水技术应用与实践', year: '2018', journal: '给水排水' },
        { title: '二次供水设施智能化管理系统研究', year: '2019', journal: '中国给水排水' }
      ],
      awards: [
        '2020年 全国工程勘察设计大师',
        '2018年 国家科技进步二等奖',
        '2016年 中国建筑学会科学技术奖一等奖',
        '2015年 华夏建设科学技术奖特等奖'
      ],
      researchAreas: ['超高层建筑给排水', '绿色建筑节水技术', '二次供水智能化', '建筑消防给水系统']
    },
    {
      id: 2,
      name: '李明华',
      title: '教授、博士生导师',
      organization: '清华大学环境学院',
      expertise: ['市政供水', '水处理技术', '水质安全'],
      location: '北京',
      achievements: '国家级教学成果奖获得者，主持国家水专项题5项，主编教材2部',
      email: 'li.mh@example.com',
      phone: '139****5678',
      bio: '李明华教授，清华大学环境学院博士生导师，长期从事城市供水与水质安全研究。在饮用水深度处理、供水管网水质保障、应急供水技术等领域取得多项创新成果，培养博士、硕士研究生80余名，是我国供水领域的学术带头人。',
      education: [
        '1995年 美国斯坦福大学环境工程 博士后',
        '1990年 清华大学环境工程 博士',
        '1985年 清华大学环境工程 学士'
      ],
      experience: [
        '2015年至今 清华大学环境学院 教授、博士生导师',
        '2008-2015年 清华大学环境学院 副教授',
        '2000-2008年 清华大学环境学院 讲师',
        '1995-2000年 清华大学环境学院 助理研究员'
      ],
      projects: [
        {
          name: '国家水体污染控制与治理科技重大专项',
          year: '2018',
          role: '课题负责人',
          description: '开展城市供水系统水质安全保障关键技术研究，建立了完善的水质监测与预警体系。'
        },
        {
          name: '北京市供水管网水质优化技术研究',
          year: '2016',
          role: '项目负责人',
          description: '针对老旧供水管网水质恶化问题，开发管网水质调控技术，显著提升供水水质。'
        }
      ],
      publications: [
        { title: '城市供水系统水质安全保障技术', year: '2021', journal: 'Water Research' },
        { title: '饮用水深度处理技术进展', year: '2019', journal: '环境科学' },
        { title: '供水管网二次污染控制策略', year: '2017', journal: 'Environmental Science & Technology' }
      ],
      awards: [
        '2021年 国家级教学成果一等奖',
        '2019年 国家科技进步二等奖',
        '2017年 教育部自然科学一等奖',
        '2015年 北京市科学技术一等奖'
      ],
      researchAreas: ['饮用水安全保障', '水处理技术', '供水管网优化', '水质监测与预警']
    },
    {
      id: 3,
      name: '王芳',
      title: '高级工程师',
      organization: '上海市政工程设计研究总院',
      expertise: ['市政排水', '雨水管理', '海绵城市'],
      location: '上海',
      achievements: '负责重大市政排水项目30余项，海绵城市建设专家，上海市劳动模范',
      email: 'wang.f@example.com',
      phone: '136****9012',
      bio: '王芳高级工程师，上海市政工程设计研究总院资深专家，专注于市政排水系统设计与管理。在雨水管理、海绵城市建设、城市排水系统优化等方面有丰富经验，主持完成多项重大市政排水项目，为上海城市排水系统的现代化做出了重要贡献。',
      education: [
        '2005年 上海交通大学市政工程 硕士',
        '2001年 上海交通大学市政工程 学士'
      ],
      experience: [
        '2015年至今 上海市政工程设计研究总院 高级工程师',
        '2010-2015年 上海市政工程设计研究总院 工程师',
        '2005-2010年 上海市政工程设计研究总院 助理工程师'
      ],
      projects: [
        {
          name: '上海市中心城排水系统优化工程',
          year: '2018',
          role: '项目负责人',
          description: '通过优化排水系统布局，提高排水效率，减少城市内涝风险，获上海市科技进步奖。'
        },
        {
          name: '浦东新区海绵城市建设示范项目',
          year: '2016',
          role: '技术顾问',
          description: '参与海绵城市建设规划，设计雨水收集与利用系统，提升城市防洪排涝能力。'
        }
      ],
      publications: [
        { title: '城市排水系统优化设计研究', year: '2020', journal: '城市规划' },
        { title: '海绵城市建设技术应用与实践', year: '2018', journal: '给水排水' },
        { title: '雨水管理系统的创新设计', year: '2019', journal: '中国给水排水' }
      ],
      awards: [
        '2020年 上海市科技进步一等奖',
        '2018年 上海市优秀工程师奖',
        '2016年 上海市劳动模范'
      ],
      researchAreas: ['市政排水系统', '雨水管理', '海绵城市建设', '城市排水系统优化']
    },
    {
      id: 4,
      name: '刘宇',
      title: '教授级高级工程师',
      organization: '广东省建筑设计研究院',
      expertise: ['建筑给排水', '消防给水', '项目管理'],
      location: '广州',
      achievements: '广东省设计大师，主持超高层建筑给排水设计项目20余项，国家级工法5项',
      email: 'liu.y@example.com',
      phone: '137****3456',
      bio: '刘宇教授级高级工程师，广东省建筑设计研究院资深专家，专注于建筑给排水设计与项目管理。在超高层建筑给排水系统设计、消防给水系统优化、项目管理等方面有丰富经验，主持完成多项国家级重点工程项目，为推动我国建筑给排水技术进步做出了重要贡献。',
      education: [
        '1995年 清华大学环境工程系 博士',
        '1990年 同济大学给水排水工程 硕士',
        '1985年 哈尔滨工业大学给水排水工程 学士'
      ],
      experience: [
        '2010年至今 广东省建筑设计研究院 总工程师',
        '2005-2010年 广东省建筑设计研究院 副总工程师',
        '1995-2005年 广东省建筑设计研究院 主任工程师',
        '1992-1995年 广州市建筑设计研究院 工程师'
      ],
      projects: [
        {
          name: '广州塔超高层建筑给排水系统',
          year: '2019',
          role: '项目总负责人',
          description: '负责超高层建筑给排水、消防给水、雨水系统等全专业设计，采用智慧水务管理平台，实现节水率30%以上。'
        },
        {
          name: '深圳平安金融中心给排水工程',
          year: '2017',
          role: '设计负责人',
          description: '600米超高层建筑给排水系统设计，实现绿色建筑三星标准，节水节能效果显著。'
        }
      ],
      publications: [
        { title: '超高层建筑给水系统优化设计研究', year: '2020', journal: '建筑学报' },
        { title: '绿色建筑节水技术应用与实践', year: '2018', journal: '给水排水' },
        { title: '二次供水设施智能化管理系统研究', year: '2019', journal: '中国给水排水' }
      ],
      awards: [
        '2020年 全国工程勘察设计大师',
        '2018年 国家科技进步二等奖',
        '2016年 中国建筑学会科学技术奖一等奖',
        '2015年 华夏建设科学技术奖特等奖'
      ],
      researchAreas: ['超高层建筑给排水', '绿色建筑节水技术', '二次供水智能化', '建筑消防给水系统']
    },
    {
      id: 5,
      name: '陈晓红',
      title: '研究员',
      organization: '住房和城乡建设部给排水产品标准化技术委员会',
      expertise: ['智慧管理', '二次供水', '政策研究'],
      location: '北京',
      achievements: '参与多项国家给排水行业政策制定，主编行业标准8部，智慧水务专家',
      email: 'chen.xh@example.com',
      phone: '135****7890',
      bio: '陈晓红研究员，住房和城乡建设部给排水产品标准化技术委员会专家，长期从事给排水行业政策研究与标准化工作。在智慧水务管理、二次供水设施优化、行业标准制定等方面有丰富经验，参与制定多项国家给排水行业政策，主编行业标准8部，为推动我国给排水行业技术进步做出了重要贡献。',
      education: [
        '1995年 清华大学环境工程系 博士',
        '1990年 同济大学给水排水工程 硕士',
        '1985年 哈尔滨工业大学给水排水工程 学士'
      ],
      experience: [
        '2010年至今 住房和城乡建设部给排水产品标准化技术委员会 研究员',
        '2005-2010年 住房和城乡建设部给排水产品标准化技术委员会 助理研究员',
        '1995-2005年 住房和城乡建设部给排水产品标准化技术委员会 技术员'
      ],
      projects: [
        {
          name: '国家给排水行业标准制定项目',
          year: '2018',
          role: '项目负责人',
          description: '参与制定多项国家给排水行业标准，提升行业技术水平，获国家科技进步二等奖。'
        },
        {
          name: '智慧水务管理平台建设',
          year: '2016',
          role: '技术顾问',
          description: '设计智慧水务管理平台，实现给排水系统智能化管理，提升运营效率。'
        }
      ],
      publications: [
        { title: '智慧水务管理技术研究', year: '2020', journal: '建筑学报' },
        { title: '二次供水设施优化设计研究', year: '2018', journal: '给水排水' },
        { title: '行业标准制定技术应用与实践', year: '2019', journal: '中国给水排水' }
      ],
      awards: [
        '2020年 国家科技进步二等奖',
        '2018年 中国建筑学会科学技术奖一等奖',
        '2016年 住房和城乡建设部优秀科技工作者'
      ],
      researchAreas: ['智慧水务管理', '二次供水设施优化', '行业标准制定', '给排水系统智能化']
    },
    {
      id: 6,
      name: '赵强',
      title: '教授',
      organization: '同济大学环境科学与工程学院',
      expertise: ['市政供水', '管网优化', '智慧管理'],
      location: '上海',
      achievements: '国家自然科学基金重点项目负责人，智慧水务技术领军人才，发表SCI论文80余篇',
      email: 'zhao.q@example.com',
      phone: '133****2345',
      bio: '赵强教授，同济大学环境科学与工程学院教授，长期从事城市供水与管网优化研究。在智慧水务技术、供水管网优化、城市排水系统管理等方面有丰富经验，主持完成多项国家自然科学基金重点项目，发表SCI论文80余篇，为推动我国智慧水务技术进步做出了重要贡献。',
      education: [
        '1995年 美国斯坦福大学环境工程 博士后',
        '1990年 清华大学环境工程 博士',
        '1985年 清华大学环境工程 学士'
      ],
      experience: [
        '2015年至今 同济大学环境科学与工程学院 教授',
        '2008-2015年 同济大学环境科学与工程学院 副教授',
        '2000-2008年 同济大学环境科学与工程学院 讲师',
        '1995-2000年 同济大学环境科学与工程学院 助理研究员'
      ],
      projects: [
        {
          name: '国家水体污染控制与治理科技重大专项',
          year: '2018',
          role: '课题负责人',
          description: '开展城市供水系统水质安全保障关键技术研究，建立了完善的水质监测与预警体系。'
        },
        {
          name: '北京市供水管网水质优化技术研究',
          year: '2016',
          role: '项目负责人',
          description: '针对老旧供水管网水质恶化问题，开发管网水质调控技术，显著提升供水水质。'
        }
      ],
      publications: [
        { title: '城市供水系统水质安全保障技术', year: '2021', journal: 'Water Research' },
        { title: '饮用水深度处理技术进展', year: '2019', journal: '环境科学' },
        { title: '供水管网二次污染控制策略', year: '2017', journal: 'Environmental Science & Technology' }
      ],
      awards: [
        '2021年 国家级教学成果一等奖',
        '2019年 国家科技进步二等奖',
        '2017年 教育部自然科学一等奖',
        '2015年 北京市科学技术一等奖'
      ],
      researchAreas: ['饮用水安全保障', '水处理技术', '供水管网优化', '水质监测与预警']
    },
    {
      id: 7,
      name: '孙丽娟',
      title: '高级工程师',
      organization: '深圳市水务规划设计院',
      expertise: ['市政排水', '污水处理', '项目管理'],
      location: '深圳',
      achievements: '深圳市优秀工程师，负责污水处理厂设计项目15项，行业技术带头人',
      email: 'sun.lj@example.com',
      phone: '134****6789',
      bio: '孙丽娟高级工程师，深圳市水务规划设计院资深专家，专注于市政排水系统设计与管理。在污水处理厂设计、项目管理、城市排水系统优化等方面有丰富经验，主持完成多项重大市政排水项目，为深圳城市排水系统的现代化做出了重要贡献。',
      education: [
        '2005年 上海交通大学市政工程 硕士',
        '2001年 上海交通大学市政工程 学士'
      ],
      experience: [
        '2015年至今 深圳市水务规划设计院 高级工程师',
        '2010-2015年 深圳市水务规划设计院 工程师',
        '2005-2010年 深圳市水务规划设计院 助理工程师'
      ],
      projects: [
        {
          name: '深圳市中心城排水系统优化工程',
          year: '2018',
          role: '项目负责人',
          description: '通过优化排水系统布局，提高排水效率，减少城市内涝风险，获深圳市科技进步奖。'
        },
        {
          name: '浦东新区海绵城市建设示范项目',
          year: '2016',
          role: '技术顾问',
          description: '参与海绵城市建设规划，设计雨水收集与利用系统，提升城市防洪排涝能力。'
        }
      ],
      publications: [
        { title: '城市排水系统优化设计研究', year: '2020', journal: '城市规划' },
        { title: '海绵城市建设技术应用与实践', year: '2018', journal: '给水排水' },
        { title: '雨水管理系统的创新设计', year: '2019', journal: '中国给水排水' }
      ],
      awards: [
        '2020年 深圳市科技进步一等奖',
        '2018年 深圳市优秀工程师奖',
        '2016年 深圳市劳动模范'
      ],
      researchAreas: ['市政排水系统', '雨水管理', '海绵城市建设', '城市排水系统优化']
    },
    {
      id: 8,
      name: '周建华',
      title: '教授级高级工程师',
      organization: '中国市政工程华北设计研究总院',
      expertise: ['市政供水', '泵站设计', '建筑给排水'],
      location: '天津',
      achievements: '全国工程勘察设计大师，主持大型供水工程设计50余项，省部级科技进步奖10项',
      email: 'zhou.jh@example.com',
      phone: '132****0123',
      bio: '周建华教授级高级工程师，中国市政工程华北设计研究总院资深专家，专注于市政供水系统设计与管理。在泵站设计、建筑给排水系统优化、城市供水系统管理等方面有丰富经验，主持完成多项国家级重点工程项目，为推动我国市政供水技术进步做出了重要贡献。',
      education: [
        '1995年 清华大学环境工程系 博士',
        '1990年 同济大学给水排水工程 硕士',
        '1985年 哈尔滨工业大学给水排水工程 学士'
      ],
      experience: [
        '2010年至今 中国市政工程华北设计研究总院 总工程师',
        '2005-2010年 中国市政工程华北设计研究总院 副总工程师',
        '1995-2005年 中国市政工程华北设计研究总院 主任工程师',
        '1992-1995年 天津市建筑设计研究院 工程师'
      ],
      projects: [
        {
          name: '天津滨海新区供水系统优化工程',
          year: '2018',
          role: '项目负责人',
          description: '通过优化供水系统布局，提高供水效率，减少城市供水风险，获天津市科技进步奖。'
        },
        {
          name: '北京大兴国际机场航站楼给排水系统',
          year: '2019',
          role: '项目总负责人',
          description: '负责航站楼给排水、消防给水、雨水系统等全专业设计，采用智慧水务管理平台，实现节水率30%以上。'
        }
      ],
      publications: [
        { title: '城市供水系统优化设计研究', year: '2020', journal: '建筑学报' },
        { title: '泵站设计技术应用与实践', year: '2018', journal: '给水排水' },
        { title: '建筑给排水系统优化设计', year: '2019', journal: '中国给水排水' }
      ],
      awards: [
        '2020年 全国工程勘察设计大师',
        '2018年 国家科技进步二等奖',
        '2016年 中国建筑学会科学技术奖一等奖',
        '2015年 华夏建设科学技术奖特等奖'
      ],
      researchAreas: ['市政供水系统', '泵站设计', '建筑给排水系统优化', '城市供水系统管理']
    },
    {
      id: 9,
      name: '吴敏',
      title: '高级工程师',
      organization: '广州市自来水公司',
      expertise: ['智慧管理', '管网漏损控制', '运营管理'],
      location: '广州',
      achievements: '智慧水务平台建设负责人，管网漏损率降低专家，获省级科技进步奖3项',
      email: 'wu.m@example.com',
      phone: '131****4567',
      bio: '吴敏高级工程师，广州市自来水公司资深专家，专注于智慧水务管理与管网漏损控制。在智慧水务平台建设、管网漏损率降低、城市供水系统运营管理等方面有丰富经验，主持完成多项省级重点工程项目，为推动我国智慧水务技术进步做出了重要贡献。',
      education: [
        '2005年 上海交通大学市政工程 硕士',
        '2001年 上海交通大学市政工程 学士'
      ],
      experience: [
        '2015年至今 广州市自来水公司 高级工程师',
        '2010-2015年 广州市自来水公司 工程师',
        '2005-2010年 广州市自来水公司 助理工程师'
      ],
      projects: [
        {
          name: '广州市智慧水务平台建设项目',
          year: '2018',
          role: '项目负责人',
          description: '设计智慧水务管理平台，实现供水系统智能化管理，提升运营效率，获省级科技进步奖。'
        },
        {
          name: '广州市供水管网漏损控制项目',
          year: '2016',
          role: '技术顾问',
          description: '开发管网漏损控制技术，显著降低管网漏损率，提升供水系统稳定性。'
        }
      ],
      publications: [
        { title: '智慧水务管理技术研究', year: '2020', journal: '建筑学报' },
        { title: '管网漏损控制技术应用与实践', year: '2018', journal: '给水排水' },
        { title: '供水系统运营管理研究', year: '2019', journal: '中国给水排水' }
      ],
      awards: [
        '2020年 省级科技进步一等奖',
        '2018年 广州市优秀工程师奖',
        '2016年 广州市劳动模范'
      ],
      researchAreas: ['智慧水务管理', '管网漏损控制', '供水系统运营管理', '城市供水系统管理']
    }
  ];

  const filteredExperts = experts.filter(expert => {
    const matchesSearch = 
      expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.expertise.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesField = selectedField === '全部领域' || expert.expertise.includes(selectedField);
    
    return matchesSearch && matchesField;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Expert Detail Modal */}
      {selectedExpert && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-8 md:p-10 text-white rounded-t-2xl">
              <button
                onClick={() => setSelectedExpert(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <span className="text-4xl">{selectedExpert.name[0]}</span>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl mb-2">{selectedExpert.name}</h1>
                  <p className="text-lg text-blue-100 mb-3">{selectedExpert.title}</p>
                  <div className="flex items-center gap-2 text-blue-100">
                    <Building className="w-4 h-4" />
                    <span>{selectedExpert.organization}</span>
                  </div>
                </div>
              </div>

              {/* Expertise Tags */}
              <div className="flex flex-wrap gap-2 mt-6">
                {selectedExpert.expertise.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-10">
              {/* Bio */}
              {selectedExpert.bio && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <UsersIcon className="w-5 h-5 text-blue-600" />
                    专家简介
                  </h2>
                  <p className="text-gray-700 leading-relaxed">{selectedExpert.bio}</p>
                </div>
              )}

              {/* Contact & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="text-sm text-gray-500 mb-3">联系方式</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>{selectedExpert.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span>{selectedExpert.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{selectedExpert.location}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-3">主要成就</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedExpert.achievements}</p>
                </div>
              </div>

              {/* Education */}
              {selectedExpert.education && selectedExpert.education.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    教育背景
                  </h2>
                  <div className="space-y-3">
                    {selectedExpert.education.map((edu, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700">{edu}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {selectedExpert.experience && selectedExpert.experience.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    工作经历
                  </h2>
                  <div className="space-y-3">
                    {selectedExpert.experience.map((exp, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700">{exp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Research Areas */}
              {selectedExpert.researchAreas && selectedExpert.researchAreas.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    研究方向
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {selectedExpert.researchAreas.map((area, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg border border-blue-200"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {selectedExpert.projects && selectedExpert.projects.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    代表项目
                  </h2>
                  <div className="space-y-4">
                    {selectedExpert.projects.map((project, index) => (
                      <div key={index} className="p-5 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg text-gray-900 flex-1">{project.name}</h3>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm ml-4 flex-shrink-0">
                            {project.year}
                          </span>
                        </div>
                        <p className="text-sm text-blue-600 mb-2">{project.role}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Publications */}
              {selectedExpert.publications && selectedExpert.publications.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    代表论文
                  </h2>
                  <div className="space-y-3">
                    {selectedExpert.publications.map((pub, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-gray-900 mb-1">{pub.title}</h3>
                            <p className="text-sm text-gray-600">{pub.journal}</p>
                          </div>
                          <span className="text-sm text-gray-500 flex-shrink-0">{pub.year}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Awards */}
              {selectedExpert.awards && selectedExpert.awards.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-blue-600" />
                    荣誉奖项
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedExpert.awards.map((award, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                        <Trophy className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{award}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>发送咨询</span>
                </button>
                <button className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>电话联系</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-gray-900 mb-2">专家风采</h1>
          <p className="text-gray-600">汇聚行业顶尖专家，提供专业技术指导与咨询服务</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索专家姓名、单位或专业领域..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Field Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {fields.map((field) => (
                <button
                  key={field}
                  onClick={() => setSelectedField(field)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedField === field
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {field}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            找到 {filteredExperts.length} 位专家
          </div>
        </div>

        {/* Expert Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredExperts.map((expert) => (
            <div
              key={expert.id}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              {/* Expert Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <span className="text-xl">{expert.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg text-gray-900 mb-1">{expert.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{expert.title}</p>
                  <p className="text-sm text-gray-500">{expert.organization}</p>
                </div>
              </div>

              {/* Expertise Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {expert.expertise.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Location and Achievements */}
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{expert.location}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Award className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{expert.achievements}</span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{expert.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{expert.phone}</span>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => setSelectedExpert(expert)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>查看详情</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredExperts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-600 mb-2">未找到匹配的专家</p>
            <p className="text-sm text-gray-500">请尝试其他搜索条件</p>
          </div>
        )}
      </div>
    </div>
  );
}