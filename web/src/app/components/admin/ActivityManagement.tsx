import { Search, Filter, Plus, MoreVertical, CheckCircle, XCircle, Clock, Edit, Trash2, Eye, X, Calendar, MapPin, Users, FileText, Phone, Mail, DollarSign, AlertCircle, Loader2, UserCheck, GripVertical } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Pagination } from './Pagination';
import {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityRegistrations,
  updateRegistrationStatus,
  cancelRegistration,
} from '@/lib/api';
import type { Page } from '@/types/member';
import type {
  ActivityListResponse,
  ActivityResponse,
  ActivityFormData,
  ActivityType,
  ActivityStatus,
  RegistrationResponse,
  RegistrationStatus,
} from '@/types/activity';
import {
  activityTypeLabels,
  activityStatusLabels,
  registrationStatusLabels,
  formDataToRequest,
  responseToFormData,
  initialFormData,
  parseActivityContact,
  parseActivityVenue,
  parseAgenda,
  type AgendaItem,
  type DayAgenda,
} from '@/types/activity';

export function ActivityManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<ActivityStatus | ''>('');
  const [filterType, setFilterType] = useState<ActivityType | ''>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityListResponse | null>(null);
  const [selectedActivityDetail, setSelectedActivityDetail] = useState<ActivityResponse | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // API data states
  const [activities, setActivities] = useState<ActivityListResponse[]>([]);
  const [activitiesPage, setActivitiesPage] = useState<Page<ActivityListResponse> | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ActivityFormData>(initialFormData);

  // Load activities
  const loadActivities = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getActivities({
        page: currentPage - 1,
        size: itemsPerPage,
        status: filterStatus || undefined,
        type: filterType || undefined,
      });
      if (result.success && result.data) {
        setActivities(result.data.content);
        setActivitiesPage(result.data);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filterStatus, filterType]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Filter activities by search term (client-side)
  const filteredActivities = activities.filter(activity => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      activity.title.toLowerCase().includes(term) ||
      activity.typeName.toLowerCase().includes(term) ||
      (activity.location && activity.location.toLowerCase().includes(term))
    );
  });

  const getStatusBadge = (status: ActivityStatus) => {
    switch (status) {
      case 'UPCOMING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            {activityStatusLabels.UPCOMING}
          </span>
        );
      case 'ONGOING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            {activityStatusLabels.ONGOING}
          </span>
        );
      case 'ENDED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">
            <XCircle className="w-3 h-3" />
            {activityStatusLabels.ENDED}
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs">
            <AlertCircle className="w-3 h-3" />
            {activityStatusLabels.CANCELLED}
          </span>
        );
    }
  };

  const handleAdd = () => {
    setFormData(initialFormData);
    setShowAddModal(true);
  };

  const handleView = async (activity: ActivityListResponse) => {
    setSelectedActivity(activity);
    try {
      const result = await getActivityById(activity.id);
      if (result.success && result.data) {
        setSelectedActivityDetail(result.data);
        setShowViewModal(true);
      }
    } catch (error) {
      console.error('Failed to load activity details', error);
    }
  };

  const handleEdit = async (activity: ActivityListResponse) => {
    setSelectedActivity(activity);
    try {
      const result = await getActivityById(activity.id);
      if (result.success && result.data) {
        setSelectedActivityDetail(result.data);
        setFormData(responseToFormData(result.data));
        setShowEditModal(true);
      }
    } catch (error) {
      console.error('Failed to load activity details', error);
    }
  };

  const handleDelete = (activity: ActivityListResponse) => {
    setSelectedActivity(activity);
    setShowDeleteModal(true);
  };

  const handleViewRegistrations = (activity: ActivityListResponse) => {
    setSelectedActivity(activity);
    setShowRegistrationsModal(true);
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
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value)
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
    try {
      const request = formDataToRequest(formData);
      const result = await createActivity(request);
      if (result.success) {
        setShowAddModal(false);
        loadActivities();
      } else {
        alert(result.message || '创建失败');
      }
    } catch (error) {
      console.error('Failed to create activity', error);
      alert('创建失败');
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;
    try {
      const request = formDataToRequest(formData);
      const result = await updateActivity(selectedActivity.id, request);
      if (result.success) {
        setShowEditModal(false);
        setSelectedActivity(null);
        loadActivities();
      } else {
        alert(result.message || '更新失败');
      }
    } catch (error) {
      console.error('Failed to update activity', error);
      alert('更新失败');
    }
  };

  const confirmDelete = async () => {
    if (!selectedActivity) return;
    try {
      const result = await deleteActivity(selectedActivity.id);
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedActivity(null);
        loadActivities();
      } else {
        alert(result.message || '删除失败');
      }
    } catch (error) {
      console.error('Failed to delete activity', error);
      alert('删除失败');
    }
  };

  const totalPages = activitiesPage ? activitiesPage.page.totalPages : 1;
  const totalItems = activitiesPage ? activitiesPage.page.totalElements : 0;

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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <button
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 whitespace-nowrap"
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
            onChange={(e) => {
              setFilterStatus(e.target.value as ActivityStatus | '');
              setCurrentPage(1);
            }}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">全部状态</option>
            <option value="UPCOMING">报名中</option>
            <option value="ONGOING">进行中</option>
            <option value="ENDED">已结束</option>
            <option value="CANCELLED">已取消</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as ActivityType | '');
              setCurrentPage(1);
            }}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">全部类型</option>
            <option value="CONFERENCE">会议</option>
            <option value="TRAINING">培训</option>
            <option value="SEMINAR">研讨会</option>
            <option value="EXHIBITION">展览</option>
            <option value="COMPETITION">竞赛</option>
            <option value="OTHER">其他</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          共 {totalItems} 个活动
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      )}

      {/* Activity Cards */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm">
                      {activity.typeName}
                    </span>
                    {getStatusBadge(activity.status)}
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
                    <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
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
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => {
                          handleViewRegistrations(activity);
                          setOpenDropdown(null);
                        }}
                      >
                        <UserCheck className="w-4 h-4" />
                        报名管理
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
                {activity.date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{activity.date} {activity.time ? activity.time.substring(0, 5) : ''}</span>
                  </div>
                )}
                {activity.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{activity.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>
                    {activity.registeredCount} / {activity.capacity || '不限'} 人已报名
                  </span>
                </div>
                {activity.fee && Number(activity.fee) > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>费用: ¥{activity.fee}</span>
                  </div>
                )}
                {activity.registrationEndDate && (
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <Clock className="w-4 h-4" />
                    <span>报名截止: {activity.registrationEndDate} {activity.registrationEndTime ? activity.registrationEndTime.substring(0, 5) : ''}</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {activity.capacity && activity.capacity > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>报名进度</span>
                    <span>{Math.round((activity.registeredCount / activity.capacity) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((activity.registeredCount / activity.capacity) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleView(activity)}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
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
      )}

      {/* Empty State */}
      {!loading && filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无活动数据</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredActivities.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

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
      {showViewModal && selectedActivityDetail && (
        <ViewActivityModal
          activity={selectedActivityDetail}
          onClose={() => setShowViewModal(false)}
          onEdit={() => {
            setShowViewModal(false);
            setFormData(responseToFormData(selectedActivityDetail));
            setShowEditModal(true);
          }}
          getStatusBadge={getStatusBadge}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedActivity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
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

      {/* Registrations Modal */}
      {showRegistrationsModal && selectedActivity && (
        <RegistrationsModal
          activity={selectedActivity}
          onClose={() => setShowRegistrationsModal(false)}
        />
      )}
    </div>
  );
}

// Agenda Editor Component (支持多天议程)
interface AgendaEditorProps {
  days: DayAgenda[];
  onChange: (days: DayAgenda[]) => void;
}

function AgendaEditor({ days, onChange }: AgendaEditorProps) {
  // 确保 days 是有效数组
  const safeDays = Array.isArray(days) && days.length > 0 ? days : [{ date: '', items: [] }];

  // 添加新的一天
  const addDay = () => {
    onChange([...safeDays, { date: '', items: [] }]);
  };

  // 删除某一天
  const removeDay = (dayIndex: number) => {
    if (safeDays.length === 1) {
      // 至少保留一天
      onChange([{ date: '', items: [] }]);
    } else {
      onChange(safeDays.filter((_, i) => i !== dayIndex));
    }
  };

  // 更新天的日期
  const updateDayDate = (dayIndex: number, date: string) => {
    const newDays = [...safeDays];
    newDays[dayIndex] = { ...newDays[dayIndex], date };
    onChange(newDays);
  };

  // 添加议程项
  const addItem = (dayIndex: number) => {
    const newDays = [...safeDays];
    newDays[dayIndex] = {
      ...newDays[dayIndex],
      items: [...(newDays[dayIndex].items || []), { startTime: '', endTime: '', title: '', speaker: '' }]
    };
    onChange(newDays);
  };

  // 删除议程项
  const removeItem = (dayIndex: number, itemIndex: number) => {
    const newDays = [...safeDays];
    newDays[dayIndex] = {
      ...newDays[dayIndex],
      items: (newDays[dayIndex].items || []).filter((_, i) => i !== itemIndex)
    };
    onChange(newDays);
  };

  // 更新议程项
  const updateItem = (dayIndex: number, itemIndex: number, field: keyof AgendaItem, value: string) => {
    const newDays = [...safeDays];
    newDays[dayIndex] = {
      ...newDays[dayIndex],
      items: (newDays[dayIndex].items || []).map((item, i) =>
        i === itemIndex ? { ...item, [field]: value } : item
      )
    };
    onChange(newDays);
  };

  return (
    <div className="space-y-4">
      {safeDays.map((day, dayIndex) => (
        <div key={dayIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          {/* 天的标题栏 */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 text-gray-400">
              <GripVertical className="w-4 h-4" />
              <span className="text-sm font-medium">第 {dayIndex + 1} 天</span>
            </div>
            <input
              type="date"
              value={day.date || ''}
              onChange={(e) => updateDayDate(dayIndex, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => removeDay(dayIndex)}
              className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm transition-colors"
            >
              删除此天
            </button>
          </div>

          {/* 该天的议程项 */}
          <div className="space-y-3 ml-6">
            {(day.items || []).map((item, itemIndex) => (
              <div key={itemIndex} className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex items-center gap-1">
                  <input
                    type="time"
                    value={item.startTime || ''}
                    onChange={(e) => updateItem(dayIndex, itemIndex, 'startTime', e.target.value)}
                    className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="time"
                    value={item.endTime || ''}
                    onChange={(e) => updateItem(dayIndex, itemIndex, 'endTime', e.target.value)}
                    className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <input
                  type="text"
                  placeholder="议程标题"
                  value={item.title}
                  onChange={(e) => updateItem(dayIndex, itemIndex, 'title', e.target.value)}
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="演讲人（可选）"
                  value={item.speaker || ''}
                  onChange={(e) => updateItem(dayIndex, itemIndex, 'speaker', e.target.value)}
                  className="w-32 px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => removeItem(dayIndex, itemIndex)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addItem(dayIndex)}
              className="flex items-center gap-1 px-3 py-2 text-orange-600 hover:bg-orange-50 rounded-lg text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加议程项
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addDay}
        className="w-full py-3 border-2 border-dashed border-orange-300 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        添加新的一天
      </button>
    </div>
  );
}

// Activity Modal Component
interface ActivityModalProps {
  title: string;
  formData: ActivityFormData;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: unknown } }) => void;
}

function ActivityModal({ title, formData, onClose, onSubmit, onFormChange }: ActivityModalProps) {
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
        <div className="relative p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl mb-1">{title}</h2>
              <p className="text-sm text-orange-100">填写活动详细信息</p>
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
                <FileText className="w-5 h-5 text-orange-600" />
                基本信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">活动名称 *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="请输入活动名称"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">活动类型 *</label>
                  <select
                    name="type"
                    required
                    value={formData.type}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">请选择</option>
                    {Object.entries(activityTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">活动状态 *</label>
                  <select
                    name="status"
                    required
                    value={formData.status}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {Object.entries(activityStatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Time & Location */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                时间地点
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">开始日期</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">开始时间</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">结束日期</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">结束时间</label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">活动地点</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="请输入活动地点"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">详细地址</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="请输入详细地址"
                  />
                </div>
              </div>
            </div>

            {/* Registration Time */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                报名时间
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">报名开始日期</label>
                  <input
                    type="date"
                    name="registrationStartDate"
                    value={formData.registrationStartDate}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">报名开始时间</label>
                  <input
                    type="time"
                    name="registrationStartTime"
                    value={formData.registrationStartTime}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">报名截止日期</label>
                  <input
                    type="date"
                    name="registrationEndDate"
                    value={formData.registrationEndDate}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">报名截止时间</label>
                  <input
                    type="time"
                    name="registrationEndTime"
                    value={formData.registrationEndTime}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Capacity & Fee */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                人数与费用
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">活动人数</label>
                  <input
                    type="number"
                    name="capacity"
                    min="0"
                    value={formData.capacity}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="请输入活动人数上限"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">活动费用 (元)</label>
                  <input
                    type="number"
                    name="fee"
                    min="0"
                    step="0.01"
                    value={formData.fee}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0表示免费"
                  />
                </div>
              </div>
            </div>

            {/* Organizer Info */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                组织单位
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">主办单位</label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="请输入主办单位"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">联系人</label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="请输入联系人"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">联系电话</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="请输入联系电话"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-2">联系邮箱</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="请输入联系邮箱"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-600" />
                活动详情
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">活动介绍</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <ReactQuill
                      value={formData.description}
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
                      value={formData.detailedDescription}
                      onChange={handleRichTextChange('detailedDescription')}
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
                  <AgendaEditor
                    days={formData.agenda}
                    onChange={(days) => onFormChange({ target: { name: 'agenda', value: days } })}
                  />
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
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-lg"
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
interface ViewActivityModalProps {
  activity: ActivityResponse;
  onClose: () => void;
  onEdit: () => void;
  getStatusBadge: (status: ActivityStatus) => React.ReactNode;
}

function ViewActivityModal({ activity, onClose, onEdit, getStatusBadge }: ViewActivityModalProps) {
  const contact = parseActivityContact(activity.contact);
  const venue = parseActivityVenue(activity.venue);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="relative p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Eye className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl mb-1">活动详情</h2>
              <p className="text-sm text-orange-100">查看活动完整信息</p>
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
                  <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm">
                    {activity.typeName}
                  </span>
                  {getStatusBadge(activity.status)}
                </div>
              </div>
            </div>
          </div>

          {/* Time & Location */}
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              时间地点
            </h3>
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <div className="flex items-start gap-2">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-600">活动时间</div>
                  <div className="text-sm text-gray-900">
                    {activity.date || '未设置'} {activity.time ? activity.time.substring(0, 5) : ''}
                    {activity.endDate && ` 至 ${activity.endDate}`} {activity.endTime ? activity.endTime.substring(0, 5) : ''}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-600">活动地点</div>
                  <div className="text-sm text-gray-900">{activity.location || '未设置'}</div>
                  {venue?.address && <div className="text-xs text-gray-500">{venue.address}</div>}
                </div>
              </div>
              {(activity.registrationStartDate || activity.registrationEndDate) && (
                <div className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-600">报名时间</div>
                    <div className="text-sm text-gray-900">
                      {activity.registrationStartDate && (
                        <>
                          {activity.registrationStartDate} {activity.registrationStartTime ? activity.registrationStartTime.substring(0, 5) : ''}
                          {' 至 '}
                        </>
                      )}
                      {activity.registrationEndDate && (
                        <>
                          {activity.registrationEndDate} {activity.registrationEndTime ? activity.registrationEndTime.substring(0, 5) : ''}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Capacity & Registration */}
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              报名情况
            </h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">报名人数</span>
                <span className="text-lg text-gray-900">
                  {activity.registeredCount} / {activity.capacity || '不限'} 人
                </span>
              </div>
              {activity.capacity && activity.capacity > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-orange-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min((activity.registeredCount / activity.capacity) * 100, 100)}%` }}
                  ></div>
                </div>
              )}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    费用: {!activity.fee || Number(activity.fee) === 0 ? '免费' : `¥${activity.fee}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Organizer Info */}
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              组织单位
            </h3>
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">主办单位</div>
                <div className="text-sm text-gray-900">{activity.organization || '未设置'}</div>
              </div>
              {contact && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {contact.name && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">联系人</div>
                      <div className="text-sm text-gray-900">{contact.name}</div>
                    </div>
                  )}
                  {contact.phone && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">联系电话</div>
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {contact.phone}
                      </div>
                    </div>
                  )}
                  {contact.email && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">联系邮箱</div>
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {contact.email}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              活动详情
            </h3>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              {activity.description && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">活动介绍</div>
                  <div
                    className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: activity.description }}
                  />
                </div>
              )}
              {activity.detailedDescription && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-600 mb-2">参会要求</div>
                  <div
                    className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: activity.detailedDescription }}
                  />
                </div>
              )}
              {activity.agenda && parseAgenda(activity.agenda).length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-600 mb-3">活动日程</div>
                  <div className="space-y-6">
                    {parseAgenda(activity.agenda).map((day, dayIndex) => (
                      <div key={dayIndex}>
                        {/* 日期标题 */}
                        {day.date && (
                          <h4 className="text-base text-gray-900 mb-3 pb-2 border-b border-gray-200 font-medium">
                            {new Date(day.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </h4>
                        )}
                        {/* 该天的议程列表 */}
                        <div className="space-y-2">
                          {(day.items || []).map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="flex items-start gap-4 p-3 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors"
                            >
                              <div className="flex-shrink-0 w-28 text-sm text-orange-600 font-medium">
                                {item.startTime}{item.endTime ? ` - ${item.endTime}` : ''}
                              </div>
                              <div className="flex-1">
                                <h5 className="text-sm text-gray-900 mb-0.5">{item.title}</h5>
                                {item.speaker && (
                                  <p className="text-xs text-gray-500">{item.speaker}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={onEdit}
              className="flex-1 px-6 py-3 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
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

// Registrations Modal Component
interface RegistrationsModalProps {
  activity: ActivityListResponse;
  onClose: () => void;
}

function RegistrationsModal({ activity, onClose }: RegistrationsModalProps) {
  const [registrations, setRegistrations] = useState<RegistrationResponse[]>([]);
  const [registrationsPage, setRegistrationsPage] = useState<Page<RegistrationResponse> | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<RegistrationStatus | ''>('');

  const loadRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getActivityRegistrations(activity.id, {
        page: currentPage - 1,
        size: 10,
        status: filterStatus || undefined,
      });
      if (result.success && result.data) {
        setRegistrations(result.data.content);
        setRegistrationsPage(result.data);
      }
    } finally {
      setLoading(false);
    }
  }, [activity.id, currentPage, filterStatus]);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  const handleUpdateStatus = async (regId: number, status: RegistrationStatus) => {
    try {
      const result = await updateRegistrationStatus(regId, status);
      if (result.success) {
        loadRegistrations();
      } else {
        alert(result.message || '更新失败');
      }
    } catch (error) {
      console.error('Failed to update registration status', error);
      alert('更新失败');
    }
  };

  const handleCancel = async (regId: number) => {
    if (!confirm('确定要取消此报名吗？')) return;
    try {
      const result = await cancelRegistration(regId);
      if (result.success) {
        loadRegistrations();
      } else {
        alert(result.message || '取消失败');
      }
    } catch (error) {
      console.error('Failed to cancel registration', error);
      alert('取消失败');
    }
  };

  const getRegStatusBadge = (status: RegistrationStatus) => {
    const colors: Record<RegistrationStatus, string> = {
      PENDING: 'bg-yellow-50 text-yellow-600',
      CONFIRMED: 'bg-green-50 text-green-600',
      CANCELLED: 'bg-gray-50 text-gray-600',
      ATTENDED: 'bg-blue-50 text-blue-600',
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${colors[status]}`}>
        {registrationStatusLabels[status]}
      </span>
    );
  };

  const totalPages = registrationsPage ? registrationsPage.page.totalPages : 1;
  const totalItems = registrationsPage ? registrationsPage.page.totalElements : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl mb-1">报名管理</h2>
              <p className="text-sm text-orange-100">{activity.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            共 {totalItems} 条报名记录
          </div>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as RegistrationStatus | '');
              setCurrentPage(1);
            }}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">全部状态</option>
            {Object.entries(registrationStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无报名记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {registrations.map((reg) => (
                <div key={reg.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{reg.name}</span>
                        {getRegStatusBadge(reg.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {reg.phone}
                        </span>
                        {reg.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {reg.email}
                          </span>
                        )}
                      </div>
                      {(reg.company || reg.position) && (
                        <div className="text-sm text-gray-500">
                          {reg.company}{reg.company && reg.position && ' · '}{reg.position}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        报名时间: {new Date(reg.createdTime).toLocaleString('zh-CN')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {reg.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(reg.id, 'CONFIRMED')}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            确认
                          </button>
                          <button
                            onClick={() => handleCancel(reg.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            取消
                          </button>
                        </>
                      )}
                      {reg.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateStatus(reg.id, 'ATTENDED')}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          签到
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && registrations.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                上一页
              </button>
              <span className="text-sm text-gray-600">
                第 {currentPage} / {totalPages} 页
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
