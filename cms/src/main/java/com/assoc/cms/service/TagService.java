package com.assoc.cms.service;

import com.assoc.cms.dto.TagResponse;

import java.util.List;

public interface TagService {

    List<TagResponse> getAllTags();

    TagResponse getById(Long id);

    TagResponse getOrCreateByName(String name);
}
