package com.assoc.cms.service;

import com.assoc.cms.dto.ManufacturerCategoryResponse;

import java.util.List;

public interface ManufacturerCategoryService {

    List<ManufacturerCategoryResponse> getAllCategories();

    List<ManufacturerCategoryResponse> getCategoryTree();
}
