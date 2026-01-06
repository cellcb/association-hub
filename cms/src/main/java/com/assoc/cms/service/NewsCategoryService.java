package com.assoc.cms.service;

import com.assoc.cms.dto.NewsCategoryResponse;

import java.util.List;

public interface NewsCategoryService {

    List<NewsCategoryResponse> getAllCategories();

    List<NewsCategoryResponse> getActiveCategories();

    NewsCategoryResponse getById(Long id);
}
