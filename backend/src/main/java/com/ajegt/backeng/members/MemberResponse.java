package com.ajegt.backeng.members;

import java.time.LocalDate;
import java.util.UUID;

public record MemberResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String phone,
        String role,
        LocalDate joinedAt,
        MemberStatus status
) {
    static MemberResponse from(MemberEntity member) {
        return new MemberResponse(member.getId(), member.getFirstName(), member.getLastName(), member.getEmail(),
                member.getPhone(), member.getRole(), member.getJoinedAt(), member.getStatus());
    }
}
