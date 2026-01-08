package com.assoc.system.repository;

import com.assoc.system.entity.Config;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConfigRepository extends JpaRepository<Config, Long> {

    Optional<Config> findByConfigKey(String configKey);

    List<Config> findByCategoryOrderBySortOrderAsc(String category);

    List<Config> findByCategoryAndStatusOrderBySortOrderAsc(String category, Integer status);

    List<Config> findByStatusOrderByCategoryAscSortOrderAsc(Integer status);

    Page<Config> findByCategory(String category, Pageable pageable);

    boolean existsByConfigKey(String configKey);

    List<Config> findByConfigKeyIn(List<String> keys);
}
