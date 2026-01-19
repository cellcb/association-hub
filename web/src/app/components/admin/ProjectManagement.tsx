import { Search, Filter, Plus, MoreVertical, CheckCircle, FileText, Edit, Trash2, Eye, X, Building2, MapPin, Calendar, Award, User, Loader2, Image as ImageIcon, Target, Lightbulb, BarChart3 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Pagination } from './Pagination';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectCategories,
} from '@/lib/api';
import type {
  ProjectListResponse,
  ProjectResponse,
  ProjectRequest,
  ProjectCategory,
  ProjectStatus,
  ProjectScale,
  TechnicalFeature,
  ProjectAchievement,
  ProjectCategoryResponse,
} from '@/types/project';
import { projectStatusLabels, parseProjectResponse } from '@/types/project';

export function ProjectManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | ProjectStatus>('all');
  const [filterCategoryId, setFilterCategoryId] = useState<'all' | number>('all');
  const [categories, setCategories] = useState<ProjectCategoryResponse[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [projects, setProjects] = useState<ProjectListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  const [formData, setFormData] = useState<ProjectFormData>(getInitialFormData());

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    const result = await getProjectCategories();
    if (result.success && result.data) {
      setCategories(result.data);
    }
  }, []);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProjects({
        page: currentPage - 1,
        size: itemsPerPage,
        status: filterStatus === 'all' ? undefined : filterStatus,
      });
      if (result.success && result.data) {
        // Filter by categoryId on client side for now
        let filteredContent = result.data.content;
        if (filterCategoryId !== 'all') {
          filteredContent = filteredContent.filter(p => p.categoryId === filterCategoryId);
        }
        setProjects(filteredContent);
        setTotalItems(result.data.page.totalElements);
        setTotalPages(result.data.page.totalPages);
      } else {
        setError(result.message || '加载失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filterStatus, filterCategoryId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filter projects by search term (client-side)
  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.location && project.location.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 1:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            已发布
          </span>
        );
      case 0:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">
            <FileText className="w-3 h-3" />
            草稿
          </span>
        );
    }
  };

  const handleAdd = () => {
    setFormData(getInitialFormData());
    setFieldErrors({});
    setShowAddModal(true);
  };

  const handleView = async (project: ProjectListResponse) => {
    try {
      const result = await getProjectById(project.id);
      if (result.success && result.data) {
        setSelectedProject(result.data);
        setShowViewModal(true);
      }
    } catch (err) {
      setError('加载详情失败');
    }
  };

  const handleEdit = async (project: ProjectListResponse) => {
    try {
      const result = await getProjectById(project.id);
      if (result.success && result.data) {
        setSelectedProject(result.data);
        setFormData(projectToFormData(result.data));
        setFieldErrors({});
        setShowEditModal(true);
      }
    } catch (err) {
      setError('加载详情失败');
    }
  };

  const handleDelete = async (project: ProjectListResponse) => {
    try {
      const result = await getProjectById(project.id);
      if (result.success && result.data) {
        setSelectedProject(result.data);
        setShowDeleteModal(true);
      }
    } catch (err) {
      setError('加载详情失败');
    }
  };

  // Parse validation errors from backend response
  const parseValidationErrors = (result: { fieldErrors?: Record<string, string>; errors?: Record<string, string> }) => {
    if (result.fieldErrors) {
      setFieldErrors(result.fieldErrors);
      return true;
    }
    if (result.errors) {
      setFieldErrors(result.errors);
      return true;
    }
    return false;
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    try {
      const request = formDataToRequest(formData);
      const result = await createProject(request);
      if (result.success) {
        setShowAddModal(false);
        fetchProjects();
      } else {
        // Try to parse field-level validation errors
        if (!parseValidationErrors(result as any)) {
          setError(result.message || '创建失败');
        }
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setSubmitting(true);
    setFieldErrors({});
    try {
      const request = formDataToRequest(formData);
      const result = await updateProject(selectedProject.id, request);
      if (result.success) {
        setShowEditModal(false);
        setSelectedProject(null);
        fetchProjects();
      } else {
        // Try to parse field-level validation errors
        if (!parseValidationErrors(result as any)) {
          setError(result.message || '更新失败');
        }
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedProject) return;
    setSubmitting(true);
    try {
      const result = await deleteProject(selectedProject.id);
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedProject(null);
        fetchProjects();
      } else {
        setError(result.message || '删除失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl text-gray-900 mb-2">项目管理</h2>
        <p className="text-gray-600">管理优秀案例项目信息</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-800 hover:text-red-900">
            <X className="w-4 h-4 inline" />
          </button>
        </div>
      )}

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
            onChange={(e) => {
              setFilterStatus(e.target.value === 'all' ? 'all' : Number(e.target.value) as ProjectStatus);
              setCurrentPage(1);
            }}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">全部状态</option>
            <option value="1">已发布</option>
            <option value="0">草稿</option>
          </select>

          <select
            value={filterCategoryId}
            onChange={(e) => {
              setFilterCategoryId(e.target.value === 'all' ? 'all' : Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">全部类别</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          共 {totalItems} 个项目
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    项目信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    项目类别
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    建设单位
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
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">{project.title}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {project.location || '-'}
                        </div>
                        {project.completionDate && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {project.completionDate}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                        {project.categoryName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{project.owner || '-'}</div>
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
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <ProjectModal
          title="添加项目"
          formData={formData}
          setFormData={setFormData}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleSubmitAdd}
          submitting={submitting}
          categories={categories}
          fieldErrors={fieldErrors}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedProject && (
        <ProjectModal
          title="编辑项目"
          formData={formData}
          setFormData={setFormData}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleSubmitEdit}
          submitting={submitting}
          categories={categories}
          fieldErrors={fieldErrors}
        />
      )}

      {/* View Modal */}
      {showViewModal && selectedProject && (
        <ViewProjectModal
          project={selectedProject}
          onClose={() => setShowViewModal(false)}
          onEdit={() => {
            setShowViewModal(false);
            setFormData(projectToFormData(selectedProject));
            setShowEditModal(true);
          }}
          getStatusBadge={getStatusBadge}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl text-gray-900 mb-4">删除项目</h3>
            <p className="text-sm text-gray-600 mb-4">
              确定要删除项目 <strong>{selectedProject.title}</strong> 吗？此操作不可撤销。
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                onClick={() => setShowDeleteModal(false)}
                disabled={submitting}
              >
                取消
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                onClick={confirmDelete}
                disabled={submitting}
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Form Data Type
interface ProjectFormData {
  title: string;
  categoryId: number | null;
  location: string;
  completionDate: string;
  owner: string;
  designer: string;
  contractor: string;
  description: string;
  background: string;
  designConcept: string;
  status: ProjectStatus;
  coverImage: string;
  highlights: string[];
  projectAwards: string[];
  scale: ProjectScale;
  technicalFeatures: TechnicalFeature[];
  achievements: ProjectAchievement[];
  images: string[];
}

function getInitialFormData(): ProjectFormData {
  return {
    title: '',
    categoryId: null,
    location: '',
    completionDate: '',
    owner: '',
    designer: '',
    contractor: '',
    description: '',
    background: '',
    designConcept: '',
    status: 0,
    coverImage: '',
    highlights: [],
    projectAwards: [],
    scale: { area: '', height: '', investment: '' },
    technicalFeatures: [],
    achievements: [],
    images: [],
  };
}

function projectToFormData(project: ProjectResponse): ProjectFormData {
  const parsed = parseProjectResponse(project);
  return {
    title: project.title,
    categoryId: project.categoryId,
    location: project.location || '',
    completionDate: project.completionDate || '',
    owner: project.owner || '',
    designer: project.designer || '',
    contractor: project.contractor || '',
    description: project.description || '',
    background: project.background || '',
    designConcept: project.designConcept || '',
    status: project.status,
    coverImage: project.coverImage || '',
    highlights: parsed.highlights,
    projectAwards: parsed.projectAwards,
    scale: parsed.scale || { area: '', height: '', investment: '' },
    technicalFeatures: parsed.technicalFeatures,
    achievements: parsed.achievements,
    images: parsed.images,
  };
}

function formDataToRequest(formData: ProjectFormData): ProjectRequest {
  // 过滤空行的辅助函数（用于文本输入的数组）
  const filterEmpty = (arr: string[]) => arr.map(s => s.trim()).filter(s => s);

  const highlights = filterEmpty(formData.highlights);
  const projectAwards = filterEmpty(formData.projectAwards);
  // images 是 Base64 数组，直接过滤空值
  const images = formData.images.filter(s => s);

  return {
    title: formData.title,
    categoryId: formData.categoryId!,
    location: formData.location || undefined,
    completionDate: formData.completionDate || undefined,
    owner: formData.owner || undefined,
    designer: formData.designer || undefined,
    contractor: formData.contractor || undefined,
    description: formData.description || undefined,
    background: formData.background || undefined,
    designConcept: formData.designConcept || undefined,
    status: formData.status,
    coverImage: formData.coverImage || undefined,
    highlights: highlights.length > 0 ? JSON.stringify(highlights) : undefined,
    projectAwards: projectAwards.length > 0 ? JSON.stringify(projectAwards) : undefined,
    scale: (formData.scale.area || formData.scale.height || formData.scale.investment)
      ? JSON.stringify(formData.scale)
      : undefined,
    technicalFeatures: formData.technicalFeatures.length > 0
      ? JSON.stringify(formData.technicalFeatures)
      : undefined,
    achievements: formData.achievements.length > 0
      ? JSON.stringify(formData.achievements)
      : undefined,
    images: images.length > 0 ? JSON.stringify(images) : undefined,
  };
}

// Project Modal Component
interface FieldErrors {
  [key: string]: string;
}

interface ProjectModalProps {
  title: string;
  formData: ProjectFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProjectFormData>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  categories: ProjectCategoryResponse[];
  fieldErrors?: FieldErrors;
}

function ProjectModal({ title, formData, setFormData, onClose, onSubmit, submitting, categories, fieldErrors = {} }: ProjectModalProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'status' || name === 'categoryId' ? Number(value) : value
    }));
  };

  const handleScaleChange = (field: keyof ProjectScale, value: string) => {
    setFormData(prev => ({
      ...prev,
      scale: { ...prev.scale, [field]: value }
    }));
  };

  const handleArrayChange = (field: 'highlights' | 'projectAwards', value: string) => {
    // 保留原始输入（包括空行），只在提交时才过滤
    const arr = value.split('\n');
    setFormData(prev => ({ ...prev, [field]: arr }));
  };

  // 封面图片上传处理
  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过 2MB');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, coverImage: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // 多图片上传处理
  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        alert(`图片 ${file.name} 超过 2MB，已跳过`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // 删除项目图片
  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleTechnicalFeaturesChange = (index: number, field: keyof TechnicalFeature, value: string) => {
    setFormData(prev => {
      const features = [...prev.technicalFeatures];
      features[index] = { ...features[index], [field]: value };
      return { ...prev, technicalFeatures: features };
    });
  };

  const addTechnicalFeature = () => {
    setFormData(prev => ({
      ...prev,
      technicalFeatures: [...prev.technicalFeatures, { title: '', description: '' }]
    }));
  };

  const removeTechnicalFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      technicalFeatures: prev.technicalFeatures.filter((_, i) => i !== index)
    }));
  };

  const handleAchievementsChange = (index: number, field: keyof ProjectAchievement, value: string) => {
    setFormData(prev => {
      const achievements = [...prev.achievements];
      achievements[index] = { ...achievements[index], [field]: value };
      return { ...prev, achievements };
    });
  };

  const addAchievement = () => {
    setFormData(prev => ({
      ...prev,
      achievements: [...prev.achievements, { title: '', value: '', description: '' }]
    }));
  };

  const removeAchievement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

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
                    maxLength={200}
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      fieldErrors.title ? 'border-red-500' : formData.title.length > 200 ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请输入项目名称"
                  />
                  <div className="flex justify-between mt-1">
                    {fieldErrors.title ? (
                      <span className="text-xs text-red-500">{fieldErrors.title}</span>
                    ) : (
                      <span></span>
                    )}
                    <span className={`text-xs ${formData.title.length > 180 ? 'text-orange-500' : 'text-gray-400'}`}>
                      {formData.title.length}/200
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">项目类别 *</label>
                  <select
                    name="categoryId"
                    required
                    value={formData.categoryId || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">请选择类别</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">项目地点</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      maxLength={200}
                      value={formData.location}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        fieldErrors.location ? 'border-red-500' : formData.location.length > 200 ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="请输入项目地点"
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    {fieldErrors.location ? (
                      <span className="text-xs text-red-500">{fieldErrors.location}</span>
                    ) : (
                      <span></span>
                    )}
                    <span className={`text-xs ${formData.location.length > 180 ? 'text-orange-500' : 'text-gray-400'}`}>
                      {formData.location.length}/200
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">竣工日期</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="completionDate"
                      value={formData.completionDate}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">建设单位</label>
                  <input
                    type="text"
                    name="owner"
                    maxLength={200}
                    value={formData.owner}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      fieldErrors.owner ? 'border-red-500' : formData.owner.length > 200 ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请输入建设单位"
                  />
                  <div className="flex justify-between mt-1">
                    {fieldErrors.owner ? (
                      <span className="text-xs text-red-500">{fieldErrors.owner}</span>
                    ) : (
                      <span></span>
                    )}
                    <span className={`text-xs ${formData.owner.length > 180 ? 'text-orange-500' : 'text-gray-400'}`}>
                      {formData.owner.length}/200
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">设计单位</label>
                  <input
                    type="text"
                    name="designer"
                    maxLength={200}
                    value={formData.designer}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      fieldErrors.designer ? 'border-red-500' : formData.designer.length > 200 ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请输入设计单位"
                  />
                  <div className="flex justify-between mt-1">
                    {fieldErrors.designer ? (
                      <span className="text-xs text-red-500">{fieldErrors.designer}</span>
                    ) : (
                      <span></span>
                    )}
                    <span className={`text-xs ${formData.designer.length > 180 ? 'text-orange-500' : 'text-gray-400'}`}>
                      {formData.designer.length}/200
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">施工单位</label>
                  <input
                    type="text"
                    name="contractor"
                    maxLength={200}
                    value={formData.contractor}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      fieldErrors.contractor ? 'border-red-500' : formData.contractor.length > 200 ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请输入施工单位"
                  />
                  <div className="flex justify-between mt-1">
                    {fieldErrors.contractor ? (
                      <span className="text-xs text-red-500">{fieldErrors.contractor}</span>
                    ) : (
                      <span></span>
                    )}
                    <span className={`text-xs ${formData.contractor.length > 180 ? 'text-orange-500' : 'text-gray-400'}`}>
                      {formData.contractor.length}/200
                    </span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">封面图片</label>
                  <div className="flex items-start gap-4">
                    {formData.coverImage && (
                      <div className="relative group">
                        <img
                          src={formData.coverImage}
                          alt="封面预览"
                          className="w-32 h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <label className="flex-1 flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
                      <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">点击上传封面图片</span>
                      <span className="text-xs text-gray-400 mt-1">支持 JPG、PNG，最大 2MB</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleCoverImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Scale Info */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                项目规模
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">建筑面积</label>
                  <input
                    type="text"
                    value={formData.scale.area || ''}
                    onChange={(e) => handleScaleChange('area', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="如：80万平方米"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">建筑高度</label>
                  <input
                    type="text"
                    value={formData.scale.height || ''}
                    onChange={(e) => handleScaleChange('height', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="如：632米"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">投资规模</label>
                  <input
                    type="text"
                    value={formData.scale.investment || ''}
                    onChange={(e) => handleScaleChange('investment', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="如：800亿元"
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
                  <label className="block text-sm text-gray-700 mb-2">项目简介</label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="请输入项目简介"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">项目背景</label>
                  <textarea
                    name="background"
                    rows={3}
                    value={formData.background}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="请输入项目背景"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">设计理念</label>
                  <textarea
                    name="designConcept"
                    rows={3}
                    value={formData.designConcept}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="请输入设计理念"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">技术亮点 (每行一个)</label>
                  <textarea
                    rows={4}
                    value={formData.highlights.join('\n')}
                    onChange={(e) => handleArrayChange('highlights', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="智能化给排水系统&#10;雨水收集利用&#10;中水回用系统"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">获奖情况 (每行一个)</label>
                  <textarea
                    rows={3}
                    value={formData.projectAwards.join('\n')}
                    onChange={(e) => handleArrayChange('projectAwards', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="鲁班奖&#10;国家优质工程金质奖"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">项目图片</label>
                  {/* 已上传图片预览 */}
                  {formData.images.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-3">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`项目图片 ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* 上传按钮 */}
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-500">点击上传项目图片（可多选）</span>
                    <span className="text-xs text-gray-400">单张最大 2MB</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      multiple
                      onChange={handleImagesUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Technical Features */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                技术特点
              </h3>
              <div className="space-y-4">
                {formData.technicalFeatures.map((feature, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-600">技术特点 #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeTechnicalFeature(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => handleTechnicalFeaturesChange(index, 'title', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="特点标题"
                      />
                      <textarea
                        rows={2}
                        value={feature.description}
                        onChange={(e) => handleTechnicalFeaturesChange(index, 'description', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="特点描述"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTechnicalFeature}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors"
                >
                  + 添加技术特点
                </button>
              </div>
            </div>

            {/* Achievements */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-green-600" />
                项目成果
              </h3>
              <div className="space-y-4">
                {formData.achievements.map((achievement, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-600">成果 #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeAchievement(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={achievement.title}
                        onChange={(e) => handleAchievementsChange(index, 'title', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="成果标题"
                      />
                      <input
                        type="text"
                        value={achievement.value}
                        onChange={(e) => handleAchievementsChange(index, 'value', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="成果数值"
                      />
                      <input
                        type="text"
                        value={achievement.description}
                        onChange={(e) => handleAchievementsChange(index, 'description', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="成果描述"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAchievement}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors"
                >
                  + 添加项目成果
                </button>
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
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value={0}>草稿</option>
                  <option value={1}>已发布</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all shadow-lg flex items-center justify-center gap-2"
                disabled={submitting}
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
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
interface ViewProjectModalProps {
  project: ProjectResponse;
  onClose: () => void;
  onEdit: () => void;
  getStatusBadge: (status: ProjectStatus) => JSX.Element;
}

function ViewProjectModal({ project, onClose, onEdit, getStatusBadge }: ViewProjectModalProps) {
  const parsed = parseProjectResponse(project);

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
          {/* Cover Image */}
          {project.coverImage && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-green-600" />
                封面图片
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <img
                  src={project.coverImage}
                  alt="封面图片"
                  className="max-w-full max-h-64 rounded-lg mx-auto"
                />
              </div>
            </div>
          )}

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
                <div className="text-sm text-gray-900">{project.categoryName}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  项目地点
                </div>
                <div className="text-sm text-gray-900">{project.location || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  竣工日期
                </div>
                <div className="text-sm text-gray-900">{project.completionDate || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">建设单位</div>
                <div className="text-sm text-gray-900">{project.owner || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">设计单位</div>
                <div className="text-sm text-gray-900">{project.designer || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">施工单位</div>
                <div className="text-sm text-gray-900">{project.contractor || '-'}</div>
              </div>
            </div>
          </div>

          {/* Scale Info */}
          {parsed.scale && (parsed.scale.area || parsed.scale.height || parsed.scale.investment) && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                项目规模
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {parsed.scale.area && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-600 mb-1">建筑面积</div>
                    <div className="text-lg text-blue-900">{parsed.scale.area}</div>
                  </div>
                )}
                {parsed.scale.height && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-600 mb-1">建筑高度</div>
                    <div className="text-lg text-blue-900">{parsed.scale.height}</div>
                  </div>
                )}
                {parsed.scale.investment && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-600 mb-1">投资规模</div>
                    <div className="text-lg text-blue-900">{parsed.scale.investment}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Project Description */}
          {project.description && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                项目简介
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-sm text-gray-700 leading-relaxed">{project.description}</p>
              </div>
            </div>
          )}

          {/* Background */}
          {project.background && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4">项目背景</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-sm text-gray-700 leading-relaxed">{project.background}</p>
              </div>
            </div>
          )}

          {/* Design Concept */}
          {project.designConcept && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-green-600" />
                设计理念
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-sm text-gray-700 leading-relaxed">{project.designConcept}</p>
              </div>
            </div>
          )}

          {/* Highlights */}
          {parsed.highlights.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-green-600" />
                技术亮点
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex flex-wrap gap-2">
                  {parsed.highlights.map((highlight, index) => (
                    <span key={index} className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm">
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Technical Features */}
          {parsed.technicalFeatures.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                技术特点
              </h3>
              <div className="space-y-3">
                {parsed.technicalFeatures.map((feature, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-sm text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {parsed.achievements.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4">项目成果</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {parsed.achievements.map((achievement, index) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                    <div className="text-2xl text-blue-600 mb-1">{achievement.value}</div>
                    <div className="text-sm text-gray-900 mb-1">{achievement.title}</div>
                    <div className="text-xs text-gray-600">{achievement.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Awards */}
          {parsed.projectAwards.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4">获奖情况</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-2">
                  {parsed.projectAwards.map((award, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <Award className="w-4 h-4 text-yellow-500" />
                      {award}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Project Images */}
          {parsed.images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-green-600" />
                项目图片 ({parsed.images.length}张)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {parsed.images.map((img, index) => (
                  <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={img}
                      alt={`项目图片 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-4">发布状态</h3>
            <div className="bg-gray-50 rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">当前状态</div>
                <div className="mt-1">{getStatusBadge(project.status)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">浏览量</div>
                <div className="text-sm text-gray-900">{project.views}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">创建时间</div>
                <div className="text-sm text-gray-900">
                  {project.createdTime ? new Date(project.createdTime).toLocaleString() : '-'}
                </div>
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
