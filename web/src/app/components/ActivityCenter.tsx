import { Calendar, MapPin, Users, Clock, Tag, Filter, ExternalLink, X, User, Mail, Phone, Building2, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface Activity {
  id: number;
  title: string;
  type: '年度会议' | '技术沙龙' | '分享会' | '联合展览' | '技术推广';
  date: string;
  time: string;
  location: string;
  participants: string;
  status: '报名中' | '已结束' | '即将开始';
  description: string;
  speaker?: string;
  organization: string;
  fee: string;
  registered: number;
  capacity: number;
  // Extended details
  detailedDescription?: string;
  agenda?: { time: string; title: string; speaker?: string }[];
  speakerBio?: string;
  venue?: {
    name: string;
    address: string;
    transportation: string;
  };
  contact?: {
    person: string;
    phone: string;
    email: string;
  };
  benefits?: string[];
}

export function ActivityCenter() {
  const [selectedType, setSelectedType] = useState('全部活动');
  const [selectedStatus, setSelectedStatus] = useState('全部状态');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    position: '',
    memberType: 'member',
    specialRequirements: ''
  });

  const types = ['全部活动', '年度会议', '技术沙龙', '分享会', '联合展览', '技术推广'];
  const statuses = ['全部状态', '报名中', '即将开始', '已结束'];

  const activities: Activity[] = [
    {
      id: 1,
      title: '2024年度技术交流大会',
      type: '年度会议',
      date: '2024年12月28日',
      time: '09:00 - 17:00',
      location: '北京国际会议中心',
      participants: '500+',
      status: '报名中',
      description: '年度最重要的行业盛会，汇聚行业精英，分享前沿技术，探讨发展趋势。包括主题报告、专家演讲、圆桌论坛、颁奖典礼等环节。',
      speaker: '多位行业专家',
      organization: '技术专委会',
      fee: '会员免费 / 非会员 ¥500',
      registered: 320,
      capacity: 500,
      detailedDescription: '本次大会将涵盖多个领域的前沿技术，包括但不限于人工智能、大数据、云计算等。我们邀请了来自国内外的顶尖专家进行主题演讲，分享他们的研究成果和实践经验。此外，大会还将设置多个圆桌论坛，让与会者有机会与专家进行深入交流。',
      agenda: [
        { time: '09:00 - 09:30', title: '开幕式', speaker: '大会主席' },
        { time: '09:30 - 10:30', title: '主题报告：人工智能在建筑行业的应用', speaker: '张三 教授' },
        { time: '10:30 - 10:45', title: '茶歇' },
        { time: '10:45 - 11:45', title: '专家演讲：大数据分析在建筑项目中的应用', speaker: '李四 教授' },
        { time: '11:45 - 12:45', title: '圆桌论坛：云计算技术在建筑行业的前景', speaker: '王五 教授' },
        { time: '12:45 - 13:45', title: '午餐' },
        { time: '13:45 - 14:45', title: '主题报告：绿色建筑设计理念与实践', speaker: '赵六 教授' },
        { time: '14:45 - 15:00', title: '茶歇' },
        { time: '15:00 - 16:00', title: '专家演讲：智能建筑技术的发展趋势', speaker: '孙七 教授' },
        { time: '16:00 - 17:00', title: '颁奖典礼', speaker: '大会主席' }
      ],
      speakerBio: '张三，教授，专注于人工智能在建筑行业的应用研究。李四，教授，大数据分析专家。王五，教授，云计算技术专家。赵六，教授，绿色建筑设计专家。孙七，教授，智能建筑技术专家。',
      venue: {
        name: '北京国际会议中心',
        address: '北京市朝阳区建国门外大街1号',
        transportation: '地铁1号线建国门站'
      },
      contact: {
        person: '张三',
        phone: '13800138000',
        email: 'zhangsan@example.com'
      },
      benefits: [
        '获得行业专家的最新研究成果和实践经验',
        '参与多个圆桌论坛，与专家进行深入交流',
        '获得大会资料和纪念品'
      ]
    },
    {
      id: 2,
      title: '智能建筑技术沙龙',
      type: '技术沙龙',
      date: '2025年1月15日',
      time: '14:00 - 17:00',
      location: '上海科技馆',
      participants: '80+',
      status: '报名中',
      description: '聚焦智能建筑技术发展，深度探讨物联网、AI在建筑中的应用，促进技术交流与思想碰撞。',
      speaker: '张建国 教授级高级工程师',
      organization: '技术专委会',
      fee: '会员免费 / 非会员 ¥200',
      registered: 45,
      capacity: 80,
      detailedDescription: '本次技术沙龙将深入探讨物联网和AI技术在建筑中的应用，包括智能照明、智能安防、智能环境控制等。我们邀请了张建国教授级高级工程师进行主题演讲，分享他的研究成果和实践经验。此外，沙龙还将设置多个互动环节，让与会者有机会与专家进行深入交流。',
      agenda: [
        { time: '14:00 - 14:30', title: '开幕式', speaker: '大会主席' },
        { time: '14:30 - 15:30', title: '主题报告：物联网技术在建筑中的应用', speaker: '张建国 教授级高级工程师' },
        { time: '15:30 - 15:45', title: '茶歇' },
        { time: '15:45 - 16:45', title: '专家演讲：AI技术在建筑中的应用', speaker: '张建国 教授级高级工程师' },
        { time: '16:45 - 17:00', title: '互动环节', speaker: '张建国 教授级高级工程师' }
      ],
      speakerBio: '张建国，教授级高级工程师，专注于物联网和AI技术在建筑中的应用研究。',
      venue: {
        name: '上海科技馆',
        address: '上海市浦东新区世纪大道2000号',
        transportation: '地铁2号线世纪大道站'
      },
      contact: {
        person: '张建国',
        phone: '13800138001',
        email: 'zhangguojun@example.com'
      },
      benefits: [
        '获得张建国教授级高级工程师的最新研究成果和实践经验',
        '参与互动环节，与专家进行深入交流',
        '获得沙龙资料和纪念品'
      ]
    },
    {
      id: 3,
      title: 'BIM技术应用分享会',
      type: '分享会',
      date: '2025年1月22日',
      time: '19:30 - 21:00',
      location: '线上直播',
      participants: '200+',
      status: '报名中',
      description: '分享BIM技术在实际项目中的应用经验，包括设计、施工、运维全流程BIM应用案例。',
      speaker: '王芳 高级工程师',
      organization: '技术专委会',
      fee: '免费',
      registered: 156,
      capacity: 500,
      detailedDescription: '本次分享会将详细介绍BIM技术在实际项目中的应用经验，包括设计、施工、运维全流程BIM应用案例。我们邀请了王芳高级工程师进行主题演讲，分享她的研究成果和实践经验。此外，分享会还将设置多个互动环节，让与会者有机会与专家进行深入交流。',
      agenda: [
        { time: '19:30 - 20:00', title: '开幕式', speaker: '大会主席' },
        { time: '20:00 - 20:30', title: '主题报告：BIM技术在设计阶段的应用', speaker: '王芳 高级工程师' },
        { time: '20:30 - 20:45', title: '茶歇' },
        { time: '20:45 - 21:00', title: '专家演讲：BIM技术在施工阶段的应用', speaker: '王芳 高级工程师' }
      ],
      speakerBio: '王芳，高级工程师，专注于BIM技术在实际项目中的应用研究。',
      venue: {
        name: '线上直播',
        address: 'https://example.com/live',
        transportation: '无需交通'
      },
      contact: {
        person: '王芳',
        phone: '13800138002',
        email: 'wangfang@example.com'
      },
      benefits: [
        '获得王芳高级工程师的最新研究成果和实践经验',
        '参与互动环节，与专家进行深入交流',
        '获得分享会资料和纪念品'
      ]
    },
    {
      id: 4,
      title: '建筑技术与设备展览会',
      type: '联合展览',
      date: '2025年3月10日 - 3月12日',
      time: '09:00 - 18:00',
      location: '深圳会展中心',
      participants: '10000+',
      status: '即将开始',
      description: '汇集国内外知名建筑设备厂商，展示最新技术产品，提供供需对接平台。',
      organization: '技术专委会联合主办',
      fee: '会员免费 / 非会员 ¥100',
      registered: 2450,
      capacity: 15000,
      detailedDescription: '本次展览会将汇集国内外知名建筑设备厂商，展示最新技术产品，提供供需对接平台。我们邀请了多位行业专家进行主题演讲，分享他们的研究成果和实践经验。此外，展览会还将设置多个互动环节，让与会者有机会与专家进行深入交流。',
      agenda: [
        { time: '09:00 - 09:30', title: '开幕式', speaker: '大会主席' },
        { time: '09:30 - 10:30', title: '主题报告：建筑设备技术的发展趋势', speaker: '多位行业专家' },
        { time: '10:30 - 10:45', title: '茶歇' },
        { time: '10:45 - 11:45', title: '专家演讲：建筑设备技术的应用案例', speaker: '多位行业专家' },
        { time: '11:45 - 12:45', title: '互动环节', speaker: '多位行业专家' },
        { time: '12:45 - 13:45', title: '午餐' },
        { time: '13:45 - 14:45', title: '主题报告：建筑设备技术的未来展望', speaker: '多位行业专家' },
        { time: '14:45 - 15:00', title: '茶歇' },
        { time: '15:00 - 16:00', title: '专家演讲：建筑设备技术的创新应用', speaker: '多位行业专家' },
        { time: '16:00 - 17:00', title: '互动环节', speaker: '多位行业专家' },
        { time: '17:00 - 18:00', title: '闭幕式', speaker: '大会主席' }
      ],
      speakerBio: '多位行业专家，专注于建筑设备技术的发展趋势和应用案例研究。',
      venue: {
        name: '深圳会展中心',
        address: '深圳市福田区福华三路1号',
        transportation: '地铁1号线会展中心站'
      },
      contact: {
        person: '大会主席',
        phone: '13800138003',
        email: 'chairman@example.com'
      },
      benefits: [
        '获得多位行业专家的最新研究成果和实践经验',
        '参与互动环节，与专家进行深入交流',
        '获得展览会资料和纪念品'
      ]
    },
    {
      id: 5,
      title: '装配式建筑技术推广会',
      type: '技术推广',
      date: '2025年2月20日',
      time: '14:00 - 16:30',
      location: '成都市建筑产业园',
      participants: '150+',
      status: '报名中',
      description: '推广装配式建筑技术，展示成功案例，组织专家评测，促进技术落地应用。',
      speaker: '陈晓红 研究员',
      organization: '技术专委会',
      fee: '会员免费 / 非会员 ¥300',
      registered: 78,
      capacity: 150,
      detailedDescription: '本次技术推广会将推广装配式建筑技术，展示成功案例，组织专家评测，促进技术落地应用。我们邀请了陈晓红研究员进行主题演讲，分享她的研究成果和实践经验。此外，推广会还将设置多个互动环节，让与会者有机会与专家进行深入交流。',
      agenda: [
        { time: '14:00 - 14:30', title: '开幕式', speaker: '大会主席' },
        { time: '14:30 - 15:30', title: '主题报告：装配式建筑技术的发展趋势', speaker: '陈晓红 研究员' },
        { time: '15:30 - 15:45', title: '茶歇' },
        { time: '15:45 - 16:30', title: '专家演讲：装配式建筑技术的应用案例', speaker: '陈晓红 研究员' }
      ],
      speakerBio: '陈晓红，研究员，专注于装配式建筑技术的发展趋势和应用案例研究。',
      venue: {
        name: '成都市建筑产业园',
        address: '成都市高新区天府大道中段1000号',
        transportation: '地铁1号线世纪城站'
      },
      contact: {
        person: '陈晓红',
        phone: '13800138004',
        email: 'chenxiaohong@example.com'
      },
      benefits: [
        '获得陈晓红研究员的最新研究成果和实践经验',
        '参与互动环节，与专家进行深入交流',
        '获得推广会资料和纪念品'
      ]
    },
    {
      id: 6,
      title: '绿色建筑设计研讨会',
      type: '技术沙龙',
      date: '2024年12月15日',
      time: '14:00 - 17:00',
      location: '广州设计中心',
      participants: '60+',
      status: '已结束',
      description: '探讨绿色建筑设计理念与技术，分享节能减排实践经验。',
      speaker: '李明华 教授',
      organization: '技术专委会',
      fee: '会员免费 / 非会员 ¥200',
      registered: 60,
      capacity: 60,
      detailedDescription: '本次研讨会将探讨绿色建筑设计理念与技术，分享节能减排实践经验。我们邀请了李明华教授进行主题演讲，分享他的研究成果和实践经验。此外，研讨会还将设置多个互动环节，让与会者有机会与专家进行深入交流。',
      agenda: [
        { time: '14:00 - 14:30', title: '开幕式', speaker: '大会主席' },
        { time: '14:30 - 15:30', title: '主题报告：绿色建筑设计理念与技术', speaker: '李明华 教授' },
        { time: '15:30 - 15:45', title: '茶歇' },
        { time: '15:45 - 16:45', title: '专家演讲：节能减排实践经验分享', speaker: '李明华 教授' },
        { time: '16:45 - 17:00', title: '互动环节', speaker: '李明华 教授' }
      ],
      speakerBio: '李明华，教授，专注于绿色建筑设计理念与技术研究。',
      venue: {
        name: '广州设计中心',
        address: '广州市天河区天河路1000号',
        transportation: '地铁3号线天河公园站'
      },
      contact: {
        person: '李明华',
        phone: '13800138005',
        email: 'liminghua@example.com'
      },
      benefits: [
        '获得李明华教授的最新研究成果和实践经验',
        '参与互动环节，与专家进行深入交流',
        '获得研讨会资料和纪念品'
      ]
    },
    {
      id: 7,
      title: '项目管理经验分享',
      type: '分享会',
      date: '2024年12月8日',
      time: '19:30 - 21:00',
      location: '线上直播',
      participants: '300+',
      status: '已结束',
      description: '分享大型项目管理经验，讨论项目管理中的难点与解决方案。',
      speaker: '刘宇 教授级高级工程师',
      organization: '技术专委会',
      fee: '免费',
      registered: 285,
      capacity: 500,
      detailedDescription: '本次分享会将分享大型项目管理经验，讨论项目管理中的难点与解决方案。我们邀请了刘宇教授级高级工程师进行主题演讲，分享他的研究成果和实践经验。此外，分享会还将设置多个互动环节，让与会者有机会与专家进行深入交流。',
      agenda: [
        { time: '19:30 - 20:00', title: '开幕式', speaker: '大会主席' },
        { time: '20:00 - 20:30', title: '主题报告：大型项目管理经验分享', speaker: '刘宇 教授级高级工程师' },
        { time: '20:30 - 20:45', title: '茶歇' },
        { time: '20:45 - 21:00', title: '专家演讲：项目管理中的难点与解决方案', speaker: '刘宇 教授级高级工程师' }
      ],
      speakerBio: '刘宇，教授级高级工程师，专注于大型项目管理经验分享。',
      venue: {
        name: '线上直播',
        address: 'https://example.com/live',
        transportation: '无需交通'
      },
      contact: {
        person: '刘宇',
        phone: '13800138006',
        email: 'liuyu@example.com'
      },
      benefits: [
        '获得刘宇教授级高级工程师的最新研究成果和实践经验',
        '参与互动环节，与专家进行深入交流',
        '获得分享会资料和纪念品'
      ]
    },
    {
      id: 8,
      title: '智能化系统集成技术论坛',
      type: '技术沙龙',
      date: '2025年2月28日',
      time: '14:00 - 17:30',
      location: '杭州国际会展中心',
      participants: '100+',
      status: '即将开始',
      description: '聚焦建筑智能化系统集成技术，探讨系统架构、协议标准、安全管理等议题。',
      speaker: '赵强 教授',
      organization: '技术专委会',
      fee: '会员免费 / 非会员 ¥250',
      registered: 52,
      capacity: 100,
      detailedDescription: '本次技术沙龙将聚焦建筑智能化系统集成技术，探讨系统架构、协议标准、安全管理等议题。我们邀请了赵强教授进行主题演讲，分享他的研究成果和实践经验。此外，沙龙还将设置多个互动环节，让与会者有机会与专家进行深入交流。',
      agenda: [
        { time: '14:00 - 14:30', title: '开幕式', speaker: '大会主席' },
        { time: '14:30 - 15:30', title: '主题报告：建筑智能化系统集成技术', speaker: '赵强 教授' },
        { time: '15:30 - 15:45', title: '茶歇' },
        { time: '15:45 - 16:45', title: '专家演讲：系统架构与协议标准', speaker: '赵强 教授' },
        { time: '16:45 - 17:30', title: '互动环节', speaker: '赵强 教授' }
      ],
      speakerBio: '赵强，教授，专注于建筑智能化系统集成技术研究。',
      venue: {
        name: '杭州国际会展中心',
        address: '杭州市滨江区滨安路1000号',
        transportation: '地铁1号线滨江区站'
      },
      contact: {
        person: '赵强',
        phone: '13800138007',
        email: 'zhaoqiang@example.com'
      },
      benefits: [
        '获得赵强教授的最新研究成果和实践经验',
        '参与互动环节，与专家进行深入交流',
        '获得沙龙资料和纪念品'
      ]
    }
  ];

  const filteredActivities = activities.filter(activity => {
    const matchesType = selectedType === '全部活动' || activity.type === selectedType;
    const matchesStatus = selectedStatus === '全部状态' || activity.status === selectedStatus;
    return matchesType && matchesStatus;
  });

  const getStatusColor = (status: Activity['status']) => {
    switch (status) {
      case '报名中':
        return 'bg-green-50 text-green-600 border-green-200';
      case '即将开始':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case '已结束':
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getTypeColor = (type: Activity['type']) => {
    switch (type) {
      case '年度会议':
        return 'bg-purple-50 text-purple-600';
      case '技术沙龙':
        return 'bg-blue-50 text-blue-600';
      case '分享会':
        return 'bg-green-50 text-green-600';
      case '联合展览':
        return 'bg-orange-50 text-orange-600';
      case '技术推广':
        return 'bg-pink-50 text-pink-600';
    }
  };

  const handleRegistration = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowRegistrationForm(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to a server
    console.log('Form submitted:', formData);
    setRegistrationSuccess(true);
  };

  const closeRegistrationForm = () => {
    setShowRegistrationForm(false);
    setRegistrationSuccess(false);
    setFormData({
      name: '',
      phone: '',
      email: '',
      company: '',
      position: '',
      memberType: 'member',
      specialRequirements: ''
    });
  };

  const openDetailModal = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedActivity(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-gray-900 mb-2">活动中心</h1>
          <p className="text-gray-600">参与丰富多彩的行业活动，拓展人脉，提升专业能力</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">筛选活动</span>
          </div>

          <div className="space-y-4">
            {/* Type Filter */}
            <div>
              <div className="text-sm text-gray-600 mb-2">活动类型</div>
              <div className="flex flex-wrap gap-2">
                {types.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <div className="text-sm text-gray-600 mb-2">活动状态</div>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedStatus === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
            找到 {filteredActivities.length} 个活动
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-6">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="md:flex">
                {/* Left Section - Date Badge */}
                <div className="md:w-32 bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 flex flex-col items-center justify-center">
                  <Calendar className="w-8 h-8 mb-2" />
                  <div className="text-center">
                    <div className="text-2xl">{activity.date.split('月')[1].split('日')[0]}</div>
                    <div className="text-sm opacity-90">{activity.date.split('年')[1].split('月')[0]}月</div>
                  </div>
                </div>

                {/* Right Section - Content */}
                <div className="flex-1 p-6">
                  {/* Header */}
                  <div className="flex flex-wrap items-start gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${getTypeColor(activity.type)}`}>
                      {activity.type}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                    {activity.status === '报名中' && (
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-sm">
                        {activity.registered}/{activity.capacity} 已报名
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl text-gray-900 mb-3">{activity.title}</h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {activity.description}
                  </p>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{activity.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{activity.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{activity.participants} 预计参与</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Tag className="w-4 h-4" />
                      <span>{activity.fee}</span>
                    </div>
                  </div>

                  {/* Speaker */}
                  {activity.speaker && (
                    <div className="text-sm text-gray-600 mb-4">
                      <span className="text-gray-700">演讲嘉宾：</span>{activity.speaker}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {activity.status === '报名中' && (
                      <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2" onClick={() => handleRegistration(activity)}>
                        <span>立即报名</span>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                    <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => openDetailModal(activity)}>
                      查看详情
                    </button>
                    {activity.status === '已结束' && (
                      <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        查看回顾
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-600 mb-2">暂无符合条件的活动</p>
            <p className="text-sm text-gray-500">请尝试其他筛选条件</p>
          </div>
        )}

        {/* Registration Form */}
        {showRegistrationForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl text-gray-900">报名活动</h2>
                <button className="text-gray-500 hover:text-gray-700" onClick={closeRegistrationForm}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {registrationSuccess ? (
                <div className="text-center">
                  <CheckCircle className="w-10 h-10 mx-auto text-green-500 mb-4" />
                  <p className="text-gray-900 mb-2">报名成功！</p>
                  <p className="text-gray-600">感谢您的报名，我们将尽快与您联系。</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">姓名</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">电话</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">邮箱</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">公司</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleFormChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">职位</label>
                      <input
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleFormChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">会员类型</label>
                      <select
                        name="memberType"
                        value={formData.memberType}
                        onChange={handleFormChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="member">会员</option>
                        <option value="non-member">非会员</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">特殊要求</label>
                      <textarea
                        name="specialRequirements"
                        value={formData.specialRequirements}
                        onChange={handleFormChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      提交报名
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedActivity && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8">
              {/* Modal Header */}
              <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-8 md:p-10 text-white rounded-t-2xl">
                <button
                  onClick={closeDetailModal}
                  className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="flex items-start gap-3 mb-4">
                  <span className={`px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm`}>
                    {selectedActivity.type}
                  </span>
                  <span className={`px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm`}>
                    {selectedActivity.status}
                  </span>
                  {selectedActivity.status === '报名中' && (
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                      {selectedActivity.registered}/{selectedActivity.capacity} 已报名
                    </span>
                  )}
                </div>

                <h1 className="text-2xl md:text-4xl mb-4 leading-tight">
                  {selectedActivity.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedActivity.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{selectedActivity.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedActivity.location}</span>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 md:p-10 max-h-[70vh] overflow-y-auto">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-xl">
                  <div>
                    <h3 className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      预计参与
                    </h3>
                    <p className="text-gray-900">{selectedActivity.participants}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      参会费用
                    </h3>
                    <p className="text-gray-900">{selectedActivity.fee}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      主办单位
                    </h3>
                    <p className="text-gray-900">{selectedActivity.organization}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    活动简介
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">{selectedActivity.description}</p>
                  {selectedActivity.detailedDescription && (
                    <p className="text-gray-700 leading-relaxed">{selectedActivity.detailedDescription}</p>
                  )}
                </div>

                {/* Speaker */}
                {selectedActivity.speaker && selectedActivity.speakerBio && (
                  <div className="mb-8">
                    <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      演讲嘉宾
                    </h2>
                    <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <h3 className="text-lg text-gray-900 mb-2">{selectedActivity.speaker}</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{selectedActivity.speakerBio}</p>
                    </div>
                  </div>
                )}

                {/* Agenda */}
                {selectedActivity.agenda && selectedActivity.agenda.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      活动议程
                    </h2>
                    <div className="space-y-3">
                      {selectedActivity.agenda.map((item, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all">
                          <div className="flex-shrink-0 w-24 text-sm text-blue-600">{item.time}</div>
                          <div className="flex-1">
                            <h4 className="text-gray-900 mb-1">{item.title}</h4>
                            {item.speaker && (
                              <p className="text-sm text-gray-600">{item.speaker}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {selectedActivity.benefits && selectedActivity.benefits.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      参会收益
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedActivity.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Venue */}
                {selectedActivity.venue && (
                  <div className="mb-8">
                    <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      活动地点
                    </h2>
                    <div className="p-5 bg-gray-50 rounded-xl space-y-2">
                      <div className="flex items-start gap-2">
                        <Building2 className="w-4 h-4 text-gray-600 mt-1" />
                        <div>
                          <p className="text-gray-900">{selectedActivity.venue.name}</p>
                          <p className="text-sm text-gray-600">{selectedActivity.venue.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>交通指引：{selectedActivity.venue.transportation}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact */}
                {selectedActivity.contact && (
                  <div className="mb-8">
                    <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-blue-600" />
                      联系方式
                    </h2>
                    <div className="p-5 bg-gray-50 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="w-4 h-4 text-gray-600" />
                        <span>联系人：{selectedActivity.contact.person}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-gray-600" />
                        <span>电话：{selectedActivity.contact.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <span>邮箱：{selectedActivity.contact.email}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {selectedActivity.status === '报名中' && (
                  <div className="flex gap-3">
                    <button 
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      onClick={() => {
                        closeDetailModal();
                        handleRegistration(selectedActivity);
                      }}
                    >
                      <span>立即报名</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}