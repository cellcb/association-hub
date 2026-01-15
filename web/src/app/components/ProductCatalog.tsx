import { Search, Package, Tag, Building2, Phone, Mail, ExternalLink, X, Eye, ChevronLeft, ChevronRight, Loader2, Globe, User, Bookmark } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getPublicProducts, getPublicProductById, getProductCategories, incrementProductViews } from '@/lib/api';
import type { ProductListResponse, ProductResponse, ProductCategoryResponse } from '@/types/product';

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

interface ProductCatalogProps {
  initialProductId?: number;
}

export function ProductCatalog({ initialProductId }: ProductCatalogProps) {
  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // 数据状态
  const [products, setProducts] = useState<ProductListResponse[]>([]);
  const [categories, setCategories] = useState<ProductCategoryResponse[]>([]);
  const [productDetail, setProductDetail] = useState<ProductResponse | null>(null);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12;

  // 加载状态
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(0); // 搜索时重置页码
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 加载分类
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getProductCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  // 加载产品列表
  useEffect(() => {
    const loadProducts = async () => {
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

        const res = await getPublicProducts(params);

        if (res.success && res.data) {
          setProducts(res.data.content);
          setTotalPages(res.data.page.totalPages);
          setTotalElements(res.data.page.totalElements);
        } else {
          setError(res.message || '加载产品失败');
        }
      } catch (err) {
        setError('网络错误，请稍后重试');
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [currentPage, selectedCategoryId, debouncedSearchTerm]);

  // Handle initial product ID from URL deep link
  useEffect(() => {
    if (initialProductId && !loading) {
      handleViewProduct(initialProductId);
    }
  }, [initialProductId, loading]);

  // 处理分类选择
  const handleCategorySelect = useCallback((categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(0);
  }, []);

  // 打开产品详情
  const handleViewProduct = async (productId: number) => {
    setLoadingDetail(true);

    try {
      // 增加浏览量
      incrementProductViews(productId).catch(console.error);

      // 获取详情
      const res = await getPublicProductById(productId);
      if (res.success && res.data) {
        setProductDetail(res.data);
      }
    } catch (err) {
      console.error('Failed to load product detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // 关闭详情模态框
  const handleCloseDetail = () => {
    setProductDetail(null);
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
      {/* Product Detail Modal */}
      {productDetail && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
            {/* Modal Header with Image */}
            <div className="relative h-64 md:h-80">
              {getFirstImage(productDetail.images) ? (
                <ImageWithFallback
                  src={getFirstImage(productDetail.images) || ''}
                  alt={productDetail.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <Package className="w-24 h-24 text-indigo-400" />
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

              {/* Product Meta on Image */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                    {productDetail.category?.name}
                  </span>
                  {productDetail.featured && (
                    <span className="px-3 py-1 bg-red-500/80 backdrop-blur-sm rounded-full text-sm">
                      推荐
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl mb-2 leading-tight">
                  {productDetail.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>{productDetail.manufacturer}</span>
                  </div>
                  {productDetail.model && (
                    <div className="flex items-center gap-2">
                      <span>型号: {productDetail.model}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{productDetail.views} 浏览</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-10 max-h-[60vh] overflow-y-auto">
              {/* Price */}
              {productDetail.price && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">参考价格</div>
                  <div className="text-2xl text-red-600">{productDetail.price}</div>
                </div>
              )}

              {/* Summary */}
              {productDetail.summary && (
                <div className="mb-6">
                  <p className="text-gray-600 leading-relaxed">{productDetail.summary}</p>
                </div>
              )}

              {/* Description */}
              {productDetail.description && (
                <div className="mb-6">
                  <h3 className="text-lg text-gray-900 mb-3">产品介绍</h3>
                  <div
                    className="prose prose-sm max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{ __html: productDetail.description }}
                  />
                </div>
              )}

              {/* Features */}
              {parseJsonArray(productDetail.features).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg text-gray-900 mb-3">产品特点</h3>
                  <div className="space-y-2">
                    {parseJsonArray(productDetail.features).map((feature, index) => (
                      <div key={index} className="flex items-start gap-2 text-gray-600">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Application */}
              {productDetail.application && (
                <div className="mb-6">
                  <h3 className="text-lg text-gray-900 mb-3">应用范围</h3>
                  <div
                    className="prose prose-sm max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{ __html: productDetail.application }}
                  />
                </div>
              )}

              {/* Specifications */}
              {productDetail.specifications && (
                <div className="mb-6">
                  <h3 className="text-lg text-gray-900 mb-3">技术规格</h3>
                  <div
                    className="prose prose-sm max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{ __html: productDetail.specifications }}
                  />
                </div>
              )}

              {/* Certifications */}
              {parseJsonArray(productDetail.certifications).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    认证资质
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {parseJsonArray(productDetail.certifications).map((cert, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg text-gray-900 mb-4">联系方式</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {productDetail.contact && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <User className="w-5 h-5 text-gray-400" />
                      <span>{productDetail.contact}</span>
                    </div>
                  )}
                  {productDetail.contactPhone && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span>{productDetail.contactPhone}</span>
                    </div>
                  )}
                  {productDetail.contactEmail && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span>{productDetail.contactEmail}</span>
                    </div>
                  )}
                  {productDetail.website && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <a
                        href={productDetail.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {productDetail.website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <span>咨询详情</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <Bookmark className="w-4 h-4" />
                    <span>收藏</span>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl text-gray-900 mb-2">创新绿色产品</h1>
          <p className="text-gray-600">最新技术产品与解决方案，促进供需对接</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索产品名称、厂商或关键词..."
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
            找到 {totalElements} 个产品
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

        {/* Products Grid */}
        {loading ? (
          renderSkeleton()
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleViewProduct(product.id)}
                  className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  {/* Product Image */}
                  <div className="h-48 relative overflow-hidden">
                    {getFirstImage(product.images) ? (
                      <ImageWithFallback
                        src={getFirstImage(product.images) || ''}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <Package className="w-16 h-16 text-indigo-400" />
                      </div>
                    )}
                    {product.featured && (
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs">
                          推荐
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    {/* Category Badge */}
                    <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm mb-3">
                      {product.categoryName}
                    </div>

                    {/* Product Name */}
                    <h3 className="text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>

                    {/* Manufacturer */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Building2 className="w-4 h-4" />
                      <span>{product.manufacturer}</span>
                    </div>

                    {/* Summary/Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {product.summary || product.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Eye className="w-4 h-4" />
                        <span>{product.views} 浏览</span>
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
            <p className="text-gray-600 mb-2">未找到匹配的产品</p>
            <p className="text-sm text-gray-500">请尝试其他搜索条件</p>
          </div>
        )}
      </div>
    </div>
  );
}
