package com.ajegt.backeng.members;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "members", uniqueConstraints = @UniqueConstraint(name = "uk_members_email", columnNames = "email"))
public class MemberEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 80)
    private String firstName;

    @Column(nullable = false, length = 80)
    private String lastName;

    @Column(nullable = false, length = 160)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(nullable = false, length = 40)
    private String role;

    @Column(nullable = false)
    private LocalDate joinedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private MemberStatus status;

    protected MemberEntity() {
    }

    public MemberEntity(String firstName, String lastName, String email, String phone, String role, LocalDate joinedAt) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.joinedAt = joinedAt;
        this.status = MemberStatus.ACTIVE;
    }

    public void update(MemberRequest request) {
        this.firstName = request.firstName().trim();
        this.lastName = request.lastName().trim();
        this.email = request.email().trim().toLowerCase(java.util.Locale.ROOT);
        this.phone = request.phone() == null ? "" : request.phone().trim();
        this.role = request.role().trim();
        this.joinedAt = request.joinedAt();
    }

    public UUID getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone == null ? "" : phone; }
    public String getRole() { return role; }
    public LocalDate getJoinedAt() { return joinedAt; }
    public MemberStatus getStatus() { return status; }
    public void setStatus(MemberStatus status) { this.status = status; }
}
