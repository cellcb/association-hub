import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Calendar, 
  Package, 
  Settings,
  ArrowLeft,
  UserCheck,
  Activity,
  TrendingUp,
  DollarSign,
  Award,
  Building2,
  Newspaper
} from 'lucide-react';
import { MemberManagement } from './MemberManagement';
import { ExpertManagement } from './ExpertManagement';
import { ProjectManagement } from './ProjectManagement';
import { NewsManagement } from './NewsManagement';
import { ActivityManagement } from './ActivityManagement';
import { ProductManagement } from './ProductManagement';
import { SystemSettings } from './SystemSettings';

interface AdminDashboardProps {
  onBack: () => void;
}

type AdminPage = 'dashboard' | 'members' | 'experts' | 'projects' | 'news' | 'activities' | 'products' | 'settings';

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');

  const menuItems = [
    { id: 'dashboard' as AdminPage, label: '数据概览', icon: LayoutDashboard },
    { id: 'members' as AdminPage, label: '会员管理', icon: Users },
    { id: 'experts' as AdminPage, label: '专家管理', icon: Award },
    { id: 'projects' as AdminPage, label: '项目管理', icon: Building2 },
    { id: 'news' as AdminPage, label: '新闻管理', icon: Newspaper },
    { id: 'activities' as AdminPage, label: '活动管理', icon: Calendar },
    { id: 'products' as AdminPage, label: '产品管理', icon: Package },
    { id: 'settings' as AdminPage, label: '系统设置', icon: Settings },
  ];

  const stats = [
    { label: '总会员数', value: '1,245', change: '+12.5%', icon: Users, color: 'bg-blue-500' },
    { label: '活动数量', value: '156', change: '+8.2%', icon: Activity, color: 'bg-green-500' },
    { label: '项目数量', value: '328', change: '+15.3%', icon: TrendingUp, color: 'bg-purple-500' },
    { label: '本月收入', value: '¥52,340', change: '+23.1%', icon: DollarSign, color: 'bg-orange-500' },
  ];

  const recentActivities = [
    { user: '张三', action: '申请入会', time: '5分钟前', type: 'member' },
    { user: '李明华', action: '发布新项目', time: '1小时前', type: 'project' },
    { user: '王芳', action: '报名参加活动', time: '2小时前', type: 'activity' },
    { user: '刘宇', action: '提交产品信息', time: '3小时前', type: 'product' },
    { user: '陈晓红', action: '更新个人信息', time: '5小时前', type: 'member' },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-green-600 text-sm">{stat.change}</span>
                  </div>
                  <div className="text-2xl text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg text-gray-900 mb-4">最近动态</h3>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900">{activity.user} {activity.action}</div>
                        <div className="text-xs text-gray-500">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg text-gray-900 mb-4">快捷操作</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <Users className="w-6 h-6 text-blue-600 mb-2" />
                    <div className="text-sm text-gray-900">审核会员</div>
                    <div className="text-xs text-gray-500">3 待审核</div>
                  </button>
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <Calendar className="w-6 h-6 text-green-600 mb-2" />
                    <div className="text-sm text-gray-900">创建活动</div>
                    <div className="text-xs text-gray-500">发布新活动</div>
                  </button>
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <FileText className="w-6 h-6 text-purple-600 mb-2" />
                    <div className="text-sm text-gray-900">发布内容</div>
                    <div className="text-xs text-gray-500">项目/资讯</div>
                  </button>
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <Package className="w-6 h-6 text-orange-600 mb-2" />
                    <div className="text-sm text-gray-900">添加产品</div>
                    <div className="text-xs text-gray-500">产品信息</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg text-gray-900 mb-4">待处理事项</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">3个会员申请待审核</span>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700">处理</button>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">2个活动报名审核</span>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700">处理</button>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">5个项目信息待审核</span>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700">处理</button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'members':
        return <MemberManagement />;
      case 'experts':
        return <ExpertManagement />;
      case 'projects':
        return <ProjectManagement />;
      case 'news':
        return <NewsManagement />;
      case 'activities':
        return <ActivityManagement />;
      case 'products':
        return <ProductManagement />;
      case 'settings':
        return <SystemSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-sm">管理</span>
            </div>
            <span className="text-gray-900">管理后台</span>
          </div>
          <button
            onClick={onBack}
            className="w-full flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回前台</span>
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Admin Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-600">管</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-900 truncate">管理员</div>
              <div className="text-xs text-gray-500">admin@example.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}