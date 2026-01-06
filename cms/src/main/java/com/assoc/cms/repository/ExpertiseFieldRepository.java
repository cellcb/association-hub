package com.assoc.cms.repository;

import com.assoc.cms.entity.ExpertiseField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpertiseFieldRepository extends JpaRepository<ExpertiseField, Long> {

    Optional<ExpertiseField> findByCode(String code);

    boolean existsByCode(String code);

    List<ExpertiseField> findByStatusOrderBySortOrderAsc(Integer status);

    List<ExpertiseField> findAllByOrderBySortOrderAsc();

    List<ExpertiseField> findByIdIn(List<Long> ids);
}
