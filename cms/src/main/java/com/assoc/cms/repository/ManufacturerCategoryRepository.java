package com.assoc.cms.repository;

import com.assoc.cms.entity.ManufacturerCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ManufacturerCategoryRepository extends JpaRepository<ManufacturerCategory, Long> {

    List<ManufacturerCategory> findAllByStatusOrderBySortOrderAsc(Integer status);

    List<ManufacturerCategory> findAllByParentIdIsNullAndStatusOrderBySortOrderAsc(Integer status);

    List<ManufacturerCategory> findAllByParentIdAndStatusOrderBySortOrderAsc(Long parentId, Integer status);
}
