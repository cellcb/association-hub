import { Search, Package, Tag, Building2, Phone, Mail, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface Product {
  id: number;
  name: string;
  category: string;
  manufacturer: string;
  description: string;
  features: string[];
  application: string;
  certifications: string[];
  contact: {
    phone: string;
    email: string;
  };
}

export function ProductCatalog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部分类');

  const categories = [
    '全部分类',
    '水泵设备',
    '阀门管件',
    '管道系统',
    '水处理设备',
    '二次供水',
    '智能控制',
    '检测仪器'
  ];

  const products: Product[] = [
    {
      id: 1,
      name: '立式多级离心泵 CDL系列',
      category: '水泵设备',
      manufacturer: '某某泵业股份有限公司',
      description: '高效节能立式多级离心泵，适用于建筑二次供水、消防供水、工业循环用水等场合。采用不锈钢材质，运行稳定可靠。',
      features: [
        '304/316不锈钢材质',
        '高效节能，能效等级2级',
        '低噪音设计≤65dB',
        '变频控制，恒压供水',
        '维护简便，寿命长',
      ],
      application: '适用于高���建筑供水、消防系统、工业用水等',
      certifications: ['中国节能产品认证', '3C消防认证', 'ISO9001质量管理体系'],
      contact: {
        phone: '400-123-4567',
        email: 'pump@example.com',
      },
    },
    {
      id: 2,
      name: '智能电动调节阀 ZDL系列',
      category: '阀门管件',
      manufacturer: '某某阀门集团有限公司',
      description: '带4-20mA信号反馈的电动调节阀，精确控制流量，广泛应用于暖通空调、水处理等系统的自动化控制。',
      features: [
        '精密流量调节',
        '电动执行机构',
        '4-20mA信号反馈',
        '防腐防锈材质',
        '开关型/调节型可选',
      ],
      application: '适用于空调水系统、供热系统、工业水处理',
      certifications: ['阀门生产许可证', '压力管道元件制造许可证'],
      contact: {
        phone: '400-234-5678',
        email: 'valve@example.com',
      },
    },
    {
      id: 3,
      name: '不锈钢卡压式管件系统',
      category: '管道系统',
      manufacturer: '某某管业科技有限公司',
      description: '304不锈钢卡压式连接系统，安装快速，密封可靠，广泛应用于建筑冷热水、直饮水等管道系统。',
      features: [
        '304/316L不锈钢材质',
        '卡压式快速连接',
        '双重O型圈密封',
        '耐腐蚀、无结垢',
        '使用寿命50年以上',
      ],
      application: '适用于建筑给水、直饮水、热水循环系统',
      certifications: ['涉水产品卫生许可批件', '绿色建材认证'],
      contact: {
        phone: '400-345-6789',
        email: 'pipe@example.com',
      },
    },
    {
      id: 4,
      name: '一体化污水提升设备',
      category: '水处理设备',
      manufacturer: '某某环保设备有限公司',
      description: '地下室污水提升专用设备，集水箱、泵、控制系统于一体，智能化控制，广泛应用于地下商场、地铁站等场所。',
      features: [
        '全自动智能控制',
        '防臭防溢流设计',
        '双泵互为备用',
        '耐腐蚀玻璃钢水箱',
        '故障自动报警',
      ],
      application: '适用于地下室、商场、地铁站污水排放',
      certifications: ['环保产品认证', '污水处理设备制造许可'],
      contact: {
        phone: '400-456-7890',
        email: 'wastewater@example.com',
      },
    },
    {
      id: 5,
      name: '无负压供水设备 WFY系列',
      category: '二次供水',
      manufacturer: '某某给排水设备股份公司',
      description: '无负压叠压供水设备，直接串接市政管网，充分利用市政压力，节能高效，避免二次污染。',
      features: [
        '无负压技术，充分利用市政压力',
        '变频恒压供水',
        '不锈钢稳流罐',
        '节能30%以上',
        '水质无二次污染',
      ],
      application: '适用于高层住宅、写字楼、酒店二次供水',
      certifications: ['涉水产品卫生许可', '中国节能产品认证'],
      contact: {
        phone: '400-567-8901',
        email: 'supply@example.com',
      },
    },
    {
      id: 6,
      name: '雨水收集回用系统',
      category: '水处理设备',
      manufacturer: '某某生态科技有限公司',
      description: '模块化雨水收集、处理、储存、回用一体化系统，支持海绵城市建设，节约水资源，减少径流污染。',
      features: [
        'PP模块化储水池',
        '多级过滤净化',
        '智能控制系统',
        '远程监控管理',
        '节约水资源40%以上',
      ],
      application: '适用于绿色建筑、园区、市政道路、公园广场',
      certifications: ['环保产品认证', '水资源节约产品', '海绵城市建设推荐产品'],
      contact: {
        phone: '400-678-9012',
        email: 'rainwater@example.com',
      },
    },
    {
      id: 7,
      name: '智慧水务监控平台',
      category: '智能控制',
      manufacturer: '某某智慧水务科技公司',
      description: '基于物联网和大数据的智慧水务综合管理平台，实现供水管网、泵站、水质的实时监测和智能调度。',
      features: [
        '实时数据采集监控',
        '管网漏损分析',
        '水质在线监测',
        '智能调度优化',
        '移动端APP管理',
      ],
      application: '适用于市政供水、二次供水、园区水务管理',
      certifications: ['软件产品登记证书', '信息系统集成资质', '高新技术企业'],
      contact: {
        phone: '400-789-0123',
        email: 'smart@example.com',
      },
    },
    {
      id: 8,
      name: '超声波流量计 TDS系列',
      category: '检测仪器',
      manufacturer: '某某仪表科技有限公司',
      description: '外夹式超声波流量计，非接触式测量，安装简便，精度高，适用于各种管道流量监测。',
      features: [
        '非接触式测量',
        '精度等级1.0级',
        '4-20mA/脉冲输出',
        'IP68防护等级',
        '数据远程传输',
      ],
      application: '适用于市政给排水、工业水计量、能耗监测',
      certifications: ['计量器具型式批准证书', '防爆合格证'],
      contact: {
        phone: '400-890-1234',
        email: 'meter@example.com',
      },
    },
    {
      id: 9,
      name: '排水通气阀 HPVB系列',
      category: '阀门管件',
      manufacturer: '某某建材科技股份公司',
      description: '正压防溢、负压吸气的智能排水通气阀，解决高层建筑排水系统通气问题，节省空间。',
      features: [
        '双向通气功能',
        '防臭防虫设计',
        '节省专用通气管',
        '安装维护简便',
        '适配多种管径',
      ],
      application: '适用于高层建筑排水系统、卫生间排水',
      certifications: ['建筑排水用通气阀检测报告', '绿色建材认证'],
      contact: {
        phone: '400-901-2345',
        email: 'vent@example.com',
      },
    },
    {
      id: 10,
      name: 'HDPE双壁波纹管',
      category: '管道系统',
      manufacturer: '某某塑业集团有限公司',
      description: '高密度聚乙烯双壁波纹管，耐腐蚀、重量轻、安装方便，广泛应用于市政排水、雨水管网。',
      features: [
        'HDPE环保材料',
        '耐腐蚀、耐老化',
        '环刚度SN8/SN10',
        '连接密封可靠',
        '使用寿命50年',
      ],
      application: '适用于市政排水、雨水管网、农田排灌',
      certifications: ['化学建材产品质量检测', '环保产品认证'],
      contact: {
        phone: '400-012-3456',
        email: 'hdpe@example.com',
      },
    },
    {
      id: 11,
      name: '潜水排污泵 WQ系列',
      category: '水泵设备',
      manufacturer: '某某水泵制造有限公司',
      description: '撕裂式叶轮设计，能有效通过固体颗粒和长纤维，适用于污水处理、市政排水等场合。',
      features: [
        '撕裂式叶轮设计',
        '通过直径≥50mm固体',
        '干式电机保护',
        '自动耦合安装',
        '免维护密封',
      ],
      application: '适用于污水处理厂、泵站、工业废水排放',
      certifications: ['水泵生产许可证', 'CE认证'],
      contact: {
        phone: '400-123-7890',
        email: 'sewage@example.com',
      },
    },
    {
      id: 12,
      name: '超滤膜净水设备',
      category: '水处理设备',
      manufacturer: '某某水处理技术公司',
      description: '采用超滤膜技术的集成式净水设备，有效去除细菌、病毒、胶体等，保障饮用水安全。',
      features: [
        'UF超滤膜技术',
        '过滤精度0.01微米',
        '自动反冲洗',
        '模块化设计',
        '出水水质优于国标',
      ],
      application: '适用于直饮水工程、学校、医院、企事业单位',
      certifications: ['涉水产品卫生许可', '水处理设备认证'],
      contact: {
        phone: '400-234-8901',
        email: 'purify@example.com',
      },
    },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '全部分类' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-gray-900 mb-2">产品展示</h1>
          <p className="text-gray-600">最新技术产品与解决方案，促进供需对接</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索产品名称、厂商或关键词..."
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
            找到 {filteredProducts.length} 个产品
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
            >
              {/* Product Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <Package className="w-16 h-16 text-indigo-400" />
              </div>

              <div className="p-6">
                {/* Category Badge */}
                <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm mb-3">
                  {product.category}
                </div>

                {/* Product Name */}
                <h3 className="text-lg text-gray-900 mb-2">{product.name}</h3>

                {/* Manufacturer */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Building2 className="w-4 h-4" />
                  <span>{product.manufacturer}</span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Features */}
                <div className="mb-4">
                  <div className="text-sm text-gray-700 mb-2">产品特点</div>
                  <div className="space-y-1">
                    {product.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Application */}
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <div className="text-sm text-gray-700 mb-1">应用范围</div>
                  <div className="text-sm text-gray-600">{product.application}</div>
                </div>

                {/* Certifications */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                    <Tag className="w-4 h-4" />
                    <span>认证资质</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.certifications.map((cert, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{product.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{product.contact.email}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <span>咨询详情</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    收藏
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-600 mb-2">未找到匹配的产品</p>
            <p className="text-sm text-gray-500">请尝试其他搜索条件</p>
          </div>
        )}
      </div>
    </div>
  );
}