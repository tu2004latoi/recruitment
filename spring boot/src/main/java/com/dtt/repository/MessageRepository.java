package com.dtt.repository;

import com.dtt.model.Message;
import com.dtt.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Integer> {
    List<Message> findBySenderAndReceiverOrderByCreatedAtAsc(User sender, User receiver);

    List<Message> findBySenderAndReceiverOrSenderAndReceiverOrderByCreatedAtAsc(
            User sender1, User receiver1,
            User sender2, User receiver2
    );

    @Query("SELECT DISTINCT m.receiver FROM Message m WHERE m.sender.userId = :userId")
    List<User> findReceivers(@Param("userId") int userId);

    @Query("SELECT DISTINCT m.sender FROM Message m WHERE m.receiver.userId = :userId")
    List<User> findSenders(@Param("userId") int userId);

}

