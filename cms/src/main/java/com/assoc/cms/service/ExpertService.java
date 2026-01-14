package com.assoc.cms.service;

import com.assoc.cms.dto.ExpertListResponse;
import com.assoc.cms.dto.ExpertRequest;
import com.assoc.cms.dto.ExpertResponse;
import com.assoc.common.event.VectorSyncable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ExpertService extends VectorSyncable {

    Page<ExpertListResponse> getActiveExperts(Pageable pageable);

    Page<ExpertListResponse> searchExperts(String keyword, Pageable pageable);

    Page<ExpertListResponse> getExpertsByField(Long fieldId, Pageable pageable);

    Page<ExpertListResponse> getExpertsByFieldCode(String fieldCode, Pageable pageable);

    ExpertResponse getExpertById(Long id);

    // Admin methods
    Page<ExpertListResponse> getAllExperts(Integer status, Pageable pageable);

    ExpertResponse createExpert(ExpertRequest request);

    ExpertResponse updateExpert(Long id, ExpertRequest request);

    void deleteExpert(Long id);
}
