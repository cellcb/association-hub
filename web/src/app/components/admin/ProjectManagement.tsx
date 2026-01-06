import { Search, Filter, Plus, MoreVertical, CheckCircle, XCircle, Clock, Edit, Trash2, Eye, X, Building2, MapPin, Calendar, Award, FileText, User } from 'lucide-react';
import { useState } from 'react';
import { Pagination } from './Pagination';

interface Project {
  id: number;
  title: string;
  coverImage?: string;
  category: string;
  location: string;
  projectDate: string;
  client: string;
  designer: string;
  area: string;
  description: string;
  features: string[];
  technologies: string;
  achievements: string;
  publishDate: string;
  status: '已发布' | '草稿' | '待审核';
  views: number;
}

export function ProjectManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      title: '北京大兴国际机场航站楼项目',
      coverImage: '',
      category: '公共建筑',
      location: '北京市大兴区',
      projectDate: '2019-09-25',
      client: '首都机场集团',
      designer: '中国建筑设计研究院',
      area: '80万平方米',
      description: '北京大兴国际机场是国家重大标志性工程，采用世界首创的双层出发车道边设计，给排水系统采用先进的智能化管理技术。',
      features: ['智能化给排水系统', '雨水收集利用', '中水回用系统', '绿色节能设计'],
      technologies: '采用BIM技术进行全生命周期管理，给排水系统实现智能监控和自动调节。',
      achievements: '获得国家优质工程金质奖、鲁班奖等多项荣誉。',
      publishDate: '2024-01-15',
      status: '已发布',
      views: 15230,
    },
    {
      id: 2,
      title: '上海中心大厦绿色建筑案例',
      coverImage: '',
      category: '超高层建筑',
      location: '上海市浦东新区',
      projectDate: '2015-03-12',
      client: '上海中心大厦建设发展有限公司',
      designer: '同济大学建筑设计研究院',
      area: '57.8万平方米',
      description: '上海中心大厦高632米，是中国第一、世界第二高楼，采用多项绿色建筑技术。',
      features: ['垂直绿化系统', '雨水收集系统', '中水处理系统', '太阳能热水系统'],
      technologies: '创新性采用螺旋上升的双层幕墙系统，给排水系统实现分区供水和智能控制。',
      achievements: '获得美国LEED金级认证、中国绿色建筑三星认证。',
      publishDate: '2024-02-20',
      status: '已发布',
      views: 12580,
    },
    {
      id: 3,
      title: '广州海绵城市示范区',
      coverImage: '',
      category: '市政工程',
      location: '广州市天河区',
      projectDate: '2023-06-15',
      client: '广州市水务局',
      designer: '广州市市政工程设计研究院',
      area: '5平方公里',
      description: '海绵城市建设示范项目，通过自然积存、自然渗透、自然净化的方式，实现雨水资源化利用。',
      features: ['透水铺装', '雨水花园', '生态滞留池', '智慧排水系统'],
      technologies: '运用物联网、大数据等技术，建立智慧水务管理平台。',
      achievements: '入选住建部海绵城市建设试点示范项目。',
      publishDate: '',
      status: '草稿',
      views: 0,
    },
  ]);

  const [formData, setFormData] = useState<Partial<Project>>({
    status: '草稿',
    features: [],
  });

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === '全部' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: Project['status']) => {
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
      features: [],
      views: 0,
    });
    setShowAddModal(true);
  };

  const handleView = (project: Project) => {
    setSelectedProject(project);
    setShowViewModal(true);
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setFormData(project);
    setShowEditModal(true);
  };

  const handleDelete = (project: Project) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeaturesChange = (value: string) => {
    const featuresArray = value.split(',').map(f => f.trim()).filter(f => f);
    setFormData(prev => ({
      ...prev,
      features: featuresArray
    }));
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      ...formData as Project,
      id: Math.max(...projects.map(p => p.id)) + 1,
      publishDate: formData.status === '已发布' ? new Date().toISOString().split('T')[0] : '',
      views: 0,
    };
    setProjects([...projects, newProject]);
    setShowAddModal(false);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProject) {
      setProjects(projects.map(p => 
        p.id === selectedProject.id ? { 
          ...formData as Project, 
          id: selectedProject.id,
          views: selectedProject.views,
          publishDate: formData.status === '已发布' && !selectedProject.publishDate 
            ? new Date().toISOString().split('T')[0] 
            : selectedProject.publishDate
        } : p
      ));
      setShowEditModal(false);
      setSelectedProject(null);
    }
  };

  const confirmDelete = () => {
    if (selectedProject) {
      setProjects(projects.filter(p => p.id !== selectedProject.id));
      setShowDeleteModal(false);
      setSelectedProject(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl text-gray-900 mb-2">项目管理</h2>
        <p className="text-gray-600">管理优秀案例项目信息</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索项目名称或地点..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap" 
            onClick={handleAdd}
          >
            <Plus className="w-5 h-5" />
            <span>添加项目</span>
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
          共 {filteredProjects.length} 个项目
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  项目信息
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  项目特点
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
              {paginatedProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-gray-900">{project.title}</div>
                      <div className="text-xs text-gray-500">{project.category} · {project.location}</div>
                      <div className="text-xs text-gray-500">面积：{project.area}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {project.features.slice(0, 2).map((feature, index) => (
                        <span key={index} className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs">
                          {feature}
                        </span>
                      ))}
                      {project.features.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{project.features.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {project.publishDate || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{project.views}</div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(project.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button 
                        className="p-1 text-gray-400 hover:text-gray-600" 
                        onClick={() => setOpenDropdown(openDropdown === project.id ? null : project.id)}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {openDropdown === project.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => {
                              handleView(project);
                              setOpenDropdown(null);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            查看
                          </button>
                          <button
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => {
                              handleEdit(project);
                              setOpenDropdown(null);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                            编辑
                          </button>
                          <button
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            onClick={() => {
                              handleDelete(project);
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
          totalItems={filteredProjects.length}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <ProjectModal
          title="添加项目"
          formData={formData}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleSubmitAdd}
          onFormChange={handleFormChange}
          onFeaturesChange={handleFeaturesChange}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedProject && (
        <ProjectModal
          title="编辑项目"
          formData={formData}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleSubmitEdit}
          onFormChange={handleFormChange}
          onFeaturesChange={handleFeaturesChange}
        />
      )}

      {/* View Modal */}
      {showViewModal && selectedProject && (
        <ViewProjectModal
          project={selectedProject}
          onClose={() => setShowViewModal(false)}
          onEdit={() => {
            setShowViewModal(false);
            handleEdit(selectedProject);
          }}
          getStatusBadge={getStatusBadge}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedProject && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl text-gray-900 mb-4">删除项目</h3>
            <p className="text-sm text-gray-600 mb-4">确定要删除项目 <strong>{selectedProject.title}</strong> 吗？</p>
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

// Project Modal Component
function ProjectModal({ title, formData, onClose, onSubmit, onFormChange, onFeaturesChange }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="relative p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl mb-1">{title}</h2>
              <p className="text-sm text-green-100">填写项目案例信息</p>
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
                <Building2 className="w-5 h-5 text-green-600" />
                项目基本信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">项目名称 *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="请输入项目名称"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">项目类别 *</label>
                  <input
                    type="text"
                    name="category"
                    required
                    value={formData.category || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="如：公共建筑、市政工程"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">项目地点 *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      required
                      value={formData.location || ''}
                      onChange={onFormChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="请输入项目地点"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">完工日期 *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="projectDate"
                      required
                      value={formData.projectDate || ''}
                      onChange={onFormChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">建筑面积 *</label>
                  <input
                    type="text"
                    name="area"
                    required
                    value={formData.area || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="如：80万平方米"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">业主单位 *</label>
                  <input
                    type="text"
                    name="client"
                    required
                    value={formData.client || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="请输入业主单位"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">设计单位 *</label>
                  <input
                    type="text"
                    name="designer"
                    required
                    value={formData.designer || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="请输入设计单位"
                  />
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                项目详情
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">项目简介 *</label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    value={formData.description || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="请输入项目简介"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">项目特点 *</label>
                  <input
                    type="text"
                    name="features"
                    required
                    value={formData.features?.join(', ') || ''}
                    onChange={(e) => onFeaturesChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="请输入项目特点，多个用逗号分隔"
                  />
                  <p className="text-xs text-gray-500 mt-1">例如：智能化给排水系统, 雨水收集利用, 绿色节能设计</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">技术应用</label>
                  <textarea
                    name="technologies"
                    rows={3}
                    value={formData.technologies || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="请输入技术应用说明"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">项目成就</label>
                  <textarea
                    name="achievements"
                    rows={3}
                    value={formData.achievements || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="请输入项目获得的荣誉或成就"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-green-600" />
                发布状态
              </h3>
              <div>
                <label className="block text-sm text-gray-700 mb-2">状态 *</label>
                <select
                  name="status"
                  required
                  value={formData.status}
                  onChange={onFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all shadow-lg"
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

// View Project Modal Component
function ViewProjectModal({ project, onClose, onEdit, getStatusBadge }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="relative p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Eye className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl mb-1">项目详情</h2>
              <p className="text-sm text-green-100">查看项目完整信息</p>
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
              <Building2 className="w-5 h-5 text-green-600" />
              项目基本信息
            </h3>
            <div className="bg-gray-50 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500 mb-1">项目名称</div>
                <div className="text-sm text-gray-900">{project.title}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">项目类别</div>
                <div className="text-sm text-gray-900">{project.category}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  项目地点
                </div>
                <div className="text-sm text-gray-900">{project.location}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  完工日期
                </div>
                <div className="text-sm text-gray-900">{project.projectDate}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">建筑面积</div>
                <div className="text-sm text-gray-900">{project.area}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">业主单位</div>
                <div className="text-sm text-gray-900">{project.client}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">设计单位</div>
                <div className="text-sm text-gray-900">{project.designer}</div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              项目特点
            </h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex flex-wrap gap-2">
                {project.features.map((feature: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              项目详情
            </h3>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">项目简介</div>
                <div className="text-sm text-gray-700 leading-relaxed">{project.description}</div>
              </div>
              {project.technologies && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">技术应用</div>
                  <div className="text-sm text-gray-700 leading-relaxed">{project.technologies}</div>
                </div>
              )}
              {project.achievements && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">项目成就</div>
                  <div className="text-sm text-gray-700 leading-relaxed">{project.achievements}</div>
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
                <div className="mt-1">{getStatusBadge(project.status)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">发布时间</div>
                <div className="text-sm text-gray-900">{project.publishDate || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">浏览量</div>
                <div className="text-sm text-gray-900">{project.views}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={onEdit}
              className="flex-1 px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              编辑项目
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
