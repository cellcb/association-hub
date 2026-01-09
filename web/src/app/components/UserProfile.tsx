import { useState, useEffect } from 'react';
import { User, Mail, Phone, Building2, MapPin, Calendar, Shield, Edit2, Save, X, Camera, Briefcase, Award, Globe, Users, FileText, Loader2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getMyMemberProfile, updateMyIndividualProfile, updateMyOrganizationProfile, getMyMemberRegistrationProfile } from '@/lib/api';
import type { MemberResponse, IndividualMemberUpdateRequest, OrganizationMemberUpdateRequest, OrganizationType, organizationTypeLabels } from '@/types/member';

interface UserProfileProps {
  onBack?: () => void;
}

// Organization type options
const ORGANIZATION_TYPES: { value: OrganizationType; label: string }[] = [
  { value: 'EQUIPMENT', label: '设备单位' },
  { value: 'CONSTRUCTION', label: '建设单位' },
  { value: 'INSTITUTION', label: '事业单位' },
  { value: 'MANAGEMENT', label: '管理单位' },
  { value: 'DESIGN', label: '设计单位' },
];

// Helper function to parse JSON array string or comma-separated string
function parseArrayField(value: string | null | undefined): string[] {
  if (!value) return [];
  const trimmed = value.trim();
  if (!trimmed) return [];

  // Try to parse as JSON array
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map(item => String(item).trim()).filter(Boolean);
      }
    } catch {
      // If JSON parsing fails, fall through to comma-separated handling
    }
  }

  // Treat as comma-separated string
  return trimmed.split(',').map(item => item.trim()).filter(Boolean);
}

// Helper function to convert array to comma-separated string for editing
function arrayFieldToString(value: string | null | undefined): string {
  const arr = parseArrayField(value);
  return arr.join(', ');
}

