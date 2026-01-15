import { Search, MapPin, Building2, Calendar, Award, Eye, TrendingUp, X, FileText, Lightbulb, CheckCircle, BarChart3, Image as ImageIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getPublicProjects, getPublicProjectById, incrementProjectViews, getProjectCategories } from '@/lib/api';
import type { ProjectListResponse, ParsedProjectResponse, ProjectCategoryResponse } from '@/types/project';
import { projectCategoryLabels, parseProjectResponse } from '@/types/project';

interface ProjectShowcaseProps {
  initialProjectId?: number;
}

export function ProjectShowcase({ initialProjectId }: ProjectShowcaseProps) {
  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 分类数据（从后台加载）
  const [categories, setCategories] = useState<ProjectCategoryResponse[]>([]);

  // 数据状态
  const [projects, setProjects] = useState<ProjectListResponse[]>([]);
  const [selectedProject, setSelectedProject] = useState<ParsedProjectResponse | null>(null);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // 加载状态
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 加载项目分类
  useEffect(() => {
    getProjectCategories().then(res => {
      if (res.success && res.data) {
        setCategories(res.data);
      }
    });
  }, []);

  // 动态生成分类选项
  const categoryOptions = [
    { label: '全部类型', value: null as string | null },
    ...categories.map(c => ({ label: c.name, value: c.code }))
  ];

  // 类别变化时重置页码
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(0);
  };

  // 加载项目列表
  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: {
        page: number;
        size: number;
        keyword?: string;
        category?: string;
      } = {
        page: currentPage,
        size: pageSize,
      };

      if (debouncedSearchTerm) {
        params.keyword = debouncedSearchTerm;
      }
      if (selectedCategory) {
        params.category = selectedCategory;
      }

      const res = await getPublicProjects(params);
      if (res.success && res.data) {
        setProjects(res.data.content);
        setTotalPages(res.data.page.totalPages);
        setTotalElements(res.data.page.totalElements);
      } else {
        setError(res.message || '加载项目失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, selectedCategory]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Handle initial project ID from URL deep link
  useEffect(() => {
    if (initialProjectId && !loading) {
      handleViewDetail(initialProjectId);
    }
  }, [initialProjectId, loading]);

  // 加载项目详情
  const handleViewDetail = async (id: number) => {
    setLoadingDetail(true);
    try {
      const [detailRes] = await Promise.all([
        getPublicProjectById(id),
        incrementProjectViews(id),
      ]);

      if (detailRes.success && detailRes.data) {
        setSelectedProject(parseProjectResponse(detailRes.data));
      } else {
        alert(detailRes.message || '加载详情失败');
      }
    } catch (err) {
      console.error('Failed to load project detail:', err);
      alert('网络错误，请稍后重试');
    } finally {
      setLoadingDetail(false);
    }
  };

  // 分页渲染
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
          disabled={currentPage === 0}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i;
            } else if (currentPage < 3) {
              pageNum = i;
            } else if (currentPage > totalPages - 4) {
              pageNum = totalPages - 5 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-10 h-10 rounded-lg ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum + 1}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={currentPage === totalPages - 1}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  // 解析列表项的 JSON 字段
  const parseListImages = (imagesJson: string | null): string[] => {
    if (!imagesJson) return [];
    try {
      return JSON.parse(imagesJson);
    } catch {
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8">
            {/* Modal Header with Project Image */}
            <div className="relative h-64 md:h-96 bg-gradient-to-br from-blue-100 to-blue-200">
              {selectedProject.images && selectedProject.images.length > 0 ? (
                <ImageWithFallback
                  src={selectedProject.images[0]}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
              ) : selectedProject.coverImage ? (
                <ImageWithFallback
                  src={selectedProject.coverImage}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="w-24 h-24 text-blue-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Project Title on Image */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                    {selectedProject.categoryName}
                  </span>
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="w-4 h-4" />
                    <span>{selectedProject.views.toLocaleString()} 浏览</span>
                  </div>
                </div>
                <h1 className="text-2xl md:text-4xl mb-4 leading-tight">
                  {selectedProject.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedProject.location}</span>
                  </div>
                  {selectedProject.completionDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>竣工时间：{selectedProject.completionDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-10">
              {/* Project Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="text-sm text-gray-500 mb-2">建设单位</h3>
                  <p className="text-sm text-gray-900">{selectedProject.owner || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-2">设计单位</h3>
                  <p className="text-sm text-gray-900">{selectedProject.designer || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-2">施工单位</h3>
                  <p className="text-sm text-gray-900">{selectedProject.contractor || '-'}</p>
                </div>
              </div>

              {/* Project Scale */}
              {selectedProject.scale && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    项目规模
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedProject.scale.area && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-sm text-blue-600 mb-1">建筑面积</div>
                        <div className="text-lg text-blue-900">{selectedProject.scale.area}</div>
                      </div>
                    )}
                    {selectedProject.scale.height && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-sm text-blue-600 mb-1">建筑高度</div>
                        <div className="text-lg text-blue-900">{selectedProject.scale.height}</div>
                      </div>
                    )}
                    {selectedProject.scale.investment && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-sm text-blue-600 mb-1">投资规模</div>
                        <div className="text-lg text-blue-900">{selectedProject.scale.investment}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Project Background */}
              {selectedProject.background && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    项目背景
                  </h2>
                  <p className="text-gray-700 leading-relaxed">{selectedProject.background}</p>
                </div>
              )}

              {/* Design Concept */}
              {selectedProject.designConcept && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-600" />
                    设计理念
                  </h2>
                  <p className="text-gray-700 leading-relaxed">{selectedProject.designConcept}</p>
                </div>
              )}

              {/* Technical Features */}
              {selectedProject.technicalFeatures && selectedProject.technicalFeatures.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    技术特点
                  </h2>
                  <div className="space-y-4">
                    {selectedProject.technicalFeatures.map((feature, index) => (
                      <div key={index} className="p-5 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all">
                        <h3 className="text-lg text-gray-900 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed pl-7">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights */}
              {selectedProject.highlights && selectedProject.highlights.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    技术亮点
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedProject.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {selectedProject.achievements && selectedProject.achievements.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    项目成果
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedProject.achievements.map((achievement, index) => (
                      <div key={index} className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 text-center">
                        <div className="text-3xl text-blue-600 mb-2">{achievement.value}</div>
                        <div className="text-sm text-gray-900 mb-2">{achievement.title}</div>
                        <div className="text-xs text-gray-600">{achievement.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Awards */}
              {selectedProject.projectAwards && selectedProject.projectAwards.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    获奖情况
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedProject.projectAwards.map((award, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                        <Award className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{award}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Images */}
              {selectedProject.images && selectedProject.images.length > 1 && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                    项目图片
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedProject.images.slice(1).map((image, index) => (
                      <div key={index} className="relative h-48 rounded-lg overflow-hidden group">
                        <ImageWithFallback
                          src={image}
                          alt={`${selectedProject.title} - ${index + 2}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay for Detail */}
      {loadingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-700">加载中...</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-gray-900 mb-2">优秀案例</h1>
          <p className="text-gray-600">展示行业典型案例与创新成果，分享成功经验</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索项目名称、地点或关键词..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {categoryOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleCategoryChange(option.value)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            找到 {totalElements} 个项目
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
              onClick={loadProjects}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              重试
            </button>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {projects.map((project) => {
                const images = parseListImages(project.images);
                return (
                  <div
                    key={project.id}
                    className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    {/* Project Image */}
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      {project.coverImage ? (
                        <ImageWithFallback
                          src={project.coverImage}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : images.length > 0 ? (
                        <ImageWithFallback
                          src={images[0]}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-16 h-16 text-blue-400" />
                      )}
                    </div>

                    <div className="p-6">
                      {/* Category Badge */}
                      <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm mb-3">
                        {project.categoryName || projectCategoryLabels[project.category] || project.category}
                      </div>

                      {/* Project Title */}
                      <h3 className="text-lg text-gray-900 mb-2">{project.title}</h3>

                      {/* Project Info */}
                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{project.location || '-'}</span>
                        </div>
                        {project.completionDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>竣工时间：{project.completionDate}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          <span>{project.views.toLocaleString()} 浏览</span>
                        </div>
                      </div>

                      {/* Description */}
                      {project.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                      )}

                      {/* Highlights */}
                      {(() => {
                        const highlights = parseListImages(project.highlights);
                        return highlights.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                              <TrendingUp className="w-4 h-4" />
                              <span>技术亮点</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {highlights.slice(0, 3).map((highlight, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                                >
                                  {highlight}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Awards */}
                      {(() => {
                        const awards = parseListImages(project.projectAwards);
                        return awards.length > 0 && (
                          <div className="mb-4 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                              <Award className="w-4 h-4 text-amber-500" />
                              <span>获奖情况</span>
                            </div>
                            <div className="space-y-1">
                              {awards.slice(0, 2).map((award, index) => (
                                <div key={index} className="text-sm text-gray-600">
                                  • {award}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Participants */}
                      <div className="space-y-1 text-xs text-gray-500 mb-4">
                        <div><span className="text-gray-600">建设单位：</span>{project.owner || '-'}</div>
                        <div><span className="text-gray-600">设计单位：</span>{project.designer || '-'}</div>
                        <div><span className="text-gray-600">施工单位：</span>{project.contractor || '-'}</div>
                      </div>

                      {/* Action Button */}
                      <button
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        onClick={() => handleViewDetail(project.id)}
                        disabled={loadingDetail}
                      >
                        查看详情
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {projects.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <p className="text-gray-600 mb-2">未找到匹配的项目</p>
                <p className="text-sm text-gray-500">请尝试其他搜索条件</p>
              </div>
            )}

            {/* Pagination */}
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
}
