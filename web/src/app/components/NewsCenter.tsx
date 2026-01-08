import { Search, Calendar, Tag, ArrowRight, TrendingUp, Clock, Eye, X, Share2, ThumbsUp, MessageCircle, User, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getPublicNewsList, getPublicNewsById, getNewsCategories, getTags, incrementNewsViews, likeNews } from '@/lib/api';
import type { NewsListResponse, NewsResponse, NewsCategoryResponse, TagResponse } from '@/types/news';

export function NewsCenter() {
  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // 数据状态
  const [newsList, setNewsList] = useState<NewsListResponse[]>([]);
  const [featuredNews, setFeaturedNews] = useState<NewsListResponse[]>([]);
  const [categories, setCategories] = useState<NewsCategoryResponse[]>([]);
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsResponse | null>(null);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // 加载状态
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 点赞状态
  const [likedArticles, setLikedArticles] = useState<Set<number>>(new Set());

  // 评论显示状态
  const [showComments, setShowComments] = useState(false);

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(0); // 搜索时重置页码
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 加载分类和标签
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          getNewsCategories(),
          getTags()
        ]);

        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data);
        }
        if (tagsRes.success && tagsRes.data) {
          setTags(tagsRes.data);
        }
      } catch (err) {
        console.error('Failed to load categories/tags:', err);
      }
    };
    loadInitialData();
  }, []);

  // 加载推荐新闻
  useEffect(() => {
    const loadFeaturedNews = async () => {
      try {
        const res = await getPublicNewsList({ featured: true, size: 3 });
        if (res.success && res.data) {
          setFeaturedNews(res.data.content);
        }
      } catch (err) {
        console.error('Failed to load featured news:', err);
      }
    };
    loadFeaturedNews();
  }, []);

  // 加载新闻列表
  useEffect(() => {
    const loadNews = async () => {
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

        const res = await getPublicNewsList(params);

        if (res.success && res.data) {
          setNewsList(res.data.content);
          setTotalPages(res.data.page.totalPages);
          setTotalElements(res.data.page.totalElements);
        } else {
          setError(res.message || '加载新闻失败');
        }
      } catch (err) {
        setError('网络错误，请稍后重试');
        console.error('Failed to load news:', err);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [currentPage, selectedCategoryId, debouncedSearchTerm]);

  // 处理分类选择
  const handleCategorySelect = useCallback((categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(0);
  }, []);

  // 获取相关新闻
  const getRelatedNews = useCallback((article: NewsResponse) => {
    return newsList
      .filter(n => n.id !== article.id && n.categoryId === article.category?.id)
      .slice(0, 3);
  }, [newsList]);

  // 打开文章详情
  const handleReadArticle = async (newsId: number) => {
    setLoadingDetail(true);
    setShowComments(false);

    try {
      // 增加浏览量
      incrementNewsViews(newsId).catch(console.error);

      // 获取详情
      const res = await getPublicNewsById(newsId);
      if (res.success && res.data) {
        setSelectedArticle(res.data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Failed to load article detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // 点赞文章
  const handleLikeArticle = async (articleId: number) => {
    if (likedArticles.has(articleId)) {
      return; // 已点赞，不重复操作
    }

    try {
      await likeNews(articleId);
      setLikedArticles(prev => new Set(prev).add(articleId));

      // 更新当前显示的文章点赞数
      if (selectedArticle && selectedArticle.id === articleId) {
        setSelectedArticle(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      }
    } catch (err) {
      console.error('Failed to like article:', err);
    }
  };

  // 格式化日期
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  };

  // 渲染加载骨架屏
  const renderSkeleton = () => (
    <div className="space-y-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-200 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            <div className="h-48 bg-gray-200"></div>
            <div className="md:col-span-2 p-6 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
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
      {/* News Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
            {/* Modal Header with Cover Image */}
            <div className="relative h-64 md:h-96">
              <ImageWithFallback
                src={selectedArticle.coverImage || ''}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Article Meta on Image */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                    {selectedArticle.category?.name}
                  </span>
                  {selectedArticle.featured && (
                    <span className="px-3 py-1 bg-red-500/80 backdrop-blur-sm rounded-full text-sm flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      推荐
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-4xl mb-4 leading-tight">
                  {selectedArticle.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(selectedArticle.publishedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{selectedArticle.author || '匿名'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{selectedArticle.views} 阅读</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-10 max-h-[60vh] overflow-y-auto">
              {/* Tags */}
              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-gray-200">
                  {selectedArticle.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Article Content */}
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedArticle.content || `<p>${selectedArticle.excerpt}</p>` }}
                style={{ lineHeight: '1.8' }}
              />

              {/* Article Footer Actions */}
              <div className="mt-10 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLikeArticle(selectedArticle.id)}
                      disabled={likedArticles.has(selectedArticle.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        likedArticles.has(selectedArticle.id)
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <ThumbsUp
                        className="w-4 h-4"
                        fill={likedArticles.has(selectedArticle.id) ? 'currentColor' : 'none'}
                      />
                      <span className="text-sm">点赞 {selectedArticle.likes > 0 ? selectedArticle.likes : ''}</span>
                    </button>
                    <button
                      onClick={() => setShowComments(!showComments)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">评论</span>
                    </button>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">分享</span>
                  </button>
                </div>

                {/* Related News */}
                {getRelatedNews(selectedArticle).length > 0 && (
                  <div>
                    <h3 className="text-lg text-gray-900 mb-4">相关新闻</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {getRelatedNews(selectedArticle).map((news) => (
                        <div
                          key={news.id}
                          onClick={() => handleReadArticle(news.id)}
                          className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors group"
                        >
                          <div className="relative h-32 mb-3 rounded-lg overflow-hidden">
                            <ImageWithFallback
                              src={news.coverImage || ''}
                              alt={news.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <h4 className="text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {news.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(news.publishedAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments Section - Disabled */}
                {showComments && (
                  <div className="mt-6">
                    <h3 className="text-lg text-gray-900 mb-4">评论</h3>
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-2">评论功能暂未开放</p>
                      <p className="text-sm text-gray-400">敬请期待</p>
                    </div>
                  </div>
                )}
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
          <h1 className="text-2xl md:text-3xl text-gray-900 mb-2">新闻中心</h1>
          <p className="text-gray-600">了解专委会最新动态与行业资讯</p>
        </div>

        {/* Featured News - Top Banner */}
        {featuredNews.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Image */}
                <div className="relative h-64 lg:h-auto">
                  <ImageWithFallback
                    src={featuredNews[0].coverImage || ''}
                    alt={featuredNews[0].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent lg:hidden"></div>
                </div>

                {/* Content */}
                <div className="p-8 md:p-10 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                      头条推荐
                    </span>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                      {featuredNews[0].categoryName}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl mb-4 leading-tight">
                    {featuredNews[0].title}
                  </h2>
                  <p className="text-white/90 mb-6 leading-relaxed">
                    {featuredNews[0].excerpt}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-white/80 mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(featuredNews[0].publishedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>{featuredNews[0].views} 阅读</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleReadArticle(featuredNews[0].id)}
                    className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all flex items-center gap-2"
                  >
                    <span>阅读全文</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索新闻标题、内容..."
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
              全部
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
            找到 {totalElements} 条新闻
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

        {/* News Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - News List */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              renderSkeleton()
            ) : newsList.length > 0 ? (
              <>
                {newsList.map((news) => (
                  <div
                    key={news.id}
                    onClick={() => handleReadArticle(news.id)}
                    className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all group cursor-pointer"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                      {/* Image */}
                      <div className="relative h-48 md:h-auto overflow-hidden">
                        <ImageWithFallback
                          src={news.coverImage || ''}
                          alt={news.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {news.featured && (
                          <div className="absolute top-3 left-3">
                            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              推荐
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="md:col-span-2 p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">
                            {news.categoryName}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(news.publishedAt)}
                          </span>
                        </div>

                        <h3 className="text-lg text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {news.title}
                        </h3>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {news.excerpt}
                        </p>

                        {/* Tags */}
                        {news.tags && news.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {news.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag.id}
                                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs flex items-center gap-1"
                              >
                                <Tag className="w-3 h-3" />
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{news.author || '匿名'}</span>
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{news.views}</span>
                            </div>
                          </div>
                          <button className="flex items-center gap-1 text-blue-600 text-sm group-hover:gap-2 transition-all">
                            <span>阅读全文</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {renderPagination()}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <p className="text-gray-600 mb-2">未找到相关新闻</p>
                <p className="text-sm text-gray-500">请尝试其他搜索条件</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Latest News */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg text-gray-900">最新动态</h3>
              </div>
              <div className="space-y-4">
                {newsList.slice(0, 5).map((news, index) => (
                  <div
                    key={news.id}
                    onClick={() => handleReadArticle(news.id)}
                    className="pb-4 border-b border-gray-100 last:border-0 last:pb-0 cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {news.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(news.publishedAt)}</span>
                          <span>·</span>
                          <Eye className="w-3 h-3" />
                          <span>{news.views}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hot Tags */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg text-gray-900">热门标签</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 12).map((tag) => (
                  <button
                    key={tag.id}
                    className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm"
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
              <h3 className="text-lg mb-3">订阅资讯</h3>
              <p className="text-sm text-blue-100 mb-4">
                订阅我们的新闻通讯，第一时间获取行业最新资讯
              </p>
              <input
                type="email"
                placeholder="请输入您的邮箱"
                className="w-full px-4 py-2 rounded-lg text-gray-900 mb-3 focus:ring-2 focus:ring-blue-300 focus:outline-none"
              />
              <button className="w-full px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all">
                立即订阅
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
