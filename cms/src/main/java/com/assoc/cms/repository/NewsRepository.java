package com.assoc.cms.repository;

import com.assoc.cms.entity.News;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NewsRepository extends JpaRepository<News, Long> {

    @Query("SELECT n FROM News n LEFT JOIN FETCH n.category LEFT JOIN FETCH n.tags WHERE n.id = :id")
    Optional<News> findByIdWithDetails(@Param("id") Long id);

    Page<News> findByStatus(Integer status, Pageable pageable);

    Page<News> findByCategory_Id(Long categoryId, Pageable pageable);

    Page<News> findByStatusAndCategory_Id(Integer status, Long categoryId, Pageable pageable);

    Page<News> findByFeaturedAndStatus(Boolean featured, Integer status, Pageable pageable);

    @Query("SELECT n FROM News n WHERE n.status = :status AND " +
           "(LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(n.content) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<News> searchByKeyword(@Param("keyword") String keyword, @Param("status") Integer status, Pageable pageable);

    @Query("SELECT n FROM News n JOIN n.tags t WHERE t.id = :tagId AND n.status = 1")
    Page<News> findByTagId(@Param("tagId") Long tagId, Pageable pageable);

    @Modifying
    @Query("UPDATE News n SET n.views = n.views + 1 WHERE n.id = :id")
    void incrementViews(@Param("id") Long id);

    @Modifying
    @Query("UPDATE News n SET n.likes = n.likes + 1 WHERE n.id = :id")
    void incrementLikes(@Param("id") Long id);

    long countByStatus(Integer status);

    List<News> findTop5ByCategory_IdAndStatusOrderByPublishedAtDesc(Long categoryId, Integer status);
}
