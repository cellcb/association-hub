import { Search, MapPin, Award, Mail, Phone, ExternalLink, X, BookOpen, Briefcase, FileText, GraduationCap, Trophy, Users as UsersIcon, Building, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { getPublicExperts, getPublicExpertById, getExpertiseFields } from '@/lib/api';
import type { ExpertListResponse, ExpertResponse, ExpertiseFieldResponse } from '@/types/expert';

// 辅助函数：安全解析 JSON 字符串
function safeParseJson<T>(jsonStr: string | null | undefined, defaultValue: T): T {
  if (!jsonStr) return defaultValue;
  try {
    return JSON.parse(jsonStr);
  } catch {
    return defaultValue;
  }
}

export function ExpertDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<ExpertResponse | null>(null);

  // 数据状态
  const [experts, setExperts] = useState<ExpertListResponse[]>([]);
  const [expertiseFields, setExpertiseFields] = useState<ExpertiseFieldResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12;

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 加载专业领域
  useEffect(() => {
    async function loadFields() {
      try {
        const result = await getExpertiseFields();
        if (result.success && result.data) {
          setExpertiseFields(result.data);
        }
      } catch (err) {
        console.error('Failed to load expertise fields:', err);
      }
    }
    loadFields();
  }, []);

  // 加载专家列表
  const loadExperts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPublicExperts({
        page: currentPage,
        size: pageSize,
        keyword: debouncedSearchTerm || undefined,
        fieldId: selectedFieldId || undefined,
      });
      if (result.success && result.data) {
        setExperts(result.data.content);
        setTotalPages(result.data.page.totalPages);
        setTotalElements(result.data.page.totalElements);
      } else {
        setError(result.message || '加载失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('Failed to load experts:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, selectedFieldId]);

  useEffect(() => {
    loadExperts();
  }, [loadExperts]);

  // 选择专业领域时重置分页
  const handleFieldSelect = (fieldId: number | null) => {
    setSelectedFieldId(fieldId);
    setCurrentPage(0);
  };

  // 查看专家详情
  const handleViewExpert = async (expertId: number) => {
    setLoadingDetail(true);
    try {
      const result = await getPublicExpertById(expertId);
      if (result.success && result.data) {
        setSelectedExpert(result.data);
      }
    } catch (err) {
      console.error('Failed to load expert detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Expert Detail Modal */}
      {selectedExpert && (
        <ExpertDetailModal
          expert={selectedExpert}
          onClose={() => setSelectedExpert(null)}
        />
      )}

      {/* Loading Detail Overlay */}
      {loadingDetail && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>加载中...</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-gray-900 mb-2">专家风采</h1>
          <p className="text-gray-600">汇聚行业顶尖专家，提供专业技术指导与咨询服务</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 mb-6">
          {/* Search Input - Full Width */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索专家姓名、单位或专业领域..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Field Filter - Separate Row */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => handleFieldSelect(null)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedFieldId === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部领域
            </button>
            {expertiseFields.map((field) => (
              <button
                key={field.id}
                onClick={() => handleFieldSelect(field.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedFieldId === field.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {field.name}
              </button>
            ))}
          </div>

          <div className="mt-4 text-sm text-gray-500">
            找到 {totalElements} 位专家
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">加载中...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <X className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-600 mb-2">{error}</p>
            <button
              onClick={loadExperts}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              重试
            </button>
          </div>
        )}

        {/* Expert Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {experts.map((expert) => (
                <ExpertCard
                  key={expert.id}
                  expert={expert}
                  onViewDetail={() => handleViewExpert(expert.id)}
                />
              ))}
            </div>

            {/* Empty State */}
            {experts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <p className="text-gray-600 mb-2">未找到匹配的专家</p>
                <p className="text-sm text-gray-500">请尝试其他搜索条件</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  上一页
                </button>
                <span className="px-4 py-2 text-gray-600">
                  第 {currentPage + 1} / {totalPages} 页
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// 专家卡片组件
function ExpertCard({ expert, onViewDetail }: { expert: ExpertListResponse; onViewDetail: () => void }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Expert Header */}
      <div className="flex items-start gap-4 mb-4">
        {expert.avatar ? (
          <img
            src={expert.avatar}
            alt={expert.name}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
            <span className="text-xl">{expert.name[0]}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg text-gray-900 mb-1">{expert.name}</h3>
          <p className="text-sm text-gray-600 mb-1">{expert.title || '专家'}</p>
          <p className="text-sm text-gray-500">{expert.organization || '-'}</p>
        </div>
      </div>

      {/* Expertise Tags */}
      {expert.expertiseFields && expert.expertiseFields.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {expert.expertiseFields.map((field) => (
            <span
              key={field.id}
              className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm border border-blue-100"
            >
              {field.name}
            </span>
          ))}
        </div>
      )}

      {/* Location */}
      {expert.location && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span>{expert.location}</span>
        </div>
      )}

      {/* Achievements */}
      {expert.achievements && (
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
          <Award className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{expert.achievements}</span>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-100 my-4"></div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        {expert.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span>{expert.email}</span>
          </div>
        )}
        {expert.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span>{expert.phone}</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={onViewDetail}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        <span>查看详情</span>
        <ExternalLink className="w-4 h-4" />
      </button>
    </div>
  );
}

// 专家详情模态框组件
function ExpertDetailModal({ expert, onClose }: { expert: ExpertResponse; onClose: () => void }) {
  // 解析 JSON 字段
  const education = safeParseJson<string[]>(expert.education, []);
  const experience = safeParseJson<string[]>(expert.experience, []);
  const researchAreas = safeParseJson<string[]>(expert.researchAreas, []);
  const awards = safeParseJson<string[]>(expert.awards, []);
  const projects = safeParseJson<{ name: string; year: string; role: string; description: string }[]>(expert.projects, []);
  const publications = safeParseJson<{ title: string; year: string; journal: string }[]>(expert.publications, []);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-8 md:p-10 text-white rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-start gap-6">
            {expert.avatar ? (
              <img
                src={expert.avatar}
                alt={expert.name}
                className="w-24 h-24 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white flex-shrink-0">
                <span className="text-4xl">{expert.name[0]}</span>
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl mb-2">{expert.name}</h1>
              <p className="text-lg text-blue-100 mb-3">{expert.title || '专家'}</p>
              <div className="flex items-center gap-2 text-blue-100">
                <Building className="w-4 h-4" />
                <span>{expert.organization || '-'}</span>
              </div>
            </div>
          </div>

          {/* Expertise Tags */}
          {expert.expertiseFields && expert.expertiseFields.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {expert.expertiseFields.map((field) => (
                <span
                  key={field.id}
                  className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm"
                >
                  {field.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6 md:p-10">
          {/* Bio */}
          {expert.bio && (
            <div className="mb-8">
              <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-blue-600" />
                专家简介
              </h2>
              <p className="text-gray-700 leading-relaxed">{expert.bio}</p>
            </div>
          )}

          {/* Contact & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-xl">
            <div>
              <h3 className="text-sm text-gray-500 mb-3">联系方式</h3>
              <div className="space-y-2">
                {expert.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>{expert.email}</span>
                  </div>
                )}
                {expert.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>{expert.phone}</span>
                  </div>
                )}
                {expert.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>{expert.location}</span>
                  </div>
                )}
              </div>
            </div>
            {expert.achievements && (
              <div>
                <h3 className="text-sm text-gray-500 mb-3">主要成就</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{expert.achievements}</p>
              </div>
            )}
          </div>

          {/* Education */}
          {education.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                教育背景
              </h2>
              <div className="space-y-3">
                {education.map((edu, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{edu}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                工作经历
              </h2>
              <div className="space-y-3">
                {experience.map((exp, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{exp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Research Areas */}
          {researchAreas.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                研究方向
              </h2>
              <div className="flex flex-wrap gap-2">
                {researchAreas.map((area, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg border border-blue-200"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                代表项目
              </h2>
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <div key={index} className="p-5 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg text-gray-900 flex-1">{project.name}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm ml-4 flex-shrink-0">
                        {project.year}
                      </span>
                    </div>
                    <p className="text-sm text-blue-600 mb-2">{project.role}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Publications */}
          {publications.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                代表论文
              </h2>
              <div className="space-y-3">
                {publications.map((pub, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-gray-900 mb-1">{pub.title}</h3>
                        <p className="text-sm text-gray-600">{pub.journal}</p>
                      </div>
                      <span className="text-sm text-gray-500 flex-shrink-0">{pub.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Awards */}
          {awards.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-600" />
                荣誉奖项
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {awards.map((award, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <Trophy className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{award}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
            {expert.email && (
              <a
                href={`mailto:${expert.email}`}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>发送咨询</span>
              </a>
            )}
            {expert.phone && (
              <a
                href={`tel:${expert.phone}`}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>电话联系</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
