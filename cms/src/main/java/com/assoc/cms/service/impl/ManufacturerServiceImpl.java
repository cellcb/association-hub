package com.assoc.cms.service.impl;

import com.assoc.cms.dto.ManufacturerListResponse;
import com.assoc.cms.dto.ManufacturerRequest;
import com.assoc.cms.dto.ManufacturerResponse;
import com.assoc.cms.entity.Manufacturer;
import com.assoc.cms.entity.ManufacturerCategory;
import com.assoc.cms.repository.ManufacturerCategoryRepository;
import com.assoc.cms.repository.ManufacturerRepository;
import com.assoc.cms.service.ManufacturerService;
import com.assoc.common.event.VectorizeEvent;
import com.assoc.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ManufacturerServiceImpl implements ManufacturerService {

    private final ManufacturerRepository manufacturerRepository;
    private final ManufacturerCategoryRepository categoryRepository;
    private final ApplicationEventPublisher eventPublisher;

    private static final int STATUS_PUBLISHED = 1;
    private static final int STATUS_DRAFT = 0;

    @Override
    public Page<ManufacturerListResponse> getPublishedManufacturers(Pageable pageable) {
        return manufacturerRepository.findByStatus(STATUS_PUBLISHED, pageable)
                .map(ManufacturerListResponse::from);
    }

    @Override
    public Page<ManufacturerListResponse> getManufacturersByCategory(Long categoryId, Pageable pageable) {
        return manufacturerRepository.findByStatusAndCategory_Id(STATUS_PUBLISHED, categoryId, pageable)
                .map(ManufacturerListResponse::from);
    }

    @Override
    public Page<ManufacturerListResponse> searchManufacturers(String keyword, Long categoryId, Pageable pageable) {
        if (categoryId != null) {
            return manufacturerRepository.searchByKeywordAndCategory(keyword, STATUS_PUBLISHED, categoryId, pageable)
                    .map(ManufacturerListResponse::from);
        }
        return manufacturerRepository.searchByKeyword(keyword, STATUS_PUBLISHED, pageable)
                .map(ManufacturerListResponse::from);
    }

    @Override
    public ManufacturerResponse getManufacturerById(Long id) {
        Manufacturer manufacturer = manufacturerRepository.findByIdWithCategory(id)
                .orElseThrow(() -> new ResourceNotFoundException("厂商不存在: " + id));
        return ManufacturerResponse.from(manufacturer);
    }

    @Override
    @Transactional
    public void incrementViews(Long id) {
        manufacturerRepository.incrementViews(id);
    }

    @Override
    public Page<ManufacturerListResponse> getAllManufacturers(Integer status, Long categoryId, String keyword, Pageable pageable) {
        if (StringUtils.hasText(keyword)) {
            if (categoryId != null) {
                return manufacturerRepository.searchByKeywordAndCategory(keyword, status != null ? status : STATUS_PUBLISHED, categoryId, pageable)
                        .map(ManufacturerListResponse::from);
            }
            return manufacturerRepository.searchByKeyword(keyword, status != null ? status : STATUS_PUBLISHED, pageable)
                    .map(ManufacturerListResponse::from);
        }

        if (status != null && categoryId != null) {
            return manufacturerRepository.findByStatusAndCategory_Id(status, categoryId, pageable)
                    .map(ManufacturerListResponse::from);
        } else if (status != null) {
            return manufacturerRepository.findByStatus(status, pageable)
                    .map(ManufacturerListResponse::from);
        } else if (categoryId != null) {
            return manufacturerRepository.findByCategory_Id(categoryId, pageable)
                    .map(ManufacturerListResponse::from);
        }
        return manufacturerRepository.findAll(pageable).map(ManufacturerListResponse::from);
    }

    @Override
    @Transactional
    public ManufacturerResponse createManufacturer(ManufacturerRequest request) {
        Manufacturer manufacturer = new Manufacturer();
        mapRequestToEntity(request, manufacturer);
        manufacturer.setStatus(request.getStatus() != null ? request.getStatus() : STATUS_DRAFT);
        manufacturer.setViews(0L);

        if (request.getCategoryId() != null) {
            ManufacturerCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("分类不存在: " + request.getCategoryId()));
            manufacturer.setCategory(category);
        }

        manufacturer = manufacturerRepository.save(manufacturer);
        publishVectorizeEvent(manufacturer, VectorizeEvent.EventAction.UPSERT);
        return ManufacturerResponse.from(manufacturer);
    }

    @Override
    @Transactional
    public ManufacturerResponse updateManufacturer(Long id, ManufacturerRequest request) {
        Manufacturer manufacturer = manufacturerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("厂商不存在: " + id));

        mapRequestToEntity(request, manufacturer);
        if (request.getStatus() != null) {
            manufacturer.setStatus(request.getStatus());
        }

        if (request.getCategoryId() != null) {
            ManufacturerCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("分类不存在: " + request.getCategoryId()));
            manufacturer.setCategory(category);
        } else {
            manufacturer.setCategory(null);
        }

        manufacturer = manufacturerRepository.save(manufacturer);
        publishVectorizeEvent(manufacturer, VectorizeEvent.EventAction.UPSERT);
        return ManufacturerResponse.from(manufacturer);
    }

    @Override
    @Transactional
    public void deleteManufacturer(Long id) {
        if (!manufacturerRepository.existsById(id)) {
            throw new ResourceNotFoundException("厂商不存在: " + id);
        }
        manufacturerRepository.deleteById(id);
        eventPublisher.publishEvent(VectorizeEvent.builder()
                .entityType("manufacturer")
                .entityId(id)
                .action(VectorizeEvent.EventAction.DELETE)
                .build());
    }

    private void mapRequestToEntity(ManufacturerRequest request, Manufacturer manufacturer) {
        manufacturer.setName(request.getName());
        manufacturer.setLogo(request.getLogo());
        manufacturer.setSummary(request.getSummary());
        manufacturer.setDescription(request.getDescription());
        manufacturer.setContactPhone(request.getContactPhone());
        manufacturer.setContactEmail(request.getContactEmail());
        manufacturer.setContactPerson(request.getContactPerson());
        manufacturer.setAddress(request.getAddress());
        manufacturer.setWebsite(request.getWebsite());

        if (StringUtils.hasText(request.getEstablishedDate())) {
            manufacturer.setEstablishedDate(LocalDate.parse(request.getEstablishedDate()));
        }

        manufacturer.setRegisteredCapital(request.getRegisteredCapital());
        manufacturer.setEmployeeScale(request.getEmployeeScale());
        manufacturer.setMainBusiness(request.getMainBusiness());
        manufacturer.setQualifications(request.getQualifications());
        manufacturer.setHonors(request.getHonors());
        manufacturer.setCases(request.getCases());
        manufacturer.setImages(request.getImages());

        if (request.getFeatured() != null) {
            manufacturer.setFeatured(request.getFeatured());
        }
    }

    private void publishVectorizeEvent(Manufacturer m, VectorizeEvent.EventAction action) {
        Map<String, String> fields = new HashMap<>();
        fields.put("name", nullToEmpty(m.getName()));
        fields.put("summary", nullToEmpty(m.getSummary()));
        fields.put("description", nullToEmpty(m.getDescription()));
        fields.put("mainBusiness", nullToEmpty(m.getMainBusiness()));
        fields.put("qualifications", nullToEmpty(m.getQualifications()));
        fields.put("honors", nullToEmpty(m.getHonors()));
        fields.put("cases", nullToEmpty(m.getCases()));
        fields.put("address", nullToEmpty(m.getAddress()));

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("name", m.getName());
        if (m.getCategory() != null) {
            metadata.put("categoryName", m.getCategory().getName());
        }
        metadata.put("address", m.getAddress());

        eventPublisher.publishEvent(VectorizeEvent.builder()
                .entityType("manufacturer")
                .entityId(m.getId())
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
        return "manufacturer";
    }

    @Override
    public int resyncVectors() {
        List<Manufacturer> allManufacturers = manufacturerRepository.findAll();
        for (Manufacturer manufacturer : allManufacturers) {
            publishVectorizeEvent(manufacturer, VectorizeEvent.EventAction.UPSERT);
        }
        return allManufacturers.size();
    }
}
