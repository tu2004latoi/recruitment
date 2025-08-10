package com.dtt.service;

import com.dtt.model.User;
import com.dtt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepo;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
        OAuth2User user = super.loadUser(request);

        String provider = request.getClientRegistration().getRegistrationId();
        String providerId = user.getAttribute("sub");
        String email = user.getAttribute("email");
        String name = user.getAttribute("name");

        User u = userRepo.findByEmail(email).orElse(null);
        if (u == null) {
            // Nếu user chưa tồn tại, tạo mới
            u = User.builder()
                    .username(email)
                    .email(email)
                    .firstName(name)
                    .password(null)
                    .provider(User.Provider.valueOf(provider.toUpperCase()))
                    .providerId(providerId)
                    .role(User.Role.APPLICANT)
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .build();
            userRepo.save(u);
        }

        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + u.getRole())),
                user.getAttributes(),
                "sub"
        );
    }
}