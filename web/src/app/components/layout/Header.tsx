import { Menu, X, Users, FileText, Calendar, Package, Settings, LogIn, User, Newspaper, FolderOpen, LogOut, UserCircle, ChevronDown, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { PageType, NavigationParams } from '../../App';
import { LoginModal } from '../auth/LoginModal';
import { MembershipApplicationModal } from '../auth/MembershipApplicationModal';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteConfig } from '@/contexts/SiteConfigContext';

interface HeaderProps {
  currentPage: PageType;
  onNavigate: (page: PageType, params?: NavigationParams) => void;
  onAdminClick: () => void;
}

export function Header({ currentPage, onNavigate, onAdminClick }: HeaderProps) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { config } = useSiteConfig();

  // Get site name from config with fallback
  const siteName = config?.site_name || '广东省土木建筑学会';
  const siteSlogan = config?.site_slogan || '给水排水专业委员会';
  const siteNameShort = config?.site_name_short || '给排水专委会';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    { id: 'home' as PageType, label: '首页', icon: null },
    { id: 'news' as PageType, label: '新闻中心', icon: Newspaper },
    { id: 'experts' as PageType, label: '专家风采', icon: Users },
    { id: 'projects' as PageType, label: '优秀案例', icon: FolderOpen },
    { id: 'activities' as PageType, label: '活动中心', icon: Calendar },
    { id: 'products' as PageType, label: '产品展示', icon: Package },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div className="hidden lg:block">
              <div className="text-sm text-gray-900">{siteName}</div>
              <div className="text-xs text-gray-600">{siteSlogan}</div>
            </div>
            <div className="lg:hidden">
              <div className="text-sm text-gray-900">{siteNameShort}</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  currentPage === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                {item.label}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={onAdminClick}
                className="ml-4 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                管理后台
              </button>
            )}
            {isAuthenticated && user ? (
              <div className="relative ml-4">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <UserCircle className="w-4 h-4" />
                  {user.realName || user.username}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                    <button
                      className="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-3"
                      onClick={() => {
                        onNavigate('profile' as PageType);
                        setUserMenuOpen(false);
                      }}
                    >
                      <User className="w-4 h-4" />
                      个人中心
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-3"
                      onClick={() => {
                        onNavigate('my-registrations' as PageType);
                        setUserMenuOpen(false);
                      }}
                    >
                      <ClipboardList className="w-4 h-4" />
                      我的报名
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      className="w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-3"
                      onClick={async () => {
                        await logout();
                        setUserMenuOpen(false);
                        onNavigate('home');
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      登出
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="ml-4 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                登录
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-gray-100">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-3 text-left rounded-lg transition-colors flex items-center gap-3 ${
                  currentPage === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.icon && <item.icon className="w-5 h-5" />}
                {item.label}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => {
                  onAdminClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-left rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-3 mt-2 border-t border-gray-100 pt-4"
              >
                <Settings className="w-5 h-5" />
                管理后台
              </button>
            )}
            {isAuthenticated && user ? (
              <div className="mt-2 border-t border-gray-100 pt-4">
                <button
                  onClick={() => {
                    onNavigate('profile' as PageType);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <User className="w-5 h-5" />
                  个人中心
                </button>
                <button
                  onClick={() => {
                    onNavigate('my-registrations' as PageType);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-3 mb-2"
                >
                  <ClipboardList className="w-5 h-5" />
                  我的报名
                </button>
                <button
                  onClick={async () => {
                    await logout();
                    setMobileMenuOpen(false);
                    onNavigate('home');
                  }}
                  className="w-full px-4 py-3 text-left rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <LogOut className="w-5 h-5" />
                  登出
                </button>
              </div>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="w-full px-4 py-3 text-left rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-3 mt-2 border-t border-gray-100 pt-4"
              >
                <LogIn className="w-5 h-5" />
                登录
              </button>
            )}
          </nav>
        )}
      </div>
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={() => {
          setLoginModalOpen(false);
        }}
        onRegisterClick={() => setApplicationModalOpen(true)}
      />
      <MembershipApplicationModal
        isOpen={applicationModalOpen}
        onClose={() => setApplicationModalOpen(false)}
      />
    </header>
  );
}