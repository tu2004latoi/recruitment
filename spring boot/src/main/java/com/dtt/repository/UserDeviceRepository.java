package com.dtt.repository;

import com.dtt.model.User;
import com.dtt.model.UserDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDeviceRepository extends JpaRepository<UserDevice, Integer> {
    List<UserDevice> findByUser(User user);
    Optional<UserDevice> findByFcmToken(String fcmToken);
    void deleteByFcmToken(String fcmToken);
    Optional<UserDevice> findByUserAndFcmToken(User user, String fcmToken);

}