export function UserProfile({ onBack }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'professional'>('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memberData, setMemberData] = useState<MemberResponse | null>(null);
  const [editedData, setEditedData] = useState<IndividualMemberUpdateRequest | OrganizationMemberUpdateRequest>({});

  // Fetch member profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      // First check if user is a member via /api/iam/users/me
      const checkRes = await getMyMemberRegistrationProfile();
      if (!checkRes.success || !checkRes.data) {
        // User is not a member
        setError('您还不是会员');
        setLoading(false);
        return;
      }

      // User is a member, fetch full profile
      const res = await getMyMemberProfile();
      if (res.success && res.data) {
        setMemberData(res.data);
        // Initialize edited data based on member type
        if (res.data.memberType === 'INDIVIDUAL' && res.data.individualMember) {
          const ind = res.data.individualMember;
          setEditedData({
            name: ind.name,
            gender: ind.gender,
            phone: ind.phone,
            email: ind.email,
            organization: ind.organization,
            position: ind.position,
            title: ind.title,
            expertise: ind.expertise,
            province: ind.province,
            city: ind.city,
            address: ind.address,
            education: ind.education,
            experience: ind.experience,
            achievements: ind.achievements,
          } as IndividualMemberUpdateRequest);
        } else if (res.data.memberType === 'ORGANIZATION' && res.data.organizationMember) {
          const org = res.data.organizationMember;
          setEditedData({
            orgName: org.orgName,
            orgType: org.orgType as OrganizationType,
            socialCreditCode: org.socialCreditCode,
            legalRepresentative: org.legalRepresentative,
            contactPerson: org.contactPerson,
            contactPhone: org.contactPhone,
            contactEmail: org.contactEmail,
            establishmentDate: org.establishmentDate,
            registeredCapital: org.registeredCapital,
            employeeCount: org.employeeCount,
            businessScope: org.businessScope,
            qualifications: org.qualifications,
            projects: org.projects,
            province: org.province,
            city: org.city,
            address: org.address,
            website: org.website,
            introduction: org.introduction,
          } as OrganizationMemberUpdateRequest);
        }
      } else {
        setError(res.message || '您还不是会员');
      }
    } catch (err) {
      setError('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!memberData) return;

    setSaving(true);
    try {
      let res;
      if (memberData.memberType === 'INDIVIDUAL') {
        res = await updateMyIndividualProfile(editedData as IndividualMemberUpdateRequest);
      } else {
        res = await updateMyOrganizationProfile(editedData as OrganizationMemberUpdateRequest);
      }

      if (res.success && res.data) {
        setMemberData(res.data);
        setIsEditing(false);
      } else {
        setError(res.message || '保存失败');
      }
    } catch (err) {
      setError('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset edited data from current member data
    if (memberData?.memberType === 'INDIVIDUAL' && memberData.individualMember) {
      const ind = memberData.individualMember;
      setEditedData({
        name: ind.name,
        gender: ind.gender,
        phone: ind.phone,
        email: ind.email,
        organization: ind.organization,
        position: ind.position,
        title: ind.title,
        expertise: ind.expertise,
        province: ind.province,
        city: ind.city,
        address: ind.address,
        education: ind.education,
        experience: ind.experience,
        achievements: ind.achievements,
      } as IndividualMemberUpdateRequest);
    } else if (memberData?.memberType === 'ORGANIZATION' && memberData.organizationMember) {
      const org = memberData.organizationMember;
      setEditedData({
        orgName: org.orgName,
        orgType: org.orgType as OrganizationType,
        socialCreditCode: org.socialCreditCode,
        legalRepresentative: org.legalRepresentative,
        contactPerson: org.contactPerson,
        contactPhone: org.contactPhone,
        contactEmail: org.contactEmail,
        establishmentDate: org.establishmentDate,
        registeredCapital: org.registeredCapital,
        employeeCount: org.employeeCount,
        businessScope: org.businessScope,
        qualifications: org.qualifications,
        projects: org.projects,
        province: org.province,
        city: org.city,
        address: org.address,
        website: org.website,
        introduction: org.introduction,
      } as OrganizationMemberUpdateRequest);
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // Not a member state
  if (!memberData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl text-gray-900 mb-2">您还不是会员</h2>
          <p className="text-gray-600 mb-6">{error || '请先申请成为会员后再访问个人中心'}</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const isIndividual = memberData.memberType === 'INDIVIDUAL';
  const individual = memberData.individualMember;
  const organization = memberData.organizationMember;

  // Tabs based on member type
  const tabs = isIndividual
    ? [
        { id: 'basic' as const, label: '基本信息', icon: User },
        { id: 'contact' as const, label: '联系方式', icon: Phone },
        { id: 'professional' as const, label: '专业信息', icon: Briefcase },
      ]
    : [
        { id: 'basic' as const, label: '单位信息', icon: Building2 },
        { id: 'contact' as const, label: '联系方式', icon: Phone },
        { id: 'professional' as const, label: '业务信息', icon: FileText },
      ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700">
              <X className="w-4 h-4 inline" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl text-gray-900 mb-2">个人中心</h1>
            <p className="text-gray-600">查看和编辑您的{isIndividual ? '个人' : '单位'}信息</p>
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  保存
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                编辑资料
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Member Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              {/* Avatar/Logo */}
              <div className="relative mb-4">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-100 relative">
                  {(isIndividual ? individual?.avatar : organization?.logo) ? (
                    <ImageWithFallback
                      src={isIndividual ? individual?.avatar : organization?.logo}
                      alt={memberData.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600">
                      {isIndividual ? (
                        <User className="w-16 h-16 text-white" />
                      ) : (
                        <Building2 className="w-16 h-16 text-white" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Member Info */}
              <div className="text-center mb-6">
                <h2 className="text-xl text-gray-900 mb-2">{memberData.displayName}</h2>
                {isIndividual && individual && (
                  <>
                    <p className="text-sm text-gray-600 mb-1">{individual.position}</p>
                    <p className="text-sm text-gray-500">{individual.organization}</p>
                  </>
                )}
                {!isIndividual && organization && (
                  <p className="text-sm text-gray-600">{organization.orgTypeDescription}</p>
                )}
              </div>

              {/* Member Badge */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-4 text-white mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-6 h-6" />
                  <div>
                    <div className="text-sm opacity-90">会员类型</div>
                    <div className="text-lg">{memberData.memberTypeDescription}</div>
                  </div>
                </div>
                <div className="text-xs opacity-90 space-y-1">
                  <div>会员编号：{memberData.memberNo}</div>
                  <div>状态：{memberData.statusDescription}</div>
                  {memberData.approvedAt && <div>入会时间：{memberData.approvedAt.split('T')[0]}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Detailed Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex overflow-x-auto">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {isIndividual ? (
                  // Individual Member Tabs
                  <>
                    {activeTab === 'basic' && (
                      <IndividualBasicTab
                        data={individual!}
                        editedData={editedData as IndividualMemberUpdateRequest}
                        isEditing={isEditing}
                        onChange={handleInputChange}
                      />
                    )}
                    {activeTab === 'contact' && (
                      <IndividualContactTab
                        data={individual!}
                        editedData={editedData as IndividualMemberUpdateRequest}
                        isEditing={isEditing}
                        onChange={handleInputChange}
                      />
                    )}
                    {activeTab === 'professional' && (
                      <IndividualProfessionalTab
                        data={individual!}
                        editedData={editedData as IndividualMemberUpdateRequest}
                        isEditing={isEditing}
                        onChange={handleInputChange}
                      />
                    )}
                  </>
                ) : (
                  // Organization Member Tabs
                  <>
                    {activeTab === 'basic' && (
                      <OrganizationBasicTab
                        data={organization!}
                        editedData={editedData as OrganizationMemberUpdateRequest}
                        isEditing={isEditing}
                        onChange={handleInputChange}
                      />
                    )}
                    {activeTab === 'contact' && (
                      <OrganizationContactTab
                        data={organization!}
                        editedData={editedData as OrganizationMemberUpdateRequest}
                        isEditing={isEditing}
                        onChange={handleInputChange}
                      />
                    )}
                    {activeTab === 'professional' && (
                      <OrganizationBusinessTab
                        data={organization!}
                        editedData={editedData as OrganizationMemberUpdateRequest}
                        isEditing={isEditing}
                        onChange={handleInputChange}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Individual Member Tab Components ====================

interface IndividualTabProps {
  data: NonNullable<MemberResponse['individualMember']>;
  editedData: IndividualMemberUpdateRequest;
  isEditing: boolean;
  onChange: (field: string, value: any) => void;
}

function IndividualBasicTab({ data, editedData, isEditing, onChange }: IndividualTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-2">姓名</label>
          {isEditing ? (
            <input
              type="text"
              value={editedData.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center gap-2 text-gray-900">
              <User className="w-4 h-4 text-gray-400" />
              {data.name || '-'}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">性别</label>
          {isEditing ? (
            <select
              value={editedData.gender || ''}
              onChange={(e) => onChange('gender', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">请选择</option>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          ) : (
            <div className="text-gray-900">{data.gender || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">学历</label>
          {isEditing ? (
            <select
              value={editedData.education || ''}
              onChange={(e) => onChange('education', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">请选择</option>
              <option value="高中">高中</option>
              <option value="大专">大专</option>
              <option value="本科">本科</option>
              <option value="硕士">硕士</option>
              <option value="博士">博士</option>
            </select>
          ) : (
            <div className="text-gray-900">{data.education || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">职称</label>
          {isEditing ? (
            <input
              type="text"
              value={editedData.title || ''}
              onChange={(e) => onChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center gap-2 text-gray-900">
              <Award className="w-4 h-4 text-gray-400" />
              {data.title || '-'}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">工作年限</label>
          {isEditing ? (
            <input
              type="text"
              value={editedData.experience || ''}
              onChange={(e) => onChange('experience', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="text-gray-900">{data.experience || '-'}</div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-2">主要业绩</label>
        {isEditing ? (
          <textarea
            value={editedData.achievements || ''}
            onChange={(e) => onChange('achievements', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ) : (
          <div className="text-gray-900 leading-relaxed">{data.achievements || '-'}</div>
        )}
      </div>
    </div>
  );
}

function IndividualContactTab({ data, editedData, isEditing, onChange }: IndividualTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-2">邮箱</label>
          {isEditing ? (
            <input
              type="email"
              value={editedData.email || ''}
              onChange={(e) => onChange('email', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center gap-2 text-gray-900">
              <Mail className="w-4 h-4 text-gray-400" />
              {data.email || '-'}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">手机号码</label>
          {isEditing ? (
            <input
              type="tel"
              value={editedData.phone || ''}
              onChange={(e) => onChange('phone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center gap-2 text-gray-900">
              <Phone className="w-4 h-4 text-gray-400" />
              {data.phone || '-'}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">省份</label>
          {isEditing ? (
            <input
              type="text"
              value={editedData.province || ''}
              onChange={(e) => onChange('province', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="text-gray-900">{data.province || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">城市</label>
          {isEditing ? (
            <input
              type="text"
              value={editedData.city || ''}
              onChange={(e) => onChange('city', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center gap-2 text-gray-900">
              <MapPin className="w-4 h-4 text-gray-400" />
              {data.city || '-'}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-2">详细地址</label>
          {isEditing ? (
            <input
              type="text"
              value={editedData.address || ''}
              onChange={(e) => onChange('address', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="text-gray-900">{data.address || '-'}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function IndividualProfessionalTab({ data, editedData, isEditing, onChange }: IndividualTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-2">工作单位</label>
          {isEditing ? (
            <input
              type="text"
              value={editedData.organization || ''}
              onChange={(e) => onChange('organization', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center gap-2 text-gray-900">
              <Building2 className="w-4 h-4 text-gray-400" />
              {data.organization || '-'}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">职位</label>
          {isEditing ? (
            <input
              type="text"
              value={editedData.position || ''}
              onChange={(e) => onChange('position', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center gap-2 text-gray-900">
              <Briefcase className="w-4 h-4 text-gray-400" />
              {data.position || '-'}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">专业领域</label>
          {isEditing ? (
            <input
              type="text"
              value={arrayFieldToString(editedData.expertise)}
              onChange={(e) => onChange('expertise', e.target.value)}
              placeholder="多个领域用逗号分隔"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {parseArrayField(data.expertise).length > 0 ? (
                parseArrayField(data.expertise).map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">-</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== Organization Member Tab Components ====================

interface OrganizationTabProps {
  data: NonNullable<MemberResponse['organizationMember']>;
  editedData: OrganizationMemberUpdateRequest;
  isEditing: boolean;
  onChange: (field: string, value: any) => void;
}

function OrganizationBasicTab({ data, editedData, isEditing, onChange }: OrganizationTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-2">单位名称</label>
          {isEditing ? (
            <input
              type="text"
              value={editedData.orgName || ''}
              onChange={(e) => onChange('orgName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center gap-2 text-gray-900">
              <Building2 className="w-4 h-4 text-gray-400" />
              {data.orgName || '-'}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">单位类型</label>
          {isEditing ? (
            <select
              value={editedData.orgType || ''}
              onChange={(e) => onChange('orgType', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">请选择</option>
              {ORGANIZATION_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          ) : (
            <div className="text-gray-900">{data.orgTypeDescription || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">统一社会信用代码</label>
          {isEditing ? (
            <input
              type="text"
              value={editedData.socialCreditCode || ''}
              onChange={(e) => onChange('socialCreditCode', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="text-gray-900">{data.socialCreditCode || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">成立日期</label>
          {isEditing ? (
            <input
              type="date"
              value={editedData.establishmentDate || ''}
              onChange={(e) => onChange('establishmentDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center gap-2 text-gray-900">
              <Calendar className="w-4 h-4 text-gray-400" />
              {data.establishmentDate || '-'}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">注册资本</label>
          {isEditing ? (
            <input
              type="text"
              value={editedData.registeredCapital || ''}
              onChange={(e) => onChange('registeredCapital', e.target.value)}
              placeholder="如：1000万元"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="text-gray-900">{data.registeredCapital || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">员工人数</label>
          {isEditing ? (
            <input
              type="number"
              value={editedData.employeeCount || ''}
              onChange={(e) => onChange('employeeCount', parseInt(e.target.value) || undefined)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center gap-2 text-gray-900">
              <Users className="w-4 h-4 text-gray-400" />
              {data.employeeCount ? `${data.employeeCount}人` : '-'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrganizationContactTab({ data, editedData, isEditing, onChange }: OrganizationTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-2">联系人</label>
          {isEditing ? (
            <input
              type="text"
              value={editedData.contactPerson || ''}
              onChange={(e) => onChange('contactPerson', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center gap-2 text-gray-900">
              <User className="w-4 h-4 text-gray-400" />
              {data.contactPerson || '-'}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">联系电话</label>
          {isEditing ? (
            <input
              type="tel"
              value={editedData.contactPhone || ''}
              onChange={(e) => onChange('contactPhone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center gap-2 text-gray-900">
              <Phone className="w-4 h-4 text-gray-400" />
              {data.contactPhone || '-'}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">联系邮箱</label>
          {isEditing ? (
            <input
              type="email"
              value={editedData.contactEmail || ''}
              onChange={(e) => onChange('contactEmail', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center gap-2 text-gray-900">
              <Mail className="w-4 h-4 text-gray-400" />
              {data.contactEmail || '-'}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">网站</label>
          {isEditing ? (
            <input
              type="url"
              value={editedData.website || ''}
              onChange={(e) => onChange('website', e.target.value)}
              placeholder="https://"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center gap-2 text-gray-900">
              <Globe className="w-4 h-4 text-gray-400" />
              {data.website ? (
                <a href={data.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {data.website}
                </a>
              ) : '-'}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">省份</label>
          {isEditing ? (
            <input
              type="text"
              value={editedData.province || ''}
              onChange={(e) => onChange('province', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="text-gray-900">{data.province || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">城市</label>
          {isEditing ? (
            <input
              type="text"
              value={editedData.city || ''}
              onChange={(e) => onChange('city', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center gap-2 text-gray-900">
              <MapPin className="w-4 h-4 text-gray-400" />
              {data.city || '-'}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-2">详细地址</label>
          {isEditing ? (
            <input
              type="text"
              value={editedData.address || ''}
              onChange={(e) => onChange('address', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="text-gray-900">{data.address || '-'}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrganizationBusinessTab({ data, editedData, isEditing, onChange }: OrganizationTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-2">法定代表人</label>
          {isEditing ? (
            <input
              type="text"
              value={editedData.legalRepresentative || ''}
              onChange={(e) => onChange('legalRepresentative', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center gap-2 text-gray-900">
              <User className="w-4 h-4 text-gray-400" />
              {data.legalRepresentative || '-'}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">经营范围</label>
          {isEditing ? (
            <textarea
              value={editedData.businessScope || ''}
              onChange={(e) => onChange('businessScope', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="text-gray-900 leading-relaxed">{data.businessScope || '-'}</div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">资质证书</label>
          {isEditing ? (
            <input
              type="text"
              value={arrayFieldToString(editedData.qualifications)}
              onChange={(e) => onChange('qualifications', e.target.value)}
              placeholder="多个证书用逗号分隔"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {parseArrayField(data.qualifications).length > 0 ? (
                parseArrayField(data.qualifications).map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">-</span>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">项目经验</label>
          {isEditing ? (
            <input
              type="text"
              value={arrayFieldToString(editedData.projects)}
              onChange={(e) => onChange('projects', e.target.value)}
              placeholder="多个项目用逗号分隔"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {parseArrayField(data.projects).length > 0 ? (
                parseArrayField(data.projects).map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">-</span>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">单位简介</label>
          {isEditing ? (
            <textarea
              value={editedData.introduction || ''}
              onChange={(e) => onChange('introduction', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="text-gray-900 leading-relaxed">{data.introduction || '-'}</div>
          )}
        </div>
      </div>
    </div>
  );
}
