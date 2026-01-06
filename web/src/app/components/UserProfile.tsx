import { useState } from 'react';
import { User, Mail, Phone, Building2, MapPin, Calendar, Shield, Edit2, Save, X, Camera, Briefcase, Award } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface UserProfileProps {
  onBack?: () => void;
}

interface UserInfo {
  // 基本信息
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  memberType: 'individual' | 'organization';
  memberLevel: string;
  memberSince: string;
  memberNumber: string;
  
  // 个人会员信息
  gender?: string;
  birthday?: string;
  idNumber?: string;
  education?: string;
  major?: string;
  title?: string;
  company?: string;
  position?: string;
  
  // 单位会员信息
  organizationName?: string;
  organizationType?: string;
  businessLicense?: string;
  legalRepresentative?: string;
  contactPerson?: string;
  
  // 联系信息
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  
  // 其他信息
  bio?: string;
  expertise?: string[];
  certifications?: string[];
}

export function UserProfile({ onBack }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'professional'>('basic');
  
  // 模拟用户数据
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138000',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdmF0YXJ8ZW58MXx8fHwxNzM2NTcyNzI3fDA&ixlib=rb-4.1.0&q=80&w=400',
    memberType: 'individual',
    memberLevel: '高级会员',
    memberSince: '2022-03-15',
    memberNumber: 'GD20220315001',
    gender: '男',
    birthday: '1985-06-20',
    education: '硕士',
    major: '给水排水工程',
    title: '高级工程师',
    company: '广东省建筑设计研究院',
    position: '给排水设计部主任',
    address: '广州市天河区珠江新城花城大道',
    city: '广州市',
    district: '天河区',
    postalCode: '510000',
    bio: '从事给排水设计工作15年，擅长高层建筑给排水系统设计、二次供水设施设计等领域，主持完成多个大型项目设计工作。',
    expertise: ['建筑给排水设计', '二次供水系统', '智慧水务', '海绵城市'],
    certifications: ['注册公用设备工程师（给水排水）', '高级工程师', 'BIM工程师'],
  });

  const [editedInfo, setEditedInfo] = useState<UserInfo>(userInfo);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedInfo(userInfo);
  };

  const handleSave = () => {
    setUserInfo(editedInfo);
    setIsEditing(false);
    // 这里可以添加API调用保存到后端
    console.log('保存用户信息:', editedInfo);
  };

  const handleCancel = () => {
    setEditedInfo(userInfo);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof UserInfo, value: any) => {
    setEditedInfo(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 模拟上传头像
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange('avatar', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'basic' as const, label: '基本信息', icon: User },
    { id: 'contact' as const, label: '联系方式', icon: Phone },
    { id: 'professional' as const, label: '专业信息', icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl text-gray-900 mb-2">个人中心</h1>
            <p className="text-gray-600">查看和编辑您的个人信息</p>
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
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
          {/* Left Sidebar - User Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              {/* Avatar */}
              <div className="relative mb-4">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-100 relative">
                  {editedInfo.avatar ? (
                    <ImageWithFallback
                      src={editedInfo.avatar}
                      alt={editedInfo.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-1/2 translate-x-16 cursor-pointer">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-lg">
                      <Camera className="w-5 h-5" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* User Info */}
              <div className="text-center mb-6">
                <h2 className="text-xl text-gray-900 mb-2">{userInfo.name}</h2>
                <p className="text-sm text-gray-600 mb-1">{userInfo.position}</p>
                <p className="text-sm text-gray-500">{userInfo.company}</p>
              </div>

              {/* Member Badge */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-4 text-white mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-6 h-6" />
                  <div>
                    <div className="text-sm opacity-90">会员等级</div>
                    <div className="text-lg">{userInfo.memberLevel}</div>
                  </div>
                </div>
                <div className="text-xs opacity-90 space-y-1">
                  <div>会员编号：{userInfo.memberNumber}</div>
                  <div>加入时间：{userInfo.memberSince}</div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl text-blue-600 mb-1">12</div>
                  <div className="text-xs text-gray-600">参与活动</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl text-green-600 mb-1">8</div>
                  <div className="text-xs text-gray-600">专家咨询</div>
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
                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">姓名</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedInfo.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-900">
                            <User className="w-4 h-4 text-gray-400" />
                            {userInfo.name}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">性别</label>
                        {isEditing ? (
                          <select
                            value={editedInfo.gender}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="男">男</option>
                            <option value="女">女</option>
                          </select>
                        ) : (
                          <div className="text-gray-900">{userInfo.gender}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">出生日期</label>
                        {isEditing ? (
                          <input
                            type="date"
                            value={editedInfo.birthday}
                            onChange={(e) => handleInputChange('birthday', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-900">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {userInfo.birthday}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">学历</label>
                        {isEditing ? (
                          <select
                            value={editedInfo.education}
                            onChange={(e) => handleInputChange('education', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="本科">本科</option>
                            <option value="硕士">硕士</option>
                            <option value="博士">博士</option>
                          </select>
                        ) : (
                          <div className="text-gray-900">{userInfo.education}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">专业</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedInfo.major}
                            onChange={(e) => handleInputChange('major', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="text-gray-900">{userInfo.major}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">职称</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedInfo.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-900">
                            <Award className="w-4 h-4 text-gray-400" />
                            {userInfo.title}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">个人简介</label>
                      {isEditing ? (
                        <textarea
                          value={editedInfo.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="text-gray-900 leading-relaxed">{userInfo.bio}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Info Tab */}
                {activeTab === 'contact' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">邮箱</label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={editedInfo.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-900">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {userInfo.email}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">手机号码</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editedInfo.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-900">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {userInfo.phone}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">城市</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedInfo.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-900">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {userInfo.city}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">区域</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedInfo.district}
                            onChange={(e) => handleInputChange('district', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="text-gray-900">{userInfo.district}</div>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-600 mb-2">详细地址</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedInfo.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="text-gray-900">{userInfo.address}</div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">邮政编码</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedInfo.postalCode}
                            onChange={(e) => handleInputChange('postalCode', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="text-gray-900">{userInfo.postalCode}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Professional Info Tab */}
                {activeTab === 'professional' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">工作单位</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedInfo.company}
                            onChange={(e) => handleInputChange('company', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-900">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            {userInfo.company}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">职位</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedInfo.position}
                            onChange={(e) => handleInputChange('position', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-900">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            {userInfo.position}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">专业领域</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedInfo.expertise?.join(', ')}
                            onChange={(e) => handleInputChange('expertise', e.target.value.split(',').map(s => s.trim()))}
                            placeholder="多个领域用逗号分隔"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {userInfo.expertise?.map((item, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">资质证书</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedInfo.certifications?.join(', ')}
                            onChange={(e) => handleInputChange('certifications', e.target.value.split(',').map(s => s.trim()))}
                            placeholder="多个证书用逗号分隔"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="space-y-2">
                            {userInfo.certifications?.map((cert, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 text-gray-900"
                              >
                                <Award className="w-4 h-4 text-green-600" />
                                {cert}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
