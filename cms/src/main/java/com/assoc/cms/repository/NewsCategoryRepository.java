package com.assoc.cms.repository;

import com.assoc.cms.entity.NewsCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NewsCategoryRepository extends JpaRepository<NewsCategory, Long> {

    Optional<NewsCategory> findByCode(String code);

    boolean existsByCode(String code);

    List<NewsCategory> findByStatusOrderBySortOrderAsc(Integer status);

    List<NewsCategory> findAllByOrderBySortOrderAsc();
}
