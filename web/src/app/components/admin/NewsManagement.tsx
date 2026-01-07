import { Search, Filter, Plus, MoreVertical, CheckCircle, XCircle, Clock, Edit, Trash2, Eye, X, FileText, User, Calendar, Tag, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Pagination } from './Pagination';
import type { NewsListResponse, NewsRequest, NewsStatus, NewsCategoryResponse, TagResponse } from '@/types/news';
import { newsStatusLabels } from '@/types/news';
import type { Page } from '@/types/member';
import {
  getNewsList,
  createNews,
  updateNews,
  deleteNews as deleteNewsApi,
  getNewsCategories,
  getTags,
  createTag,
} from '@/lib/api';

// Rich text editor formats - defined outside component to prevent re-creation
const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'color', 'background',
  'align',
  'link', 'image'
];

// 表单数据类型（用于创建/编辑）
interface NewsFormData {
  title?: string;
  excerpt?: string;
  content?: string;
  categoryId?: number;
  author?: string;
  coverImage?: string;
  featured?: boolean;
  status?: number;
  tagIds?: number[];
}

export function NewsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsListResponse | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // API 数据状态
  const [newsList, setNewsList] = useState<NewsListResponse[]>([]);
  const [newsPage, setNewsPage] = useState<Page<NewsListResponse> | null>(null);
  const [categories, setCategories] = useState<NewsCategoryResponse[]>([]);
  const [allTags, setAllTags] = useState<TagResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [formData, setFormData] = useState<NewsFormData>({
    status: 0,
    tagIds: [],
    featured: false,
  });

  // 状态映射
  const statusMap: Record<string, number | undefined> = {
    '全部': undefined,
    '已发布': 1,
    '草稿': 0,
    '待审核': 2,
  };

  // 加载分类和标签
  useEffect(() => {
    const loadCategoriesAndTags = async () => {
      const [catResult, tagResult] = await Promise.all([
        getNewsCategories(),
        getTags(),
      ]);
      if (catResult.success && catResult.data) {
        setCategories(catResult.data);
      }
      if (tagResult.success && tagResult.data) {
        setAllTags(tagResult.data);
      }
    };
    loadCategoriesAndTags();
  }, []);

  // 加载新闻列表
  const loadNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getNewsList({
        page: currentPage - 1,
        size: itemsPerPage,
        status: statusMap[filterStatus],
      });

      if (result.success && result.data) {
        setNewsList(result.data.content);
        setNewsPage(result.data);
      } else {
        setError(result.message || '加载失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filterStatus]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  // 分页数据
  const totalPages = newsPage?.page?.totalPages || 1;
  const totalItems = newsPage?.page?.totalElements || 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: NewsStatus) => {
    switch (status) {
      case 1: // 已发布
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            已发布
          </span>
        );
      case 0: // 草稿
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">
            <FileText className="w-3 h-3" />
            草稿
          </span>
        );
      case 2: // 已归档/待审核
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            已归档
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">
            未知
          </span>
        );
    }
  };

  const handleAdd = () => {
    setFormData({
      status: 0,
      tagIds: [],
      featured: false,
    });
    setShowAddModal(true);
  };

  const handleView = (news: NewsListResponse) => {
    setSelectedNews(news);
    setShowViewModal(true);
  };

  const handleEdit = (news: NewsListResponse) => {
    setSelectedNews(news);
    setFormData({
      title: news.title,
      excerpt: news.excerpt,
      content: '', // 需要从详情API获取
      categoryId: news.categoryId,
      author: news.author,
      coverImage: news.coverImage || '',
      featured: news.featured,
      status: news.status,
      tagIds: news.tags?.map(t => t.id) || [],
    });
    setShowEditModal(true);
  };

  const handleDelete = (news: NewsListResponse) => {
    setSelectedNews(news);
    setShowDeleteModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: any } }) => {
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

  const handleTagIdsChange = (tagIds: number[]) => {
    setFormData(prev => ({
      ...prev,
      tagIds
    }));
  };

  const handleCreateTag = async (name: string): Promise<boolean> => {
    const trimmedName = name.trim();
    if (!trimmedName) return false;

    // 检查是否已存在
    const existing = allTags.find(t => t.name === trimmedName);
    if (existing) {
      // 已存在则直接选中
      if (!formData.tagIds?.includes(existing.id)) {
        handleTagIdsChange([...(formData.tagIds || []), existing.id]);
      }
      return true;
    }

    try {
      const result = await createTag(trimmedName);
      if (result.success && result.data) {
        // 添加到标签列表
        setAllTags(prev => [...prev, result.data!]);
        // 自动选中新标签
        handleTagIdsChange([...(formData.tagIds || []), result.data.id]);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(-1);
    try {
      const request: NewsRequest = {
        title: formData.title!,
        excerpt: formData.excerpt,
        content: formData.content!,
        categoryId: formData.categoryId!,
        author: formData.author,
        coverImage: formData.coverImage,
        featured: formData.featured,
        status: formData.status,
        tagIds: formData.tagIds || [],
      };
      const result = await createNews(request);
      if (result.success) {
        setShowAddModal(false);
        loadNews();
      } else {
        alert(result.message || '创建失败');
      }
    } catch {
      alert('网络错误');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNews) return;
    setActionLoading(selectedNews.id);
    try {
      const request: NewsRequest = {
        title: formData.title!,
        excerpt: formData.excerpt,
        content: formData.content!,
        categoryId: formData.categoryId!,
        author: formData.author,
        coverImage: formData.coverImage,
        featured: formData.featured,
        status: formData.status,
        tagIds: formData.tagIds || [],
      };
      const result = await updateNews(selectedNews.id, request);
      if (result.success) {
        setShowEditModal(false);
        setSelectedNews(null);
        loadNews();
      } else {
        alert(result.message || '更新失败');
      }
    } catch {
      alert('网络错误');
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDelete = async () => {
    if (!selectedNews) return;
    setActionLoading(selectedNews.id);
    try {
      const result = await deleteNewsApi(selectedNews.id);
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedNews(null);
        loadNews();
      } else {
        alert(result.message || '删除失败');
      }
    } catch {
      alert('网络错误');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl text-gray-900 mb-2">新闻管理</h2>
        <p className="text-gray-600">管理新闻资讯内容</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索新闻标题或分类..."
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
            <span>添加新闻</span>
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
          共 {totalItems} 条新闻
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">加载中...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadNews}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              重试
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      新闻信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      标签
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      作者
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
                  {newsList.map((news) => (
                    <tr key={news.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-gray-900 flex items-center gap-2">
                            {news.title}
                            {news.featured && (
                              <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs">推荐</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{news.categoryName}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">{news.excerpt}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {news.tags?.slice(0, 2).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs">
                              {tag.name}
                            </span>
                          ))}
                          {news.tags && news.tags.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{news.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{news.author || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {news.publishedAt ? new Date(news.publishedAt).toLocaleDateString() : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{news.views}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(news.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            className="p-1 text-gray-400 hover:text-gray-600"
                            onClick={() => setOpenDropdown(openDropdown === news.id ? null : news.id)}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openDropdown === news.id && (
                            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              <button
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                onClick={() => {
                                  handleView(news);
                                  setOpenDropdown(null);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                                查看
                              </button>
                              <button
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                onClick={() => {
                                  handleEdit(news);
                                  setOpenDropdown(null);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                                编辑
                              </button>
                              <button
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                onClick={() => {
                                  handleDelete(news);
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
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <NewsModal
          title="添加新闻"
          formData={formData}
          categories={categories}
          allTags={allTags}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleSubmitAdd}
          onFormChange={handleFormChange}
          onTagIdsChange={handleTagIdsChange}
          onCreateTag={handleCreateTag}
          loading={actionLoading === -1}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedNews && (
        <NewsModal
          title="编辑新闻"
          formData={formData}
          categories={categories}
          allTags={allTags}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleSubmitEdit}
          onFormChange={handleFormChange}
          onTagIdsChange={handleTagIdsChange}
          onCreateTag={handleCreateTag}
          loading={actionLoading === selectedNews.id}
        />
      )}

      {/* View Modal */}
      {showViewModal && selectedNews && (
        <ViewNewsModal
          news={selectedNews}
          onClose={() => setShowViewModal(false)}
          onEdit={() => {
            setShowViewModal(false);
            handleEdit(selectedNews);
          }}
          getStatusBadge={getStatusBadge}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl text-gray-900 mb-4">删除新闻</h3>
            <p className="text-sm text-gray-600 mb-4">确定要删除新闻 <strong>{selectedNews.title}</strong> 吗？</p>
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

// News Modal Component
function NewsModal({ title, formData, categories, allTags, onClose, onSubmit, onFormChange, onTagIdsChange, onCreateTag, loading }: {
  title: string;
  formData: NewsFormData;
  categories: NewsCategoryResponse[];
  allTags: TagResponse[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (e: any) => void;
  onTagIdsChange: (tagIds: number[]) => void;
  onCreateTag: (name: string) => Promise<boolean>;
  loading?: boolean;
}) {
  const [newTagInput, setNewTagInput] = useState('');
  const [creatingTag, setCreatingTag] = useState(false);

  // 切换标签选择
  const toggleTag = (tagId: number) => {
    const currentIds = formData.tagIds || [];
    if (currentIds.includes(tagId)) {
      onTagIdsChange(currentIds.filter(id => id !== tagId));
    } else {
      onTagIdsChange([...currentIds, tagId]);
    }
  };

  // 创建新标签
  const handleAddTag = async () => {
    if (!newTagInput.trim() || creatingTag) return;
    setCreatingTag(true);
    const success = await onCreateTag(newTagInput);
    if (success) {
      setNewTagInput('');
    }
    setCreatingTag(false);
  };

  // 回车创建标签
  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  // Custom image handler for Quill - defined with useCallback to maintain stable reference
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        // Convert image to base64
        const reader = new FileReader();
        reader.onload = (e) => {
          const quill = (window as any).quillEditor;
          if (quill && e.target?.result) {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', e.target.result);
            quill.setSelection(range.index + 1);
          }
        };
        reader.readAsDataURL(file);
      }
    };
  }, []);

  // Rich text editor configuration - memoized to prevent re-creation on every render
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
  }), [imageHandler]);

  const handleContentChange = useCallback((value: string) => {
    onFormChange({ target: { name: 'content', value } });
  }, [onFormChange]);

  const handleQuillRef = useCallback((ref: any) => {
    if (ref) {
      (window as any).quillEditor = ref.getEditor();
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="relative p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl mb-1">{title}</h2>
              <p className="text-sm text-purple-100">填写新闻资讯信息</p>
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
                <FileText className="w-5 h-5 text-purple-600" />
                基本信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">新闻标题 *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="请输入新闻标题"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">新闻分类 *</label>
                  <select
                    name="categoryId"
                    required
                    value={formData.categoryId || ''}
                    onChange={(e) => onFormChange({ target: { name: 'categoryId', value: Number(e.target.value) } })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">请选择</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">作者 *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="author"
                      required
                      value={formData.author || ''}
                      onChange={onFormChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="请输入作者"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">标签</label>
                  <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg min-h-[48px]">
                    {allTags.map((tag) => {
                      const isSelected = formData.tagIds?.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            isSelected
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      placeholder="输入新标签名称"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!newTagInput.trim() || creatingTag}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {creatingTag ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      添加
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">点击选择标签，已选 {formData.tagIds?.length || 0} 个</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">摘要 *</label>
                  <textarea
                    name="excerpt"
                    required
                    rows={2}
                    value={formData.excerpt || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="请输入新闻摘要"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                新闻内容
              </h3>
              <div>
                <label className="block text-sm text-gray-700 mb-2">正文内容 *</label>
                <ReactQuill
                  value={formData.content || ''}
                  onChange={handleContentChange}
                  className="w-full"
                  placeholder="请输入新闻正文内容"
                  modules={modules}
                  formats={quillFormats}
                  ref={handleQuillRef}
                />
              </div>
            </div>

            {/* Status & Featured */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                发布设置
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">状态 *</label>
                  <select
                    name="status"
                    required
                    value={formData.status}
                    onChange={(e) => onFormChange({ target: { name: 'status', value: Number(e.target.value) } })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={0}>草稿</option>
                    <option value={2}>已归档</option>
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
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">设为推荐新闻</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// View News Modal Component
function ViewNewsModal({ news, onClose, onEdit, getStatusBadge }: {
  news: NewsListResponse;
  onClose: () => void;
  onEdit: () => void;
  getStatusBadge: (status: NewsStatus) => React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="relative p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Eye className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl mb-1">新闻详情</h2>
              <p className="text-sm text-purple-100">查看新闻完整信息</p>
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
              <FileText className="w-5 h-5 text-purple-600" />
              基本信息
            </h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="mb-4">
                <h1 className="text-2xl text-gray-900 mb-2">{news.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {news.author || '-'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {news.publishedAt ? new Date(news.publishedAt).toLocaleDateString() : '未发布'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {news.views} 次浏览
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm">
                  {news.categoryName}
                </span>
                {news.featured && (
                  <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm">
                    推荐
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          {news.tags && news.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-600" />
                标签
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex flex-wrap gap-2">
                  {news.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm">
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              新闻内容
            </h3>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-2">摘要</div>
                <div className="text-sm text-gray-700 leading-relaxed">{news.excerpt || '-'}</div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-4">发布状态</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-2">
                {getStatusBadge(news.status)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={onEdit}
              className="flex-1 px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              编辑新闻
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