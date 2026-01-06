import { Search, Filter, Plus, MoreVertical, CheckCircle, XCircle, Clock, Edit, Trash2, Eye, X, FileText, User, Calendar, Tag } from 'lucide-react';
import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Pagination } from './Pagination';

interface News {
  id: number;
  title: string;
  coverImage?: string;
  category: string;
  tags: string[];
  summary: string;
  content: string;
  author: string;
  publishDate: string;
  status: '已发布' | '草稿' | '待审核';
  views: number;
  featured: boolean;
}

export function NewsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [newsList, setNewsList] = useState<News[]>([
    {
      id: 1,
      title: '2024年行业发展趋势分析报告',
      coverImage: '',
      category: '行业动态',
      tags: ['行业分析', '发展趋势', '年度报告'],
      summary: '深入分析2024年给排水行业的发展趋势，探讨智慧水务、绿色建筑等热点话题。',
      content: '2024年给排水行业呈现出智能化、绿色化、数字化的发展趋势。智慧水务建设加速推进，BIM技术在给排水设计中的应用日益广泛，海绵城市建设持续深入...',
      author: '编辑部',
      publishDate: '2024-01-15',
      status: '已发布',
      views: 3450,
      featured: true,
    },
    {
      id: 2,
      title: '智能建筑技术研讨会成功举办',
      coverImage: '',
      category: '活动报道',
      tags: ['技术研讨', '智能建筑', '行业交流'],
      summary: '2023年度智能建筑技术研讨会在广州成功举办，来自全国各地的专家学者齐聚一堂。',
      content: '本次研讨会汇聚了来自全国各地的300余名专家学者和企业代表，围绕智能建筑给排水系统设计、运营管理等议题展开深入交流...',
      author: '张三',
      publishDate: '2023-12-20',
      status: '已发布',
      views: 2180,
      featured: false,
    },
    {
      id: 3,
      title: '新版《建筑给水排水设计标准》解读',
      coverImage: '',
      category: '政策法规',
      tags: ['设计标准', '政策解读', '行业规范'],
      summary: '对新修订的《建筑给水排水设计标准》进行详细解读，分析新标准的主要变化和影响。',
      content: '新版标准在节水、二次供水、雨水利用等方面提出了更高要求，将对行业发展产生深远影响...',
      author: '李四',
      publishDate: '',
      status: '草稿',
      views: 0,
      featured: false,
    },
    {
      id: 4,
      title: '海绵城市建设经验分享',
      coverImage: '',
      category: '技术文章',
      tags: ['海绵城市', '雨水管理', '工程实践'],
      summary: '分享海绵城市建设的实践经验，探讨城市雨洪管理的创新模式。',
      content: '通过多个海绵城市试点项目的实践，总结出一套行之有效的建设模式和管理经验...',
      author: '王五',
      publishDate: '2024-01-10',
      status: '待审核',
      views: 0,
      featured: false,
    },
  ]);

  const [formData, setFormData] = useState<Partial<News>>({
    status: '草稿',
    tags: [],
    featured: false,
  });

  const filteredNews = newsList.filter(news => {
    const matchesSearch = 
      news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === '全部' || news.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNews = filteredNews.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: News['status']) => {
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
      tags: [],
      featured: false,
      views: 0,
    });
    setShowAddModal(true);
  };

  const handleView = (news: News) => {
    setSelectedNews(news);
    setShowViewModal(true);
  };

  const handleEdit = (news: News) => {
    setSelectedNews(news);
    setFormData(news);
    setShowEditModal(true);
  };

  const handleDelete = (news: News) => {
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

  const handleTagsChange = (value: string) => {
    const tagsArray = value.split(',').map(t => t.trim()).filter(t => t);
    setFormData(prev => ({
      ...prev,
      tags: tagsArray
    }));
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newNews: News = {
      ...formData as News,
      id: Math.max(...newsList.map(n => n.id)) + 1,
      publishDate: formData.status === '已发布' ? new Date().toISOString().split('T')[0] : '',
      views: 0,
    };
    setNewsList([...newsList, newNews]);
    setShowAddModal(false);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNews) {
      setNewsList(newsList.map(n => 
        n.id === selectedNews.id ? { 
          ...formData as News, 
          id: selectedNews.id,
          views: selectedNews.views,
          publishDate: formData.status === '已发布' && !selectedNews.publishDate 
            ? new Date().toISOString().split('T')[0] 
            : selectedNews.publishDate
        } : n
      ));
      setShowEditModal(false);
      setSelectedNews(null);
    }
  };

  const confirmDelete = () => {
    if (selectedNews) {
      setNewsList(newsList.filter(n => n.id !== selectedNews.id));
      setShowDeleteModal(false);
      setSelectedNews(null);
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
          共 {filteredNews.length} 条新闻
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
              {paginatedNews.map((news) => (
                <tr key={news.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-gray-900 flex items-center gap-2">
                        {news.title}
                        {news.featured && (
                          <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs">推荐</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{news.category}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{news.summary}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {news.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {news.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{news.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{news.author}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {news.publishDate || '-'}
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
          totalItems={filteredNews.length}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <NewsModal
          title="添加新闻"
          formData={formData}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleSubmitAdd}
          onFormChange={handleFormChange}
          onTagsChange={handleTagsChange}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedNews && (
        <NewsModal
          title="编辑新闻"
          formData={formData}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleSubmitEdit}
          onFormChange={handleFormChange}
          onTagsChange={handleTagsChange}
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
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
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
function NewsModal({ title, formData, onClose, onSubmit, onFormChange, onTagsChange }: any) {
  // Rich text editor configuration with image upload
  const modules = {
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
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'align',
    'link', 'image'
  ];

  // Custom image handler for Quill
  function imageHandler() {
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
  }

  const handleContentChange = (value: string) => {
    onFormChange({ target: { name: 'content', value } });
  };

  const handleQuillRef = (ref: any) => {
    if (ref) {
      (window as any).quillEditor = ref.getEditor();
    }
  };

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
                    name="category"
                    required
                    value={formData.category || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">请选择</option>
                    <option value="行业动态">行业动态</option>
                    <option value="活动报道">活动报道</option>
                    <option value="政策法规">政策法规</option>
                    <option value="技术文章">技术文章</option>
                    <option value="通知公告">通知公告</option>
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
                  <label className="block text-sm text-gray-700 mb-2">标签 *</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="tags"
                      required
                      value={formData.tags?.join(', ') || ''}
                      onChange={(e) => onTagsChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="请输入标签，多个用逗号分隔"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">例如：行业分析, 发展趋势, 年度报告</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">摘要 *</label>
                  <textarea
                    name="summary"
                    required
                    rows={2}
                    value={formData.summary || ''}
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
                  name="content"
                  required
                  value={formData.content || ''}
                  onChange={handleContentChange}
                  className="w-full"
                  placeholder="请输入新闻正文内容"
                  modules={modules}
                  formats={formats}
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
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="草稿">草稿</option>
                    <option value="待审核">待审核</option>
                    <option value="已发布">已发布</option>
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
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
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

// View News Modal Component
function ViewNewsModal({ news, onClose, onEdit, getStatusBadge }: any) {
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
                    {news.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {news.publishDate || '未发布'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {news.views} 次浏览
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm">
                  {news.category}
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
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              标签
            </h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex flex-wrap gap-2">
                {news.tags.map((tag: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              新闻内容
            </h3>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-2">摘要</div>
                <div className="text-sm text-gray-700 leading-relaxed">{news.summary}</div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="text-xs text-gray-500 mb-2">正文</div>
                <div 
                  className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: news.content }}
                />
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