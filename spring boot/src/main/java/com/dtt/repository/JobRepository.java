package com.dtt.repository;

import com.dtt.model.Job;
import com.dtt.model.Recruiter;
import com.dtt.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Integer>, JpaSpecificationExecutor<Job> {
    List<Job> findByUser(User user);
    long countByIsActive(Boolean isActive);
    long countByIsFeatured(Boolean isFeatured);
    long countByUser_UserId(int userId);
    long countByUser_UserIdAndIsActiveTrue(int userId);
    long countByUser_UserIdAndIsFeaturedTrue(int userId);

    @Query("SELECT SUM(j.viewsCount) FROM Job j WHERE j.user.userId = :userId")
    Long sumViewsByUser(@Param("userId") Integer userId);

    @Modifying
    @Query("UPDATE Job j SET j.isActive = false WHERE j.expiredAt < CURRENT_TIMESTAMP AND j.isActive = true")
    int deactivateExpiredJobs();

    @Modifying
    @Query("UPDATE Job j SET j.isFeatured = true WHERE j.viewsCount > 10")
    int markFeaturedJobs();

}
