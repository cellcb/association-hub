package com.assoc.ai.repository;

import com.assoc.ai.entity.VectorDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for VectorDocument entity.
 */
@Repository
public interface VectorDocumentRepository extends JpaRepository<VectorDocument, Long> {

    /**
     * Find all vector documents by entity type and ID.
     */
    List<VectorDocument> findByEntityTypeAndEntityId(String entityType, Long entityId);

    /**
     * Delete all vector documents by entity type and ID.
     */
    @Modifying
    @Query("DELETE FROM VectorDocument v WHERE v.entityType = :entityType AND v.entityId = :entityId")
    void deleteByEntityTypeAndEntityId(@Param("entityType") String entityType, @Param("entityId") Long entityId);

    /**
     * Count documents by entity type.
     */
    long countByEntityType(String entityType);

    /**
     * Count total documents.
     */
    @Query("SELECT COUNT(DISTINCT CONCAT(v.entityType, '-', v.entityId)) FROM VectorDocument v")
    long countDistinctEntities();
}
