package com.dtt.config;

import com.dtt.filters.JwtFilter;
import com.dtt.service.CustomOAuth2UserService;
import com.dtt.utils.JwtUtils;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Autowired
    private CustomOAuth2UserService customOAuth2UserService;

    @Bean
    public JwtFilter jwtFilter() {
        return new JwtFilter();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/login", "/api/register", "/api/register/**",
                                "/api/educations", "/api/educations/**",
                                "/api/job-industries", "/api/job-industries/**",
                                "/api/job-types", "/api/job-types/**",
                                "/api/levels", "/api/levels/**",
                                "/api/institutions", "/api/institutions/**",
                                "/api/notifications/**",
                                "/api/jobs", "/api/jobs/*", "/api/jobs/**",
                                "/api/public/users/**",
                                "/ws/**"
                        ).permitAll()
                        .requestMatchers(
                                "/api/secure/profile", "/api/secure/profile/**",
                                "/api/applications", "/api/applications/**",
                                "/api/favorites",  "/api/favorites/**",
                                "/api/interviews/my",
                                "/api/send/mail/**",
                                "/api/locations", "/api/locations/**",
                                "/api/users/applicants/*", "/api/users/recruiters/*",
                                "/api/export/**",
                                "/api/chat/**",
                                "/api/devices", "/api/devices/**"
                        ).hasAnyRole("ADMIN", "RECRUITER", "APPLICANT", "MODERATOR")
                        .requestMatchers(
                                "/api/jobs/*/**",
                                "/api/users/recruiters/**",
                                "/api/interviews", "/api/interviews/**",
                                "/api/recruiter/statistics/**"
                        ).hasAnyRole("ADMIN", "RECRUITER", "MODERATOR")
                        .requestMatchers(
                                "/api/users", "/api/users/**",
                                "/api/users/moderators/**"
                        ).hasAnyRole("ADMIN", "MODERATOR")
                        .requestMatchers(
                                "/api/admin/statistics/**"
                        ).hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .successHandler((request, response, authentication) -> {
                            try {
                                String username = authentication.getName();
                                String token = JwtUtils.generateToken(username); // Dùng JwtUtils có sẵn
                                response.sendRedirect("http://localhost:3000/oauth2/redirect?token=" + token);
                            } catch (Exception e) {
                                e.printStackTrace();
                                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Token generation failed");
                            }
                        })
                )
                .addFilterBefore(jwtFilter(), UsernamePasswordAuthenticationFilter.class)
                .logout(logout -> logout
                        .logoutSuccessUrl("/login")
                        .permitAll()
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000")); // Gốc hợp lệ (frontend)
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")); // Các phương thức HTTP
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type")); // Các header được phép
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
