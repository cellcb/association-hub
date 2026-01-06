package com.assoc.member.repository;

import com.assoc.member.entity.IndividualMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IndividualMemberRepository extends JpaRepository<IndividualMember, Long> {

    /**
     * Find by member ID
     */
    Optional<IndividualMember> findByMember_Id(Long memberId);

    /**
     * Find by name
     */
    Page<IndividualMember> findByNameContainingIgnoreCase(String name, Pageable pageable);

    /**
     * Find by organization
     */
    Page<IndividualMember> findByOrganizationContainingIgnoreCase(String organization, Pageable pageable);

    /**
     * Search by keyword (name, organization, position)
     */
    @Query("SELECT im FROM IndividualMember im WHERE " +
           "LOWER(im.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(im.organization) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(im.position) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<IndividualMember> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Check if ID card exists
     */
    boolean existsByIdCard(String idCard);

    /**
     * Check if ID card exists excluding certain member
     */
    boolean existsByIdCardAndMember_IdNot(String idCard, Long memberId);
}
