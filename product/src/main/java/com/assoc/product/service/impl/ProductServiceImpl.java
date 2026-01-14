package com.assoc.product.service.impl;

import com.assoc.product.dto.ProductCategoryResponse;
import com.assoc.product.dto.ProductListResponse;
import com.assoc.product.dto.ProductRequest;
import com.assoc.product.dto.ProductResponse;
import com.assoc.product.entity.Product;
import com.assoc.product.entity.ProductCategory;
import com.assoc.product.repository.ProductCategoryRepository;
import com.assoc.product.repository.ProductRepository;
import com.assoc.product.service.ProductService;
import com.assoc.common.event.VectorizeEvent;
import com.assoc.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;
    private final ApplicationEventPublisher eventPublisher;

    private static final int STATUS_PUBLISHED = 1;
    private static final int STATUS_DRAFT = 0;

    @Override
    public Page<ProductListResponse> getPublishedProducts(Pageable pageable) {
        return productRepository.findByStatus(STATUS_PUBLISHED, pageable)
                .map(this::toListResponse);
    }

    @Override
    public Page<ProductListResponse> getProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByStatusAndCategory_Id(STATUS_PUBLISHED, categoryId, pageable)
                .map(this::toListResponse);
    }

    @Override
    public Page<ProductListResponse> searchProducts(String keyword, Pageable pageable) {
        return productRepository.searchByKeyword(keyword, STATUS_PUBLISHED, pageable)
                .map(this::toListResponse);
    }

    @Override
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findByIdWithCategory(id)
                .orElseThrow(() -> new ResourceNotFoundException("产品不存在: " + id));
        return toResponse(product);
    }

    @Override
    @Transactional
    public void incrementViews(Long id) {
        productRepository.incrementViews(id);
    }

    @Override
    public Page<ProductListResponse> getAllProducts(Integer status, Long categoryId, Pageable pageable) {
        if (status != null && categoryId != null) {
            return productRepository.findByStatusAndCategory_Id(status, categoryId, pageable)
                    .map(this::toListResponse);
        } else if (status != null) {
            return productRepository.findByStatus(status, pageable)
                    .map(this::toListResponse);
        } else if (categoryId != null) {
            return productRepository.findByCategory_Id(categoryId, pageable)
                    .map(this::toListResponse);
        }
        return productRepository.findAll(pageable).map(this::toListResponse);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Product product = new Product();
        mapRequestToEntity(request, product);
        product.setStatus(request.getStatus() != null ? request.getStatus() : STATUS_DRAFT);
        product.setViews(0L);

        if (request.getCategoryId() != null) {
            ProductCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("分类不存在: " + request.getCategoryId()));
            product.setCategory(category);
        }

        product = productRepository.save(product);
        publishVectorizeEvent(product, VectorizeEvent.EventAction.UPSERT);
        return toResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("产品不存在: " + id));

        mapRequestToEntity(request, product);
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }

        if (request.getCategoryId() != null) {
            ProductCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("分类不存在: " + request.getCategoryId()));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        product = productRepository.save(product);
        publishVectorizeEvent(product, VectorizeEvent.EventAction.UPSERT);
        return toResponse(product);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("产品不存在: " + id);
        }
        productRepository.deleteById(id);
        eventPublisher.publishEvent(VectorizeEvent.builder()
                .entityType("product")
                .entityId(id)
                .action(VectorizeEvent.EventAction.DELETE)
                .build());
    }

    private void mapRequestToEntity(ProductRequest request, Product product) {
        product.setName(request.getName());
        product.setManufacturer(request.getManufacturer());
        product.setModel(request.getModel());
        product.setPrice(request.getPrice());
        product.setSummary(request.getSummary());
        product.setDescription(request.getDescription());
        product.setFeatures(request.getFeatures());
        product.setApplication(request.getApplication());
        product.setCertifications(request.getCertifications());
        product.setContactPhone(request.getContactPhone());
        product.setContactEmail(request.getContactEmail());
        product.setContact(request.getContact());
        product.setWebsite(request.getWebsite());
        product.setImages(request.getImages());
        product.setSpecifications(request.getSpecifications());
        if (request.getFeatured() != null) {
            product.setFeatured(request.getFeatured());
        }
    }

    private ProductListResponse toListResponse(Product product) {
        ProductListResponse response = new ProductListResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        if (product.getCategory() != null) {
            response.setCategoryName(product.getCategory().getName());
            response.setCategoryId(product.getCategory().getId());
        }
        response.setManufacturer(product.getManufacturer());
        response.setModel(product.getModel());
        response.setPrice(product.getPrice());
        response.setSummary(product.getSummary());
        response.setDescription(product.getDescription());
        response.setStatus(product.getStatus());
        response.setViews(product.getViews());
        response.setFeatured(product.getFeatured());
        response.setImages(product.getImages());
        return response;
    }

    private ProductResponse toResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        if (product.getCategory() != null) {
            response.setCategory(toCategoryResponse(product.getCategory()));
        }
        response.setManufacturer(product.getManufacturer());
        response.setModel(product.getModel());
        response.setPrice(product.getPrice());
        response.setSummary(product.getSummary());
        response.setDescription(product.getDescription());
        response.setFeatures(product.getFeatures());
        response.setApplication(product.getApplication());
        response.setCertifications(product.getCertifications());
        response.setContactPhone(product.getContactPhone());
        response.setContactEmail(product.getContactEmail());
        response.setContact(product.getContact());
        response.setWebsite(product.getWebsite());
        response.setImages(product.getImages());
        response.setSpecifications(product.getSpecifications());
        response.setStatus(product.getStatus());
        response.setViews(product.getViews());
        response.setFeatured(product.getFeatured());
        response.setCreatedTime(product.getCreatedTime());
        response.setUpdatedTime(product.getUpdatedTime());
        return response;
    }

    private ProductCategoryResponse toCategoryResponse(ProductCategory category) {
        ProductCategoryResponse response = new ProductCategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setCode(category.getCode());
        response.setParentId(category.getParentId());
        response.setSortOrder(category.getSortOrder());
        response.setStatus(category.getStatus());
        return response;
    }

    private void publishVectorizeEvent(Product product, VectorizeEvent.EventAction action) {
        Map<String, String> fields = new HashMap<>();
        fields.put("name", nullToEmpty(product.getName()));
        fields.put("summary", nullToEmpty(product.getSummary()));
        fields.put("description", nullToEmpty(product.getDescription()));
        fields.put("features", nullToEmpty(product.getFeatures()));
        fields.put("application", nullToEmpty(product.getApplication()));
        fields.put("specifications", nullToEmpty(product.getSpecifications()));

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("name", product.getName());
        if (product.getCategory() != null) {
            metadata.put("categoryName", product.getCategory().getName());
        }
        metadata.put("manufacturer", product.getManufacturer());

        eventPublisher.publishEvent(VectorizeEvent.builder()
                .entityType("product")
                .entityId(product.getId())
                .action(action)
                .fields(fields)
                .metadata(metadata)
                .build());
    }

    private String nullToEmpty(String s) {
        return s == null ? "" : s;
    }
}
