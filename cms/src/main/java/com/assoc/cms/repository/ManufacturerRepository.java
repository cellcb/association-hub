package com.assoc.cms.repository;

import com.assoc.cms.entity.Manufacturer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ManufacturerRepository extends JpaRepository<Manufacturer, Long> {

    @Query("SELECT m FROM Manufacturer m LEFT JOIN FETCH m.category WHERE m.id = :id")
    Optional<Manufacturer> findByIdWithCategory(@Param("id") Long id);

    Page<Manufacturer> findByStatus(Integer status, Pageable pageable);

    Page<Manufacturer> findByCategory_Id(Long categoryId, Pageable pageable);

    Page<Manufacturer> findByStatusAndCategory_Id(Integer status, Long categoryId, Pageable pageable);

    @Query("SELECT m FROM Manufacturer m WHERE m.status = :status AND " +
           "(LOWER(m.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.address) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.mainBusiness) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.summary) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Manufacturer> searchByKeyword(@Param("keyword") String keyword, @Param("status") Integer status, Pageable pageable);

    @Query("SELECT m FROM Manufacturer m WHERE m.status = :status AND m.category.id = :categoryId AND " +
           "(LOWER(m.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.address) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.mainBusiness) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(m.summary) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Manufacturer> searchByKeywordAndCategory(@Param("keyword") String keyword, @Param("status") Integer status,
                                                   @Param("categoryId") Long categoryId, Pageable pageable);

    @Modifying
    @Query("UPDATE Manufacturer m SET m.views = m.views + 1 WHERE m.id = :id")
    void incrementViews(@Param("id") Long id);

    long countByStatus(Integer status);

    long countByCategory_Id(Long categoryId);
}
