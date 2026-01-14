package com.assoc.cms.service.impl;

import com.assoc.cms.dto.NewsCategoryResponse;
import com.assoc.cms.dto.NewsListResponse;
import com.assoc.cms.dto.NewsRequest;
import com.assoc.cms.dto.NewsResponse;
import com.assoc.cms.dto.TagResponse;
import com.assoc.cms.entity.News;
import com.assoc.cms.entity.NewsCategory;
import com.assoc.cms.entity.Tag;
import com.assoc.cms.repository.NewsCategoryRepository;
import com.assoc.cms.repository.NewsRepository;
import com.assoc.cms.repository.TagRepository;
import com.assoc.cms.service.NewsService;
import com.assoc.common.event.VectorizeEvent;
import com.assoc.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NewsServiceImpl implements NewsService {

    private final NewsRepository newsRepository;
    private final NewsCategoryRepository newsCategoryRepository;
    private final TagRepository tagRepository;
    private final ApplicationEventPublisher eventPublisher;

    private static final int STATUS_PUBLISHED = 1;
    private static final int STATUS_DRAFT = 0;

    @Override
    public Page<NewsListResponse> getPublishedNews(Pageable pageable) {
        return newsRepository.findByStatus(STATUS_PUBLISHED, pageable)
                .map(this::toListResponse);
    }

    @Override
    public Page<NewsListResponse> getNewsByCategory(Long categoryId, Pageable pageable) {
        return newsRepository.findByStatusAndCategory_Id(STATUS_PUBLISHED, categoryId, pageable)
                .map(this::toListResponse);
    }

    @Override
    public Page<NewsListResponse> getFeaturedNews(Pageable pageable) {
        return newsRepository.findByFeaturedAndStatus(true, STATUS_PUBLISHED, pageable)
                .map(this::toListResponse);
    }

    @Override
    public Page<NewsListResponse> searchNews(String keyword, Pageable pageable) {
        return newsRepository.searchByKeyword(keyword, STATUS_PUBLISHED, pageable)
                .map(this::toListResponse);
    }

    @Override
    public Page<NewsListResponse> getNewsByTag(Long tagId, Pageable pageable) {
        return newsRepository.findByTagId(tagId, pageable)
                .map(this::toListResponse);
    }

    @Override
    public NewsResponse getNewsById(Long id) {
        News news = newsRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("新闻不存在: " + id));
        return toResponse(news);
    }

    @Override
    @Transactional
    public void incrementViews(Long id) {
        newsRepository.incrementViews(id);
    }

    @Override
    @Transactional
    public void incrementLikes(Long id) {
        newsRepository.incrementLikes(id);
    }

    @Override
    public Page<NewsListResponse> getAllNews(Integer status, Long categoryId, Pageable pageable) {
        if (status != null && categoryId != null) {
            return newsRepository.findByStatusAndCategory_Id(status, categoryId, pageable)
                    .map(this::toListResponse);
        } else if (status != null) {
            return newsRepository.findByStatus(status, pageable)
                    .map(this::toListResponse);
        } else if (categoryId != null) {
            return newsRepository.findByCategory_Id(categoryId, pageable)
                    .map(this::toListResponse);
        }
        return newsRepository.findAll(pageable).map(this::toListResponse);
    }

    @Override
    @Transactional
    public NewsResponse createNews(NewsRequest request) {
        NewsCategory category = newsCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("分类不存在: " + request.getCategoryId()));

        News news = new News();
        news.setTitle(request.getTitle());
        news.setExcerpt(request.getExcerpt());
        news.setContent(request.getContent());
        news.setCategory(category);
        news.setAuthor(request.getAuthor());
        news.setCoverImage(request.getCoverImage());
        news.setFeatured(request.getFeatured() != null ? request.getFeatured() : false);
        news.setStatus(request.getStatus() != null ? request.getStatus() : STATUS_DRAFT);
        news.setViews(0);
        news.setLikes(0);

        if (news.getStatus() == STATUS_PUBLISHED) {
            news.setPublishedAt(LocalDateTime.now());
        }

        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            Set<Tag> tags = new HashSet<>(tagRepository.findAllById(request.getTagIds()));
            news.setTags(tags);
            tags.forEach(tag -> tagRepository.incrementUsageCount(tag.getId()));
        }

        news = newsRepository.save(news);
        publishVectorizeEvent(news, VectorizeEvent.EventAction.UPSERT);
        return toResponse(news);
    }

    @Override
    @Transactional
    public NewsResponse updateNews(Long id, NewsRequest request) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("新闻不存在: " + id));

        NewsCategory category = newsCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("分类不存在: " + request.getCategoryId()));

        news.setTitle(request.getTitle());
        news.setExcerpt(request.getExcerpt());
        news.setContent(request.getContent());
        news.setCategory(category);
        news.setAuthor(request.getAuthor());
        news.setCoverImage(request.getCoverImage());
        if (request.getFeatured() != null) {
            news.setFeatured(request.getFeatured());
        }
        if (request.getStatus() != null) {
            if (request.getStatus() == STATUS_PUBLISHED && news.getStatus() != STATUS_PUBLISHED) {
                news.setPublishedAt(LocalDateTime.now());
            }
            news.setStatus(request.getStatus());
        }

        if (request.getTagIds() != null) {
            // Decrement old tags
            if (news.getTags() != null) {
                news.getTags().forEach(tag -> tagRepository.decrementUsageCount(tag.getId()));
            }
            // Set new tags
            Set<Tag> tags = new HashSet<>(tagRepository.findAllById(request.getTagIds()));
            news.setTags(tags);
            tags.forEach(tag -> tagRepository.incrementUsageCount(tag.getId()));
        }

        news = newsRepository.save(news);
        publishVectorizeEvent(news, VectorizeEvent.EventAction.UPSERT);
        return toResponse(news);
    }

    @Override
    @Transactional
    public void deleteNews(Long id) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("新闻不存在: " + id));
        if (news.getTags() != null) {
            news.getTags().forEach(tag -> tagRepository.decrementUsageCount(tag.getId()));
        }
        newsRepository.delete(news);
        eventPublisher.publishEvent(VectorizeEvent.builder()
                .entityType("news")
                .entityId(id)
                .action(VectorizeEvent.EventAction.DELETE)
                .build());
    }

    @Override
    @Transactional
    public void publishNews(Long id) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("新闻不存在: " + id));
        news.setStatus(STATUS_PUBLISHED);
        news.setPublishedAt(LocalDateTime.now());
        newsRepository.save(news);
    }

    @Override
    @Transactional
    public void unpublishNews(Long id) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("新闻不存在: " + id));
        news.setStatus(STATUS_DRAFT);
        newsRepository.save(news);
    }

    private NewsListResponse toListResponse(News news) {
        NewsListResponse response = new NewsListResponse();
        response.setId(news.getId());
        response.setTitle(news.getTitle());
        response.setExcerpt(news.getExcerpt());
        if (news.getCategory() != null) {
            response.setCategoryName(news.getCategory().getName());
            response.setCategoryId(news.getCategory().getId());
        }
        response.setAuthor(news.getAuthor());
        response.setCoverImage(news.getCoverImage());
        response.setViews(news.getViews());
        response.setLikes(news.getLikes());
        response.setFeatured(news.getFeatured());
        response.setStatus(news.getStatus());
        response.setPublishedAt(news.getPublishedAt());
        if (news.getTags() != null) {
            response.setTags(news.getTags().stream()
                    .map(this::toTagResponse)
                    .collect(Collectors.toList()));
        }
        return response;
    }

    private NewsResponse toResponse(News news) {
        NewsResponse response = new NewsResponse();
        response.setId(news.getId());
        response.setTitle(news.getTitle());
        response.setExcerpt(news.getExcerpt());
        response.setContent(news.getContent());
        if (news.getCategory() != null) {
            response.setCategory(toCategoryResponse(news.getCategory()));
        }
        response.setAuthor(news.getAuthor());
        response.setCoverImage(news.getCoverImage());
        response.setViews(news.getViews());
        response.setLikes(news.getLikes());
        response.setFeatured(news.getFeatured());
        response.setStatus(news.getStatus());
        response.setPublishedAt(news.getPublishedAt());
        response.setCreatedTime(news.getCreatedTime());
        response.setUpdatedTime(news.getUpdatedTime());
        if (news.getTags() != null) {
            response.setTags(news.getTags().stream()
                    .map(this::toTagResponse)
                    .collect(Collectors.toList()));
        }
        return response;
    }

    private NewsCategoryResponse toCategoryResponse(NewsCategory category) {
        NewsCategoryResponse response = new NewsCategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setCode(category.getCode());
        response.setSortOrder(category.getSortOrder());
        response.setStatus(category.getStatus());
        return response;
    }

    private TagResponse toTagResponse(Tag tag) {
        TagResponse response = new TagResponse();
        response.setId(tag.getId());
        response.setName(tag.getName());
        response.setUsageCount(tag.getUsageCount());
        return response;
    }

    private void publishVectorizeEvent(News news, VectorizeEvent.EventAction action) {
        Map<String, String> fields = new HashMap<>();
        fields.put("title", nullToEmpty(news.getTitle()));
        fields.put("excerpt", nullToEmpty(news.getExcerpt()));
        fields.put("content", nullToEmpty(news.getContent()));
        fields.put("author", nullToEmpty(news.getAuthor()));
        if (news.getTags() != null && !news.getTags().isEmpty()) {
            String tagNames = news.getTags().stream()
                .map(Tag::getName)
                .collect(Collectors.joining(" "));
            fields.put("tags", tagNames);
        }

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("title", news.getTitle());
        if (news.getCategory() != null) {
            metadata.put("categoryName", news.getCategory().getName());
        }

        eventPublisher.publishEvent(VectorizeEvent.builder()
                .entityType("news")
                .entityId(news.getId())
                .action(action)
                .fields(fields)
                .metadata(metadata)
                .build());
    }

    private String nullToEmpty(String s) {
        return s == null ? "" : s;
    }

    @Override
    public String getEntityType() {
        return "news";
    }

    @Override
    public int resyncVectors() {
        List<News> allNews = newsRepository.findAll();
        for (News news : allNews) {
            publishVectorizeEvent(news, VectorizeEvent.EventAction.UPSERT);
        }
        return allNews.size();
    }
}
