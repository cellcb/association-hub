import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  X,
  FileText,
  Building2,
  Tag,
  Image,
  Phone,
  Mail,
  Link as LinkIcon,
  Loader2,
  MapPin,
  Globe,
  Calendar,
  Users,
  Award,
  Briefcase,
  Star
} from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Pagination } from './Pagination';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  getManufacturers,
  getManufacturerById,
  createManufacturer,
  updateManufacturer,
  deleteManufacturer,
  getManufacturerCategories,
} from '@/lib/api';
import type {
  ManufacturerListResponse,
  ManufacturerResponse,
  ManufacturerRequest,
  ManufacturerCategoryResponse,
  ManufacturerStatus,
} from '@/types/manufacturer';

// 解析 JSON 字符串为数组
function parseJsonArray(json: string | null): string[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

// 数组转 JSON 字符串
function toJsonString(arr: string[]): string {
  return JSON.stringify(arr);
}

// 表单数据接口
interface FormData {
  name: string;
  categoryId?: number;
  logo: string;
  summary: string;
  description: string;
  contactPhone: string;
  contactEmail: string;
  contactPerson: string;
  address: string;
  website: string;
  establishedDate: string;
  registeredCapital: string;
  employeeScale: string;
  mainBusiness: string;
  qualifications: string[];
  honors: string[];
  cases: string[];
  images: string[];
  status: number;
  featured: boolean;
}

const emptyFormData: FormData = {
  name: '',
  categoryId: undefined,
  logo: '',
  summary: '',
  description: '',
  contactPhone: '',
  contactEmail: '',
  contactPerson: '',
  address: '',
  website: '',
  establishedDate: '',
  registeredCapital: '',
  employeeScale: '',
  mainBusiness: '',
  qualifications: [],
  honors: [],
  cases: [],
  images: [],
  status: 0,
  featured: false,
};

const statusLabels: Record<ManufacturerStatus, string> = {
  0: '草稿',
  1: '已发布',
};

export function ManufacturerManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<number | undefined>(undefined);
  const [filterCategory, setFilterCategory] = useState<number | undefined>(undefined);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState<ManufacturerResponse | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [manufacturers, setManufacturers] = useState<ManufacturerListResponse[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ManufacturerCategoryResponse[]>([]);
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [submitting, setSubmitting] = useState(false);

  // 加载分类列表
  useEffect(() => {
    const loadCategories = async () => {
      const result = await getManufacturerCategories();
      if (result.success && result.data) {
        setCategories(result.data);
      }
    };
    loadCategories();
  }, []);

  // 加载厂商列表
  const loadManufacturers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getManufacturers({
        page: currentPage - 1,
        size: itemsPerPage,
        status: filterStatus,
        categoryId: filterCategory,
        keyword: searchTerm || undefined,
      });
      if (result.success && result.data) {
        setManufacturers(result.data.content);
        setTotalItems(result.data.page.totalElements);
        setTotalPages(result.data.page.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filterStatus, filterCategory, searchTerm]);

  useEffect(() => {
    loadManufacturers();
  }, [loadManufacturers]);

  // 搜索时重置页码
  const handleSearch = () => {
    setCurrentPage(1);
  };

  const getStatusBadge = (status: ManufacturerStatus) => {
    switch (status) {
      case 1:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            {statusLabels[1]}
          </span>
        );
      case 0:
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">
            <FileText className="w-3 h-3" />
            {statusLabels[0]}
          </span>
        );
    }
  };

  const handleAdd = () => {
    setFormData(emptyFormData);
    setShowAddModal(true);
  };

  const handleView = async (manufacturer: ManufacturerListResponse) => {
    const result = await getManufacturerById(manufacturer.id);
    if (result.success && result.data) {
      setSelectedManufacturer(result.data);
      setShowViewModal(true);
    }
  };

  const handleEdit = async (manufacturer: ManufacturerListResponse) => {
    const result = await getManufacturerById(manufacturer.id);
    if (result.success && result.data) {
      const m = result.data;
      setSelectedManufacturer(m);
      setFormData({
        name: m.name,
        categoryId: m.category?.id,
        logo: m.logo || '',
        summary: m.summary || '',
        description: m.description || '',
        contactPhone: m.contactPhone || '',
        contactEmail: m.contactEmail || '',
        contactPerson: m.contactPerson || '',
        address: m.address || '',
        website: m.website || '',
        establishedDate: m.establishedDate || '',
        registeredCapital: m.registeredCapital || '',
        employeeScale: m.employeeScale || '',
        mainBusiness: m.mainBusiness || '',
        qualifications: parseJsonArray(m.qualifications),
        honors: parseJsonArray(m.honors),
        cases: parseJsonArray(m.cases),
        images: parseJsonArray(m.images),
        status: m.status,
        featured: m.featured,
      });
      setShowEditModal(true);
    }
  };

  const handleDelete = async (manufacturer: ManufacturerListResponse) => {
    const result = await getManufacturerById(manufacturer.id);
    if (result.success && result.data) {
      setSelectedManufacturer(result.data);
      setShowDeleteModal(true);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: unknown } }) => {
    const { name, value } = e.target;
    const type = 'type' in e.target ? e.target.type : undefined;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const request: ManufacturerRequest = {
        name: formData.name,
        categoryId: formData.categoryId,
        logo: formData.logo || undefined,
        summary: formData.summary || undefined,
        description: formData.description || undefined,
        contactPhone: formData.contactPhone || undefined,
        contactEmail: formData.contactEmail || undefined,
        contactPerson: formData.contactPerson || undefined,
        address: formData.address || undefined,
        website: formData.website || undefined,
        establishedDate: formData.establishedDate || undefined,
        registeredCapital: formData.registeredCapital || undefined,
        employeeScale: formData.employeeScale || undefined,
        mainBusiness: formData.mainBusiness || undefined,
        qualifications: formData.qualifications.length > 0 ? toJsonString(formData.qualifications) : undefined,
        honors: formData.honors.length > 0 ? toJsonString(formData.honors) : undefined,
        cases: formData.cases.length > 0 ? toJsonString(formData.cases) : undefined,
        images: formData.images.length > 0 ? toJsonString(formData.images) : undefined,
        status: formData.status,
        featured: formData.featured,
      };
      const result = await createManufacturer(request);
      if (result.success) {
        setShowAddModal(false);
        loadManufacturers();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManufacturer) return;
    setSubmitting(true);
    try {
      const request: ManufacturerRequest = {
        name: formData.name,
        categoryId: formData.categoryId,
        logo: formData.logo || undefined,
        summary: formData.summary || undefined,
        description: formData.description || undefined,
        contactPhone: formData.contactPhone || undefined,
        contactEmail: formData.contactEmail || undefined,
        contactPerson: formData.contactPerson || undefined,
        address: formData.address || undefined,
        website: formData.website || undefined,
        establishedDate: formData.establishedDate || undefined,
        registeredCapital: formData.registeredCapital || undefined,
        employeeScale: formData.employeeScale || undefined,
        mainBusiness: formData.mainBusiness || undefined,
        qualifications: formData.qualifications.length > 0 ? toJsonString(formData.qualifications) : undefined,
        honors: formData.honors.length > 0 ? toJsonString(formData.honors) : undefined,
        cases: formData.cases.length > 0 ? toJsonString(formData.cases) : undefined,
        images: formData.images.length > 0 ? toJsonString(formData.images) : undefined,
        status: formData.status,
        featured: formData.featured,
      };
      const result = await updateManufacturer(selectedManufacturer.id, request);
      if (result.success) {
        setShowEditModal(false);
        setSelectedManufacturer(null);
        loadManufacturers();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedManufacturer) return;
    setSubmitting(true);
    try {
      const result = await deleteManufacturer(selectedManufacturer.id);
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedManufacturer(null);
        loadManufacturers();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl text-gray-900 mb-2">厂商管理</h2>
        <p className="text-gray-600">管理合作厂商信息和展示</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索厂商名称、主营业务..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
            onClick={handleAdd}
          >
            <Plus className="w-5 h-5" />
            <span>添加厂商</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">筛选:</span>
          </div>

          <select
            value={filterCategory ?? ''}
            onChange={(e) => {
              setFilterCategory(e.target.value ? Number(e.target.value) : undefined);
              setCurrentPage(1);
            }}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">全部分类</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={filterStatus ?? ''}
            onChange={(e) => {
              setFilterStatus(e.target.value !== '' ? Number(e.target.value) : undefined);
              setCurrentPage(1);
            }}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">全部状态</option>
            <option value="1">已发布</option>
            <option value="0">草稿</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          共 {totalItems} 个厂商
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
                    厂商信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    分类
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    地址
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
                {manufacturers.map((manufacturer) => (
                  <tr key={manufacturer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {manufacturer.logo ? (
                            <ImageWithFallback src={manufacturer.logo} alt={manufacturer.name} className="w-full h-full object-contain" />
                          ) : (
                            <Building2 className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm text-gray-900 flex items-center gap-2">
                            {manufacturer.name}
                            {manufacturer.featured && (
                              <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs">推荐</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">{manufacturer.summary || manufacturer.mainBusiness || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {manufacturer.categoryName && (
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs">
                          {manufacturer.categoryName}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-[150px] truncate">{manufacturer.address || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Eye className="w-4 h-4" />
                        <span>{manufacturer.views?.toLocaleString() ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(manufacturer.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          className="p-1 text-gray-400 hover:text-gray-600"
                          onClick={() => setOpenDropdown(openDropdown === manufacturer.id ? null : manufacturer.id)}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openDropdown === manufacturer.id && (
                          <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              onClick={() => {
                                handleView(manufacturer);
                                setOpenDropdown(null);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                              查看
                            </button>
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              onClick={() => {
                                handleEdit(manufacturer);
                                setOpenDropdown(null);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                              编辑
                            </button>
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                              onClick={() => {
                                handleDelete(manufacturer);
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <ManufacturerModal
          title="添加厂商"
          formData={formData}
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleSubmitAdd}
          onFormChange={handleFormChange}
          submitting={submitting}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedManufacturer && (
        <ManufacturerModal
          title="编辑厂商"
          formData={formData}
          categories={categories}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleSubmitEdit}
          onFormChange={handleFormChange}
          submitting={submitting}
        />
      )}

      {/* View Modal */}
      {showViewModal && selectedManufacturer && (
        <ViewManufacturerModal
          manufacturer={selectedManufacturer}
          onClose={() => setShowViewModal(false)}
          onEdit={() => {
            setShowViewModal(false);
            setFormData({
              name: selectedManufacturer.name,
              categoryId: selectedManufacturer.category?.id,
              logo: selectedManufacturer.logo || '',
              summary: selectedManufacturer.summary || '',
              description: selectedManufacturer.description || '',
              contactPhone: selectedManufacturer.contactPhone || '',
              contactEmail: selectedManufacturer.contactEmail || '',
              contactPerson: selectedManufacturer.contactPerson || '',
              address: selectedManufacturer.address || '',
              website: selectedManufacturer.website || '',
              establishedDate: selectedManufacturer.establishedDate || '',
              registeredCapital: selectedManufacturer.registeredCapital || '',
              employeeScale: selectedManufacturer.employeeScale || '',
              mainBusiness: selectedManufacturer.mainBusiness || '',
              qualifications: parseJsonArray(selectedManufacturer.qualifications),
              honors: parseJsonArray(selectedManufacturer.honors),
              cases: parseJsonArray(selectedManufacturer.cases),
              images: parseJsonArray(selectedManufacturer.images),
              status: selectedManufacturer.status,
              featured: selectedManufacturer.featured,
            });
            setShowEditModal(true);
          }}
          getStatusBadge={getStatusBadge}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedManufacturer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl text-gray-900 mb-4">删除厂商</h3>
            <p className="text-sm text-gray-600 mb-4">确定要删除厂商 <strong>{selectedManufacturer.name}</strong> 吗？</p>
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

// Manufacturer Modal Component
interface ManufacturerModalProps {
  title: string;
  formData: FormData;
  categories: ManufacturerCategoryResponse[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: unknown } }) => void;
  submitting: boolean;
}

function ManufacturerModal({ title, formData, categories, onClose, onSubmit, onFormChange, submitting }: ManufacturerModalProps) {
  // Rich text editor configuration
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }],
      ['link'],
      ['clean']
    ],
  }), []);

  const formats = useMemo(() => [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'color',
    'link'
  ], []);

  const handleRichTextChange = useCallback((field: string) => (value: string) => {
    onFormChange({ target: { name: field, value } });
  }, [onFormChange]);

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onFormChange({ target: { name: 'logo', value: event.target?.result as string } });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const readers = fileArray.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              resolve(e.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then(results => {
        const existingImages = formData.images || [];
        onFormChange({
          target: {
            name: 'images',
            value: [...existingImages, ...results]
          }
        });
      });
    }
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    onFormChange({ target: { name: 'images', value: newImages } });
  };

  // Array field helpers
  const handleArrayChange = (field: 'qualifications' | 'honors' | 'cases', value: string) => {
    const arr = value.split(',').map(s => s.trim()).filter(s => s);
    onFormChange({ target: { name: field, value: arr } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="relative p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl mb-1">{title}</h2>
              <p className="text-sm text-blue-100">填写厂商详细信息</p>
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
                <FileText className="w-5 h-5 text-blue-600" />
                基本信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">厂商名称 *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入厂商名称"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">所属分类</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId ?? ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请选择分类</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">企业LOGO</label>
                  <div className="flex items-center gap-4">
                    {formData.logo && (
                      <div className="w-16 h-16 border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback src={formData.logo} alt="Logo" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors border-2 border-blue-200">
                      <Image className="w-5 h-5" />
                      <span className="font-medium text-sm">上传LOGO</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">企业简介</label>
                  <textarea
                    name="summary"
                    rows={2}
                    value={formData.summary || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入企业简介（一句话介绍）"
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                联系方式
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">联系人</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入联系人"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">联系电话</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入联系电话"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">联系邮箱</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入联系邮箱"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">地址</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address || ''}
                      onChange={onFormChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入企业地址"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">官方网站</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="website"
                      value={formData.website || ''}
                      onChange={onFormChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                企业详情
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">成立时间</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="establishedDate"
                      value={formData.establishedDate || ''}
                      onChange={onFormChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">注册资本</label>
                  <input
                    type="text"
                    name="registeredCapital"
                    value={formData.registeredCapital || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="如: 1000万元"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">员工规模</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="employeeScale"
                      value={formData.employeeScale || ''}
                      onChange={onFormChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="如: 100-500人"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">企业介绍</label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <ReactQuill
                    value={formData.description || ''}
                    onChange={handleRichTextChange('description')}
                    modules={modules}
                    formats={formats}
                    theme="snow"
                    placeholder="请输入企业详细介绍..."
                    style={{ height: '150px', marginBottom: '50px' }}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-700 mb-2">主营业务</label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <ReactQuill
                    value={formData.mainBusiness || ''}
                    onChange={handleRichTextChange('mainBusiness')}
                    modules={modules}
                    formats={formats}
                    theme="snow"
                    placeholder="请输入主营业务..."
                    style={{ height: '120px', marginBottom: '50px' }}
                  />
                </div>
              </div>
            </div>

            {/* Certifications & Honors */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                资质荣誉
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">资质认证</label>
                  <input
                    type="text"
                    value={formData.qualifications?.join(', ') || ''}
                    onChange={(e) => handleArrayChange('qualifications', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入资质认证，多个用逗号分隔"
                  />
                  <p className="text-xs text-gray-500 mt-1">例如：ISO9001, CE认证, 高新技术企业</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">荣誉资质</label>
                  <input
                    type="text"
                    value={formData.honors?.join(', ') || ''}
                    onChange={(e) => handleArrayChange('honors', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入荣誉资质，多个用逗号分隔"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">合作案例</label>
                  <input
                    type="text"
                    value={formData.cases?.join(', ') || ''}
                    onChange={(e) => handleArrayChange('cases', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入合作案例，多个用逗号分隔"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Image className="w-5 h-5 text-blue-600" />
                图片展示
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors border-2 border-blue-200">
                    <Image className="w-5 h-5" />
                    <span className="font-medium">上传图片</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">支持多张图片上传（JPG、PNG等）</p>
                </div>

                {formData.images && formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {formData.images.map((image: string, index: number) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`图片 ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Status & Featured */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                发布设置
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">状态 *</label>
                  <select
                    name="status"
                    required
                    value={formData.status}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0}>草稿</option>
                    <option value={1}>已发布</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured || false}
                      onChange={onFormChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      设为推荐厂商
                    </span>
                  </label>
                </div>
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
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
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

// View Manufacturer Modal Component
interface ViewManufacturerModalProps {
  manufacturer: ManufacturerResponse;
  onClose: () => void;
  onEdit: () => void;
  getStatusBadge: (status: ManufacturerStatus) => JSX.Element;
}

function ViewManufacturerModal({ manufacturer, onClose, onEdit, getStatusBadge }: ViewManufacturerModalProps) {
  const images = parseJsonArray(manufacturer.images);
  const qualifications = parseJsonArray(manufacturer.qualifications);
  const honors = parseJsonArray(manufacturer.honors);
  const cases = parseJsonArray(manufacturer.cases);

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
              <h2 className="text-2xl md:text-3xl mb-1">厂商详情</h2>
              <p className="text-sm text-blue-100">查看厂商完整信息</p>
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
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start gap-4 mb-4">
                {manufacturer.logo ? (
                  <div className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                    <ImageWithFallback src={manufacturer.logo} alt={manufacturer.name} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-2xl text-gray-900 mb-2">{manufacturer.name}</h1>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {manufacturer.category && (
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm">
                        {manufacturer.category.name}
                      </span>
                    )}
                    {getStatusBadge(manufacturer.status)}
                    {manufacturer.featured && (
                      <span className="px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        推荐
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {manufacturer.views} 次浏览
                    </span>
                    {manufacturer.establishedDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        成立于 {manufacturer.establishedDate}
                      </span>
                    )}
                    {manufacturer.employeeScale && (
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {manufacturer.employeeScale}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {manufacturer.summary && <p className="text-sm text-gray-700">{manufacturer.summary}</p>}
            </div>
          </div>

          {/* Contact Info */}
          {(manufacturer.contactPerson || manufacturer.contactPhone || manufacturer.contactEmail || manufacturer.address || manufacturer.website) && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                联系方式
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {manufacturer.contactPerson && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">联系人</div>
                      <div className="text-sm text-gray-900">{manufacturer.contactPerson}</div>
                    </div>
                  )}
                  {manufacturer.contactPhone && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">联系电话</div>
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {manufacturer.contactPhone}
                      </div>
                    </div>
                  )}
                  {manufacturer.contactEmail && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">联系邮箱</div>
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {manufacturer.contactEmail}
                      </div>
                    </div>
                  )}
                  {manufacturer.website && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">官方网站</div>
                      <div className="text-sm text-blue-600 flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" />
                        <a href={manufacturer.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {manufacturer.website}
                        </a>
                      </div>
                    </div>
                  )}
                  {manufacturer.address && (
                    <div className="md:col-span-2">
                      <div className="text-xs text-gray-500 mb-1">地址</div>
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {manufacturer.address}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Company Details */}
          {(manufacturer.description || manufacturer.mainBusiness || manufacturer.registeredCapital) && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                企业详情
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                {manufacturer.registeredCapital && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">注册资本</div>
                    <div className="text-sm text-gray-900">{manufacturer.registeredCapital}</div>
                  </div>
                )}
                {manufacturer.description && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="text-sm text-gray-600 mb-2">企业介绍</div>
                    <div
                      className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: manufacturer.description }}
                    />
                  </div>
                )}
                {manufacturer.mainBusiness && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="text-sm text-gray-600 mb-2">主营业务</div>
                    <div
                      className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: manufacturer.mainBusiness }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Images */}
          {images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Image className="w-5 h-5 text-blue-600" />
                图片展示
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image: string, index: number) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`${manufacturer.name} - 图片 ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => window.open(image, '_blank')}
                      />
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                        {index + 1} / {images.length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Certifications & Honors */}
          {(qualifications.length > 0 || honors.length > 0 || cases.length > 0) && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                资质荣誉
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                {qualifications.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">资质认证</div>
                    <div className="flex flex-wrap gap-2">
                      {qualifications.map((item: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {honors.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="text-sm text-gray-600 mb-2">荣誉资质</div>
                    <div className="flex flex-wrap gap-2">
                      {honors.map((item: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {cases.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="text-sm text-gray-600 mb-2">合作案例</div>
                    <div className="flex flex-wrap gap-2">
                      {cases.map((item: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={onEdit}
              className="flex-1 px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              编辑厂商
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
