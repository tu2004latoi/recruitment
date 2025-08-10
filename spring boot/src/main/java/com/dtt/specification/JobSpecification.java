package com.dtt.specification;

import com.dtt.model.Job;
import org.springframework.data.jpa.domain.Specification;

public class JobSpecification {

    public static Specification<Job> hasTitle(String title) {
        return (root, query, cb) ->
                title == null ? null :
                        cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
    }

    public static Specification<Job> hasLocation(Integer locationId) {
        return (root, query, cb) ->
                locationId == null ? null :
                        cb.equal(root.get("location").get("locationId"), locationId);
    }

    public static Specification<Job> hasLevel(Integer levelId) {
        return (root, query, cb) ->
                levelId == null ? null :
                        cb.equal(root.get("level").get("levelId"), levelId);
    }

    public static Specification<Job> hasJobType(Integer jobTypeId) {
        return (root, query, cb) ->
                jobTypeId == null ? null :
                        cb.equal(root.get("jobType").get("jobTypeId"), jobTypeId);
    }

    public static Specification<Job> hasIndustry(Integer industryId) {
        return (root, query, cb) ->
                industryId == null ? null :
                        cb.equal(root.get("industry").get("industryId"), industryId);
    }

    public static Specification<Job> salaryGreaterThanOrEqual(Integer salary) {
        return (root, query, cb) ->
                salary == null ? null :
                        cb.greaterThanOrEqualTo(root.get("salary"), salary);
    }

    public static Specification<Job> hasStatus(Job.Status status) {
        return (root, query, cb) ->
                status == null ? null :
                        cb.equal(root.get("status"), status);
    }
}
