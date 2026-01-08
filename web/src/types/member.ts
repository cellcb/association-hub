// 会员类型
export type MemberType = 'INDIVIDUAL' | 'ORGANIZATION';

// 会员状态 (包含申请状态)
export type MemberStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'REJECTED';

// 单位类型
export type OrganizationType = 'EQUIPMENT' | 'CONSTRUCTION' | 'INSTITUTION' | 'MANAGEMENT' | 'DESIGN';

// 分页元数据
export interface PageMetadata {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

// 分页响应 (匹配 Spring Boot 3.x 返回格式)
export interface Page<T> {
  content: T[];
  page: PageMetadata;
}

// 分页请求参数
export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
}

// 个人会员详情
export interface IndividualMemberResponse {
  id: number;
  name: string;
  gender: string;
  idCard: string;
  phone: string;
  email: string;
  organization: string;
  position: string;
  title: string;
  expertise: string;
  province: string;
  city: string;
  address: string;
  education: string;
  experience: string;
  achievements: string;
  recommendation: string;
  avatar: string;
}

// 单位会员详情
export interface OrganizationMemberResponse {
  id: number;
  orgName: string;
  orgType: string;
  orgTypeDescription: string;
  socialCreditCode: string;
  legalRepresentative: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  establishmentDate: string;
  registeredCapital: string;
  employeeCount: number;
  businessScope: string;
  qualifications: string;
  projects: string;
  province: string;
  city: string;
  address: string;
  website: string;
  introduction: string;
  logo: string;
}

// 会员响应
export interface MemberResponse {
  id: number;
  userId: number;
  memberNo: string;
  memberType: MemberType;
  memberTypeDescription: string;
  status: MemberStatus;
  statusDescription: string;
  approvedAt: string;
  expiredAt: string;
  createdTime: string;
  updatedTime: string;
  displayName: string;
  individualMember?: IndividualMemberResponse;
  organizationMember?: OrganizationMemberResponse;
}

// 会员统计响应
export interface MemberStatsResponse {
  totalMembers: number;
  activeMembers: number;
  suspendedMembers: number;
  expiredMembers: number;
  individualMembers: number;
  organizationMembers: number;
  pendingApplications: number;
}

// 个人会员更新请求
export interface IndividualMemberUpdateRequest {
  name?: string;
  gender?: string;
  idCard?: string;
  phone?: string;
  email?: string;
  organization?: string;
  position?: string;
  title?: string;
  expertise?: string;
  province?: string;
  city?: string;
  address?: string;
  education?: string;
  experience?: string;
  achievements?: string;
  recommendation?: string;
}

// 单位会员更新请求
export interface OrganizationMemberUpdateRequest {
  orgName?: string;
  orgType?: OrganizationType;
  socialCreditCode?: string;
  legalRepresentative?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  establishmentDate?: string;
  registeredCapital?: string;
  employeeCount?: number;
  businessScope?: string;
  qualifications?: string;
  projects?: string;
  province?: string;
  city?: string;
  address?: string;
  website?: string;
  introduction?: string;
}

// 字段映射工具函数
export const memberTypeLabels: Record<MemberType, string> = {
  INDIVIDUAL: '个人会员',
  ORGANIZATION: '单位会员',
};

export const memberStatusLabels: Record<MemberStatus, string> = {
  PENDING: '待审核',
  ACTIVE: '正常',
  SUSPENDED: '已暂停',
  EXPIRED: '已过期',
  REJECTED: '已拒绝',
};

export const organizationTypeLabels: Record<OrganizationType, string> = {
  EQUIPMENT: '设备单位',
  CONSTRUCTION: '建设单位',
  INSTITUTION: '事业单位',
  MANAGEMENT: '管理单位',
  DESIGN: '设计单位',
};

// 会员报名信息 (用于活动报名自动填充)
export interface MemberRegistrationProfile {
  memberId: number;
  memberNo: string;
  memberType: MemberType;
  memberStatus: MemberStatus;
  name: string;
  phone: string;
  email: string;
  company: string;
  position: string;
}
