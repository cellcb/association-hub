import { Search, Filter, UserPlus, MoreVertical, CheckCircle, XCircle, Clock, Edit, Trash2, Eye, X, User, Mail, Phone, Building, Calendar, Shield, FileText, Building2, Briefcase, Award, MapPin, Globe, Users, ClipboardList, Loader2, AlertCircle, PlayCircle, PauseCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Pagination } from './Pagination';
import type { MemberResponse, MemberApplicationResponse, Page, MemberType, MemberStatus } from '@/types/member';
import { memberTypeLabels, memberStatusLabels, applicationStatusLabels } from '@/types/member';
import {
  getMembers,
  searchMembers,
  getMembersByType,
  getMembersByStatus,
  deleteMember,
  suspendMember,
  activateMember,
  getApplications,
  getApplicationsByStatus as getAppsByStatus,
  getApplicationsByMemberType,
  approveApplication,
  rejectApplication,
} from '@/lib/api';

// Tab 类型
type TabType = 'members' | 'applications';

// 会员状态显示标签
const getMemberStatusLabel = (status: MemberStatus): string => {
  return memberStatusLabels[status] || status;
};

// 会员类型显示标签
const getMemberTypeLabel = (type: MemberType): string => {
  return memberTypeLabels[type] || type;
};

export function MemberManagement() {
  // Tab 状态
  const [activeTab, setActiveTab] = useState<TabType>('members');

  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('全部');
  const [filterStatus, setFilterStatus] = useState<string>('全部');

  // 模态框状态
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // 选中项状态
  const [selectedMember, setSelectedMember] = useState<MemberResponse | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<MemberApplicationResponse | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // 会员列表数据
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [membersPage, setMembersPage] = useState<Page<MemberResponse> | null>(null);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);

  // 申请列表数据
  const [applications, setApplications] = useState<MemberApplicationResponse[]>([]);
  const [applicationsPage, setApplicationsPage] = useState<Page<MemberApplicationResponse> | null>(null);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);

  // 操作状态
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // 加载会员列表
  const loadMembers = useCallback(async () => {
    setMembersLoading(true);
    setMembersError(null);
    try {
      const params = { page: currentPage - 1, size: itemsPerPage };
      let result;

      if (searchTerm) {
        result = await searchMembers(searchTerm, params);
      } else if (filterType !== '全部') {
        const type = filterType === '个人会员' ? 'INDIVIDUAL' : 'ORGANIZATION';
        result = await getMembersByType(type as MemberType, params);
      } else if (filterStatus !== '全部') {
        const statusMap: Record<string, MemberStatus> = {
          '正常': 'ACTIVE',
          '已暂停': 'SUSPENDED',
          '已过期': 'EXPIRED',
        };
        result = await getMembersByStatus(statusMap[filterStatus], params);
      } else {
        result = await getMembers(params);
      }

      if (result.success && result.data) {
        setMembers(result.data.content);
        setMembersPage(result.data);
      } else {
        setMembersError(result.message || '加载会员列表失败');
      }
    } catch (error) {
      setMembersError('网络错误，请重试');
    } finally {
      setMembersLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, filterType, filterStatus]);

  // 加载申请列表
  const loadApplications = useCallback(async () => {
    setApplicationsLoading(true);
    setApplicationsError(null);
    try {
      const params = { page: currentPage - 1, size: itemsPerPage };
      let result;

      if (filterType !== '全部') {
        const type = filterType === '个人会员' ? 'INDIVIDUAL' : 'ORGANIZATION';
        result = await getApplicationsByMemberType(type as MemberType, params);
      } else if (filterStatus !== '全部') {
        const statusMap: Record<string, 'PENDING' | 'APPROVED' | 'REJECTED'> = {
          '待审核': 'PENDING',
          '已通过': 'APPROVED',
          '已拒绝': 'REJECTED',
        };
        result = await getAppsByStatus(statusMap[filterStatus], params);
      } else {
        result = await getApplications(params);
      }

      if (result.success && result.data) {
        setApplications(result.data.content);
        setApplicationsPage(result.data);
      } else {
        setApplicationsError(result.message || '加载申请列表失败');
      }
    } catch (error) {
      setApplicationsError('网络错误，请重试');
    } finally {
      setApplicationsLoading(false);
    }
  }, [currentPage, itemsPerPage, filterType, filterStatus]);

  // 根据当前 Tab 加载数据
  useEffect(() => {
    if (activeTab === 'members') {
      loadMembers();
    } else {
      loadApplications();
    }
  }, [activeTab, loadMembers, loadApplications]);

  // 切换 Tab 时重置分页和筛选
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm('');
    setFilterType('全部');
    setFilterStatus('全部');
  };

  // 处理搜索
  const handleSearch = () => {
    setCurrentPage(1);
    if (activeTab === 'members') {
      loadMembers();
    }
  };

  // 处理暂停会员
  const handleSuspend = async (id: number) => {
    setActionLoading(id);
    try {
      const result = await suspendMember(id);
      if (result.success) {
        loadMembers();
      } else {
        alert(result.message || '操作失败');
      }
    } catch (error) {
      alert('网络错误，请重试');
    } finally {
      setActionLoading(null);
    }
  };

  // 处理激活会员
  const handleActivate = async (id: number) => {
    setActionLoading(id);
    try {
      const result = await activateMember(id);
      if (result.success) {
        loadMembers();
      } else {
        alert(result.message || '操作失败');
      }
    } catch (error) {
      alert('网络错误，请重试');
    } finally {
      setActionLoading(null);
    }
  };

  // 处理删除会员
  const confirmDelete = async () => {
    if (!selectedMember) return;
    setActionLoading(selectedMember.id);
    try {
      const result = await deleteMember(selectedMember.id);
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedMember(null);
        loadMembers();
      } else {
        alert(result.message || '删除失败');
      }
    } catch (error) {
      alert('网络错误，请重试');
    } finally {
      setActionLoading(null);
    }
  };

  // 处理审核通过
  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      const result = await approveApplication(id);
      if (result.success) {
        loadApplications();
      } else {
        alert(result.message || '审核失败');
      }
    } catch (error) {
      alert('网络错误，请重试');
    } finally {
      setActionLoading(null);
    }
  };

  // 处理审核拒绝
  const confirmReject = async () => {
    if (!selectedApplication) return;
    setActionLoading(selectedApplication.id);
    try {
      const result = await rejectApplication(selectedApplication.id, rejectReason);
      if (result.success) {
        setShowRejectModal(false);
        setSelectedApplication(null);
        setRejectReason('');
        loadApplications();
      } else {
        alert(result.message || '操作失败');
      }
    } catch (error) {
      alert('网络错误，请重试');
    } finally {
      setActionLoading(null);
    }
  };

  // 分页相关 (适配 Spring Boot 3.x 返回的嵌套分页结构)
  const totalPages = activeTab === 'members'
    ? (membersPage?.page?.totalPages || 1)
    : (applicationsPage?.page?.totalPages || 1);
  const totalItems = activeTab === 'members'
    ? (membersPage?.page?.totalElements || 0)
    : (applicationsPage?.page?.totalElements || 0);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // 会员状态徽章
  const getMemberStatusBadge = (status: MemberStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            正常
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-full text-xs">
            <PauseCircle className="w-3 h-3" />
            已暂停
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs">
            <XCircle className="w-3 h-3" />
            已过期
          </span>
        );
      default:
        return null;
    }
  };

  // 申请状态徽章
  const getApplicationStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            待审核
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            已通过
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs">
            <XCircle className="w-3 h-3" />
            已拒绝
          </span>
        );
      default:
        return null;
    }
  };

  // 查看会员详情
  const handleViewMember = (member: MemberResponse) => {
    setSelectedMember(member);
    setShowViewModal(true);
  };

  // 删除会员
  const handleDeleteMember = (member: MemberResponse) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  // 打开拒绝模态框
  const handleOpenRejectModal = (application: MemberApplicationResponse) => {
    setSelectedApplication(application);
    setRejectReason('');
    setShowRejectModal(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl text-gray-900 mb-2">会员管理</h2>
        <p className="text-gray-600">管理会员信息和审核会员申请</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => handleTabChange('members')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'members'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <Users className="w-5 h-5" />
            会员列表
          </button>
          <button
            onClick={() => handleTabChange('applications')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'applications'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            待审核申请
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search - 仅会员列表显示 */}
          {activeTab === 'members' && (
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索会员姓名或邮箱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
          {activeTab === 'applications' && (
            <div className="flex-1">
              <span className="text-gray-600">审核会员申请，通过后自动创建会员账号</span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">筛选:</span>
          </div>

          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option>全部</option>
            <option>个人会员</option>
            <option>单位会员</option>
          </select>

          {activeTab === 'members' && (
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option>全部</option>
              <option>正常</option>
              <option>已暂停</option>
              <option>已过期</option>
            </select>
          )}

          {activeTab === 'applications' && (
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option>全部</option>
              <option>待审核</option>
              <option>已通过</option>
              <option>已拒绝</option>
            </select>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          共 {totalItems} 条记录
        </div>
      </div>

      {/* Loading State */}
      {(activeTab === 'members' ? membersLoading : applicationsLoading) && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">加载中...</span>
        </div>
      )}

      {/* Error State */}
      {(activeTab === 'members' ? membersError : applicationsError) && (
        <div className="bg-white rounded-xl border border-red-200 p-12 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <span className="ml-3 text-red-600">{activeTab === 'members' ? membersError : applicationsError}</span>
          <button
            onClick={() => activeTab === 'members' ? loadMembers() : loadApplications()}
            className="ml-4 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
          >
            重试
          </button>
        </div>
      )}

      {/* Members Table */}
      {activeTab === 'members' && !membersLoading && !membersError && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">会员信息</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">会员编号</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">类型</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">审核时间</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      暂无会员数据
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-gray-900">{member.displayName}</div>
                          {member.memberType === 'INDIVIDUAL' && member.individualMember && (
                            <div className="text-xs text-gray-500">{member.individualMember.organization}</div>
                          )}
                          {member.memberType === 'ORGANIZATION' && member.organizationMember && (
                            <div className="text-xs text-gray-500">{member.organizationMember.orgTypeDescription}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{member.memberNo || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{getMemberTypeLabel(member.memberType)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {member.approvedAt ? new Date(member.approvedAt).toLocaleDateString() : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getMemberStatusBadge(member.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewMember(member)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="查看"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {member.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleSuspend(member.id)}
                              disabled={actionLoading === member.id}
                              className="p-1 text-gray-400 hover:text-amber-600"
                              title="暂停"
                            >
                              {actionLoading === member.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <PauseCircle className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          {member.status === 'SUSPENDED' && (
                            <button
                              onClick={() => handleActivate(member.id)}
                              disabled={actionLoading === member.id}
                              className="p-1 text-gray-400 hover:text-green-600"
                              title="激活"
                            >
                              {actionLoading === member.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <PlayCircle className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMember(member)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
        </div>
      )}

      {/* Applications Table */}
      {activeTab === 'applications' && !applicationsLoading && !applicationsError && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">申请人</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">会员类型</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">联系方式</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">申请时间</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      暂无申请数据
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{app.username}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{getMemberTypeLabel(app.memberType)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          <div>{app.email}</div>
                          {app.phone && <div>{app.phone}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {new Date(app.createdTime).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getApplicationStatusBadge(app.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {app.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(app.id)}
                                disabled={actionLoading === app.id}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs disabled:opacity-50"
                              >
                                {actionLoading === app.id ? '处理中...' : '通过'}
                              </button>
                              <button
                                onClick={() => handleOpenRejectModal(app)}
                                disabled={actionLoading === app.id}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs disabled:opacity-50"
                              >
                                拒绝
                              </button>
                            </>
                          )}
                          {app.status === 'REJECTED' && app.rejectReason && (
                            <span className="text-xs text-red-500" title={app.rejectReason}>
                              拒绝原因: {app.rejectReason.slice(0, 20)}...
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
        </div>
      )}

      {/* View Member Modal */}
      {showViewModal && selectedMember && (
        <MemberViewModal
          member={selectedMember}
          onClose={() => { setShowViewModal(false); setSelectedMember(null); }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedMember && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl text-gray-900 mb-4">删除会员</h3>
            <p className="text-sm text-gray-600 mb-4">
              确定要删除会员 <strong>{selectedMember.displayName}</strong> 吗？此操作不可恢复。
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                onClick={() => { setShowDeleteModal(false); setSelectedMember(null); }}
              >
                取消
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                onClick={confirmDelete}
                disabled={actionLoading === selectedMember.id}
              >
                {actionLoading === selectedMember.id ? '删除中...' : '删除'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Application Modal */}
      {showRejectModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl text-gray-900 mb-4">拒绝申请</h3>
            <p className="text-sm text-gray-600 mb-4">
              确定要拒绝 <strong>{selectedApplication.username}</strong> 的会员申请吗？
            </p>
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">拒绝原因（可选）</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="请输入拒绝原因..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                onClick={() => { setShowRejectModal(false); setSelectedApplication(null); setRejectReason(''); }}
              >
                取消
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                onClick={confirmReject}
                disabled={actionLoading === selectedApplication.id}
              >
                {actionLoading === selectedApplication.id ? '处理中...' : '确认拒绝'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Member View Modal Component
function MemberViewModal({ member, onClose }: { member: MemberResponse; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
        <div className="relative p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Eye className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl mb-1">会员详情</h2>
              <p className="text-sm text-blue-100">{member.displayName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                基本信息
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">会员编号</div>
                  <div className="text-sm text-gray-900">{member.memberNo || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">会员类型</div>
                  <div className="text-sm text-gray-900">{getMemberTypeLabel(member.memberType)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">状态</div>
                  <div className="text-sm text-gray-900">{getMemberStatusLabel(member.status)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">审核时间</div>
                  <div className="text-sm text-gray-900">
                    {member.approvedAt ? new Date(member.approvedAt).toLocaleString() : '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Member Details */}
            {member.memberType === 'INDIVIDUAL' && member.individualMember && (
              <div>
                <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  个人信息
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">姓名</div>
                    <div className="text-sm text-gray-900">{member.individualMember.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">性别</div>
                    <div className="text-sm text-gray-900">{member.individualMember.gender || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">手机</div>
                    <div className="text-sm text-gray-900">{member.individualMember.phone || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">邮箱</div>
                    <div className="text-sm text-gray-900">{member.individualMember.email || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">单位</div>
                    <div className="text-sm text-gray-900">{member.individualMember.organization || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">职务</div>
                    <div className="text-sm text-gray-900">{member.individualMember.position || '-'}</div>
                  </div>
                  {member.individualMember.expertise && (
                    <div className="col-span-2">
                      <div className="text-xs text-gray-500 mb-1">专业领域</div>
                      <div className="text-sm text-gray-900">{member.individualMember.expertise}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Organization Member Details */}
            {member.memberType === 'ORGANIZATION' && member.organizationMember && (
              <div>
                <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  单位信息
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 mb-1">单位名称</div>
                    <div className="text-sm text-gray-900">{member.organizationMember.orgName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">单位类型</div>
                    <div className="text-sm text-gray-900">{member.organizationMember.orgTypeDescription || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">联系人</div>
                    <div className="text-sm text-gray-900">{member.organizationMember.contactPerson || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">联系电话</div>
                    <div className="text-sm text-gray-900">{member.organizationMember.contactPhone || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">联系邮箱</div>
                    <div className="text-sm text-gray-900">{member.organizationMember.contactEmail || '-'}</div>
                  </div>
                  {member.organizationMember.address && (
                    <div className="col-span-2">
                      <div className="text-xs text-gray-500 mb-1">地址</div>
                      <div className="text-sm text-gray-900">
                        {member.organizationMember.province} {member.organizationMember.city} {member.organizationMember.address}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
