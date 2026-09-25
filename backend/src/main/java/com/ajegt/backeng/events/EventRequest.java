package com.ajegt.backeng.events;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record EventRequest(
        @NotBlank @Size(max = 120) String title,
        @Size(max = 500) String description,
        @NotBlank @Size(max = 180) String location,
        @NotNull LocalDateTime startsAt,
        @NotNull LocalDateTime endsAt
) {}
