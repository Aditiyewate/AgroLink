package com.rtech.agrolink.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String role;
    private String profilePhoto;

    public JwtResponse(String accessToken, Long id, String email, String role, String profilePhoto) {
        this.token = accessToken;
        this.id = id;
        this.email = email;
        this.role = role;
        this.profilePhoto = profilePhoto;
    }
}
