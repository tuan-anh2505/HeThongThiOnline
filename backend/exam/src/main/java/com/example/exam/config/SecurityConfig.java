package com.example.exam.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.exam.security.JwtFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // AUTH
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register")
                        .permitAll()

                        .requestMatchers(
                                "/api/auth/logout",
                                "/api/auth/me")
                        .authenticated()

                        // WEBSOCKET
                        .requestMatchers("/ws-exam/**")
                        .permitAll()

                        // ADMIN
                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")

                        // TEACHER
                        .requestMatchers("/api/analytics/**")
                        .hasAnyRole("TEACHER", "ADMIN")

                        .requestMatchers("/api/baithi/**")
                        .hasAnyRole("TEACHER", "ADMIN")

                        .requestMatchers("/api/monthi/**")
                        .hasAnyRole("TEACHER", "ADMIN")

                        .requestMatchers("/api/metadata/**")
                        .hasAnyRole("TEACHER", "ADMIN")

                        .requestMatchers("/api/dashboard/teacher/**")
                        .hasAnyRole("TEACHER", "ADMIN")

                        // STUDENT
                        .requestMatchers("/api/dashboard/student/**")
                        .hasAnyRole("STUDENT", "ADMIN")

                        .requestMatchers("/api/exam-taking/**")
                        .hasAnyRole("STUDENT", "ADMIN")

                        // FILES
                        .requestMatchers("/api/files/**")
                        .hasAnyRole("TEACHER", "STUDENT", "ADMIN")

                        // TEST ROLE APIs
                        .requestMatchers("/api/admin/test")
                        .hasRole("ADMIN")

                        .requestMatchers("/api/teacher/test")
                        .hasAnyRole("TEACHER", "ADMIN")

                        .requestMatchers("/api/student/test")
                        .hasAnyRole("STUDENT", "ADMIN")

                        .anyRequest()
                        .authenticated())

                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(
                List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}