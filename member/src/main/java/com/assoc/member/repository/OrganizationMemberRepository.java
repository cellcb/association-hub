package com.assoc.member.repository;

import com.assoc.member.entity.OrganizationMember;
import com.assoc.member.entity.OrganizationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, Long> {

    /**
     * Find by member ID
     */
    Optional<OrganizationMember> findByMember_Id(Long memberId);

    /**
     * Find by organization name
     */
    Page<OrganizationMember> findByOrgNameContainingIgnoreCase(String orgName, Pageable pageable);

    /**
     * Find by organization type
     */
    Page<OrganizationMember> findByOrgType(OrganizationType orgType, Pageable pageable);

    /**
     * Search by keyword (org name, contact person)
     */
    @Query("SELECT om FROM OrganizationMember om WHERE " +
           "LOWER(om.orgName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(om.contactPerson) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(om.legalRepresentative) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<OrganizationMember> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Check if social credit code exists
     */
    boolean existsBySocialCreditCode(String socialCreditCode);

    /**
     * Check if social credit code exists excluding certain member
     */
    boolean existsBySocialCreditCodeAndMember_IdNot(String socialCreditCode, Long memberId);

    /**
     * Count by organization type
     */
    long countByOrgType(OrganizationType orgType);
}
