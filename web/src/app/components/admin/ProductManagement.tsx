import { Search, Filter, Plus, MoreVertical, CheckCircle, Clock, Edit, Trash2, Eye, X, FileText, Building2, Tag, Image, DollarSign, Package, Phone, Mail, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Pagination } from './Pagination';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCategories,
} from '@/lib/api';
import type {
  ProductListResponse,
  ProductResponse,
  ProductRequest,
  ProductCategoryResponse,
  ProductStatus,
} from '@/types/product';
import { productStatusLabels } from '@/types/product';

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
  manufacturer: string;
  model: string;
  price: string;
  summary: string;
  description: string;
  specifications: string;
  features: string;
  application: string;
  certifications: string[];
  contact: string;
  contactPhone: string;
  contactEmail: string;
  website: string;
  status: number;
  featured: boolean;
  images: string[];
}

const emptyFormData: FormData = {
  name: '',
  categoryId: undefined,
  manufacturer: '',
  model: '',
  price: '',
  summary: '',
  description: '',
  specifications: '',
  features: '',
  application: '',
  certifications: [],
  contact: '',
  contactPhone: '',
  contactEmail: '',
  website: '',
  status: 0,
  featured: false,
  images: [],
};

export function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<number | undefined>(undefined);
  const [filterCategory, setFilterCategory] = useState<number | undefined>(undefined);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [products, setProducts] = useState<ProductListResponse[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ProductCategoryResponse[]>([]);
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

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

  // 加载分类列表
  useEffect(() => {
    const loadCategories = async () => {
      const result = await getProductCategories();
      if (result.success && result.data) {
        setCategories(result.data);
      }
    };
    loadCategories();
  }, []);

  // 加载产品列表
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getProducts({
        page: currentPage - 1,
        size: itemsPerPage,
        status: filterStatus,
        categoryId: filterCategory,
        keyword: searchTerm || undefined,
      });
      if (result.success && result.data) {
        setProducts(result.data.content);
        setTotalItems(result.data.page.totalElements);
        setTotalPages(result.data.page.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filterStatus, filterCategory, searchTerm]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // 搜索时重置页码
  const handleSearch = () => {
    setCurrentPage(1);
  };

  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case 1:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            {productStatusLabels[1]}
          </span>
        );
      case 0:
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">
            <FileText className="w-3 h-3" />
            {productStatusLabels[0]}
          </span>
        );
    }
  };

  const handleAdd = () => {
    setFormData(emptyFormData);
    setFieldErrors({});
    setShowAddModal(true);
  };

  const handleView = async (product: ProductListResponse) => {
    const result = await getProductById(product.id);
    if (result.success && result.data) {
      setSelectedProduct(result.data);
      setShowViewModal(true);
    }
  };

  const handleEdit = async (product: ProductListResponse) => {
    const result = await getProductById(product.id);
    if (result.success && result.data) {
      const p = result.data;
      setSelectedProduct(p);
      setFieldErrors({});
      setFormData({
        name: p.name,
        categoryId: p.category?.id,
        manufacturer: p.manufacturer || '',
        model: p.model || '',
        price: p.price || '',
        summary: p.summary || '',
        description: p.description || '',
        specifications: p.specifications || '',
        features: p.features || '',
        application: p.application || '',
        certifications: parseJsonArray(p.certifications),
        contact: p.contact || '',
        contactPhone: p.contactPhone || '',
        contactEmail: p.contactEmail || '',
        website: p.website || '',
        status: p.status,
        featured: p.featured || false,
        images: parseJsonArray(p.images),
      });
      setShowEditModal(true);
    }
  };

  const handleDelete = async (product: ProductListResponse) => {
    const result = await getProductById(product.id);
    if (result.success && result.data) {
      setSelectedProduct(result.data);
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

  const handleCertificationsChange = (value: string) => {
    const certificationsArray = value.split(',').map(c => c.trim()).filter(c => c);
    setFormData(prev => ({
      ...prev,
      certifications: certificationsArray
    }));
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    try {
      const request: ProductRequest = {
        name: formData.name,
        categoryId: formData.categoryId,
        manufacturer: formData.manufacturer || undefined,
        model: formData.model || undefined,
        price: formData.price || undefined,
        summary: formData.summary || undefined,
        description: formData.description || undefined,
        specifications: formData.specifications || undefined,
        features: formData.features || undefined,
        application: formData.application || undefined,
        certifications: formData.certifications.length > 0 ? toJsonString(formData.certifications) : undefined,
        contact: formData.contact || undefined,
        contactPhone: formData.contactPhone || undefined,
        contactEmail: formData.contactEmail || undefined,
        website: formData.website || undefined,
        status: formData.status,
        featured: formData.featured,
        images: formData.images.length > 0 ? toJsonString(formData.images) : undefined,
      };
      const result = await createProduct(request);
      if (result.success) {
        setShowAddModal(false);
        loadProducts();
      } else {
        parseValidationErrors(result as { fieldErrors?: Record<string, string>; errors?: Record<string, string> });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSubmitting(true);
    setFieldErrors({});
    try {
      const request: ProductRequest = {
        name: formData.name,
        categoryId: formData.categoryId,
        manufacturer: formData.manufacturer || undefined,
        model: formData.model || undefined,
        price: formData.price || undefined,
        summary: formData.summary || undefined,
        description: formData.description || undefined,
        specifications: formData.specifications || undefined,
        features: formData.features || undefined,
        application: formData.application || undefined,
        certifications: formData.certifications.length > 0 ? toJsonString(formData.certifications) : undefined,
        contact: formData.contact || undefined,
        contactPhone: formData.contactPhone || undefined,
        contactEmail: formData.contactEmail || undefined,
        website: formData.website || undefined,
        status: formData.status,
        featured: formData.featured,
        images: formData.images.length > 0 ? toJsonString(formData.images) : undefined,
      };
      const result = await updateProduct(selectedProduct.id, request);
      if (result.success) {
        setShowEditModal(false);
        setSelectedProduct(null);
        loadProducts();
      } else {
        parseValidationErrors(result as { fieldErrors?: Record<string, string>; errors?: Record<string, string> });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    setSubmitting(true);
    try {
      const result = await deleteProduct(selectedProduct.id);
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedProduct(null);
        loadProducts();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl text-gray-900 mb-2">产品管理</h2>
        <p className="text-gray-600">管理产品信息和技术推广</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索产品名称、分类或厂商..."
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
            <span>添加产品</span>
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
          共 {totalItems} 个产品
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
                    产品信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    分类
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    厂商
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    价格
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
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          {product.name}
                          {product.featured && (
                            <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs">推荐</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{product.model}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">{product.summary}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.categoryName && (
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs">
                          {product.categoryName}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{product.manufacturer}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{product.price || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Eye className="w-4 h-4" />
                        <span>{product.views?.toLocaleString() ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          className="p-1 text-gray-400 hover:text-gray-600"
                          onClick={() => setOpenDropdown(openDropdown === product.id ? null : product.id)}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openDropdown === product.id && (
                          <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              onClick={() => {
                                handleView(product);
                                setOpenDropdown(null);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                              查看
                            </button>
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              onClick={() => {
                                handleEdit(product);
                                setOpenDropdown(null);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                              编辑
                            </button>
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                              onClick={() => {
                                handleDelete(product);
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
        <ProductModal
          title="添加产品"
          formData={formData}
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleSubmitAdd}
          onFormChange={handleFormChange}
          onCertificationsChange={handleCertificationsChange}
          submitting={submitting}
          fieldErrors={fieldErrors}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedProduct && (
        <ProductModal
          title="编辑产品"
          formData={formData}
          categories={categories}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleSubmitEdit}
          onFormChange={handleFormChange}
          onCertificationsChange={handleCertificationsChange}
          submitting={submitting}
          fieldErrors={fieldErrors}
        />
      )}

      {/* View Modal */}
      {showViewModal && selectedProduct && (
        <ViewProductModal
          product={selectedProduct}
          onClose={() => setShowViewModal(false)}
          onEdit={() => {
            setShowViewModal(false);
            // 重新加载详情并打开编辑模态框
            setFormData({
              name: selectedProduct.name,
              categoryId: selectedProduct.category?.id,
              manufacturer: selectedProduct.manufacturer || '',
              model: selectedProduct.model || '',
              price: selectedProduct.price || '',
              summary: selectedProduct.summary || '',
              description: selectedProduct.description || '',
              specifications: selectedProduct.specifications || '',
              features: selectedProduct.features || '',
              application: selectedProduct.application || '',
              certifications: parseJsonArray(selectedProduct.certifications),
              contact: selectedProduct.contact || '',
              contactPhone: selectedProduct.contactPhone || '',
              contactEmail: selectedProduct.contactEmail || '',
              website: selectedProduct.website || '',
              status: selectedProduct.status,
              featured: selectedProduct.featured || false,
              images: parseJsonArray(selectedProduct.images),
            });
            setShowEditModal(true);
          }}
          getStatusBadge={getStatusBadge}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl text-gray-900 mb-4">删除产品</h3>
            <p className="text-sm text-gray-600 mb-4">确定要删除产品 <strong>{selectedProduct.name}</strong> 吗？</p>
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

// Field errors type
type FieldErrors = {[key: string]: string};

// Product Modal Component
interface ProductModalProps {
  title: string;
  formData: FormData;
  categories: ProductCategoryResponse[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: unknown } }) => void;
  onCertificationsChange: (value: string) => void;
  submitting: boolean;
  fieldErrors?: FieldErrors;
}

function ProductModal({ title, formData, categories, onClose, onSubmit, onFormChange, onCertificationsChange, submitting, fieldErrors = {} }: ProductModalProps) {
  // Rich text editor configuration - use useMemo to prevent re-creation
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="relative p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl mb-1">{title}</h2>
              <p className="text-sm text-indigo-100">填写产品详细信息</p>
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
                <FileText className="w-5 h-5 text-indigo-600" />
                基本信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">产品名称 *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    maxLength={255}
                    value={formData.name || ''}
                    onChange={onFormChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      fieldErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请输入产品名称"
                  />
                  <div className="flex justify-between mt-1">
                    {fieldErrors.name ? (
                      <span className="text-xs text-red-500">{fieldErrors.name}</span>
                    ) : <span />}
                    <span className="text-xs text-gray-400">{formData.name?.length || 0}/255</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">产品分类</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId ?? ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">请选择</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">产品型号</label>
                  <input
                    type="text"
                    name="model"
                    maxLength={100}
                    value={formData.model || ''}
                    onChange={onFormChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      fieldErrors.model ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请输入产品型号"
                  />
                  <div className="flex justify-between mt-1">
                    {fieldErrors.model ? (
                      <span className="text-xs text-red-500">{fieldErrors.model}</span>
                    ) : <span />}
                    <span className="text-xs text-gray-400">{formData.model?.length || 0}/100</span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">生产厂商</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="manufacturer"
                      maxLength={255}
                      value={formData.manufacturer || ''}
                      onChange={onFormChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        fieldErrors.manufacturer ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="请输入生产厂商"
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    {fieldErrors.manufacturer ? (
                      <span className="text-xs text-red-500">{fieldErrors.manufacturer}</span>
                    ) : <span />}
                    <span className="text-xs text-gray-400">{formData.manufacturer?.length || 0}/255</span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">产品价格</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="price"
                      maxLength={100}
                      value={formData.price || ''}
                      onChange={onFormChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        fieldErrors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="如：¥50,000 或 面议"
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    {fieldErrors.price ? (
                      <span className="text-xs text-red-500">{fieldErrors.price}</span>
                    ) : <span />}
                    <span className="text-xs text-gray-400">{formData.price?.length || 0}/100</span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">产品摘要</label>
                  <textarea
                    name="summary"
                    rows={2}
                    maxLength={500}
                    value={formData.summary || ''}
                    onChange={onFormChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      fieldErrors.summary ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请输入产品摘要（一句话介绍）"
                  />
                  <div className="flex justify-between mt-1">
                    {fieldErrors.summary ? (
                      <span className="text-xs text-red-500">{fieldErrors.summary}</span>
                    ) : <span />}
                    <span className="text-xs text-gray-400">{formData.summary?.length || 0}/500</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                产品详情
              </h3>
              <div className="space-y-4">
                {/* Product Images */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-indigo-600" />
                      产品图片
                    </span>
                  </label>
                  <div className="space-y-3">
                    {/* Image Upload Button */}
                    <div>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors border-2 border-indigo-200">
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
                      <p className="text-xs text-gray-500 mt-2">支持多张图片上传（JPG、PNG、GIF等），图片将转为Base64格式存储</p>
                    </div>

                    {/* Image Preview */}
                    {formData.images && formData.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {formData.images.map((image: string, index: number) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`产品图片 ${index + 1}`}
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

                <div>
                  <label className="block text-sm text-gray-700 mb-2">产品描述</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <ReactQuill
                      value={formData.description || ''}
                      onChange={handleRichTextChange('description')}
                      modules={modules}
                      formats={formats}
                      theme="snow"
                      placeholder="请输入产品详细描述..."
                      style={{ height: '150px', marginBottom: '50px' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">技术规格</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <ReactQuill
                      value={formData.specifications || ''}
                      onChange={handleRichTextChange('specifications')}
                      modules={modules}
                      formats={formats}
                      theme="snow"
                      placeholder="请输入技术参数和规格..."
                      style={{ height: '150px', marginBottom: '50px' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">产品特点</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <ReactQuill
                      value={formData.features || ''}
                      onChange={handleRichTextChange('features')}
                      modules={modules}
                      formats={formats}
                      theme="snow"
                      placeholder="请输入产品特点和优势..."
                      style={{ height: '150px', marginBottom: '50px' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">应用场景</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <ReactQuill
                      value={formData.application || ''}
                      onChange={handleRichTextChange('application')}
                      modules={modules}
                      formats={formats}
                      theme="snow"
                      placeholder="请输入应用场景..."
                      style={{ height: '120px', marginBottom: '50px' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-600" />
                认证信息
              </h3>
              <div>
                <label className="block text-sm text-gray-700 mb-2">产品认证</label>
                <input
                  type="text"
                  name="certifications"
                  value={formData.certifications?.join(', ') || ''}
                  onChange={(e) => onCertificationsChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="请输入产品认证，多个用逗号分隔"
                />
                <p className="text-xs text-gray-500 mt-1">例如：ISO9001, CE认证, 节能产品认证</p>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-indigo-600" />
                联系方式
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">联系人</label>
                  <input
                    type="text"
                    name="contact"
                    maxLength={100}
                    value={formData.contact || ''}
                    onChange={onFormChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      fieldErrors.contact ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请输入联系人"
                  />
                  <div className="flex justify-between mt-1">
                    {fieldErrors.contact ? (
                      <span className="text-xs text-red-500">{fieldErrors.contact}</span>
                    ) : <span />}
                    <span className="text-xs text-gray-400">{formData.contact?.length || 0}/100</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">联系电话</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    maxLength={20}
                    value={formData.contactPhone || ''}
                    onChange={onFormChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      fieldErrors.contactPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请输入联系电话"
                  />
                  <div className="flex justify-between mt-1">
                    {fieldErrors.contactPhone ? (
                      <span className="text-xs text-red-500">{fieldErrors.contactPhone}</span>
                    ) : <span />}
                    <span className="text-xs text-gray-400">{formData.contactPhone?.length || 0}/20</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">联系邮箱</label>
                  <input
                    type="email"
                    name="contactEmail"
                    maxLength={100}
                    value={formData.contactEmail || ''}
                    onChange={onFormChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      fieldErrors.contactEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请输入联系邮箱"
                  />
                  <div className="flex justify-between mt-1">
                    {fieldErrors.contactEmail ? (
                      <span className="text-xs text-red-500">{fieldErrors.contactEmail}</span>
                    ) : <span />}
                    <span className="text-xs text-gray-400">{formData.contactEmail?.length || 0}/100</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">官方网站</label>
                  <input
                    type="text"
                    name="website"
                    maxLength={255}
                    value={formData.website || ''}
                    onChange={onFormChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      fieldErrors.website ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请输入官方网站"
                  />
                  <div className="flex justify-between mt-1">
                    {fieldErrors.website ? (
                      <span className="text-xs text-red-500">{fieldErrors.website}</span>
                    ) : <span />}
                    <span className="text-xs text-gray-400">{formData.website?.length || 0}/255</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Featured */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-indigo-600" />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                      className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">设为推荐产品</span>
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
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
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

// View Product Modal Component
interface ViewProductModalProps {
  product: ProductResponse;
  onClose: () => void;
  onEdit: () => void;
  getStatusBadge: (status: ProductStatus) => JSX.Element;
}

function ViewProductModal({ product, onClose, onEdit, getStatusBadge }: ViewProductModalProps) {
  const images = parseJsonArray(product.images);
  const certifications = parseJsonArray(product.certifications);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="relative p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Eye className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl mb-1">产品详情</h2>
              <p className="text-sm text-indigo-100">查看产品完整信息</p>
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
              <div className="mb-4">
                <h1 className="text-2xl text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center gap-2 mb-3">
                  {product.category && (
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm">
                      {product.category.name}
                    </span>
                  )}
                  {getStatusBadge(product.status)}
                  {product.featured && (
                    <span className="px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs">推荐</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {product.model && (
                    <span className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      型号: {product.model}
                    </span>
                  )}
                  {product.price && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {product.price}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {product.views} 次浏览
                  </span>
                </div>
              </div>
              {product.summary && <p className="text-sm text-gray-700">{product.summary}</p>}
            </div>
          </div>

          {/* Manufacturer */}
          {product.manufacturer && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                生产厂商
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-sm text-gray-900">{product.manufacturer}</div>
              </div>
            </div>
          )}

          {/* Product Images */}
          {images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Image className="w-5 h-5 text-indigo-600" />
                产品图片
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image: string, index: number) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`${product.name} - 图片 ${index + 1}`}
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

          {/* Product Details */}
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              产品详情
            </h3>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              {product.description && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">产品描述</div>
                  <div
                    className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )}
              {product.specifications && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-600 mb-2">技术规格</div>
                  <div
                    className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.specifications }}
                  />
                </div>
              )}
              {product.features && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-600 mb-2">产品特点</div>
                  <div
                    className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.features }}
                  />
                </div>
              )}
              {product.application && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-600 mb-2">应用场景</div>
                  <div
                    className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.application }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Certifications */}
          {certifications.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-600" />
                产品认证
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex flex-wrap gap-2">
                  {certifications.map((cert: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Contact Info */}
          {(product.contact || product.contactPhone || product.contactEmail || product.website) && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-indigo-600" />
                联系方式
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.contact && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">联系人</div>
                      <div className="text-sm text-gray-900">{product.contact}</div>
                    </div>
                  )}
                  {product.contactPhone && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">联系电话</div>
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {product.contactPhone}
                      </div>
                    </div>
                  )}
                  {product.contactEmail && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">联系邮箱</div>
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {product.contactEmail}
                      </div>
                    </div>
                  )}
                  {product.website && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">官方网站</div>
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" />
                        {product.website}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={onEdit}
              className="flex-1 px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              编辑产品
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
