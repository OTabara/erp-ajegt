package com.ajegt.backeng.members;

public class DuplicateMemberEmailException extends RuntimeException {
    public DuplicateMemberEmailException() {
        super("Cette adresse e-mail est déjà associée à un membre.");
    }
}
