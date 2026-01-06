package com.assoc.cms.service;

import com.assoc.cms.dto.NewsListResponse;
import com.assoc.cms.dto.NewsRequest;
import com.assoc.cms.dto.NewsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NewsService {

    Page<NewsListResponse> getPublishedNews(Pageable pageable);

    Page<NewsListResponse> getNewsByCategory(Long categoryId, Pageable pageable);

    Page<NewsListResponse> getFeaturedNews(Pageable pageable);

    Page<NewsListResponse> searchNews(String keyword, Pageable pageable);

    Page<NewsListResponse> getNewsByTag(Long tagId, Pageable pageable);

    NewsResponse getNewsById(Long id);

    void incrementViews(Long id);

    void incrementLikes(Long id);

    // Admin methods
    Page<NewsListResponse> getAllNews(Integer status, Long categoryId, Pageable pageable);

    NewsResponse createNews(NewsRequest request);

    NewsResponse updateNews(Long id, NewsRequest request);

    void deleteNews(Long id);

    void publishNews(Long id);

    void unpublishNews(Long id);
}
