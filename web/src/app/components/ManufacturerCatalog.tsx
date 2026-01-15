import { Search, Building2, Phone, Mail, ExternalLink, X, Eye, ChevronLeft, ChevronRight, Loader2, Globe, User, MapPin, Calendar, Users, Award, Briefcase, CheckCircle, FileText } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getPublicManufacturers, getPublicManufacturerById, getManufacturerCategories, incrementManufacturerViews } from '@/lib/api';
import type { ManufacturerListResponse, ManufacturerResponse, ManufacturerCategoryResponse } from '@/types/manufacturer';

// JSON 字段解析工具函数
const parseJsonArray = (jsonStr: string | null): string[] => {
  if (!jsonStr) return [];
  try {
    return JSON.parse(jsonStr);
  } catch {
    return [];
  }
};

// 获取第一张图片
const getFirstImage = (imagesJson: string | null): string | null => {
  const images = parseJsonArray(imagesJson);
  return images.length > 0 ? images[0] : null;
};

interface ManufacturerCatalogProps {
  initialManufacturerId?: number;
}

export function ManufacturerCatalog({ initialManufacturerId }: ManufacturerCatalogProps) {
  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // 数据状态
  const [manufacturers, setManufacturers] = useState<ManufacturerListResponse[]>([]);
  const [categories, setCategories] = useState<ManufacturerCategoryResponse[]>([]);
  const [manufacturerDetail, setManufacturerDetail] = useState<ManufacturerResponse | null>(null);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12;

  // 加载状态
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 图片预览状态
  const [previewImage, setPreviewImage] = useState<{
    images: string[];
    currentIndex: number;
  } | null>(null);

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 加载分类
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getManufacturerCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  // 加载厂商列表
  useEffect(() => {
    const loadManufacturers = async () => {
      setLoading(true);
      setError(null);

      try {
        const params: {
          page: number;
          size: number;
          categoryId?: number;
          keyword?: string;
        } = {
          page: currentPage,
          size: pageSize,
        };

        if (selectedCategoryId !== null) {
          params.categoryId = selectedCategoryId;
        }
        if (debouncedSearchTerm) {
          params.keyword = debouncedSearchTerm;
        }

        const res = await getPublicManufacturers(params);

        if (res.success && res.data) {
          setManufacturers(res.data.content);
          setTotalPages(res.data.page.totalPages);
          setTotalElements(res.data.page.totalElements);
        } else {
          setError(res.message || '加载厂商失败');
        }
      } catch (err) {
        setError('网络错误，请稍后重试');
        console.error('Failed to load manufacturers:', err);
      } finally {
        setLoading(false);
      }
    };

    loadManufacturers();
  }, [currentPage, selectedCategoryId, debouncedSearchTerm]);

  // Handle initial manufacturer ID from URL deep link
  useEffect(() => {
    if (initialManufacturerId && !loading) {
      handleViewManufacturer(initialManufacturerId);
    }
  }, [initialManufacturerId, loading]);

  // 图片预览键盘导航
  useEffect(() => {
    if (!previewImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewImage(null);
      } else if (e.key === 'ArrowLeft' && previewImage.currentIndex > 0) {
        setPreviewImage(prev => prev ? { ...prev, currentIndex: prev.currentIndex - 1 } : null);
      } else if (e.key === 'ArrowRight' && previewImage.currentIndex < previewImage.images.length - 1) {
        setPreviewImage(prev => prev ? { ...prev, currentIndex: prev.currentIndex + 1 } : null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage]);

  // 处理分类选择
  const handleCategorySelect = useCallback((categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(0);
  }, []);

  // 打开厂商详情
  const handleViewManufacturer = async (manufacturerId: number) => {
    setLoadingDetail(true);

    try {
      // 增加浏览量
      incrementManufacturerViews(manufacturerId).catch(console.error);

      // 获取详情
      const res = await getPublicManufacturerById(manufacturerId);
      if (res.success && res.data) {
        setManufacturerDetail(res.data);
      }
    } catch (err) {
      console.error('Failed to load manufacturer detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // 关闭详情模态框
  const handleCloseDetail = () => {
    setManufacturerDetail(null);
  };

  // 渲染加载骨架屏
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-200 animate-pulse">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-6 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // 渲染分页
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Manufacturer Detail Modal */}
      {manufacturerDetail && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8">
            {/* Modal Header */}
            <div className="relative h-64 md:h-96 bg-gradient-to-br from-blue-100 to-blue-200">
              {getFirstImage(manufacturerDetail.images) ? (
                <ImageWithFallback
                  src={getFirstImage(manufacturerDetail.images)!}
                  alt={manufacturerDetail.name}
                  className="w-full h-full object-cover"
                />
              ) : manufacturerDetail.logo ? (
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  <ImageWithFallback
                    src={manufacturerDetail.logo}
                    alt={manufacturerDetail.name}
                    className="max-w-[200px] max-h-[150px] object-contain"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="w-24 h-24 text-blue-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

              {/* Close Button */}
              <button
                onClick={handleCloseDetail}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Manufacturer Meta */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                    {manufacturerDetail.category?.name || '未分类'}
                  </span>
                  {manufacturerDetail.featured && (
                    <span className="px-3 py-1 bg-red-500/80 backdrop-blur-sm rounded-full text-sm">
                      推荐
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl mb-2 leading-tight">
                  {manufacturerDetail.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {manufacturerDetail.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{manufacturerDetail.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{manufacturerDetail.views} 浏览</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-10">
              {/* Company Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 p-6 bg-gray-50 rounded-xl">
                {manufacturerDetail.establishedDate && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-600 mb-1">成立时间</div>
                    <div className="text-lg text-blue-900">{manufacturerDetail.establishedDate}</div>
                  </div>
                )}
                {manufacturerDetail.registeredCapital && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-600 mb-1">注册资本</div>
                    <div className="text-lg text-blue-900">{manufacturerDetail.registeredCapital}</div>
                  </div>
                )}
                {manufacturerDetail.employeeScale && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-600 mb-1">员工规模</div>
                    <div className="text-lg text-blue-900">{manufacturerDetail.employeeScale}</div>
                  </div>
                )}
                {parseJsonArray(manufacturerDetail.qualifications).length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-600 mb-1">资质认证</div>
                    <div className="text-lg text-blue-900">{parseJsonArray(manufacturerDetail.qualifications).length} 项</div>
                  </div>
                )}
              </div>

              {/* Summary */}
              {manufacturerDetail.summary && (
                <div className="mb-8">
                  <p className="text-gray-700 leading-relaxed">{manufacturerDetail.summary}</p>
                </div>
              )}

              {/* Description */}
              {manufacturerDetail.description && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    企业介绍
                  </h2>
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: manufacturerDetail.description }}
                  />
                </div>
              )}

              {/* Main Business */}
              {manufacturerDetail.mainBusiness && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    主营业务
                  </h2>
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: manufacturerDetail.mainBusiness }}
                  />
                </div>
              )}

              {/* Qualifications */}
              {parseJsonArray(manufacturerDetail.qualifications).length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    资质认证
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {parseJsonArray(manufacturerDetail.qualifications).map((qual, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                      >
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{qual}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Honors */}
              {parseJsonArray(manufacturerDetail.honors).length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    荣誉资质
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {parseJsonArray(manufacturerDetail.honors).map((honor, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                        <Award className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{honor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cases */}
              {parseJsonArray(manufacturerDetail.cases).length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    合作案例
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {parseJsonArray(manufacturerDetail.cases).map((caseItem, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <Building2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{caseItem}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Images Gallery */}
              {parseJsonArray(manufacturerDetail.images).length > 1 && (
                <div className="mb-8">
                  <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    图片展示
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {parseJsonArray(manufacturerDetail.images).slice(1).map((img, index) => (
                      <div
                        key={index}
                        className="relative h-48 rounded-lg overflow-hidden group cursor-pointer"
                        onClick={() => setPreviewImage({
                          images: parseJsonArray(manufacturerDetail.images).slice(1),
                          currentIndex: index
                        })}
                      >
                        <ImageWithFallback
                          src={img}
                          alt={`${manufacturerDetail.name} - ${index + 2}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="p-6 bg-gray-50 rounded-xl">
                <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-blue-600" />
                  联系方式
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {manufacturerDetail.contactPerson && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <User className="w-5 h-5 text-gray-400" />
                      <span>{manufacturerDetail.contactPerson}</span>
                    </div>
                  )}
                  {manufacturerDetail.contactPhone && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span>{manufacturerDetail.contactPhone}</span>
                    </div>
                  )}
                  {manufacturerDetail.contactEmail && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span>{manufacturerDetail.contactEmail}</span>
                    </div>
                  )}
                  {manufacturerDetail.website && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <a
                        href={manufacturerDetail.website.startsWith('http') ? manufacturerDetail.website : `https://${manufacturerDetail.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {manufacturerDetail.website}
                      </a>
                    </div>
                  )}
                  {manufacturerDetail.address && (
                    <div className="flex items-center gap-3 text-gray-700 md:col-span-2">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span>{manufacturerDetail.address}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <span>联系厂商</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Detail Modal */}
      {loadingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
          onClick={() => setPreviewImage(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 text-white/70 text-sm">
            {previewImage.currentIndex + 1} / {previewImage.images.length}
          </div>

          {/* Previous Button */}
          {previewImage.images.length > 1 && previewImage.currentIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImage(prev => prev ? { ...prev, currentIndex: prev.currentIndex - 1 } : null);
              }}
              className="absolute left-4 p-2 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
          )}

          {/* Image */}
          <img
            src={previewImage.images[previewImage.currentIndex]}
            alt="预览"
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next Button */}
          {previewImage.images.length > 1 && previewImage.currentIndex < previewImage.images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImage(prev => prev ? { ...prev, currentIndex: prev.currentIndex + 1 } : null);
              }}
              className="absolute right-4 p-2 text-white/70 hover:text-white transition-colors"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-gray-900 mb-2">厂商展示</h1>
          <p className="text-gray-600">优质厂商资源，助力行业合作与发展</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索厂商名称、地址或主营业务..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => handleCategorySelect(null)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategoryId === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部分类
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategoryId === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="mt-4 text-sm text-gray-500">
            找到 {totalElements} 个厂商
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-600 underline"
            >
              重新加载
            </button>
          </div>
        )}

        {/* Manufacturers Grid */}
        {loading ? (
          renderSkeleton()
        ) : manufacturers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {manufacturers.map((manufacturer) => (
                <div
                  key={manufacturer.id}
                  onClick={() => handleViewManufacturer(manufacturer.id)}
                  className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  {/* Manufacturer Logo/Image */}
                  <div className="h-48 relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                    {manufacturer.logo ? (
                      <ImageWithFallback
                        src={manufacturer.logo}
                        alt={manufacturer.name}
                        className="max-w-[150px] max-h-[100px] object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <Building2 className="w-16 h-16 text-blue-400" />
                    )}
                    {manufacturer.featured && (
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs">
                          推荐
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    {/* Category Badge */}
                    <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm mb-3">
                      {manufacturer.categoryName || '未分类'}
                    </div>

                    {/* Manufacturer Name */}
                    <h3 className="text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {manufacturer.name}
                    </h3>

                    {/* Address */}
                    {manufacturer.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{manufacturer.address}</span>
                      </div>
                    )}

                    {/* Summary/Main Business */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {manufacturer.summary || manufacturer.mainBusiness || '暂无简介'}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Eye className="w-4 h-4" />
                        <span>{manufacturer.views} 浏览</span>
                      </div>
                      <button className="text-blue-600 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        <span>查看详情</span>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {renderPagination()}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-600 mb-2">未找到匹配的厂商</p>
            <p className="text-sm text-gray-500">请尝试其他搜索条件</p>
          </div>
        )}
      </div>
    </div>
  );
}
