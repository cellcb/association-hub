import { Search, Filter, UserPlus, MoreVertical, CheckCircle, XCircle, Clock, Edit, Trash2, Eye, X, User, Mail, Phone, Building, Calendar, Shield, FileText, Building2, Briefcase, Award, MapPin, Globe } from 'lucide-react';
import { useState } from 'react';
import { Pagination } from './Pagination';

// Individual Member Interface
interface IndividualMember {
  id: number;
  type: '个人会员';
  name: string;
  gender: '男' | '女';
  idCard?: string;
  phone: string;
  email: string;
  organization: string;
  position: string;
  title?: string;
  expertise: string[];
  province: string;
  city: string;
  address: string;
  education?: string;
  experience?: string;
  achievements?: string;
  recommendation?: string;
  joinDate: string;
  status: '正常' | '待审核' | '已过期';
  memberLevel: '普通会员' | '专家会员' | '学生会员';
  notes?: string;
}

// Organization Member Interface
interface OrganizationMember {
  id: number;
  type: '单位会员';
  organizationName: string;
  organizationType: '设备单位' | '建设单位' | '事业单位' | '管理单位' | '设计单位';
  socialCreditCode?: string;
  legalRepresentative?: string;
  establishmentDate?: string;
  registeredCapital?: string;
  employeeCount?: string;
  businessScope?: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  province: string;
  city: string;
  address: string;
  website?: string;
  introduction?: string;
  qualifications?: string;
  projects?: string;
  joinDate: string;
  status: '正常' | '待审核' | '已过期';
  memberLevel: '普通会员' | '专家会员' | '学生会员';
  notes?: string;
}

type Member = IndividualMember | OrganizationMember;

// Helper functions
const getMemberName = (member: Member): string => {
  return member.type === '个人会员' ? member.name : member.organizationName;
};

const getMemberEmail = (member: Member): string => {
  return member.type === '个人会员' ? member.email : member.contactEmail;
};

const getMemberPhone = (member: Member): string => {
  return member.type === '个人会员' ? member.phone : member.contactPhone;
};

