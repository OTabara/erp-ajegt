package com.ajegt.backeng.members;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record MemberRequest(
        @NotBlank @Size(max = 80) String firstName,
        @NotBlank @Size(max = 80) String lastName,
        @NotBlank @Email @Size(max = 160) String email,
        @Size(max = 30) String phone,
        @NotBlank @Size(max = 40) String role,
        @NotNull @PastOrPresent LocalDate joinedAt
) {
}
