import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';

interface Content {
  id: number;
  title: string;
  type: '专家' | '项目' | '资讯';
  author: string;
  publishDate: string;
  status: '已发布' | '草稿' | '待审核';
  views: number;
}

export function ContentManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('全部');
  const [filterStatus, setFilterStatus] = useState('全部');

  const contents: Content[] = [
    {
      id: 1,
      title: '张建国 - 教授级高级工程师',
      type: '专家',
      author: '管理员',
      publishDate: '2024-01-15',
      status: '已发布',
      views: 1520,
    },
    {
      id: 2,
      title: '北京大兴国际机场航站楼项目',
      type: '项目',
      author: '管理员',
      publishDate: '2024-02-20',
      status: '已发布',
      views: 15230,
    },
    {
      id: 3,
      title: '2024年行业发展趋势分析',
      type: '资讯',
      author: '编辑部',
      publishDate: '2024-12-15',
      status: '已发布',
      views: 3450,
    },
    {
      id: 4,
      title: '智能建筑技术研讨会回顾',
      type: '资讯',
      author: '编辑部',
      publishDate: '2024-12-20',
      status: '待审核',
      views: 0,
    },
    {
      id: 5,
      title: '上海中心大厦绿色建筑案例',
      type: '项目',
      author: '管理员',
      publishDate: '',
      status: '草稿',
      views: 0,
    },
  ];

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === '全部' || content.type === filterType;
    const matchesStatus = filterStatus === '全部' || content.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: Content['status']) => {
    switch (status) {
      case '已发布':
        return <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs">已发布</span>;
      case '草稿':
        return <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">草稿</span>;
      case '待审核':
        return <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded-full text-xs">待审核</span>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl text-gray-900 mb-2">内容管理</h2>
        <p className="text-gray-600">管理专家、项目和资讯内容</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索内容标题..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Add Button */}
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap">
            <Plus className="w-5 h-5" />
            <span>添加内容</span>
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
            <option>专家</option>
            <option>项目</option>
            <option>资讯</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option>全部</option>
            <option>已发布</option>
            <option>草稿</option>
            <option>待审核</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          共 {filteredContents.length} 条记录
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  内容标题
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  作者
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  发布时间
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  浏览量
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
              {filteredContents.map((content) => (
                <tr key={content.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{content.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">
                      {content.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{content.author}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {content.publishDate || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Eye className="w-4 h-4" />
                      <span>{content.views.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(content.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {content.status === '待审核' && (
                        <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs">
                          审核
                        </button>
                      )}
                      <button className="p-1 text-blue-600 hover:text-blue-700">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