export function MemberManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('全部');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [members, setMembers] = useState<Member[]>([
    {
      id: 1,
      type: '个人会员',
      name: '张建国',
      gender: '男',
      idCard: '11010519700101001X',
      phone: '138****1234',
      email: 'zhang.jg@example.com',
      organization: '中国建筑科学研究院',
      position: '教授级高级工程师',
      title: '高级工程师',
      expertise: ['建筑给排水', '绿色建筑', '二次供水'],
      province: '北京市',
      city: '朝阳区',
      address: '北京市朝阳区',
      education: '博士',
      experience: '30年',
      achievements: '获得多项国家科技进步奖',
      recommendation: '资深专家，在建筑给排水领域有30余年经验',
      joinDate: '2023-01-15',
      status: '正常',
      memberLevel: '专家会员',
      notes: '资深专家，在建筑给排水领域有30余年经验'
    },
    {
      id: 2,
      type: '单位会员',
      organizationName: '某某智能科技有限公司',
      organizationType: '设备单位',
      socialCreditCode: '91110105MA00000000',
      legalRepresentative: '李华',
      establishmentDate: '2010-01-01',
      registeredCapital: '1000万元',
      employeeCount: '100人',
      businessScope: '智能建筑设备研发',
      contactPerson: '张三',
      contactPhone: '010-12345678',
      contactEmail: 'contact@company.com',
      province: '北京市',
      city: '海淀区',
      address: '北京市海淀区中关村',
      website: 'www.example.com',
      introduction: '专注于智能建筑设备研发',
      qualifications: 'ISO9001认证',
      projects: '多个大型智能建筑项目',
      joinDate: '2023-03-20',
      status: '正常',
      memberLevel: '普通会员',
      notes: '专注于智能建筑设备研发'
    },
    {
      id: 3,
      type: '个人会员',
      name: '李明',
      gender: '男',
      phone: '139****5678',
      email: 'li.m@example.com',
      organization: '上海建筑设计研究院',
      position: '工程师',
      province: '上海市',
      city: '浦东新区',
      address: '上海市浦东新区',
      expertise: ['建筑设计', 'BIM技术'],
      joinDate: '2024-12-20',
      status: '待审核',
      memberLevel: '普通会员',
      notes: '新申请会员，待审核'
    },
    {
      id: 4,
      type: '个人会员',
      name: '王芳',
      gender: '女',
      phone: '136****7890',
      email: 'wang.f@example.com',
      organization: '深圳建筑设计院',
      position: '高级工程师',
      province: '广东省',
      city: '深圳市',
      address: '深圳市福田区',
      expertise: ['结构设计', '抗震设计'],
      joinDate: '2023-05-10',
      status: '正常',
      memberLevel: '普通会员',
    },
    {
      id: 5,
      type: '单位会员',
      organizationName: '广州建筑工程有限公司',
      organizationType: '建设单位',
      contactPerson: '陈经理',
      contactPhone: '020-87654321',
      contactEmail: 'chen@gzjz.com',
      province: '广东省',
      city: '广州市',
      address: '广州市天河区',
      joinDate: '2023-06-15',
      status: '正常',
      memberLevel: '普通会员',
    },
    {
      id: 6,
      type: '个人会员',
      name: '赵强',
      gender: '男',
      phone: '135****2468',
      email: 'zhao.q@example.com',
      organization: '成都建筑设计研究院',
      position: '工程师',
      province: '四川省',
      city: '成都市',
      address: '成都市武侯区',
      expertise: ['建筑电气', '智能化'],
      joinDate: '2023-07-20',
      status: '正常',
      memberLevel: '普通会员',
    },
    {
      id: 7,
      type: '个人会员',
      name: '孙丽',
      gender: '女',
      phone: '137****1357',
      email: 'sun.l@example.com',
      organization: '杭州市建筑设计院',
      position: '高级工程师',
      province: '浙江省',
      city: '杭州市',
      address: '杭州市西湖区',
      expertise: ['暖通空调', '节能设计'],
      joinDate: '2023-08-05',
      status: '正常',
      memberLevel: '专家会员',
    },
    {
      id: 8,
      type: '单位会员',
      organizationName: '南京智能建筑科技公司',
      organizationType: '设备单位',
      contactPerson: '周经理',
      contactPhone: '025-66778899',
      contactEmail: 'zhou@njzn.com',
      province: '江苏省',
      city: '南京市',
      address: '南京市江宁区',
      joinDate: '2023-09-12',
      status: '正常',
      memberLevel: '普通会员',
    },
    {
      id: 9,
      type: '个人会员',
      name: '吴涛',
      gender: '男',
      phone: '138****9876',
      email: 'wu.t@example.com',
      organization: '武汉建筑设计集团',
      position: '工程师',
      province: '湖北省',
      city: '武汉市',
      address: '武汉市洪山区',
      expertise: ['给排水', '消防设计'],
      joinDate: '2023-10-08',
      status: '待审核',
      memberLevel: '普通会员',
    },
    {
      id: 10,
      type: '个人会员',
      name: '郑美',
      gender: '女',
      phone: '139****3698',
      email: 'zheng.m@example.com',
      organization: '西安建筑科技大学',
      position: '教授',
      province: '陕西省',
      city: '西安市',
      address: '西安市雁塔区',
      expertise: ['建筑结构', '绿色建筑'],
      joinDate: '2023-11-15',
      status: '正常',
      memberLevel: '专家会员',
    },
    {
      id: 11,
      type: '单位会员',
      organizationName: '重庆建工集团',
      organizationType: '建设单位',
      contactPerson: '刘总',
      contactPhone: '023-12345678',
      contactEmail: 'liu@cqjg.com',
      province: '重庆市',
      city: '渝中区',
      address: '重庆市渝中区',
      joinDate: '2023-12-01',
      status: '正常',
      memberLevel: '普通会员',
    },
    {
      id: 12,
      type: '个人会员',
      name: '韩峰',
      gender: '男',
      phone: '137****7412',
      email: 'han.f@example.com',
      organization: '天津建筑设计院',
      position: '高级工程师',
      province: '天津市',
      city: '和平区',
      address: '天津市和平区',
      expertise: ['建筑设计', '城市规划'],
      joinDate: '2024-01-10',
      status: '正常',
      memberLevel: '普通会员',
    },
    {
      id: 13,
      type: '个人会员',
      name: '冯静',
      gender: '女',
      phone: '136****8520',
      email: 'feng.j@example.com',
      organization: '大连建筑研究所',
      position: '工程师',
      province: '辽宁省',
      city: '大连市',
      address: '大连市中山区',
      expertise: ['结构设计'],
      joinDate: '2024-02-05',
      status: '已过期',
      memberLevel: '普通会员',
    },
    {
      id: 14,
      type: '单位会员',
      organizationName: '青岛智慧建筑有限公司',
      organizationType: '事业单位',
      contactPerson: '陆经理',
      contactPhone: '0532-88776655',
      contactEmail: 'lu@qdzh.com',
      province: '山东省',
      city: '青岛市',
      address: '青岛市市南区',
      joinDate: '2024-03-12',
      status: '待审核',
      memberLevel: '普通会员',
    },
    {
      id: 15,
      type: '个人会员',
      name: '蔡明',
      gender: '男',
      phone: '135****9630',
      email: 'cai.m@example.com',
      organization: '厦门建筑设计院',
      position: '工程师',
      province: '福建省',
      city: '厦门市',
      address: '厦门市思明区',
      expertise: ['暖通空调', 'BIM技术'],
      joinDate: '2024-04-20',
      status: '正常',
      memberLevel: '普通会员',
    },
  ]);

  const [formData, setFormData] = useState<Partial<Member>>({
    type: '个人会员',
    status: '正常',
    memberLevel: '普通会员',
  });

  const filteredMembers = members.filter(member => {
    const memberName = getMemberName(member);
    const memberEmail = getMemberEmail(member);
    
    const matchesSearch = 
      memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memberEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === '全部' || member.type === filterType;
    const matchesStatus = filterStatus === '全部' || member.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: Member['status']) => {
    switch (status) {
      case '正常':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            正常
          </span>
        );
      case '待审核':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            待审核
          </span>
        );
      case '已过期':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs">
            <XCircle className="w-3 h-3" />
            已过期
          </span>
        );
    }
  };

  // CRUD Functions
  const handleAdd = () => {
    setFormData({
      type: '个人会员',
      status: '正常',
      memberLevel: '普通会员',
    });
    setShowAddModal(true);
  };

  const handleView = (member: Member) => {
    setSelectedMember(member);
    setShowViewModal(true);
  };

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setFormData(member);
    setShowEditModal(true);
  };

  const handleDelete = (member: Member) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  const handleApprove = (id: number) => {
    setMembers(members.map(m => 
      m.id === id ? { ...m, status: '正常' as const } : m
    ));
  };

  const handleReject = (id: number) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: Member = {
      ...formData as Member,
      id: Math.max(...members.map(m => m.id)) + 1,
      joinDate: new Date().toISOString().split('T')[0]
    };
    setMembers([...members, newMember]);
    setShowAddModal(false);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMember) {
      setMembers(members.map(m => 
        m.id === selectedMember.id ? { ...formData as Member, id: selectedMember.id, joinDate: selectedMember.joinDate } : m
      ));
      setShowEditModal(false);
      setSelectedMember(null);
    }
  };

  const confirmDelete = () => {
    if (selectedMember) {
      setMembers(members.filter(m => m.id !== selectedMember.id));
      setShowDeleteModal(false);
      setSelectedMember(null);
    }
  };

  const handleExpertiseChange = (value: string) => {
    const expertiseArray = value.split(',').map(e => e.trim()).filter(e => e);
    setFormData(prev => ({
      ...prev,
      expertise: expertiseArray
    }));
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl text-gray-900 mb-2">会员管理</h2>
        <p className="text-gray-600">管理个人会员和单位会员信息</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索会员姓名或邮箱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Add Button */}
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap" onClick={handleAdd}>
            <UserPlus className="w-5 h-5" />
            <span>添加会员</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">筛选:</span>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option>全部</option>
            <option>个人会员</option>
            <option>单位会员</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option>全部</option>
            <option>正常</option>
            <option>待审核</option>
            <option>已过期</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          共 {filteredMembers.length} 条记录
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  会员信息
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  联系方式
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  加入时间
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
              {paginatedMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-gray-900">{getMemberName(member)}</div>
                      {member.type === '个人会员' && member.organization && (
                        <div className="text-xs text-gray-500">{member.organization}</div>
                      )}
                      {member.type === '单位会员' && (
                        <div className="text-xs text-gray-500">{member.organizationType}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-gray-900">{member.type}</span>
                      <span className="text-xs text-gray-500">{member.memberLevel}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      <div>{getMemberEmail(member)}</div>
                      <div>{getMemberPhone(member)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{member.joinDate}</div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(member.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {member.status === '待审核' && (
                        <>
                          <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs" onClick={() => handleApprove(member.id)}>
                            通过
                          </button>
                          <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs" onClick={() => handleReject(member.id)}>
                            拒绝
                          </button>
                        </>
                      )}
                      <div className="relative">
                        <button 
                          className="p-1 text-gray-400 hover:text-gray-600" 
                          onClick={() => setOpenDropdown(openDropdown === member.id ? null : member.id)}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {openDropdown === member.id && (
                          <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              onClick={() => {
                                handleView(member);
                                setOpenDropdown(null);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                              查看
                            </button>
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              onClick={() => {
                                handleEdit(member);
                                setOpenDropdown(null);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                              编辑
                            </button>
                            <button
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              onClick={() => {
                                handleDelete(member);
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
          totalItems={filteredMembers.length}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddMemberModal
          formData={formData}
          onClose={() => setShowAddModal(false)}
          onFormChange={handleFormChange}
          onSubmit={handleSubmitAdd}
          onExpertiseChange={handleExpertiseChange}
          setFormData={setFormData}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedMember && (
        <EditMemberModal
          formData={formData}
          selectedMember={selectedMember}
          onClose={() => setShowEditModal(false)}
          onFormChange={handleFormChange}
          onSubmit={handleSubmitEdit}
          onExpertiseChange={handleExpertiseChange}
          setFormData={setFormData}
        />
      )}

      {/* View Modal */}
      {showViewModal && selectedMember && (
        <ViewMemberModal
          member={selectedMember}
          onClose={() => setShowViewModal(false)}
          onEdit={() => {
            setShowViewModal(false);
            handleEdit(selectedMember);
          }}
          getStatusBadge={getStatusBadge}
          getMemberName={getMemberName}
          getMemberEmail={getMemberEmail}
          getMemberPhone={getMemberPhone}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedMember && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl text-gray-900 mb-4">删除会员</h3>
            <p className="text-sm text-gray-600 mb-4">确定要删除会员 <strong>{getMemberName(selectedMember)}</strong> 吗？</p>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors" onClick={() => setShowDeleteModal(false)}>
                取消
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors" onClick={confirmDelete}>
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add Member Modal Component
function AddMemberModal({ formData, onClose, onFormChange, onSubmit, onExpertiseChange, setFormData }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="relative p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl mb-1">添加会员</h2>
              <p className="text-sm text-blue-100">填写会员信息，新增会员</p>
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
            {/* Member Type Selection */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4">选择会员类型</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ type: '个人会员', status: '正常', memberLevel: '普通会员' })}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    formData.type === '个人会员'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      formData.type === '个人会员' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="text-lg text-gray-900 mb-1">个人会员</div>
                      <div className="text-sm text-gray-600">
                        适合行业专家、技术人员、设计师等专业人士
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ type: '单位会员', status: '正常', memberLevel: '普通会员' })}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    formData.type === '单位会员'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      formData.type === '单位会员' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="text-lg text-gray-900 mb-1">单位会员</div>
                      <div className="text-sm text-gray-600">
                        适合企业、事业单位、科研机构等组织
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Form fields based on member type will be rendered here */}
            {formData.type === '个人会员' ? (
              <IndividualMemberForm 
                formData={formData} 
                onFormChange={onFormChange} 
                onExpertiseChange={onExpertiseChange} 
              />
            ) : (
              <OrganizationMemberForm 
                formData={formData} 
                onFormChange={onFormChange} 
              />
            )}

            {/* Status & Level Section - Common for both types */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                会员状态
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">状态 *</label>
                  <select
                    name="status"
                    required
                    value={formData.status}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>正常</option>
                    <option>待审核</option>
                    <option>已过期</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">会员等级 *</label>
                  <select
                    name="memberLevel"
                    required
                    value={formData.memberLevel}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>普通会员</option>
                    <option>专家会员</option>
                    <option>学生会员</option>
                  </select>
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
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                添加会员
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Edit Member Modal Component
function EditMemberModal({ formData, selectedMember, onClose, onFormChange, onSubmit, onExpertiseChange, setFormData }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="relative p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Edit className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl mb-1">编辑会员</h2>
              <p className="text-sm text-blue-100">修改会员信息</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Member Type Display (not editable) */}
            <div>
              <h3 className="text-lg text-gray-900 mb-2">会员类型</h3>
              <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-700">
                {formData.type}
              </div>
            </div>

            {/* Form fields based on member type */}
            {formData.type === '个人会员' ? (
              <IndividualMemberForm 
                formData={formData} 
                onFormChange={onFormChange} 
                onExpertiseChange={onExpertiseChange} 
              />
            ) : (
              <OrganizationMemberForm 
                formData={formData} 
                onFormChange={onFormChange} 
              />
            )}

            {/* Status & Level Section */}
            <div>
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                会员状态
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">状态 *</label>
                  <select
                    name="status"
                    required
                    value={formData.status}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>正常</option>
                    <option>待审核</option>
                    <option>已过期</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">会员等级 *</label>
                  <select
                    name="memberLevel"
                    required
                    value={formData.memberLevel}
                    onChange={onFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>普通会员</option>
                    <option>专家会员</option>
                    <option>学生会员</option>
                  </select>
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
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                保存更改
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// View Member Modal Component  
function ViewMemberModal({ member, onClose, onEdit, getStatusBadge, getMemberName, getMemberEmail, getMemberPhone }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="relative p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Eye className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl mb-1">会员详情</h2>
              <p className="text-sm text-blue-100">查看会员完整信息</p>
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
          {member.type === '个人会员' ? (
            <IndividualMemberView member={member} getStatusBadge={getStatusBadge} />
          ) : (
            <OrganizationMemberView member={member} getStatusBadge={getStatusBadge} />
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200 mt-6">
            <button
              onClick={onEdit}
              className="flex-1 px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              编辑会员
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

// Individual Member Form Component
function IndividualMemberForm({ formData, onFormChange, onExpertiseChange }: any) {
  return (
    <>
      {/* Basic Info */}
      <div>
        <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          基本信息
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">姓名 *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入您的姓名"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">性别 *</label>
            <select
              name="gender"
              required
              value={formData.gender || '男'}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">身份证号</label>
            <input
              type="text"
              name="idCard"
              value={formData.idCard || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入身份证号"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">手机号码 *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone || ''}
                onChange={onFormChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入手机号码"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">邮箱地址 *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email || ''}
                onChange={onFormChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入邮箱地址"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">所在单位 *</label>
            <input
              type="text"
              name="organization"
              required
              value={formData.organization || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入所在单位"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">职务 *</label>
            <input
              type="text"
              name="position"
              required
              value={formData.position || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入职务"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">职称</label>
            <input
              type="text"
              name="title"
              value={formData.title || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="如：高级工程师、教授等"
            />
          </div>
        </div>
      </div>

      {/* Location & Expertise */}
      <div>
        <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          地址与专业
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">省份 *</label>
            <input
              type="text"
              name="province"
              required
              value={formData.province || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入省份"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">城市 *</label>
            <input
              type="text"
              name="city"
              required
              value={formData.city || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入城市"
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

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-2">专业领域</label>
            <input
              type="text"
              name="expertise"
              value={formData.expertise?.join(', ') || ''}
              onChange={(e) => onExpertiseChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入专业领域，多个用逗号分隔"
            />
            <p className="text-xs text-gray-500 mt-1">例如：给水工程, 排水工程, 建筑给排水</p>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">学历</label>
            <select
              name="education"
              value={formData.education || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">请选择</option>
              <option value="本科">本科</option>
              <option value="硕士">硕士</option>
              <option value="博士">博士</option>
              <option value="其他">其他</option>
            </select>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div>
        <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          附加信息
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">工作经历</label>
            <textarea
              name="experience"
              rows={3}
              value={formData.experience || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请简要描述您的工作经历"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">主要成果或业绩</label>
            <textarea
              name="achievements"
              rows={3}
              value={formData.achievements || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请简要描述您的主要成果或业绩"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">备注</label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入备注信息"
            />
          </div>
        </div>
      </div>
    </>
  );
}

// Organization Member Form Component
function OrganizationMemberForm({ formData, onFormChange }: any) {
  return (
    <>
      {/* Basic Info */}
      <div>
        <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          单位基本信息
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-2">单位名称 *</label>
            <input
              type="text"
              name="organizationName"
              required
              value={formData.organizationName || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入单位全称"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">单位类型 *</label>
            <select
              name="organizationType"
              required
              value={formData.organizationType || '设备单位'}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="设备单位">设备单位</option>
              <option value="建设单位">建设单位</option>
              <option value="事业单位">事业单位</option>
              <option value="管理单位">管理单位</option>
              <option value="设计单位">设计单位</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">统一社会信用代码</label>
            <input
              type="text"
              name="socialCreditCode"
              value={formData.socialCreditCode || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入统一社会信用代码"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">法定代表人</label>
            <input
              type="text"
              name="legalRepresentative"
              value={formData.legalRepresentative || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入法定代表人"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">成立日期</label>
            <input
              type="date"
              name="establishmentDate"
              value={formData.establishmentDate || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">注册资本</label>
            <input
              type="text"
              name="registeredCapital"
              value={formData.registeredCapital || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="如：1000万元"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">员工人数</label>
            <input
              type="text"
              name="employeeCount"
              value={formData.employeeCount || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="如：100人"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-2">经营范围</label>
            <textarea
              name="businessScope"
              rows={2}
              value={formData.businessScope || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入经营范围"
            />
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div>
        <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          联系信息
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">联系人 *</label>
            <input
              type="text"
              name="contactPerson"
              required
              value={formData.contactPerson || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入联系人姓名"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">联系电话 *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                name="contactPhone"
                required
                value={formData.contactPhone || ''}
                onChange={onFormChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入联系电话"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">联系邮箱 *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="contactEmail"
                required
                value={formData.contactEmail || ''}
                onChange={onFormChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入联系邮箱"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">网站</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="website"
                value={formData.website || ''}
                onChange={onFormChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="如：www.example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">省份 *</label>
            <input
              type="text"
              name="province"
              required
              value={formData.province || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入省份"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">城市 *</label>
            <input
              type="text"
              name="city"
              required
              value={formData.city || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入城市"
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

      {/* Additional Info */}
      <div>
        <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          附加信息
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">单位介绍</label>
            <textarea
              name="introduction"
              rows={3}
              value={formData.introduction || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请简要介绍单位情况"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">资质证书</label>
            <textarea
              name="qualifications"
              rows={2}
              value={formData.qualifications || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请列出主要资质证书"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">代表项目</label>
            <textarea
              name="projects"
              rows={2}
              value={formData.projects || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请列出代表性项目"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">备注</label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes || ''}
              onChange={onFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入备注信息"
            />
          </div>
        </div>
      </div>
    </>
  );
}

// Individual Member View Component
function IndividualMemberView({ member, getStatusBadge }: any) {
  return (
    <>
      {/* Basic Info Section */}
      <div className="mb-6">
        <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          基本信息
        </h3>
        <div className="bg-gray-50 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">姓名</div>
            <div className="text-sm text-gray-900">{member.name}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">性别</div>
            <div className="text-sm text-gray-900">{member.gender}</div>
          </div>
          {member.idCard && (
            <div>
              <div className="text-xs text-gray-500 mb-1">身份证号</div>
              <div className="text-sm text-gray-900">{member.idCard}</div>
            </div>
          )}
          <div>
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              手机号码
            </div>
            <div className="text-sm text-gray-900">{member.phone}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              邮箱地址
            </div>
            <div className="text-sm text-gray-900">{member.email}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">所在单位</div>
            <div className="text-sm text-gray-900">{member.organization}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">职务</div>
            <div className="text-sm text-gray-900">{member.position}</div>
          </div>
          {member.title && (
            <div>
              <div className="text-xs text-gray-500 mb-1">职称</div>
              <div className="text-sm text-gray-900">{member.title}</div>
            </div>
          )}
        </div>
      </div>

      {/* Location Info */}
      <div className="mb-6">
        <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          地址信息
        </h3>
        <div className="bg-gray-50 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">省份</div>
            <div className="text-sm text-gray-900">{member.province}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">城市</div>
            <div className="text-sm text-gray-900">{member.city}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-xs text-gray-500 mb-1">详细地址</div>
            <div className="text-sm text-gray-900">{member.address}</div>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="mb-6">
        <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          会员状态
        </h3>
        <div className="bg-gray-50 rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">当前状态</div>
            <div className="mt-1">{getStatusBadge(member.status)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">会员等级</div>
            <div className="text-sm text-gray-900">{member.memberLevel}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              加入时间
            </div>
            <div className="text-sm text-gray-900">{member.joinDate}</div>
          </div>
        </div>
      </div>

      {/* Additional Info Section */}
      {(member.expertise?.length > 0 || member.education || member.experience || member.achievements || member.notes) && (
        <div className="mb-6">
          <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            附加信息
          </h3>
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            {member.expertise && member.expertise.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-2">专业领域</div>
                <div className="flex flex-wrap gap-2">
                  {member.expertise.map((exp: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {member.education && (
              <div>
                <div className="text-xs text-gray-500 mb-1">学历</div>
                <div className="text-sm text-gray-900">{member.education}</div>
              </div>
            )}
            {member.experience && (
              <div>
                <div className="text-xs text-gray-500 mb-1">工作经历</div>
                <div className="text-sm text-gray-700 leading-relaxed">{member.experience}</div>
              </div>
            )}
            {member.achievements && (
              <div>
                <div className="text-xs text-gray-500 mb-1">主要成果或业绩</div>
                <div className="text-sm text-gray-700 leading-relaxed">{member.achievements}</div>
              </div>
            )}
            {member.notes && (
              <div>
                <div className="text-xs text-gray-500 mb-1">备注</div>
                <div className="text-sm text-gray-700 leading-relaxed">{member.notes}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Organization Member View Component
function OrganizationMemberView({ member, getStatusBadge }: any) {
  return (
    <>
      {/* Basic Info Section */}
      <div className="mb-6">
        <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          单位基本信息
        </h3>
        <div className="bg-gray-50 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <div className="text-xs text-gray-500 mb-1">单位名称</div>
            <div className="text-sm text-gray-900">{member.organizationName}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">单位类型</div>
            <div className="text-sm text-gray-900">{member.organizationType}</div>
          </div>
          {member.socialCreditCode && (
            <div>
              <div className="text-xs text-gray-500 mb-1">统一社会信用代码</div>
              <div className="text-sm text-gray-900">{member.socialCreditCode}</div>
            </div>
          )}
          {member.legalRepresentative && (
            <div>
              <div className="text-xs text-gray-500 mb-1">法定代表人</div>
              <div className="text-sm text-gray-900">{member.legalRepresentative}</div>
            </div>
          )}
          {member.establishmentDate && (
            <div>
              <div className="text-xs text-gray-500 mb-1">成立日期</div>
              <div className="text-sm text-gray-900">{member.establishmentDate}</div>
            </div>
          )}
          {member.registeredCapital && (
            <div>
              <div className="text-xs text-gray-500 mb-1">注册资本</div>
              <div className="text-sm text-gray-900">{member.registeredCapital}</div>
            </div>
          )}
          {member.employeeCount && (
            <div>
              <div className="text-xs text-gray-500 mb-1">员工人数</div>
              <div className="text-sm text-gray-900">{member.employeeCount}</div>
            </div>
          )}
          {member.businessScope && (
            <div className="md:col-span-2">
              <div className="text-xs text-gray-500 mb-1">经营范围</div>
              <div className="text-sm text-gray-900">{member.businessScope}</div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="mb-6">
        <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          联系信息
        </h3>
        <div className="bg-gray-50 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">联系人</div>
            <div className="text-sm text-gray-900">{member.contactPerson}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              联系电话
            </div>
            <div className="text-sm text-gray-900">{member.contactPhone}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              联系邮箱
            </div>
            <div className="text-sm text-gray-900">{member.contactEmail}</div>
          </div>
          {member.website && (
            <div>
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                网站
              </div>
              <div className="text-sm text-gray-900">{member.website}</div>
            </div>
          )}
          <div>
            <div className="text-xs text-gray-500 mb-1">省份</div>
            <div className="text-sm text-gray-900">{member.province}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">城市</div>
            <div className="text-sm text-gray-900">{member.city}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-xs text-gray-500 mb-1">详细地址</div>
            <div className="text-sm text-gray-900">{member.address}</div>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="mb-6">
        <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          会员状态
        </h3>
        <div className="bg-gray-50 rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">当前状态</div>
            <div className="mt-1">{getStatusBadge(member.status)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">会员等级</div>
            <div className="text-sm text-gray-900">{member.memberLevel}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              加入时间
            </div>
            <div className="text-sm text-gray-900">{member.joinDate}</div>
          </div>
        </div>
      </div>

      {/* Additional Info Section */}
      {(member.introduction || member.qualifications || member.projects || member.notes) && (
        <div className="mb-6">
          <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            附加信息
          </h3>
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            {member.introduction && (
              <div>
                <div className="text-xs text-gray-500 mb-1">单位介绍</div>
                <div className="text-sm text-gray-700 leading-relaxed">{member.introduction}</div>
              </div>
            )}
            {member.qualifications && (
              <div>
                <div className="text-xs text-gray-500 mb-1">资质证书</div>
                <div className="text-sm text-gray-700 leading-relaxed">{member.qualifications}</div>
              </div>
            )}
            {member.projects && (
              <div>
                <div className="text-xs text-gray-500 mb-1">代表项目</div>
                <div className="text-sm text-gray-700 leading-relaxed">{member.projects}</div>
              </div>
            )}
            {member.notes && (
              <div>
                <div className="text-xs text-gray-500 mb-1">备注</div>
                <div className="text-sm text-gray-700 leading-relaxed">{member.notes}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
