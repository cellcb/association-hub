/**
 * API 统一响应格式
 */
export interface Result<T> {
  success: boolean;
  message: string;
  data: T;
  code: number;
}

/**
 * 用户信息
 */
export interface UserInfo {
  id: number;
  username: string;
  email: string;
  realName: string;
  roles: string[];
}

/**
 * 登录请求
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserInfo;
}

/**
 * 会员类型
 */
export type MemberType = 'INDIVIDUAL' | 'ORGANIZATION';

/**
 * 单位类型
 */
export type OrganizationType = 'EQUIPMENT' | 'CONSTRUCTION' | 'INSTITUTION' | 'MANAGEMENT' | 'DESIGN';

/**
 * 个人会员申请数据
 */
export interface IndividualApplicationData {
  name: string;
  gender?: string;
  idCard?: string;
  organization?: string;
  position?: string;
  title?: string;
  expertise?: string[];
  province?: string;
  city?: string;
  address?: string;
  education?: string;
  experience?: string;
  achievements?: string;
  recommendation?: string;
}

/**
 * 单位会员申请数据
 */
export interface OrganizationApplicationData {
  orgName: string;
  orgType: string;
  socialCreditCode?: string;
  legalRepresentative?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  establishmentDate?: string;
  registeredCapital?: string;
  employeeCount?: number;
  businessScope?: string;
  qualifications?: string[];
  projects?: string[];
  province?: string;
  city?: string;
  address?: string;
  website?: string;
  introduction?: string;
}

/**
 * 会员申请请求
 */
export interface MemberApplicationRequest {
  memberType: MemberType;
  username: string;
  password: string;
  email: string;
  phone?: string;
  individualData?: IndividualApplicationData;
  organizationData?: OrganizationApplicationData;
}

/**
 * 申请状态
 */
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * 会员申请响应
 */
export interface MemberApplicationResponse {
  id: number;
  memberType: MemberType;
  username: string;
  email: string;
  phone?: string;
  status: ApplicationStatus;
  statusDescription?: string;
  memberTypeDescription?: string;
  createdTime: string;
}

/**
 * 申请状态查询响应
 */
export interface ApplicationStatusResponse {
  id: number;
  status: ApplicationStatus;
  statusDescription: string;
  reviewedAt?: string;
  rejectReason?: string;
}

/**
 * 密码强度等级
 */
export type PasswordStrengthLevel =
  | 'VERY_WEAK'  // 极弱 (0-2分)
  | 'WEAK'       // 弱 (3-4分)
  | 'MEDIUM'     // 中等 (5-6分)
  | 'STRONG'     // 强 (7-8分)
  | 'VERY_STRONG'; // 极强 (9+分)

/**
 * 密码强度信息
 */
export interface PasswordStrengthInfo {
  level: PasswordStrengthLevel;
  score: number; // 0-100 显示用百分比
  description: string; // 中文描述：极弱/弱/中等/强/极强
  suggestions: string[]; // 改进建议数组
}

/**
 * 修改密码请求
 */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
