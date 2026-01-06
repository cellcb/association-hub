package com.assoc.member.repository;

import com.assoc.member.entity.Member;
import com.assoc.member.entity.MemberStatus;
import com.assoc.member.entity.MemberType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    /**
     * Find member by user ID
     */
    Optional<Member> findByUserId(Long userId);

    /**
     * Find member by member number
     */
    Optional<Member> findByMemberNo(String memberNo);

    /**
     * Check if user ID already has a member record
     */
    boolean existsByUserId(Long userId);

    /**
     * Check if member number exists
     */
    boolean existsByMemberNo(String memberNo);

    /**
     * Find members by status
     */
    Page<Member> findByStatus(MemberStatus status, Pageable pageable);

    /**
     * Find members by type
     */
    Page<Member> findByMemberType(MemberType memberType, Pageable pageable);

    /**
     * Find members by status and type
     */
    Page<Member> findByStatusAndMemberType(MemberStatus status, MemberType memberType, Pageable pageable);

    /**
     * Find member with individual details
     */
    @Query("SELECT m FROM Member m LEFT JOIN FETCH m.individualMember WHERE m.id = :id AND m.memberType = 'INDIVIDUAL'")
    Optional<Member> findByIdWithIndividualMember(@Param("id") Long id);

    /**
     * Find member with organization details
     */
    @Query("SELECT m FROM Member m LEFT JOIN FETCH m.organizationMember WHERE m.id = :id AND m.memberType = 'ORGANIZATION'")
    Optional<Member> findByIdWithOrganizationMember(@Param("id") Long id);

    /**
     * Find member with full details
     */
    @Query("SELECT m FROM Member m " +
           "LEFT JOIN FETCH m.individualMember " +
           "LEFT JOIN FETCH m.organizationMember " +
           "WHERE m.id = :id")
    Optional<Member> findByIdWithDetails(@Param("id") Long id);

    /**
     * Count members by status
     */
    long countByStatus(MemberStatus status);

    /**
     * Count members by type
     */
    long countByMemberType(MemberType memberType);

    /**
     * Count active members
     */
    default long countActive() {
        return countByStatus(MemberStatus.ACTIVE);
    }

    /**
     * Count individual members
     */
    default long countIndividual() {
        return countByMemberType(MemberType.INDIVIDUAL);
    }

    /**
     * Count organization members
     */
    default long countOrganization() {
        return countByMemberType(MemberType.ORGANIZATION);
    }

    /**
     * Search members by keyword (member number or name in individual/organization)
     */
    @Query("SELECT m FROM Member m " +
           "LEFT JOIN m.individualMember im " +
           "LEFT JOIN m.organizationMember om " +
           "WHERE LOWER(m.memberNo) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(im.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(om.orgName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Member> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
