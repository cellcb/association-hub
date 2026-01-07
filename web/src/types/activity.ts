// 活动类型枚举（匹配后端 ActivityType）
export type ActivityType =
  | 'CONFERENCE'    // 会议
  | 'TRAINING'      // 培训
  | 'SEMINAR'       // 研讨会
  | 'EXHIBITION'    // 展览
  | 'COMPETITION'   // 竞赛
  | 'OTHER';        // 其他

// 活动状态枚举（匹配后端 ActivityStatus）
export type ActivityStatus =
  | 'UPCOMING'      // 即将开始（报名中）
  | 'ONGOING'       // 进行中
  | 'ENDED'         // 已结束
  | 'CANCELLED';    // 已取消

// 报名状态枚举（匹配后端 RegistrationStatus）
export type RegistrationStatus =
  | 'PENDING'       // 待确认
  | 'CONFIRMED'     // 已确认
  | 'CANCELLED'     // 已取消
  | 'ATTENDED';     // 已参加

// 活动类型标签映射
export const activityTypeLabels: Record<ActivityType, string> = {
  CONFERENCE: '会议',
  TRAINING: '培训',
  SEMINAR: '研讨会',
  EXHIBITION: '展览',
  COMPETITION: '竞赛',
  OTHER: '其他',
};

// 活动状态标签映射
export const activityStatusLabels: Record<ActivityStatus, string> = {
  UPCOMING: '报名中',
  ONGOING: '进行中',
  ENDED: '已结束',
  CANCELLED: '已取消',
};

// 报名状态标签映射
export const registrationStatusLabels: Record<RegistrationStatus, string> = {
  PENDING: '待确认',
  CONFIRMED: '已确认',
  CANCELLED: '已取消',
  ATTENDED: '已参加',
};

// 活动列表项响应（用于列表展示）
export interface ActivityListResponse {
  id: number;
  title: string;
  type: ActivityType;
  typeName: string;
  date: string | null;         // YYYY-MM-DD
  time: string | null;         // HH:mm:ss
  registrationEndDate: string | null;
  registrationEndTime: string | null;
  location: string | null;
  status: ActivityStatus;
  statusName: string;
  description: string | null;
  organization: string | null;
  fee: string | null;          // BigDecimal as string
  capacity: number | null;
  registeredCount: number;
  coverImage: string | null;
}

// 活动详情响应
export interface ActivityResponse {
  id: number;
  title: string;
  type: ActivityType;
  typeName: string;
  date: string | null;         // YYYY-MM-DD
  time: string | null;         // HH:mm:ss
  endDate: string | null;
  endTime: string | null;
  registrationStartDate: string | null;
  registrationStartTime: string | null;
  registrationEndDate: string | null;
  registrationEndTime: string | null;
  location: string | null;
  participantsLimit: number | null;
  status: ActivityStatus;
  statusName: string;
  description: string | null;
  detailedDescription: string | null;
  speaker: string | null;
  speakerBio: string | null;
  organization: string | null;
  fee: string | null;          // BigDecimal as string
  capacity: number | null;
  registeredCount: number;
  coverImage: string | null;
  createdTime: string;
  updatedTime: string;
  // JSON string fields
  venue: string | null;
  contact: string | null;
  benefits: string | null;
  agenda: string | null;
}

// 创建/更新活动请求
export interface ActivityRequest {
  title: string;
  type: ActivityType;
  date?: string;               // YYYY-MM-DD
  time?: string;               // HH:mm
  endDate?: string;
  endTime?: string;
  registrationStartDate?: string;
  registrationStartTime?: string;
  registrationEndDate?: string;
  registrationEndTime?: string;
  location?: string;
  participantsLimit?: number;
  status?: ActivityStatus;
  description?: string;
  detailedDescription?: string;
  speaker?: string;
  speakerBio?: string;
  organization?: string;
  fee?: string;                // BigDecimal as string
  capacity?: number;
  coverImage?: string;
  // JSON string fields
  venue?: string;
  contact?: string;
  benefits?: string;
  agenda?: string;
}

// 报名响应
export interface RegistrationResponse {
  id: number;
  activityId: number;
  activityTitle: string;
  userId: number | null;
  name: string;
  phone: string;
  email: string | null;
  company: string | null;
  position: string | null;
  memberType: string | null;
  specialRequirements: string | null;
  status: RegistrationStatus;
  statusName: string;
  createdTime: string;
}

// 活动联系方式 JSON 结构
export interface ActivityContact {
  name?: string;
  phone?: string;
  email?: string;
}

// 活动地点 JSON 结构
export interface ActivityVenue {
  address?: string;
  directions?: string;
}

// 议程项结构
export interface AgendaItem {
  startTime: string;  // HH:mm 格式
  endTime: string;    // HH:mm 格式
  title: string;
  speaker?: string;
}

