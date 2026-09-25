package com.ajegt.backeng.members;

import java.util.UUID;

public class MemberNotFoundException extends RuntimeException {
    public MemberNotFoundException(UUID id) {
        super("Aucun membre ne correspond à l’identifiant " + id + ".");
    }
}
