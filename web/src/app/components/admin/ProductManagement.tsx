import { Search, Filter, Plus, MoreVertical, CheckCircle, XCircle, Clock, Edit, Trash2, Eye, X, FileText, Building2, Tag, Image, DollarSign, Package, Phone, Mail, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Pagination } from './Pagination';

interface Product {
  id: number;
  name: string;
  category: string;
  manufacturer: string;
  model: string;
  price: string;
  images: string[];
  summary: string;
  description: string;
  specifications: string;
  features: string;
  applications: string;
  certifications: string[];
  contact: string;
  phone: string;
  email: string;
  website: string;
  status: '已发布' | '待审核' | '草稿';
  publishDate: string;
  views: number;
  featured: boolean;
}

export function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [filterCategory, setFilterCategory] = useState('全部');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: '智能楼宇管理系统 V8.0',
      category: '智能化系统',
      manufacturer: '智慧建筑科技有限公司',
      model: 'IBMS-V8.0',
      price: '面议',
      images: [],
      summary: '集成化智能楼宇管理系统，支持多子系统统一管控',
      description: '<p>智能楼宇管理系统V8.0是一款集成化的智能建筑管理解决方案，支持暖通空调、照明、安防、消防等多个子系统的统一管控。</p>',
      specifications: '<p><strong>技术参数：</strong><br>- 支持设备数：10000+<br>- 响应时间：&lt;100ms<br>- 支持协议：BACnet, Modbus, OPC</p>',
      features: '<p>1. 统一平台管理<br>2. 实时数据监控<br>3. 智能节能优化<br>4. 故障预警诊断</p>',
      applications: '<p>适用于商业综合体、写字楼、医院、学校等各类大型建筑</p>',
      certifications: ['ISO9001', 'CE认证', '节能产品认证'],
      contact: '张经理',
      phone: '400-123-4567',
      email: 'sales@smartbuilding.com',
      website: 'www.smartbuilding.com',
      status: '已发布',
      publishDate: '2024-01-20',
      views: 2340,
      featured: true,
    },
    {
      id: 2,
      name: '高效变频多联机空调系统',
      category: '暖通空调',
      manufacturer: '绿色空调集团股份有限公司',
      model: 'VRV-X6',
      price: '¥85,000 - ¥150,000',
      images: [],
      summary: '新一代变频多联机系统，能效比高达4.5',
      description: '<p>采用直流变频技术，智能化控制，节能环保，运行稳定可靠。</p>',
      specifications: '<p><strong>技术参数：</strong><br>- 制冷量：8-56kW<br>- 能效比：4.5<br>- 噪音：23-42dB</p>',
      features: '<p>1. 直流变频技术<br>2. 智能除霜<br>3. 远程控制<br>4. 节能模式</p>',
      applications: '<p>适用于办公楼、酒店、商场等商业场所</p>',
      certifications: ['能效一级', '环保认证'],
      contact: '李经理',
      phone: '021-87654321',
      email: 'vrf@greenac.com',
      website: 'www.greenac.com',
      status: '已发布',
      publishDate: '2024-02-15',
      views: 1890,
      featured: false,
    },
    {
      id: 3,
      name: '智能照明控制系统',
      category: '电气设备',
      manufacturer: '光明电气技术有限公司',
      model: 'LCS-2000',
      price: '¥3,500/路',
      images: [],
      summary: '基于KNX总线的智能照明控制系统',
      description: '<p>采用KNX国际标准总线技术，支持场景控制、定时控制、感应控制等多种控制模式。</p>',
      specifications: '<p><strong>技术参数：</strong><br>- 控制路数：1-64路<br>- 通讯协议：KNX<br>- 负载功率：10A/路</p>',
      features: '<p>1. 场景联动<br>2. 移动端控制<br>3. 能耗统计<br>4. 定时任务</p>',
      applications: '<p>适用于会议室、展厅、酒店客房等场所</p>',
      certifications: ['KNX认证', 'CCC认证'],
      contact: '王工',
      phone: '010-11223344',
      email: 'info@lightcontrol.com',
      website: 'www.lightcontrol.com',
      status: '待审核',
      publishDate: '',
      views: 0,
      featured: false,
    },
    {
      id: 4,
      name: 'BIM协同设计平台',
      category: 'BIM软件',
      manufacturer: '数字建造软件科技股份有限公司',
      model: 'BIMCloud Pro',
      price: '¥12,800/年/用户',
      images: [],
      summary: '云端BIM协同设计平台，支持多专业协同',
      description: '<p>基于云计算的BIM协同设计平台，支持建筑、结构、机电等多专业协同设计，实时同步，版本管理。</p>',
      specifications: '<p><strong>技术参数：</strong><br>- 并发用户：500+<br>- 文件格式：IFC, RVT, DWG<br>- 存储空间：1TB起</p>',
      features: '<p>1. 云端协同<br>2. 版本控制<br>3. 碰撞检测<br>4. 工程量统计</p>',
      applications: '<p>适用于设计院、施工企业、业主单位</p>',
      certifications: ['软件著作权', 'ISO27001'],
      contact: '陈经理',
      phone: '0755-88996677',
      email: 'sales@bimcloud.com',
      website: 'www.bimcloud.com',
      status: '已发布',
      publishDate: '2024-03-10',
      views: 3120,
      featured: true,
    },
  ]);

  const [formData, setFormData] = useState<Partial<Product>>({
    status: '草稿',
    featured: false,
    certifications: [],
    images: [],
    views: 0,
  });

  const categories = ['全部', '智能化系统', '暖通空调', '电气设备', 'BIM软件', '给排水设备', '消防设备', '建筑材料', '其他'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === '全部' || product.status === filterStatus;
    const matchesCategory = filterCategory === '全部' || product.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: Product['status']) => {
    switch (status) {
      case '已发布':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            已发布
          </span>
        );
      case '待审核':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            待审核
          </span>
        );
      case '草稿':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">
            <FileText className="w-3 h-3" />
            草稿
          </span>
        );
    }
  };

  const handleAdd = () => {
    setFormData({
      status: '草稿',
      featured: false,
      certifications: [],
      images: [],
      views: 0,
    });
    setShowAddModal(true);
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData(product);
    setShowEditModal(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
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

  const handleCertificationsChange = (value: string) => {
    const certificationsArray = value.split(',').map(c => c.trim()).filter(c => c);
    setFormData(prev => ({
      ...prev,
      certifications: certificationsArray
    }));
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      ...formData as Product,
      id: Math.max(...products.map(p => p.id)) + 1,
      publishDate: formData.status === '已发布' ? new Date().toISOString().split('T')[0] : '',
      views: 0,
    };
    setProducts([...products, newProduct]);
    setShowAddModal(false);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct) {
      setProducts(products.map(p => 
        p.id === selectedProduct.id ? { 
          ...formData as Product, 
          id: selectedProduct.id,
          views: selectedProduct.views,
          publishDate: formData.status === '已发布' && !selectedProduct.publishDate 
            ? new Date().toISOString().split('T')[0] 
            : selectedProduct.publishDate
        } : p
      ));
      setShowEditModal(false);
      setSelectedProduct(null);
    }
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      setShowDeleteModal(false);
      setSelectedProduct(null);
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
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            {categories.map(cat => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option>全部</option>
            <option>已发布</option>
            <option>待审核</option>
            <option>草稿</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          共 {filteredProducts.length} 个产品
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
              {filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((product) => (
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
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{product.manufacturer}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{product.price}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {product.publishDate || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Eye className="w-4 h-4" />
                      <span>{product.views.toLocaleString()}</span>
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
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredProducts.length / itemsPerPage)}
          onPageChange={setCurrentPage}
          totalItems={filteredProducts.length}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <ProductModal
          title="添加产品"
          formData={formData}
          categories={categories.filter(c => c !== '全部')}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleSubmitAdd}
          onFormChange={handleFormChange}
          onCertificationsChange={handleCertificationsChange}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedProduct && (
        <ProductModal
          title="编辑产品"
          formData={formData}
          categories={categories.filter(c => c !== '全部')}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleSubmitEdit}
          onFormChange={handleFormChange}
          onCertificationsChange={handleCertificationsChange}
        />
      )}

      {/* View Modal */}
      {showViewModal && selectedProduct && (
        <ViewProductModal
          product={selectedProduct}
          onClose={() => setShowViewModal(false)}
          onEdit={() => {
            setShowViewModal(false);
            handleEdit(selectedProduct);
          }}
          getStatusBadge={getStatusBadge}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl text-gray-900 mb-4">删除产品</h3>
            <p className="text-sm text-gray-600 mb-4">确定要删除产品 <strong>{selectedProduct.name}</strong> 吗？</p>
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

// Product Modal Component
function ProductModal({ title, formData, categories, onClose, onSubmit, onFormChange, onCertificationsChange }: any) {
  // Rich text editor configuration with image upload
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }],
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
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'color',
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

  const handleRichTextChange = (field: string) => (value: string) => {
    onFormChange({ target: { name: field, value } });
  };

  const handleQuillRef = (field: string) => (ref: any) => {
    if (ref) {
      (window as any).quillEditor = ref.getEditor();
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
                    value={formData.name || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="请输入产品名称"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">产品分类 *</label>
                  <select
                    name="category"
                    required
                    value={formData.category || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">请选择</option>
                    {categories.map((cat: string) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">产品型号 *</label>
                  <input
                    type="text"
                    name="model"
                    required
                    value={formData.model || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="请输入产品型号"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">生产厂商 *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="manufacturer"
                      required
                      value={formData.manufacturer || ''}
                      onChange={onFormChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="请输入生产厂商"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">产品价格 *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="price"
                      required
                      value={formData.price || ''}
                      onChange={onFormChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="如：¥50,000 或 面议"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">产品摘要 *</label>
                  <textarea
                    name="summary"
                    required
                    rows={2}
                    value={formData.summary || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="请输入产品摘要（一句话介绍）"
                  />
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
                  <label className="block text-sm text-gray-700 mb-2">产品描述 *</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <ReactQuill
                      value={formData.description || ''}
                      onChange={handleRichTextChange('description')}
                      modules={modules}
                      formats={formats}
                      theme="snow"
                      placeholder="请输入产品详细描述..."
                      style={{ height: '150px', marginBottom: '50px' }}
                      ref={handleQuillRef('description')}
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
                      ref={handleQuillRef('specifications')}
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
                      ref={handleQuillRef('features')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">应用场景</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <ReactQuill
                      value={formData.applications || ''}
                      onChange={handleRichTextChange('applications')}
                      modules={modules}
                      formats={formats}
                      theme="snow"
                      placeholder="请输入应用场景..."
                      style={{ height: '120px', marginBottom: '50px' }}
                      ref={handleQuillRef('applications')}
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
                  <label className="block text-sm text-gray-700 mb-2">联系人 *</label>
                  <input
                    type="text"
                    name="contact"
                    required
                    value={formData.contact || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="请输入联系人"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">联系电话 *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="请输入联系电话"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">联系邮箱 *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="请输入联系邮箱"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">官方网站</label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="请输入官方网站"
                  />
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
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
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

// View Product Modal Component
function ViewProductModal({ product, onClose, onEdit, getStatusBadge }: any) {
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
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm">
                    {product.category}
                  </span>
                  {getStatusBadge(product.status)}
                  {product.featured && (
                    <span className="px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs">推荐</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    型号: {product.model}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {product.price}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {product.views} 次浏览
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700">{product.summary}</p>
            </div>
          </div>

          {/* Manufacturer */}
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              生产厂商
            </h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-sm text-gray-900">{product.manufacturer}</div>
            </div>
          </div>

          {/* Product Images */}
          {product.images && product.images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Image className="w-5 h-5 text-indigo-600" />
                产品图片
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {product.images.map((image: string, index: number) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`${product.name} - 图片 ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => window.open(image, '_blank')}
                      />
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                        {index + 1} / {product.images.length}
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
              <div>
                <div className="text-sm text-gray-600 mb-2">产品描述</div>
                <div 
                  className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
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
              {product.applications && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-600 mb-2">应用场景</div>
                  <div 
                    className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.applications }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Certifications */}
          {product.certifications && product.certifications.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-600" />
                产品认证
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex flex-wrap gap-2">
                  {product.certifications.map((cert: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-indigo-600" />
              联系方式
            </h3>
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">联系人</div>
                  <div className="text-sm text-gray-900">{product.contact}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">联系电话</div>
                  <div className="text-sm text-gray-900 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {product.phone}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">联系邮箱</div>
                  <div className="text-sm text-gray-900 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {product.email}
                  </div>
                </div>
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