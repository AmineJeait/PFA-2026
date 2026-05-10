package com.example.PFA_2026.modules.auth.dto;

import com.example.PFA_2026.modules.auth.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDto {

    @Data
    public static class RegisterRequest {
        @Email(message = "Email invalide")
        @NotBlank(message = "Email obligatoire")
        private String email;

        @NotBlank(message = "Mot de passe obligatoire")
        @Size(min = 6, message = "Minimum 6 caractères")
        private String password;

        private User.Role role;
    }

    @Data
    public static class LoginRequest {
        @NotBlank(message = "Email obligatoire")
        private String email;

        @NotBlank(message = "Mot de passe obligatoire")
        private String password;
    }

    @Data
    @lombok.Builder
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String email;
        private String role;
    }
}