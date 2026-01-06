import { Search, Filter, UserPlus, MoreVertical, CheckCircle, XCircle, Clock, Edit, Trash2, Eye, X, User, Mail, Phone, Briefcase, Award, MapPin, FileText, Building } from 'lucide-react';
import { useState } from 'react';
import { Pagination } from './Pagination';

interface Expert {
  id: number;
  name: string;
  photo?: string;
  title: string;
  organization: string;
  expertise: string[];
  education: string;
  phone: string;
  email: string;
  province: string;
  city: string;
  bio: string;
  achievements: string;
  projects: string;
  publishDate: string;
  status: '已发布' | '草稿' | '待审核';
  views: number;
}

export function ExpertManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [experts, setExperts] = useState<Expert[]>([
    {
      id: 1,
      name: '张建国',
      photo: '',
      title: '教授级高级工程师',
      organization: '中国建筑科学研究院',
      expertise: ['建筑给排水', '绿色建筑', '二次供水'],
      education: '博士',
      phone: '138****1234',
      email: 'zhang.jg@example.com',
      province: '北京市',
      city: '朝阳区',
      bio: '长期从事建筑给排水设计与研究工作，主持完成多项国家重点工程项目。',
      achievements: '获得国家科技进步奖二等奖2项，发表学术论文50余篇。',
      projects: '北京大兴国际机场、上海中心大厦等重大项目',
      publishDate: '2024-01-15',
      status: '已发布',
      views: 1520,
    },
    {
      id: 2,
      name: '李明华',
      photo: '',
      title: '高级工程师',
      organization: '广州市设计院',
      expertise: ['市政给排水', '海绵城市', '智慧水务'],
      education: '硕士',
      phone: '139****5678',
      email: 'li.mh@example.com',
      province: '广东省',
      city: '广州市',
      bio: '专注市政给排水及海绵城市技术研究与应用。',
      achievements: '主持完成省级重点项目10余项。',
      projects: '广州海绵城市示范区、深圳前海新区市政工程',
      publishDate: '2024-02-20',
      status: '已发布',
      views: 890,
    },
    {
      id: 3,
      name: '王芳',
      photo: '',
      title: '副教授',
      organization: '华南理工大学',
      expertise: ['水处理技术', '环境工程'],
      education: '博士',
      phone: '136****9012',
      email: 'wang.f@example.com',
      province: '广东省',
      city: '广州市',
      bio: '从事水处理技术研究与教学工作。',
      achievements: '发表SCI论文30余篇。',
      projects: '污水处理厂提标改造、工业废水处理',
      publishDate: '',
      status: '草稿',
      views: 0,
    },
  ]);

  const [formData, setFormData] = useState<Partial<Expert>>({
    status: '草稿',
    expertise: [],
  });

  const filteredExperts = experts.filter(expert => {
    const matchesSearch = 
      expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === '全部' || expert.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredExperts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExperts = filteredExperts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: Expert['status']) => {
    switch (status) {
      case '已发布':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            已发布
          </span>
        );
      case '草稿':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">
            <FileText className="w-3 h-3" />
            草稿
          </span>
        );
      case '待审核':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            待审核
          </span>
        );
    }
  };

  const handleAdd = () => {
    setFormData({
      status: '草稿',
      expertise: [],
      views: 0,
    });
    setShowAddModal(true);
  };

  const handleView = (expert: Expert) => {
    setSelectedExpert(expert);
    setShowViewModal(true);
  };

  const handleEdit = (expert: Expert) => {
    setSelectedExpert(expert);
    setFormData(expert);
    setShowEditModal(true);
  };

  const handleDelete = (expert: Expert) => {
    setSelectedExpert(expert);
    setShowDeleteModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExpertiseChange = (value: string) => {
    const expertiseArray = value.split(',').map(e => e.trim()).filter(e => e);
    setFormData(prev => ({
      ...prev,
      expertise: expertiseArray
    }));
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newExpert: Expert = {
      ...formData as Expert,
      id: Math.max(...experts.map(e => e.id)) + 1,
      publishDate: formData.status === '已发布' ? new Date().toISOString().split('T')[0] : '',
      views: 0,
    };
    setExperts([...experts, newExpert]);
    setShowAddModal(false);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedExpert) {
      setExperts(experts.map(e => 
        e.id === selectedExpert.id ? { 
          ...formData as Expert, 
          id: selectedExpert.id,
          views: selectedExpert.views,
          publishDate: formData.status === '已发布' && !selectedExpert.publishDate 
            ? new Date().toISOString().split('T')[0] 
            : selectedExpert.publishDate
        } : e
      ));
      setShowEditModal(false);
      setSelectedExpert(null);
    }
  };

  const confirmDelete = () => {
    if (selectedExpert) {
      setExperts(experts.filter(e => e.id !== selectedExpert.id));
      setShowDeleteModal(false);
      setSelectedExpert(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl text-gray-900 mb-2">专家管理</h2>
        <p className="text-gray-600">管理专家信息与展示</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索专家姓名或单位..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap" 
            onClick={handleAdd}
          >
            <UserPlus className="w-5 h-5" />
            <span>添加专家</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">筛选:</span>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option>全部</option>
            <option>已发布</option>
            <option>草稿</option>
            <option>待审核</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          共 {filteredExperts.length} 位专家
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  专家信息
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  专业领域
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  发布时间
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  浏览量
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedExperts.map((expert) => (
                <tr key={expert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-gray-900">{expert.name}</div>
                      <div className="text-xs text-gray-500">{expert.title}</div>
                      <div className="text-xs text-gray-500">{expert.organization}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {expert.expertise.slice(0, 2).map((exp, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                          {exp}
                        </span>
                      ))}
                      {expert.expertise.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{expert.expertise.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {expert.publishDate || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{expert.views}</div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(expert.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button 
                        className="p-1 text-gray-400 hover:text-gray-600" 
                        onClick={() => setOpenDropdown(openDropdown === expert.id ? null : expert.id)}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {openDropdown === expert.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => {
                              handleView(expert);
                              setOpenDropdown(null);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            查看
                          </button>
                          <button
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => {
                              handleEdit(expert);
                              setOpenDropdown(null);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                            编辑
                          </button>
                          <button
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            onClick={() => {
                              handleDelete(expert);
                              setOpenDropdown(null);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                            删除
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={filteredExperts.length}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <ExpertModal
          title="添加专家"
          formData={formData}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleSubmitAdd}
          onFormChange={handleFormChange}
          onExpertiseChange={handleExpertiseChange}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedExpert && (
        <ExpertModal
          title="编辑专家"
          formData={formData}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleSubmitEdit}
          onFormChange={handleFormChange}
          onExpertiseChange={handleExpertiseChange}
        />
      )}

      {/* View Modal */}
      {showViewModal && selectedExpert && (
        <ViewExpertModal
          expert={selectedExpert}
          onClose={() => setShowViewModal(false)}
          onEdit={() => {
            setShowViewModal(false);
            handleEdit(selectedExpert);
          }}
          getStatusBadge={getStatusBadge}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedExpert && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl text-gray-900 mb-4">删除专家</h3>
            <p className="text-sm text-gray-600 mb-4">确定要删除专家 <strong>{selectedExpert.name}</strong> 吗？</p>
            <div className="flex justify-end gap-2">
              <button 
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors" 
                onClick={() => setShowDeleteModal(false)}
              >
                取消
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors" 
                onClick={confirmDelete}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Expert Modal Component
function ExpertModal({ title, formData, onClose, onSubmit, onFormChange, onExpertiseChange }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="relative p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl mb-1">{title}</h2>
              <p className="text-sm text-blue-100">填写专家信息</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                基本信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">姓名 *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入专家姓名"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">职称 *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="如：教授级高级工程师"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">所在单位 *</label>
                  <input
                    type="text"
                    name="organization"
                    required
                    value={formData.organization || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入所在单位"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">学历 *</label>
                  <select
                    name="education"
                    required
                    value={formData.education || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请选择</option>
                    <option value="本科">本科</option>
                    <option value="硕士">硕士</option>
                    <option value="博士">博士</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">手机号码 *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone || ''}
                      onChange={onFormChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入手机号码"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">邮箱地址 *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email || ''}
                      onChange={onFormChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入邮箱地址"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">省份 *</label>
                  <input
                    type="text"
                    name="province"
                    required
                    value={formData.province || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入省份"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">城市 *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入城市"
                  />
                </div>
              </div>
            </div>

            {/* Expertise & Details */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                专业领域与详情
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">专业领域 *</label>
                  <input
                    type="text"
                    name="expertise"
                    required
                    value={formData.expertise?.join(', ') || ''}
                    onChange={(e) => onExpertiseChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入专业领域，多个用逗号分隔"
                  />
                  <p className="text-xs text-gray-500 mt-1">例如：建筑给排水, 绿色建筑, 二次供水</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">个人简介 *</label>
                  <textarea
                    name="bio"
                    required
                    rows={3}
                    value={formData.bio || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入个人简介"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">主要成就</label>
                  <textarea
                    name="achievements"
                    rows={3}
                    value={formData.achievements || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入主要成就"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">代表项目</label>
                  <textarea
                    name="projects"
                    rows={3}
                    value={formData.projects || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入代表项目"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                发布状态
              </h3>
              <div>
                <label className="block text-sm text-gray-700 mb-2">状态 *</label>
                <select
                  name="status"
                  required
                  value={formData.status}
                  onChange={onFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="草稿">草稿</option>
                  <option value="待审核">待审核</option>
                  <option value="已发布">已发布</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// View Expert Modal Component
function ViewExpertModal({ expert, onClose, onEdit, getStatusBadge }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="relative p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Eye className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl mb-1">专家详情</h2>
              <p className="text-sm text-blue-100">查看专家完整信息</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              基本信息
            </h3>
            <div className="bg-gray-50 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">姓名</div>
                <div className="text-sm text-gray-900">{expert.name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">职称</div>
                <div className="text-sm text-gray-900">{expert.title}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500 mb-1">所在单位</div>
                <div className="text-sm text-gray-900">{expert.organization}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">学历</div>
                <div className="text-sm text-gray-900">{expert.education}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  手机号码
                </div>
                <div className="text-sm text-gray-900">{expert.phone}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  邮箱地址
                </div>
                <div className="text-sm text-gray-900">{expert.email}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  所在地区
                </div>
                <div className="text-sm text-gray-900">{expert.province} {expert.city}</div>
              </div>
            </div>
          </div>

          {/* Expertise */}
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              专业领域
            </h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex flex-wrap gap-2">
                {expert.expertise.map((exp: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                    {exp}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              详细信息
            </h3>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">个人简介</div>
                <div className="text-sm text-gray-700 leading-relaxed">{expert.bio}</div>
              </div>
              {expert.achievements && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">主要成就</div>
                  <div className="text-sm text-gray-700 leading-relaxed">{expert.achievements}</div>
                </div>
              )}
              {expert.projects && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">代表项目</div>
                  <div className="text-sm text-gray-700 leading-relaxed">{expert.projects}</div>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-4">发布状态</h3>
            <div className="bg-gray-50 rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">当前状态</div>
                <div className="mt-1">{getStatusBadge(expert.status)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">发布时间</div>
                <div className="text-sm text-gray-900">{expert.publishDate || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">浏览量</div>
                <div className="text-sm text-gray-900">{expert.views}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={onEdit}
              className="flex-1 px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              编辑专家
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