// 按天分组的议程
export interface DayAgenda {
  date: string;
  items: AgendaItem[];
}

// JSON 解析辅助函数
export function parseActivityContact(json: string | null): ActivityContact | null {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function parseActivityVenue(json: string | null): ActivityVenue | null {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// 解析议程 JSON
export function parseAgenda(json: string | null): DayAgenda[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// 序列化议程为 JSON
export function stringifyAgenda(days: DayAgenda[]): string {
  // 过滤掉空的天和空的议程项
  const filtered = days
    .map(day => ({
      ...day,
      items: day.items.filter(item => item.startTime || item.title)
    }))
    .filter(day => day.date || day.items.length > 0);
  return JSON.stringify(filtered);
}

// 表单数据类型（用于前端表单状态）
export interface ActivityFormData {
  title: string;
  type: ActivityType | '';
  date: string;
  time: string;
  endDate: string;
  endTime: string;
  registrationStartDate: string;
  registrationStartTime: string;
  registrationEndDate: string;
  registrationEndTime: string;
  location: string;
  address: string;             // venue.address
  capacity: number | '';
  fee: number | '';
  organization: string;
  contactName: string;         // contact.name
  contactPhone: string;        // contact.phone
  contactEmail: string;        // contact.email
  description: string;
  detailedDescription: string;
  agenda: DayAgenda[];         // 结构化议程数据
  status: ActivityStatus;
  coverImage: string;
}

// 表单数据到请求的转换
export function formDataToRequest(formData: ActivityFormData): ActivityRequest {
  const contact: ActivityContact = {
    name: formData.contactName || undefined,
    phone: formData.contactPhone || undefined,
    email: formData.contactEmail || undefined,
  };

  const venue: ActivityVenue = {
    address: formData.address || undefined,
  };

  // 序列化议程为 JSON 字符串
  const agendaJson = stringifyAgenda(formData.agenda);

  return {
    title: formData.title,
    type: formData.type as ActivityType,
    date: formData.date || undefined,
    time: formData.time || undefined,
    endDate: formData.endDate || undefined,
    endTime: formData.endTime || undefined,
    registrationStartDate: formData.registrationStartDate || undefined,
    registrationStartTime: formData.registrationStartTime || undefined,
    registrationEndDate: formData.registrationEndDate || undefined,
    registrationEndTime: formData.registrationEndTime || undefined,
    location: formData.location || undefined,
    capacity: formData.capacity ? Number(formData.capacity) : undefined,
    fee: formData.fee ? String(formData.fee) : undefined,
    organization: formData.organization || undefined,
    contact: JSON.stringify(contact),
    venue: JSON.stringify(venue),
    description: formData.description || undefined,
    detailedDescription: formData.detailedDescription || undefined,
    agenda: agendaJson || undefined,
    status: formData.status,
    coverImage: formData.coverImage || undefined,
  };
}

// 响应数据到表单数据的转换
export function responseToFormData(response: ActivityResponse): ActivityFormData {
  const contact = parseActivityContact(response.contact);
  const venue = parseActivityVenue(response.venue);
  // 解析议程 JSON 字符串为 DayAgenda[]
  const agenda = parseAgenda(response.agenda);

  return {
    title: response.title,
    type: response.type,
    date: response.date || '',
    time: response.time ? response.time.substring(0, 5) : '', // HH:mm:ss -> HH:mm
    endDate: response.endDate || '',
    endTime: response.endTime ? response.endTime.substring(0, 5) : '',
    registrationStartDate: response.registrationStartDate || '',
    registrationStartTime: response.registrationStartTime ? response.registrationStartTime.substring(0, 5) : '',
    registrationEndDate: response.registrationEndDate || '',
    registrationEndTime: response.registrationEndTime ? response.registrationEndTime.substring(0, 5) : '',
    location: response.location || '',
    address: venue?.address || '',
    capacity: response.capacity || '',
    fee: response.fee ? Number(response.fee) : '',
    organization: response.organization || '',
    contactName: contact?.name || '',
    contactPhone: contact?.phone || '',
    contactEmail: contact?.email || '',
    description: response.description || '',
    detailedDescription: response.detailedDescription || '',
    agenda: agenda.length > 0 ? agenda : [{ date: '', items: [] }],
    status: response.status,
    coverImage: response.coverImage || '',
  };
}

// 初始表单数据
export const initialFormData: ActivityFormData = {
  title: '',
  type: '',
  date: '',
  time: '',
  endDate: '',
  endTime: '',
  registrationStartDate: '',
  registrationStartTime: '',
  registrationEndDate: '',
  registrationEndTime: '',
  location: '',
  address: '',
  capacity: '',
  fee: '',
  organization: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  description: '',
  detailedDescription: '',
  agenda: [{ date: '', items: [] }],  // 初始一天，无日期
  status: 'UPCOMING',
  coverImage: '',
};
