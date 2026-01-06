package com.assoc.cms.repository;

import com.assoc.cms.entity.Comment;
import com.assoc.cms.entity.ResourceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    Page<Comment> findByResourceTypeAndResourceIdAndParentIdIsNullAndStatus(
            ResourceType resourceType, Long resourceId, Integer status, Pageable pageable);

    List<Comment> findByParentIdAndStatus(Long parentId, Integer status);

    @Query("SELECT c FROM Comment c LEFT JOIN FETCH c.replies WHERE c.id = :id")
    Comment findByIdWithReplies(@Param("id") Long id);

    long countByResourceTypeAndResourceIdAndStatus(ResourceType resourceType, Long resourceId, Integer status);

    @Modifying
    @Query("UPDATE Comment c SET c.likes = c.likes + 1 WHERE c.id = :id")
    void incrementLikes(@Param("id") Long id);

    void deleteByResourceTypeAndResourceId(ResourceType resourceType, Long resourceId);
}
