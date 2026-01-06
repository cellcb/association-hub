import { Search, Filter, Plus, MoreVertical, CheckCircle, XCircle, Clock, Edit, Trash2, Eye, X, Calendar, MapPin, Users, FileText, Phone, Mail, DollarSign, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Pagination } from './Pagination';

interface Activity {
  id: number;
  title: string;
  type: string;
  date: string;
  endDate?: string;
  time: string;
  location: string;
  address: string;
  capacity: number;
  registered: number;
  fee: number;
  organizer: string;
  contact: string;
  phone: string;
  email: string;
  description: string;
  requirements: string;
  agenda: string;
  status: '报名中' | '进行中' | '已结束' | '已取消';
  featured: boolean;
}

export function ActivityManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [activities, setActivities] = useState<Activity[]>([
    {
      id: 1,
      title: '2024年度技术交流大会',
      type: '年度会议',
      date: '2024-12-28',
      endDate: '2024-12-29',
      time: '09:00-17:00',
      location: '北京国际会议中心',
      address: '北京市朝阳区北辰东路8号',
      capacity: 500,
      registered: 320,
      fee: 500,
      organizer: '广东省土木建筑学会',
      contact: '张主任',
      phone: '020-12345678',
      email: 'conference@example.com',
      description: '<p>本次大会将汇聚行业专家学者，共同探讨给排水行业的发展趋势和技术创新。</p>',
      requirements: '<p>1. 从事给排水相关工作<br>2. 具有相关专业背景</p>',
      agenda: '<p><strong>第一天</strong><br>09:00-10:00 开幕式<br>10:00-12:00 主题演讲</p>',
      status: '报名中',
      featured: true,
    },
    {
      id: 2,
      title: '智能建筑技术沙龙',
      type: '技术沙龙',
      date: '2025-01-15',
      time: '14:00-17:00',
      location: '上海科技馆',
      address: '上海市浦东新区世纪大道2000号',
      capacity: 80,
      registered: 45,
      fee: 0,
      organizer: '智能建筑专委会',
      contact: '李工',
      phone: '021-87654321',
      email: 'salon@example.com',
      description: '<p>探讨智能建筑在给排水系统中的应用与实践。</p>',
      requirements: '<p>对智能建筑感兴趣的专业人士</p>',
      agenda: '<p>14:00-15:00 技术分享<br>15:00-17:00 互动交流</p>',
      status: '报名中',
      featured: false,
    },
    {
      id: 3,
      title: 'BIM技术应用分享会',
      type: '分享会',
      date: '2025-01-22',
      time: '15:00-17:00',
      location: '线上直播',
      address: '腾讯会议线上',
      capacity: 500,
      registered: 156,
      fee: 0,
      organizer: 'BIM技术委员会',
      contact: '王经理',
      phone: '010-11223344',
      email: 'bim@example.com',
      description: '<p>分享BIM技术在给排水设计中的最新应用案例。</p>',
      requirements: '<p>对BIM技术感兴趣即可</p>',
      agenda: '<p>15:00-16:00 案例分享<br>16:00-17:00 Q&A</p>',
      status: '报名中',
      featured: false,
    },
    {
      id: 4,
      title: '绿色建筑设计研讨会',
      type: '技术研讨',
      date: '2024-12-15',
      time: '09:00-12:00',
      location: '广州设计中心',
      address: '广州市天河区珠江新城花城大道',
      capacity: 60,
      registered: 60,
      fee: 200,
      organizer: '绿色建筑协会',
      contact: '陈主任',
      phone: '020-99887766',
      email: 'green@example.com',
      description: '<p>讨论绿色建筑在给排水系统设计中的节能减排措施。</p>',
      requirements: '<p>设计院从业人员优先</p>',
      agenda: '<p>09:00-10:30 主题演讲<br>10:30-12:00 案例研讨</p>',
      status: '已结束',
      featured: false,
    },
  ]);

  const [formData, setFormData] = useState<Partial<Activity>>({
    status: '报名中',
    featured: false,
    fee: 0,
  });

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === '全部' || activity.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Activity['status']) => {
    switch (status) {
      case '报名中':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            报名中
          </span>
        );
      case '进行中':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            进行中
          </span>
        );
      case '已结束':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">
            <XCircle className="w-3 h-3" />
            已结束
          </span>
        );
      case '已取消':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs">
            <AlertCircle className="w-3 h-3" />
            已取消
          </span>
        );
    }
  };

  const handleAdd = () => {
    setFormData({
      status: '报名中',
      featured: false,
      fee: 0,
      registered: 0,
    });
    setShowAddModal(true);
  };

  const handleView = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowViewModal(true);
  };

  const handleEdit = (activity: Activity) => {
    setSelectedActivity(activity);
    setFormData(activity);
    setShowEditModal(true);
  };

  const handleDelete = (activity: Activity) => {
    setSelectedActivity(activity);
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
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newActivity: Activity = {
      ...formData as Activity,
      id: Math.max(...activities.map(a => a.id)) + 1,
      registered: 0,
    };
    setActivities([...activities, newActivity]);
    setShowAddModal(false);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedActivity) {
      setActivities(activities.map(a => 
        a.id === selectedActivity.id ? { 
          ...formData as Activity, 
          id: selectedActivity.id,
          registered: selectedActivity.registered
        } : a
      ));
      setShowEditModal(false);
      setSelectedActivity(null);
    }
  };

  const confirmDelete = () => {
    if (selectedActivity) {
      setActivities(activities.filter(a => a.id !== selectedActivity.id));
      setShowDeleteModal(false);
      setSelectedActivity(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl text-gray-900 mb-2">活动管理</h2>
        <p className="text-gray-600">管理各类活动的发布、报名和执行</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索活动名称、类型或地点..."
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
            <span>创建活动</span>
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
            <option>报名中</option>
            <option>进行中</option>
            <option>已结束</option>
            <option>已取消</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          共 {filteredActivities.length} 个活动
        </div>
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredActivities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((activity) => (
          <div key={activity.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm">
                    {activity.type}
                  </span>
                  {getStatusBadge(activity.status)}
                  {activity.featured && (
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs">推荐</span>
                  )}
                </div>
                <h3 className="text-lg text-gray-900 mb-2">{activity.title}</h3>
              </div>
              <div className="relative">
                <button 
                  className="p-1 text-gray-400 hover:text-gray-600" 
                  onClick={() => setOpenDropdown(openDropdown === activity.id ? null : activity.id)}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {openDropdown === activity.id && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => {
                        handleView(activity);
                        setOpenDropdown(null);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      查看
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => {
                        handleEdit(activity);
                        setOpenDropdown(null);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                      编辑
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      onClick={() => {
                        handleDelete(activity);
                        setOpenDropdown(null);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      删除
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{activity.date} {activity.time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{activity.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>
                  {activity.registered} / {activity.capacity} 人已报名
                </span>
              </div>
              {activity.fee > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>费用: ¥{activity.fee}</span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>报名进度</span>
                <span>{Math.round((activity.registered / activity.capacity) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((activity.registered / activity.capacity) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button 
                onClick={() => handleView(activity)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                查看详情
              </button>
              <button 
                onClick={() => handleEdit(activity)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDelete(activity)}
                className="px-4 py-2 border border-gray-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredActivities.length / itemsPerPage)}
        onPageChange={setCurrentPage}
        totalItems={filteredActivities.length}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* Add Modal */}
      {showAddModal && (
        <ActivityModal
          title="创建活动"
          formData={formData}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleSubmitAdd}
          onFormChange={handleFormChange}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedActivity && (
        <ActivityModal
          title="编辑活动"
          formData={formData}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleSubmitEdit}
          onFormChange={handleFormChange}
        />
      )}

      {/* View Modal */}
      {showViewModal && selectedActivity && (
        <ViewActivityModal
          activity={selectedActivity}
          onClose={() => setShowViewModal(false)}
          onEdit={() => {
            setShowViewModal(false);
            handleEdit(selectedActivity);
          }}
          getStatusBadge={getStatusBadge}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedActivity && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl text-gray-900 mb-4">删除活动</h3>
            <p className="text-sm text-gray-600 mb-4">确定要删除活动 <strong>{selectedActivity.title}</strong> 吗？</p>
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

// Activity Modal Component
function ActivityModal({ title, formData, onClose, onSubmit, onFormChange }: any) {
  // Rich text editor configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link'
  ];

  const handleRichTextChange = (field: string) => (value: string) => {
    onFormChange({ target: { name: field, value } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="relative p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl mb-1">{title}</h2>
              <p className="text-sm text-blue-100">填写活动详细信息</p>
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
                  <label className="block text-sm text-gray-700 mb-2">活动名称 *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入活动名称"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">活动类型 *</label>
                  <select
                    name="type"
                    required
                    value={formData.type || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请选择</option>
                    <option value="年度会议">年度会议</option>
                    <option value="技术沙龙">技术沙龙</option>
                    <option value="分享会">分享会</option>
                    <option value="技术研讨">技术研讨</option>
                    <option value="培训课程">培训课程</option>
                    <option value="参观考察">参观考察</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">活动状态 *</label>
                  <select
                    name="status"
                    required
                    value={formData.status}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="报名中">报名中</option>
                    <option value="进行中">进行中</option>
                    <option value="已结束">已结束</option>
                    <option value="已取消">已取消</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Time & Location */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                时间地点
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">开始日期 *</label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">结束日期</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">活动时间 *</label>
                  <input
                    type="text"
                    name="time"
                    required
                    value={formData.time || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="如：09:00-17:00"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">活动地点 *</label>
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入活动地点"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">详细地址 *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入详细地址"
                  />
                </div>
              </div>
            </div>

            {/* Capacity & Fee */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                人数与费用
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">活动人数 *</label>
                  <input
                    type="number"
                    name="capacity"
                    required
                    min="1"
                    value={formData.capacity || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入活动人数"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">活动费用 (元) *</label>
                  <input
                    type="number"
                    name="fee"
                    required
                    min="0"
                    value={formData.fee || 0}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0表示免费"
                  />
                </div>
              </div>
            </div>

            {/* Organizer Info */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                组织单位
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">主办单位 *</label>
                  <input
                    type="text"
                    name="organizer"
                    required
                    value={formData.organizer || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入主办单位"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">联系人 *</label>
                  <input
                    type="text"
                    name="contact"
                    required
                    value={formData.contact || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入联系电话"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">联系邮箱 *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email || ''}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入联系邮箱"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                活动详情
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">活动介绍 *</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <ReactQuill
                      value={formData.description || ''}
                      onChange={handleRichTextChange('description')}
                      modules={modules}
                      formats={formats}
                      theme="snow"
                      placeholder="请输入活动介绍..."
                      style={{ height: '150px', marginBottom: '50px' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">参会要求</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <ReactQuill
                      value={formData.requirements || ''}
                      onChange={handleRichTextChange('requirements')}
                      modules={modules}
                      formats={formats}
                      theme="snow"
                      placeholder="请输入参会要求..."
                      style={{ height: '150px', marginBottom: '50px' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">活动日程</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <ReactQuill
                      value={formData.agenda || ''}
                      onChange={handleRichTextChange('agenda')}
                      modules={modules}
                      formats={formats}
                      theme="snow"
                      placeholder="请输入活动日程安排..."
                      style={{ height: '150px', marginBottom: '50px' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Featured */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured || false}
                  onChange={onFormChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">设为推荐活动</span>
              </label>
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
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg"
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

// View Activity Modal Component
function ViewActivityModal({ activity, onClose, onEdit, getStatusBadge }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="relative p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Eye className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl mb-1">活动详情</h2>
              <p className="text-sm text-blue-100">查看活动完整信息</p>
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
                <h1 className="text-2xl text-gray-900 mb-2">{activity.title}</h1>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm">
                    {activity.type}
                  </span>
                  {getStatusBadge(activity.status)}
                  {activity.featured && (
                    <span className="px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs">推荐</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Time & Location */}
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              时间地点
            </h3>
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <div className="flex items-start gap-2">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-600">活动时间</div>
                  <div className="text-sm text-gray-900">
                    {activity.date} {activity.endDate && `至 ${activity.endDate}`} {activity.time}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-600">活动地点</div>
                  <div className="text-sm text-gray-900">{activity.location}</div>
                  <div className="text-xs text-gray-500">{activity.address}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Capacity & Registration */}
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              报名情况
            </h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">报名人数</span>
                <span className="text-lg text-gray-900">
                  {activity.registered} / {activity.capacity} 人
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min((activity.registered / activity.capacity) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    费用: {activity.fee === 0 ? '免费' : `¥${activity.fee}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Organizer Info */}
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              组织单位
            </h3>
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">主办单位</div>
                <div className="text-sm text-gray-900">{activity.organizer}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">联系人</div>
                  <div className="text-sm text-gray-900">{activity.contact}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">联系电话</div>
                  <div className="text-sm text-gray-900 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {activity.phone}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">联系邮箱</div>
                  <div className="text-sm text-gray-900 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {activity.email}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              活动详情
            </h3>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-2">活动介绍</div>
                <div 
                  className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: activity.description }}
                />
              </div>
              {activity.requirements && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-600 mb-2">参会要求</div>
                  <div 
                    className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: activity.requirements }}
                  />
                </div>
              )}
              {activity.agenda && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-600 mb-2">活动日程</div>
                  <div 
                    className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: activity.agenda }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={onEdit}
              className="flex-1 px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              编辑活动
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