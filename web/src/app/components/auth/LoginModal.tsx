import { useState } from 'react';
import { X, Mail, Lock, Phone, User, Eye, EyeOff, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

type LoginMethod = 'password' | 'sms';
type MemberType = 'individual' | 'organization';

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const { login } = useAuth();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [memberType, setMemberType] = useState<MemberType>('individual');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    smsCode: '',
    rememberMe: false,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 短信验证码登录暂不支持
    if (loginMethod === 'sms') {
      setError('短信验证码登录功能开发中，请使用密码登录');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login({
        username: formData.email,
        password: formData.password,
      });

      if (result.success) {
        onLoginSuccess?.();
        onClose();
      } else {
        setError(result.message);
      }
    } catch {
      setError('登录失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 注册功能通过会员申请流程完成
    setError('请通过"入会申请"提交会员注册');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl text-gray-900 mb-2">
              {isRegistering ? '会员注册' : '会员登录'}
            </h2>
            <p className="text-sm text-gray-600">
              {isRegistering ? '加入技术专委会，开启专业之旅' : '欢迎回来，请登录您的账户'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!isRegistering ? (
            // Login Form
            <>
              {/* Member Type Selector */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setMemberType('individual')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    memberType === 'individual'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <User className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm">个人会员</div>
                </button>
                <button
                  onClick={() => setMemberType('organization')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    memberType === 'organization'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Shield className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm">单位会员</div>
                </button>
              </div>

              {/* Login Method Tabs */}
              <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setLoginMethod('password')}
                  className={`flex-1 py-2 text-sm rounded-md transition-all ${
                    loginMethod === 'password'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  密码登录
                </button>
                <button
                  onClick={() => setLoginMethod('sms')}
                  className={`flex-1 py-2 text-sm rounded-md transition-all ${
                    loginMethod === 'sms'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  验证码登录
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {loginMethod === 'password' ? (
                  <>
                    {/* Email Input */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        邮箱地址
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          placeholder="请输入邮箱地址"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        密码
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="请输入密码"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Phone Input */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        手机号码
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          placeholder="请输入手机号码"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    {/* SMS Code Input */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        验证码
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="请输入验证码"
                          value={formData.smsCode}
                          onChange={(e) => setFormData({ ...formData, smsCode: e.target.value })}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                        <button
                          type="button"
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                          获取验证码
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Remember Me & Forgot Password */}
                {loginMethod === 'password' && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">记住我</span>
                    </label>
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      忘记密码？
                    </button>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      登录中...
                    </>
                  ) : (
                    '登录'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">或</span>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <span className="text-sm text-gray-600">还没有账号？</span>
                <button
                  onClick={() => setIsRegistering(true)}
                  className="ml-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  立即注册
                </button>
              </div>
            </>
          ) : (
            // Register Form
            <>
              {/* Member Type Selector */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setMemberType('individual')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    memberType === 'individual'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <User className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm">个人会员</div>
                </button>
                <button
                  onClick={() => setMemberType('organization')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    memberType === 'organization'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Shield className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm">单位会员</div>
                </button>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Name/Organization Name */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    {memberType === 'individual' ? '姓名' : '单位名称'}
                  </label>
                  <input
                    type="text"
                    placeholder={memberType === 'individual' ? '请输入您的姓名' : '请输入单位名称'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    邮箱地址
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="请输入邮箱地址"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    手机号码
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="请输入手机号码"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    密码
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="请设置密码（至少6位）"
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Agreement */}
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm text-gray-600">
                    我已阅读并同意
                    <a href="#" className="text-blue-600 hover:text-blue-700 mx-1">《用户协议》</a>
                    和
                    <a href="#" className="text-blue-600 hover:text-blue-700 mx-1">《隐私政策》</a>
                  </span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  注册
                </button>
              </form>

              {/* Back to Login */}
              <div className="text-center mt-6">
                <span className="text-sm text-gray-600">已有账号？</span>
                <button
                  onClick={() => setIsRegistering(false)}
                  className="ml-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  立即登录
                </button>
              </div>
            </>
          )}

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              <Shield className="w-4 h-4 inline mr-1" />
              您的信息将被严格保密，仅用于会员服务
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
