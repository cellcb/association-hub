package com.assoc.cms.service;

import com.assoc.cms.dto.ManufacturerListResponse;
import com.assoc.cms.dto.ManufacturerRequest;
import com.assoc.cms.dto.ManufacturerResponse;
import com.assoc.common.event.VectorSyncable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ManufacturerService extends VectorSyncable {

    Page<ManufacturerListResponse> getPublishedManufacturers(Pageable pageable);

    Page<ManufacturerListResponse> getManufacturersByCategory(Long categoryId, Pageable pageable);

    Page<ManufacturerListResponse> searchManufacturers(String keyword, Long categoryId, Pageable pageable);

    ManufacturerResponse getManufacturerById(Long id);

    void incrementViews(Long id);

    // Admin methods
    Page<ManufacturerListResponse> getAllManufacturers(Integer status, Long categoryId, String keyword, Pageable pageable);

    ManufacturerResponse createManufacturer(ManufacturerRequest request);

    ManufacturerResponse updateManufacturer(Long id, ManufacturerRequest request);

    void deleteManufacturer(Long id);
}
