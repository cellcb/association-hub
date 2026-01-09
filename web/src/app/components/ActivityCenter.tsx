import { Calendar, MapPin, Users, Clock, Tag, Filter, ExternalLink, X, User, Mail, Phone, Building2, FileText, CheckCircle, Loader2, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getPublicActivities, getPublicActivityById, registerActivity, getMyMemberRegistrationProfile } from '@/lib/api';
import type {
  ActivityListResponse,
  ActivityResponse,
  ActivityType,
  ActivityStatus,
  RegistrationRequest,
} from '@/types/activity';
import type { MemberRegistrationProfile } from '@/types/member';
import {
  activityTypeLabels,
  activityStatusLabels,
  parseActivityContact,
  parseActivityVenue,
  parseAgenda,
} from '@/types/activity';

// 前端筛选选项到后端枚举的映射
const typeFilterMap: Record<string, ActivityType | undefined> = {
  '全部活动': undefined,
  '会议': 'CONFERENCE',
  '培训': 'TRAINING',
  '研讨会': 'SEMINAR',
  '展览': 'EXHIBITION',
  '竞赛': 'COMPETITION',
  '其他': 'OTHER',
};

interface ActivityCenterProps {
  initialActivityId?: number;
}

export function ActivityCenter({ initialActivityId }: ActivityCenterProps) {
  // 列表数据状态
  const [activities, setActivities] = useState<ActivityListResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  // 筛选状态
  const [selectedType, setSelectedType] = useState('全部活动');

  // 详情和报名状态
  const [selectedActivity, setSelectedActivity] = useState<ActivityListResponse | null>(null);
  const [activityDetail, setActivityDetail] = useState<ActivityResponse | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // 报名表单数据
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    position: '',
    memberType: 'member',
    memberId: null as number | null,
    specialRequirements: ''
  });

  // 会员信息状态
  const [memberProfile, setMemberProfile] = useState<MemberRegistrationProfile | null>(null);
  const [loadingMemberProfile, setLoadingMemberProfile] = useState(false);

  const types = ['全部活动', '会议', '培训', '研讨会', '展览', '竞赛', '其他'];

  // 加载活动列表
  const loadActivities = useCallback(async () => {
    setLoading(true);
    try {
      const params: { page: number; size: number; type?: ActivityType } = {
        page: currentPage,
        size: pageSize,
      };

      const typeFilter = typeFilterMap[selectedType];
      if (typeFilter) {
        params.type = typeFilter;
      }

      const res = await getPublicActivities(params);
      if (res.success && res.data) {
        setActivities(res.data.content);
        setTotalPages(res.data.page.totalPages);
        setTotalElements(res.data.page.totalElements);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedType]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // 处理初始活动 ID，自动打开详情弹窗
  const initialActivityIdRef = useRef<number | undefined>(initialActivityId);
  useEffect(() => {
    if (initialActivityId && initialActivityId !== initialActivityIdRef.current) {
      initialActivityIdRef.current = initialActivityId;
    }
    if (initialActivityId) {
      // 直接加载并打开详情弹窗
      const loadInitialActivity = async () => {
        setDetailLoading(true);
        setShowDetailModal(true);
        try {
          const res = await getPublicActivityById(initialActivityId);
          if (res.success && res.data) {
            setActivityDetail(res.data);
            // 创建一个简化的 ActivityListResponse 用于显示
            setSelectedActivity({
              id: res.data.id,
              title: res.data.title,
              type: res.data.type,
              typeName: res.data.typeName,
              status: res.data.status,
              statusName: res.data.statusName,
              date: res.data.date,
              time: res.data.time,
              location: res.data.location,
              fee: res.data.fee,
              capacity: res.data.capacity,
              registeredCount: res.data.registeredCount,
              description: res.data.description,
              organization: res.data.organization,
            });
          }
        } catch (error) {
          console.error('Failed to load initial activity:', error);
          setShowDetailModal(false);
        } finally {
          setDetailLoading(false);
        }
      };
      loadInitialActivity();
    }
  }, [initialActivityId]);

  // 类型筛选变化时重置页码
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setCurrentPage(0);
  };

  // 状态颜色
  const getStatusColor = (status: ActivityStatus) => {
    switch (status) {
      case 'UPCOMING':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'ONGOING':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'ENDED':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  // 类型颜色
  const getTypeColor = (type: ActivityType) => {
    switch (type) {
      case 'CONFERENCE':
        return 'bg-purple-50 text-purple-600';
      case 'TRAINING':
        return 'bg-green-50 text-green-600';
      case 'SEMINAR':
        return 'bg-blue-50 text-blue-600';
      case 'EXHIBITION':
        return 'bg-orange-50 text-orange-600';
      case 'COMPETITION':
        return 'bg-pink-50 text-pink-600';
      case 'OTHER':
        return 'bg-gray-50 text-gray-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  // 格式化日期显示
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // 格式化时间显示
  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5); // HH:mm:ss -> HH:mm
  };

  // 格式化费用显示
  const formatFee = (fee: string | null) => {
    if (!fee || fee === '0' || fee === '0.00') return '免费';
    return `会员免费 / 非会员 ¥${parseFloat(fee)}`;
  };

  // 移除 HTML 标签，用于列表显示
  const stripHtml = (html: string | null) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  };

  // 获取日期中的日
  const getDayFromDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.getDate().toString();
  };

  // 获取日期中的月
  const getMonthFromDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return (date.getMonth() + 1).toString();
  };

  // 打开报名表单
  const handleRegistration = async (activity: ActivityListResponse) => {
    setSelectedActivity(activity);
    setShowRegistrationForm(true);
    setLoadingMemberProfile(true);

    try {
      const res = await getMyMemberRegistrationProfile();
      if (res.success && res.data) {
        setMemberProfile(res.data);
        // 自动填充表单
        setFormData({
          name: res.data.name || '',
          phone: res.data.phone || '',
          email: res.data.email || '',
          company: res.data.company || '',
          position: res.data.position || '',
          memberType: 'member',
          memberId: res.data.memberId,
          specialRequirements: ''
        });
      } else {
        setMemberProfile(null);
      }
    } catch (error) {
      console.error('Failed to load member profile:', error);
      setMemberProfile(null);
    } finally {
      setLoadingMemberProfile(false);
    }
  };

  // 表单变化处理
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 提交报名
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;

    setSubmitting(true);
    try {
      const request: RegistrationRequest = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        company: formData.company || undefined,
        position: formData.position || undefined,
        memberType: formData.memberType,
        memberId: formData.memberId || undefined,
        specialRequirements: formData.specialRequirements || undefined,
      };

      const res = await registerActivity(selectedActivity.id, request);
      if (res.success) {
        setRegistrationSuccess(true);
        // 刷新列表以更新报名人数
        loadActivities();
      } else {
        alert(res.message || '报名失败，请稍后重试');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert('报名失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 关闭报名表单
  const closeRegistrationForm = () => {
    setShowRegistrationForm(false);
    setRegistrationSuccess(false);
    setMemberProfile(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      company: '',
      position: '',
      memberType: 'member',
      memberId: null,
      specialRequirements: ''
    });
  };

  // 打开详情弹窗
  const openDetailModal = async (activity: ActivityListResponse) => {
    setSelectedActivity(activity);
    setShowDetailModal(true);
    setDetailLoading(true);

    try {
      const res = await getPublicActivityById(activity.id);
      if (res.success && res.data) {
        setActivityDetail(res.data);
      }
    } catch (error) {
      console.error('Failed to load activity detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  // 关闭详情弹窗
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedActivity(null);
    setActivityDetail(null);
  };

  // 解析详情中的 JSON 字段
  const contact = activityDetail ? parseActivityContact(activityDetail.contact) : null;
  const venue = activityDetail ? parseActivityVenue(activityDetail.venue) : null;
  const agenda = activityDetail ? parseAgenda(activityDetail.agenda) : [];
  const benefits = activityDetail?.benefits ? (() => {
    try {
      const parsed = JSON.parse(activityDetail.benefits);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })() : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-gray-900 mb-2">活动中心</h1>
          <p className="text-gray-600">参与丰富多彩的行业活动，拓展人脉，提升专业能力</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">筛选活动</span>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2">活动类型</div>
            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
            {loading ? '加载中...' : `找到 ${totalElements} 个活动`}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Activities List */}
        {!loading && (
          <div className="space-y-6">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="md:flex">
                  {/* Left Section - Date Badge */}
                  <div className="md:w-32 bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 flex flex-col items-center justify-center">
                    <Calendar className="w-8 h-8 mb-2" />
                    <div className="text-center">
                      <div className="text-2xl">{getDayFromDate(activity.date)}</div>
                      <div className="text-sm opacity-90">{getMonthFromDate(activity.date)}月</div>
                    </div>
                  </div>

                  {/* Right Section - Content */}
                  <div className="flex-1 p-6">
                    {/* Header */}
                    <div className="flex flex-wrap items-start gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${getTypeColor(activity.type)}`}>
                        {activityTypeLabels[activity.type] || activity.typeName}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(activity.status)}`}>
                        {activityStatusLabels[activity.status] || activity.statusName}
                      </span>
                      {activity.status === 'UPCOMING' && activity.capacity && (
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-sm">
                          {activity.registeredCount}/{activity.capacity} 已报名
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl text-gray-900 mb-3">{activity.title}</h3>

                    {/* Description */}
                    {activity.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {stripHtml(activity.description)}
                      </p>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
                      {activity.time && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(activity.time)}</span>
                        </div>
                      )}
                      {activity.location && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{activity.location}</span>
                        </div>
                      )}
                      {activity.capacity && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{activity.capacity} 人容量</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Tag className="w-4 h-4" />
                        <span>{formatFee(activity.fee)}</span>
                      </div>
                    </div>

                    {/* Organization */}
                    {activity.organization && (
                      <div className="text-sm text-gray-600 mb-4">
                        <span className="text-gray-700">主办单位：</span>{activity.organization}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {activity.status === 'UPCOMING' && (
                        <button
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                          onClick={() => handleRegistration(activity)}
                        >
                          <span>立即报名</span>
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => openDetailModal(activity)}
                      >
                        查看详情
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && activities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-600 mb-2">暂无符合条件的活动</p>
            <p className="text-sm text-gray-500">请尝试其他筛选条件</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-10 h-10 rounded-lg ${
                    currentPage === i
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Registration Form Modal */}
        {showRegistrationForm && selectedActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="relative p-6 border-b border-gray-100">
                <div className="text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-xl text-gray-900 mb-1">活动报名</h2>
                  <p className="text-sm text-gray-500">填写报名信息，参与精彩活动</p>
                </div>
                <button
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={closeRegistrationForm}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Activity Info Banner */}
              <div className="mx-6 mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                    <span className="text-lg font-medium">{getDayFromDate(selectedActivity.date)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{selectedActivity.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(selectedActivity.time)}
                      </span>
                      {selectedActivity.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {selectedActivity.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {registrationSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <p className="text-xl text-gray-900 mb-2">报名成功！</p>
                    <p className="text-gray-600 mb-8">感谢您的报名，我们将尽快与您联系。</p>
                    <button
                      onClick={closeRegistrationForm}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                    >
                      关闭
                    </button>
                  </div>
                ) : loadingMemberProfile ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                    <span className="text-gray-600">正在加载会员信息...</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* 会员自动填充提示 */}
                    {memberProfile && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserCheck className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-800">已自动填充会员信息</p>
                          <p className="text-xs text-green-600">会员号：{memberProfile.memberNo}</p>
                        </div>
                      </div>
                    )}

                    {/* 基本信息分组 */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <User className="w-4 h-4 text-blue-600" />
                        <span>基本信息</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1.5">
                            姓名 <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleFormChange}
                              placeholder="请输入姓名"
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1.5">
                            电话 <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleFormChange}
                              placeholder="请输入电话"
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1.5">邮箱</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleFormChange}
                            placeholder="请输入邮箱"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 工作信息分组 */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span>工作信息</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1.5">公司/单位</label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              name="company"
                              value={formData.company}
                              onChange={handleFormChange}
                              placeholder="请输入公司/单位"
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1.5">职位</label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              name="position"
                              value={formData.position}
                              onChange={handleFormChange}
                              placeholder="请输入职位"
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 报名选项分组 */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Tag className="w-4 h-4 text-blue-600" />
                        <span>报名选项</span>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1.5">参会类型</label>
                        <div className="grid grid-cols-2 gap-3">
                          <label
                            className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                              formData.memberType === 'member'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <input
                              type="radio"
                              name="memberType"
                              value="member"
                              checked={formData.memberType === 'member'}
                              onChange={handleFormChange}
                              className="sr-only"
                            />
                            <UserCheck className={`w-4 h-4 ${formData.memberType === 'member' ? 'text-blue-600' : 'text-gray-400'}`} />
                            <span className="text-sm font-medium">会员</span>
                            {selectedActivity.fee && selectedActivity.fee !== '0' && (
                              <span className="text-xs text-green-600 font-medium">免费</span>
                            )}
                          </label>
                          <label
                            className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                              formData.memberType === 'non-member'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <input
                              type="radio"
                              name="memberType"
                              value="non-member"
                              checked={formData.memberType === 'non-member'}
                              onChange={handleFormChange}
                              className="sr-only"
                            />
                            <Users className={`w-4 h-4 ${formData.memberType === 'non-member' ? 'text-blue-600' : 'text-gray-400'}`} />
                            <span className="text-sm font-medium">非会员</span>
                            {selectedActivity.fee && selectedActivity.fee !== '0' && (
                              <span className="text-xs text-orange-600 font-medium">¥{parseFloat(selectedActivity.fee)}</span>
                            )}
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1.5">特殊要求（可选）</label>
                        <textarea
                          name="specialRequirements"
                          value={formData.specialRequirements}
                          onChange={handleFormChange}
                          placeholder="如有特殊需求，请在此说明..."
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            提交中...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            确认报名
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedActivity && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8">
              {/* Modal Header */}
              <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-8 md:p-10 text-white rounded-t-2xl">
                <button
                  onClick={closeDetailModal}
                  className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="flex items-start gap-3 mb-4">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                    {activityTypeLabels[selectedActivity.type] || selectedActivity.typeName}
                  </span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                    {activityStatusLabels[selectedActivity.status] || selectedActivity.statusName}
                  </span>
                  {selectedActivity.status === 'UPCOMING' && selectedActivity.capacity && (
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                      {selectedActivity.registeredCount}/{selectedActivity.capacity} 已报名
                    </span>
                  )}
                </div>

                <h1 className="text-2xl md:text-4xl mb-4 leading-tight">
                  {selectedActivity.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {selectedActivity.date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(selectedActivity.date)}</span>
                    </div>
                  )}
                  {selectedActivity.time && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(selectedActivity.time)}</span>
                    </div>
                  )}
                  {selectedActivity.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedActivity.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 md:p-10 max-h-[70vh] overflow-y-auto">
                {detailLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : activityDetail ? (
                  <>
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-6 bg-gray-50 rounded-xl">
                      <div>
                        <h3 className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          活动时间
                        </h3>
                        <p className="text-gray-900">
                          {formatDate(activityDetail.date)}
                          {activityDetail.endDate && activityDetail.endDate !== activityDetail.date && (
                            <> - {formatDate(activityDetail.endDate)}</>
                          )}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatTime(activityDetail.time)}
                          {activityDetail.endTime && (
                            <> - {formatTime(activityDetail.endTime)}</>
                          )}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          报名截止
                        </h3>
                        <p className="text-gray-900">
                          {activityDetail.registrationEndDate
                            ? formatDate(activityDetail.registrationEndDate)
                            : '活动开始前'}
                        </p>
                        {activityDetail.registrationEndTime && (
                          <p className="text-sm text-gray-600">{formatTime(activityDetail.registrationEndTime)}</p>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          活动容量
                        </h3>
                        <p className="text-gray-900">{activityDetail.capacity ? `${activityDetail.capacity} 人` : '不限'}</p>
                        <p className="text-sm text-gray-600">已报名 {activityDetail.registeredCount || 0} 人</p>
                      </div>
                      <div>
                        <h3 className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          参会费用
                        </h3>
                        <p className="text-gray-900">{formatFee(activityDetail.fee)}</p>
                      </div>
                    </div>

                    {/* Organization Info */}
                    {activityDetail.organization && (
                      <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 text-blue-800">
                          <Building2 className="w-5 h-5" />
                          <span className="font-medium">主办单位：</span>
                          <span>{activityDetail.organization}</span>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div className="mb-8">
                      <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        活动简介
                      </h2>
                      {activityDetail.description && (
                        <div
                          className="text-gray-700 leading-relaxed mb-4 prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: activityDetail.description }}
                        />
                      )}
                      {activityDetail.detailedDescription && (
                        <div
                          className="text-gray-700 leading-relaxed prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: activityDetail.detailedDescription }}
                        />
                      )}
                    </div>

                    {/* Speaker */}
                    {activityDetail.speaker && (
                      <div className="mb-8">
                        <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                          <User className="w-5 h-5 text-blue-600" />
                          演讲嘉宾
                        </h2>
                        <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                          <h3 className="text-lg text-gray-900 mb-2">{activityDetail.speaker}</h3>
                          {activityDetail.speakerBio && (
                            <p className="text-sm text-gray-700 leading-relaxed">{activityDetail.speakerBio}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Agenda */}
                    {agenda.length > 0 && (
                      <div className="mb-8">
                        <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          活动议程
                        </h2>
                        <div className="space-y-4">
                          {agenda.map((day, dayIndex) => (
                            <div key={dayIndex}>
                              {day.date && (
                                <h3 className="text-lg font-medium text-gray-900 mb-3">{day.date}</h3>
                              )}
                              <div className="space-y-3">
                                {day.items.map((item, itemIndex) => (
                                  <div key={itemIndex} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all">
                                    <div className="flex-shrink-0 w-28 text-sm text-blue-600">
                                      {item.startTime} - {item.endTime}
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="text-gray-900 mb-1">{item.title}</h4>
                                      {item.speaker && (
                                        <p className="text-sm text-gray-600">{item.speaker}</p>
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

                    {/* Benefits */}
                    {benefits.length > 0 && (
                      <div className="mb-8">
                        <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                          参会收益
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {benefits.map((benefit: string, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Venue */}
                    {(activityDetail.location || (venue && (venue.address || venue.directions))) && (
                      <div className="mb-8">
                        <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          活动地点
                        </h2>
                        <div className="p-5 bg-gray-50 rounded-xl space-y-3">
                          {activityDetail.location && (
                            <div className="flex items-start gap-3">
                              <Building2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-lg text-gray-900 font-medium">{activityDetail.location}</p>
                                {venue?.address && (
                                  <p className="text-sm text-gray-600 mt-1">{venue.address}</p>
                                )}
                              </div>
                            </div>
                          )}
                          {venue?.directions && (
                            <div className="flex items-start gap-3 pt-2 border-t border-gray-200">
                              <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-700">交通指引</p>
                                <p className="text-sm text-gray-600">{venue.directions}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contact */}
                    {contact && (contact.name || contact.phone || contact.email) && (
                      <div className="mb-8">
                        <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                          <Phone className="w-5 h-5 text-blue-600" />
                          联系方式
                        </h2>
                        <div className="p-5 bg-gray-50 rounded-xl">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {contact.name && (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">联系人</p>
                                  <p className="text-gray-900">{contact.name}</p>
                                </div>
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                  <Phone className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">联系电话</p>
                                  <p className="text-gray-900">{contact.phone}</p>
                                </div>
                              </div>
                            )}
                            {contact.email && (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                  <Mail className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">电子邮箱</p>
                                  <p className="text-gray-900">{contact.email}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    {selectedActivity.status === 'UPCOMING' && (
                      <div className="flex gap-3">
                        <button
                          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                          onClick={() => {
                            closeDetailModal();
                            handleRegistration(selectedActivity);
                          }}
                        >
                          <span>立即报名</span>
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    加载失败，请重试
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
