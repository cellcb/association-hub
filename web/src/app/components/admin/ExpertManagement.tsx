import { Search, Filter, UserPlus, MoreVertical, CheckCircle, FileText, Edit, Trash2, Eye, X, User, Mail, Phone, Award, MapPin, Building, Loader2, Plus, Minus, GraduationCap, Briefcase, BookOpen, Trophy, Upload } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Pagination } from './Pagination';
import type { ExpertListResponse, ExpertResponse, ExpertRequest, ExpertiseFieldResponse } from '@/types/expert';
import {
  getExperts,
  getExpertById,
  createExpert,
  updateExpert,
  deleteExpert,
  getExpertiseFields,
} from '@/lib/api';

// 项目结构
interface ProjectItem {
  name: string;
  year: string;
  role: string;
  description: string;
}

// 论文结构
interface PublicationItem {
  title: string;
  year: string;
  journal: string;
}

// 表单数据结构（用于 UI 编辑）
interface ExpertFormData {
  name: string;
  title: string;
  organization: string;
  location: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  achievements: string;
  status: number;
  expertiseFieldIds: number[];
  education: string[];
  experience: string[];
  researchAreas: string[];
  awards: string[];
  projects: ProjectItem[];
  publications: PublicationItem[];
}

// 解析 JSON 字符串为数组
function parseJsonArray<T>(jsonStr: string | undefined | null): T[] {
  if (!jsonStr) return [];
  try {
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// 表单数据转换为 API 请求
function formDataToRequest(formData: ExpertFormData): ExpertRequest {
  return {
    name: formData.name,
    title: formData.title || undefined,
    organization: formData.organization || undefined,
    location: formData.location || undefined,
    email: formData.email || undefined,
    phone: formData.phone || undefined,
    avatar: formData.avatar || undefined,
    bio: formData.bio || undefined,
    achievements: formData.achievements || undefined,
    status: formData.status,
    expertiseFieldIds: formData.expertiseFieldIds,
    education: formData.education.length > 0 ? JSON.stringify(formData.education) : undefined,
    experience: formData.experience.length > 0 ? JSON.stringify(formData.experience) : undefined,
    researchAreas: formData.researchAreas.length > 0 ? JSON.stringify(formData.researchAreas) : undefined,
    awards: formData.awards.length > 0 ? JSON.stringify(formData.awards) : undefined,
    projects: formData.projects.length > 0 ? JSON.stringify(formData.projects) : undefined,
    publications: formData.publications.length > 0 ? JSON.stringify(formData.publications) : undefined,
  };
}

// API 响应转换为表单数据
function responseToFormData(data: ExpertResponse): ExpertFormData {
  return {
    name: data.name,
    title: data.title || '',
    organization: data.organization || '',
    location: data.location || '',
    email: data.email || '',
    phone: data.phone || '',
    avatar: data.avatar || '',
    bio: data.bio || '',
    achievements: data.achievements || '',
    status: data.status,
    expertiseFieldIds: data.expertiseFields?.map(f => f.id) || [],
    education: parseJsonArray<string>(data.education),
    experience: parseJsonArray<string>(data.experience),
    researchAreas: parseJsonArray<string>(data.researchAreas),
    awards: parseJsonArray<string>(data.awards),
    projects: parseJsonArray<ProjectItem>(data.projects),
    publications: parseJsonArray<PublicationItem>(data.publications),
  };
}

// 创建空表单数据
function createEmptyFormData(): ExpertFormData {
  return {
    name: '',
    title: '',
    organization: '',
    location: '',
    email: '',
    phone: '',
    avatar: '',
    bio: '',
    achievements: '',
    status: 0,
    expertiseFieldIds: [],
    education: [],
    experience: [],
    researchAreas: [],
    awards: [],
    projects: [],
    publications: [],
  };
}

export function ExpertManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<ExpertResponse | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // API data states
  const [experts, setExperts] = useState<ExpertListResponse[]>([]);
  const [expertiseFields, setExpertiseFields] = useState<ExpertiseFieldResponse[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState<ExpertFormData>(createEmptyFormData());

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Load expertise fields
  const loadExpertiseFields = useCallback(async () => {
    const result = await getExpertiseFields();
    if (result.success && result.data) {
      setExpertiseFields(result.data);
    }
  }, []);

  // Load experts list
  const loadExperts = useCallback(async () => {
    setLoading(true);
    try {
      const statusValue = filterStatus === '全部' ? undefined :
                          filterStatus === '已发布' ? 1 : 0;
      const result = await getExperts({
        page: currentPage - 1,
        size: itemsPerPage,
        status: statusValue,
      });
      if (result.success && result.data) {
        setExperts(result.data.content);
        setTotalItems(result.data.page.totalElements);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filterStatus]);

  useEffect(() => {
    loadExpertiseFields();
  }, [loadExpertiseFields]);

  useEffect(() => {
    loadExperts();
  }, [loadExperts]);

  // Filter by search term (client-side for now)
  const filteredExperts = experts.filter(expert => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return expert.name.toLowerCase().includes(term) ||
           expert.organization?.toLowerCase().includes(term) ||
           expert.title?.toLowerCase().includes(term);
  });

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs">
          <CheckCircle className="w-3 h-3" />
          已发布
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">
        <FileText className="w-3 h-3" />
        草稿
      </span>
    );
  };

  const handleAdd = () => {
    setFormData(createEmptyFormData());
    setFieldErrors({});
    setShowAddModal(true);
  };

  const handleView = async (expert: ExpertListResponse) => {
    const result = await getExpertById(expert.id);
    if (result.success && result.data) {
      setSelectedExpert(result.data);
      setShowViewModal(true);
    } else {
      alert('加载专家详情失败');
    }
  };

  const handleEdit = async (expert: ExpertListResponse) => {
    const result = await getExpertById(expert.id);
    if (result.success && result.data) {
      setSelectedExpert(result.data);
      setFormData(responseToFormData(result.data));
      setFieldErrors({});
      setShowEditModal(true);
    } else {
      alert('加载专家详情失败');
    }
  };

  const handleDelete = async (expert: ExpertListResponse) => {
    const result = await getExpertById(expert.id);
    if (result.success && result.data) {
      setSelectedExpert(result.data);
      setShowDeleteModal(true);
    }
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    try {
      const result = await createExpert(formDataToRequest(formData));
      if (result.success) {
        setShowAddModal(false);
        loadExperts();
      } else {
        // Check if data contains field-level validation errors
        if (result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
          setFieldErrors(result.data as Record<string, string>);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpert) return;
    setSubmitting(true);
    setFieldErrors({});
    try {
      const result = await updateExpert(selectedExpert.id, formDataToRequest(formData));
      if (result.success) {
        setShowEditModal(false);
        setSelectedExpert(null);
        loadExperts();
      } else {
        // Check if data contains field-level validation errors
        if (result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
          setFieldErrors(result.data as Record<string, string>);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedExpert) return;
    setSubmitting(true);
    try {
      const result = await deleteExpert(selectedExpert.id);
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedExpert(null);
        loadExperts();
      } else {
        alert(result.message || '删除失败');
      }
    } finally {
      setSubmitting(false);
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
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option>全部</option>
            <option>已发布</option>
            <option>草稿</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          共 {totalItems} 位专家
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
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
                    所在地区
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
                {filteredExperts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      暂无专家数据
                    </td>
                  </tr>
                ) : (
                  filteredExperts.map((expert) => (
                    <tr key={expert.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {expert.avatar ? (
                            <img src={expert.avatar} alt={expert.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm text-gray-900">{expert.name}</div>
                            <div className="text-xs text-gray-500">{expert.title}</div>
                            <div className="text-xs text-gray-500">{expert.organization}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {expert.expertiseFields?.slice(0, 2).map((field) => (
                            <span key={field.id} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                              {field.name}
                            </span>
                          ))}
                          {expert.expertiseFields && expert.expertiseFields.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{expert.expertiseFields.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {expert.location || '-'}
                        </div>
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
                  ))
                )}
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
        <ExpertModal
          title="添加专家"
          formData={formData}
          setFormData={setFormData}
          expertiseFields={expertiseFields}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleSubmitAdd}
          submitting={submitting}
          fieldErrors={fieldErrors}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedExpert && (
        <ExpertModal
          title="编辑专家"
          formData={formData}
          setFormData={setFormData}
          expertiseFields={expertiseFields}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleSubmitEdit}
          submitting={submitting}
          fieldErrors={fieldErrors}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl text-gray-900 mb-4">删除专家</h3>
            <p className="text-sm text-gray-600 mb-4">确定要删除专家 <strong>{selectedExpert.name}</strong> 吗？</p>
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

// 动态列表输入组件
interface DynamicListInputProps {
  label: string;
  icon: React.ReactNode;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

function DynamicListInput({ label, icon, items, onChange, placeholder }: DynamicListInputProps) {
  const addItem = () => onChange([...items, '']);
  const removeItem = (index: number) => onChange(items.filter((_, i) => i !== index));
  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg text-gray-900 flex items-center gap-2">
          {icon}
          {label}
        </h3>
        <button
          type="button"
          onClick={addItem}
          className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          添加
        </button>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 py-2">暂无数据，点击"添加"按钮添加</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder={placeholder}
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="px-2 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Expert Modal Component
interface ExpertModalProps {
  title: string;
  formData: ExpertFormData;
  setFormData: React.Dispatch<React.SetStateAction<ExpertFormData>>;
  expertiseFields: ExpertiseFieldResponse[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  fieldErrors?: Record<string, string>;
}

function ExpertModal({ title, formData, setFormData, expertiseFields, onClose, onSubmit, submitting, fieldErrors = {} }: ExpertModalProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'status' ? parseInt(value) : value
    }));
  };

  const handleExpertiseFieldChange = (fieldId: number) => {
    setFormData(prev => {
      const currentIds = prev.expertiseFieldIds || [];
      const newIds = currentIds.includes(fieldId)
        ? currentIds.filter(id => id !== fieldId)
        : [...currentIds, fieldId];
      return { ...prev, expertiseFieldIds: newIds };
    });
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { name: '', year: '', role: '', description: '' }]
    }));
  };

  const removeProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const updateProject = (index: number, field: keyof ProjectItem, value: string) => {
    setFormData(prev => {
      const newProjects = [...prev.projects];
      newProjects[index] = { ...newProjects[index], [field]: value };
      return { ...prev, projects: newProjects };
    });
  };

  const addPublication = () => {
    setFormData(prev => ({
      ...prev,
      publications: [...prev.publications, { title: '', year: '', journal: '' }]
    }));
  };

  const removePublication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      publications: prev.publications.filter((_, i) => i !== index)
    }));
  };

  const updatePublication = (index: number, field: keyof PublicationItem, value: string) => {
    setFormData(prev => {
      const newPublications = [...prev.publications];
      newPublications[index] = { ...newPublications[index], [field]: value };
      return { ...prev, publications: newPublications };
    });
  };

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
          <form onSubmit={onSubmit} className="space-y-8">
            {/* Error Summary */}
            {Object.keys(fieldErrors).length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-sm font-medium text-red-800 mb-2">请修正以下错误：</h4>
                <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                  {Object.entries(fieldErrors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
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
                    maxLength={50}
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="请输入专家姓名"
                  />
                  {fieldErrors.name && <p className="mt-1 text-sm text-red-500">{fieldErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">职称</label>
                  <input
                    type="text"
                    name="title"
                    maxLength={100}
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fieldErrors.title ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="如：教授级高级工程师"
                  />
                  {fieldErrors.title && <p className="mt-1 text-sm text-red-500">{fieldErrors.title}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">所在单位</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="organization"
                      maxLength={200}
                      value={formData.organization}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fieldErrors.organization ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="请输入所在单位"
                    />
                  </div>
                  {fieldErrors.organization && <p className="mt-1 text-sm text-red-500">{fieldErrors.organization}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">所在地区</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      maxLength={100}
                      value={formData.location}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fieldErrors.location ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="如：北京"
                    />
                  </div>
                  {fieldErrors.location && <p className="mt-1 text-sm text-red-500">{fieldErrors.location}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">手机号码</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      maxLength={20}
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fieldErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="请输入手机号码"
                    />
                  </div>
                  {fieldErrors.phone && <p className="mt-1 text-sm text-red-500">{fieldErrors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">邮箱地址</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      maxLength={100}
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="请输入邮箱地址"
                    />
                  </div>
                  {fieldErrors.email && <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">头像</label>
                  <div className="flex items-center gap-4">
                    {/* 头像预览 */}
                    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                      {formData.avatar ? (
                        <img
                          src={formData.avatar}
                          alt="头像预览"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                    {/* 上传按钮 */}
                    <div className="flex-1">
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>选择图片</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            // 检查文件大小 (1MB)
                            if (file.size > 1 * 1024 * 1024) {
                              alert('图片大小不能超过 1MB');
                              e.target.value = '';
                              return;
                            }
                            // 转换为 Base64
                            const reader = new FileReader();
                            reader.onload = () => {
                              setFormData(prev => ({ ...prev, avatar: reader.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                      <p className="mt-2 text-xs text-gray-500">支持 JPG/PNG/GIF/WebP，1MB 以内</p>
                      {formData.avatar && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                          className="mt-2 text-xs text-red-500 hover:text-red-700"
                        >
                          删除头像
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expertise Fields */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                专业领域
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {expertiseFields.map((field) => (
                  <label
                    key={field.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      formData.expertiseFieldIds.includes(field.id)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.expertiseFieldIds.includes(field.id)}
                      onChange={() => handleExpertiseFieldChange(field.id)}
                      className="sr-only"
                    />
                    <span className="text-sm">{field.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bio & Achievements */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                简介与成就
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">个人简介</label>
                  <textarea
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入个人简介"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">主要成就</label>
                  <textarea
                    name="achievements"
                    rows={3}
                    value={formData.achievements}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入主要成就"
                  />
                </div>
              </div>
            </div>

            {/* Education */}
            <DynamicListInput
              label="教育背景"
              icon={<GraduationCap className="w-5 h-5 text-blue-600" />}
              items={formData.education}
              onChange={(items) => setFormData(prev => ({ ...prev, education: items }))}
              placeholder="如：1992年 清华大学环境工程系 博士"
            />

            {/* Experience */}
            <DynamicListInput
              label="工作经历"
              icon={<Briefcase className="w-5 h-5 text-blue-600" />}
              items={formData.experience}
              onChange={(items) => setFormData(prev => ({ ...prev, experience: items }))}
              placeholder="如：2010年至今 中国建筑设计研究院 总工程师"
            />

            {/* Research Areas */}
            <DynamicListInput
              label="研究方向"
              icon={<BookOpen className="w-5 h-5 text-blue-600" />}
              items={formData.researchAreas}
              onChange={(items) => setFormData(prev => ({ ...prev, researchAreas: items }))}
              placeholder="如：超高层建筑给排水"
            />

            {/* Projects */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  代表项目
                </h3>
                <button
                  type="button"
                  onClick={addProject}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  添加项目
                </button>
              </div>
              <div className="space-y-4">
                {formData.projects.length === 0 ? (
                  <p className="text-sm text-gray-500 py-2">暂无项目，点击"添加项目"按钮添加</p>
                ) : (
                  formData.projects.map((project, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-gray-700">项目 {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeProject(index)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            value={project.name}
                            onChange={(e) => updateProject(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="项目名称"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={project.year}
                            onChange={(e) => updateProject(index, 'year', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="年份"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={project.role}
                            onChange={(e) => updateProject(index, 'role', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="担任角色"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <textarea
                            value={project.description}
                            onChange={(e) => updateProject(index, 'description', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="项目描述"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Publications */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  代表论文
                </h3>
                <button
                  type="button"
                  onClick={addPublication}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  添加论文
                </button>
              </div>
              <div className="space-y-4">
                {formData.publications.length === 0 ? (
                  <p className="text-sm text-gray-500 py-2">暂无论文，点击"添加论文"按钮添加</p>
                ) : (
                  formData.publications.map((pub, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-gray-700">论文 {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removePublication(index)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            value={pub.title}
                            onChange={(e) => updatePublication(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="论文标题"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={pub.year}
                            onChange={(e) => updatePublication(index, 'year', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="发表年份"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={pub.journal}
                            onChange={(e) => updatePublication(index, 'journal', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="期刊名称"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Awards */}
            <DynamicListInput
              label="荣誉奖项"
              icon={<Trophy className="w-5 h-5 text-blue-600" />}
              items={formData.awards}
              onChange={(items) => setFormData(prev => ({ ...prev, awards: items }))}
              placeholder="如：2020年 全国工程勘察设计大师"
            />

            {/* Status */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4">发布状态</h3>
              <div>
                <label className="block text-sm text-gray-700 mb-2">状态 *</label>
                <select
                  name="status"
                  required
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                disabled={submitting}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
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

// View Expert Modal Component
interface ViewExpertModalProps {
  expert: ExpertResponse;
  onClose: () => void;
  onEdit: () => void;
  getStatusBadge: (status: number) => JSX.Element;
}

function ViewExpertModal({ expert, onClose, onEdit, getStatusBadge }: ViewExpertModalProps) {
  const education = parseJsonArray<string>(expert.education);
  const experience = parseJsonArray<string>(expert.experience);
  const researchAreas = parseJsonArray<string>(expert.researchAreas);
  const projects = parseJsonArray<ProjectItem>(expert.projects);
  const publications = parseJsonArray<PublicationItem>(expert.publications);
  const awards = parseJsonArray<string>(expert.awards);

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
            <div className="bg-gray-50 rounded-lg p-6">
              {/* 头像和基本信息 */}
              <div className="flex items-start gap-6 mb-6 pb-6 border-b border-gray-200">
                {/* 头像 */}
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-white shadow-lg">
                  {expert.avatar ? (
                    <img src={expert.avatar} alt={expert.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50">
                      <User className="w-10 h-10 text-blue-400" />
                    </div>
                  )}
                </div>
                {/* 姓名职称 */}
                <div className="flex-1 pt-2">
                  <div className="text-xl font-medium text-gray-900 mb-1">{expert.name}</div>
                  <div className="text-sm text-blue-600 mb-1">{expert.title || '-'}</div>
                  <div className="text-sm text-gray-500">{expert.organization || '-'}</div>
                </div>
              </div>
              {/* 联系信息 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    手机号码
                  </div>
                  <div className="text-sm text-gray-900">{expert.phone || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    邮箱地址
                  </div>
                  <div className="text-sm text-gray-900">{expert.email || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    所在地区
                  </div>
                  <div className="text-sm text-gray-900">{expert.location || '-'}</div>
                </div>
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
                {expert.expertiseFields && expert.expertiseFields.length > 0 ? (
                  expert.expertiseFields.map((field) => (
                    <span key={field.id} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                      {field.name}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">暂无专业领域</span>
                )}
              </div>
            </div>
          </div>

          {/* Bio & Achievements */}
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              简介与成就
            </h3>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">个人简介</div>
                <div className="text-sm text-gray-700 leading-relaxed">{expert.bio || '-'}</div>
              </div>
              {expert.achievements && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">主要成就</div>
                  <div className="text-sm text-gray-700 leading-relaxed">{expert.achievements}</div>
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          {education.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                教育背景
              </h3>
              <div className="space-y-2">
                {education.map((edu, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">{edu}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                工作经历
              </h3>
              <div className="space-y-2">
                {experience.map((exp, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">{exp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Research Areas */}
          {researchAreas.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                研究方向
              </h3>
              <div className="flex flex-wrap gap-2">
                {researchAreas.map((area, index) => (
                  <span key={index} className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg border border-blue-200 text-sm">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                代表项目
              </h3>
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{project.name}</h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{project.year}</span>
                    </div>
                    <p className="text-xs text-blue-600 mb-2">{project.role}</p>
                    <p className="text-sm text-gray-600">{project.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Publications */}
          {publications.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                代表论文
              </h3>
              <div className="space-y-3">
                {publications.map((pub, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-sm text-gray-900 mb-1">{pub.title}</h4>
                        <p className="text-xs text-gray-600">{pub.journal}</p>
                      </div>
                      <span className="text-xs text-gray-500">{pub.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Awards */}
          {awards.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-600" />
                荣誉奖项
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {awards.map((award, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <Trophy className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{award}</p>
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
                <div className="mt-1">{getStatusBadge(expert.status)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">创建时间</div>
                <div className="text-sm text-gray-900">
                  {expert.createdTime ? new Date(expert.createdTime).toLocaleString('zh-CN') : '-'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">更新时间</div>
                <div className="text-sm text-gray-900">
                  {expert.updatedTime ? new Date(expert.updatedTime).toLocaleString('zh-CN') : '-'}
                </div>
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
