package com.dtt.repository;

import com.dtt.model.Applicant;
import com.dtt.model.FavoriteJob;
import com.dtt.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavoriteJobRepository extends JpaRepository<FavoriteJob, Integer> {
    List<FavoriteJob> findByUser(User user);
}
