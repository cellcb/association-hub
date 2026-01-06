package com.assoc.product.repository;

import com.assoc.product.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {

    Optional<ProductCategory> findByCode(String code);

    List<ProductCategory> findByStatusOrderBySortOrderAsc(Integer status);

    List<ProductCategory> findByParentIdAndStatusOrderBySortOrderAsc(Long parentId, Integer status);

    List<ProductCategory> findAllByOrderBySortOrderAsc();

    boolean existsByCode(String code);
}
