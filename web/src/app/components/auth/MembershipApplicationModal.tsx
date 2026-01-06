import { useState } from 'react';
import { X, User, Building2, Mail, Phone, MapPin, Briefcase, Award, FileText, CheckCircle, Upload } from 'lucide-react';

interface MembershipApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

type MemberType = 'individual' | 'organization';
type OrganizationType = 'equipment' | 'construction' | 'institution' | 'management' | 'design';

export function MembershipApplicationModal({ isOpen, onClose, onSubmitSuccess }: MembershipApplicationModalProps) {
  const [memberType, setMemberType] = useState<MemberType>('individual');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Individual member form data
  const [individualForm, setIndividualForm] = useState({
    name: '',
    gender: 'male',
    idCard: '',
    phone: '',
    email: '',
    organization: '',
    position: '',
    title: '',
    expertise: [] as string[],
    province: '',
    city: '',
    address: '',
    education: '',
    experience: '',
    achievements: '',
    recommendation: '',
  });

  // Organization member form data
  const [organizationForm, setOrganizationForm] = useState({
    organizationName: '',
    organizationType: 'equipment' as OrganizationType,
    socialCreditCode: '',
    legalRepresentative: '',
    establishmentDate: '',
    registeredCapital: '',
    employeeCount: '',
    businessScope: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    province: '',
    city: '',
    address: '',
    website: '',
    introduction: '',
    qualifications: '',
    projects: '',
  });

  const expertiseOptions = [
    '给水工程', '排水工程', '建筑给排水', '市政给排水', 
    '水处理技术', '管道设计', '泵站设计', '阀门技术',
    '智慧水务', '海绵城市', '二次供水', '水质监测'
  ];

  const organizationTypeOptions = [
    { value: 'equipment', label: '设备单位', desc: '设备制造商、供应商、代理商' },
    { value: 'construction', label: '建设单位', desc: '工程公司、施工单位、总承包商' },
    { value: 'institution', label: '事业单位', desc: '科研院所、高校、检测机构' },
    { value: 'management', label: '管理单位', desc: '业主单位、运营管理公司' },
    { value: 'design', label: '设计单位', desc: '设计院、咨询公司' },
  ];

  if (!isOpen) return null;

  const handleIndividualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log('Individual application submitted:', individualForm);
      setIsSubmitted(true);
    }
  };

  const handleOrganizationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log('Organization application submitted:', organizationForm);
      setIsSubmitted(true);
    }
  };

  const handleExpertiseToggle = (expertise: string) => {
    if (individualForm.expertise.includes(expertise)) {
      setIndividualForm({
        ...individualForm,
        expertise: individualForm.expertise.filter(e => e !== expertise)
      });
    } else {
      setIndividualForm({
        ...individualForm,
        expertise: [...individualForm.expertise, expertise]
      });
    }
  };

  const resetAndClose = () => {
    setCurrentStep(1);
    setIsSubmitted(false);
    onClose();
  };

  const handleSuccess = () => {
    onSubmitSuccess?.();
    resetAndClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl mb-2">
              {isSubmitted ? '申请提交成功' : '会员申请'}
            </h2>
            <p className="text-sm text-blue-100">
              {isSubmitted ? '我们将在3个工作日内审核您的申请' : '加入技术专委会，开启专业之旅'}
            </p>
          </div>
          <button
            onClick={resetAndClose}
            className="absolute top-6 right-6 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSubmitted ? (
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* Member Type Selector */}
            {currentStep === 1 && (
              <div className="mb-6">
                <h3 className="text-lg text-gray-900 mb-4">选择会员类型</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setMemberType('individual')}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      memberType === 'individual'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        memberType === 'individual' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <User className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="text-lg text-gray-900 mb-1">个人会员</div>
                        <div className="text-sm text-gray-600">
                          适合行业专家、技术人员、设计师等专业人士
                        </div>
                        <div className="mt-3 space-y-1">
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            参与所有技术活动
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            专家资源库展示
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            技术资料下载
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setMemberType('organization')}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      memberType === 'organization'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        memberType === 'organization' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="text-lg text-gray-900 mb-1">单位会员</div>
                        <div className="text-sm text-gray-600">
                          适合企业、事业单位、科研机构等组织
                        </div>
                        <div className="mt-3 space-y-1">
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            品牌展示与推广
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            产品技术推广
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            供需对接服务
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2 md:gap-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                      currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step}
                    </div>
                    {step < 3 && (
                      <div className={`w-8 md:w-16 h-1 mx-1 ${
                        currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-4 md:gap-8 mt-2">
                <span className="text-xs text-gray-600">基本信息</span>
                <span className="text-xs text-gray-600">详细资料</span>
                <span className="text-xs text-gray-600">确认提交</span>
              </div>
            </div>

            {/* Individual Member Form */}
            {memberType === 'individual' && (
              <form onSubmit={handleIndividualSubmit} className="space-y-6">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg text-gray-900 mb-4">基本信息</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">姓名 *</label>
                        <input
                          type="text"
                          required
                          value={individualForm.name}
                          onChange={(e) => setIndividualForm({ ...individualForm, name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="请输入您的姓名"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-2">性别 *</label>
                        <select
                          required
                          value={individualForm.gender}
                          onChange={(e) => setIndividualForm({ ...individualForm, gender: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="male">男</option>
                          <option value="female">女</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-2">手机号码 *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            required
                            value={individualForm.phone}
                            onChange={(e) => setIndividualForm({ ...individualForm, phone: e.target.value })}
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
                            required
                            value={individualForm.email}
                            onChange={(e) => setIndividualForm({ ...individualForm, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="请输入邮箱地址"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-2">所在单位 *</label>
                        <input
                          type="text"
                          required
                          value={individualForm.organization}
                          onChange={(e) => setIndividualForm({ ...individualForm, organization: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="请输入所在单位"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-2">职务 *</label>
                        <input
                          type="text"
                          required
                          value={individualForm.position}
                          onChange={(e) => setIndividualForm({ ...individualForm, position: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="请输入职务"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Detailed Info */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg text-gray-900 mb-4">详细资料</h3>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">专业领域 * (可多选)</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {expertiseOptions.map((expertise) => (
                          <label
                            key={expertise}
                            className={`px-4 py-2 border-2 rounded-lg cursor-pointer transition-all text-center ${
                              individualForm.expertise.includes(expertise)
                                ? 'border-blue-600 bg-blue-50 text-blue-600'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={individualForm.expertise.includes(expertise)}
                              onChange={() => handleExpertiseToggle(expertise)}
                            />
                            <span className="text-sm">{expertise}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">职称</label>
                        <input
                          type="text"
                          value={individualForm.title}
                          onChange={(e) => setIndividualForm({ ...individualForm, title: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="如：高级工程师、教授等"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-2">学历</label>
                        <select
                          value={individualForm.education}
                          onChange={(e) => setIndividualForm({ ...individualForm, education: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">请选择</option>
                          <option value="bachelor">本科</option>
                          <option value="master">硕士</option>
                          <option value="doctor">博士</option>
                          <option value="other">其他</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">工作经历</label>
                      <textarea
                        rows={3}
                        value={individualForm.experience}
                        onChange={(e) => setIndividualForm({ ...individualForm, experience: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="请简要描述您的工作经历"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">主要成果或业绩</label>
                      <textarea
                        rows={3}
                        value={individualForm.achievements}
                        onChange={(e) => setIndividualForm({ ...individualForm, achievements: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="请简要描述您的主要成果或业绩"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Confirmation */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg text-gray-900 mb-4">确认信息</h3>
                    <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">姓名</div>
                          <div className="text-sm text-gray-900">{individualForm.name}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">手机号</div>
                          <div className="text-sm text-gray-900">{individualForm.phone}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">邮箱</div>
                          <div className="text-sm text-gray-900">{individualForm.email}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">所在单位</div>
                          <div className="text-sm text-gray-900">{individualForm.organization}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">职务</div>
                          <div className="text-sm text-gray-900">{individualForm.position}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">职称</div>
                          <div className="text-sm text-gray-900">{individualForm.title || '-'}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">专业领域</div>
                        <div className="flex flex-wrap gap-2">
                          {individualForm.expertise.map((exp) => (
                            <span key={exp} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                              {exp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm text-gray-900 mb-1">会员权益说明</div>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>• 参与所有专委会组织的技术交流活动</li>
                            <li>• 个人信息在专家风采中展示，提升行业影响力</li>
                            <li>• 获取行业最新技术资料和研究成果</li>
                            <li>• 优先参与标准编制和技术评审工作</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        className="w-4 h-4 mt-0.5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">
                        我确认以上信息真实有效，并同意
                        <a href="#" className="text-blue-600 hover:text-blue-700 mx-1">《会员章程》</a>
                        和
                        <a href="#" className="text-blue-600 hover:text-blue-700 mx-1">《会员权益说明》</a>
                      </span>
                    </label>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      上一步
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                  >
                    {currentStep === 3 ? '提交申请' : '下一步'}
                  </button>
                </div>
              </form>
            )}

            {/* Organization Member Form */}
            {memberType === 'organization' && (
              <form onSubmit={handleOrganizationSubmit} className="space-y-6">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg text-gray-900 mb-4">基本信息</h3>
                    
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">单位名称 *</label>
                      <input
                        type="text"
                        required
                        value={organizationForm.organizationName}
                        onChange={(e) => setOrganizationForm({ ...organizationForm, organizationName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="请输入单位全称"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">单位类型 *</label>
                      <div className="space-y-2">
                        {organizationTypeOptions.map((type) => (
                          <label
                            key={type.value}
                            className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              organizationForm.organizationType === type.value
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="organizationType"
                              value={type.value}
                              checked={organizationForm.organizationType === type.value}
                              onChange={(e) => setOrganizationForm({ ...organizationForm, organizationType: e.target.value as OrganizationType })}
                              className="w-5 h-5 mt-0.5 text-blue-600"
                            />
                            <div className="flex-1">
                              <div className="text-sm text-gray-900">{type.label}</div>
                              <div className="text-xs text-gray-500 mt-1">{type.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">联系人 *</label>
                        <input
                          type="text"
                          required
                          value={organizationForm.contactPerson}
                          onChange={(e) => setOrganizationForm({ ...organizationForm, contactPerson: e.target.value })}
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
                            required
                            value={organizationForm.contactPhone}
                            onChange={(e) => setOrganizationForm({ ...organizationForm, contactPhone: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="请输入联系电话"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-700 mb-2">联系邮箱 *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            required
                            value={organizationForm.contactEmail}
                            onChange={(e) => setOrganizationForm({ ...organizationForm, contactEmail: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="请输入联系邮箱"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Detailed Info */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg text-gray-900 mb-4">详细资料</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">统一社会信用代码</label>
                        <input
                          type="text"
                          value={organizationForm.socialCreditCode}
                          onChange={(e) => setOrganizationForm({ ...organizationForm, socialCreditCode: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="请输入统一社会信用代码"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-2">法定代表人</label>
                        <input
                          type="text"
                          value={organizationForm.legalRepresentative}
                          onChange={(e) => setOrganizationForm({ ...organizationForm, legalRepresentative: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="请输入法定代表人"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-2">成立日期</label>
                        <input
                          type="date"
                          value={organizationForm.establishmentDate}
                          onChange={(e) => setOrganizationForm({ ...organizationForm, establishmentDate: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-2">员工人数</label>
                        <input
                          type="text"
                          value={organizationForm.employeeCount}
                          onChange={(e) => setOrganizationForm({ ...organizationForm, employeeCount: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="如：50-100人"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">单位简介</label>
                      <textarea
                        rows={4}
                        value={organizationForm.introduction}
                        onChange={(e) => setOrganizationForm({ ...organizationForm, introduction: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="请简要介绍单位基本情况、主营业务等"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">主要项目或业绩</label>
                      <textarea
                        rows={3}
                        value={organizationForm.projects}
                        onChange={(e) => setOrganizationForm({ ...organizationForm, projects: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="请简要描述主要项目或业绩"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Confirmation */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg text-gray-900 mb-4">确认信息</h3>
                    <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">单位名称</div>
                        <div className="text-sm text-gray-900">{organizationForm.organizationName}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">单位类型</div>
                          <div className="text-sm text-gray-900">
                            {organizationTypeOptions.find(t => t.value === organizationForm.organizationType)?.label}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">联系人</div>
                          <div className="text-sm text-gray-900">{organizationForm.contactPerson}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">联系电话</div>
                          <div className="text-sm text-gray-900">{organizationForm.contactPhone}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">联系邮箱</div>
                          <div className="text-sm text-gray-900">{organizationForm.contactEmail}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm text-gray-900 mb-1">单位会员权益说明</div>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>• 参与专委会组织的各类技术交流活动</li>
                            <li>• 在平台进行品牌展示和技术产品推广</li>
                            <li>• 优先参与行业标准制定和技术评审</li>
                            <li>• 获得供需对接和项目合作机会</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        className="w-4 h-4 mt-0.5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">
                        我代表单位确认以上信息真实有效，并同意
                        <a href="#" className="text-blue-600 hover:text-blue-700 mx-1">《会员章程》</a>
                        和
                        <a href="#" className="text-blue-600 hover:text-blue-700 mx-1">《会员权益说明》</a>
                      </span>
                    </label>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      上一步
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                  >
                    {currentStep === 3 ? '提交申请' : '下一步'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          // Success State
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl text-gray-900 mb-4">申请提交成功！</h3>
            <p className="text-gray-600 mb-8">
              您的{memberType === 'individual' ? '个人会员' : '单位会员'}申请已提交成功，<br />
              我们将在<span className="text-blue-600">3个工作日</span>内完成审核。<br />
              审核果将通过邮件和短信通知您。
            </p>
            <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
              <div className="text-sm text-gray-900 mb-2">接下来您可以：</div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 查看平台的专家风采和优秀案例</li>
                <li>• 浏览近期活动并提前了解活动详情</li>
                <li>• 加入我们的微信公众号获取最新资讯</li>
              </ul>
            </div>
            <button
              onClick={handleSuccess}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              返回首页
            </button>
          </div>
        )}
      </div>
    </div>
  );
}