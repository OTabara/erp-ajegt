package com.ajegt.backeng.members;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.time.LocalDate;

@Configuration
@Profile("dev")
public class DemoMemberData {
    @Bean
    ApplicationRunner seedDemoMembers(MemberRepository members) {
        return arguments -> {
            if (members.count() != 0) return;
            int year = LocalDate.now().getYear();
            members.save(new MemberEntity("Aïssatou", "Camara", "aissatou.camara@example.org", "+33 6 00 00 00 01", "Présidence", LocalDate.of(2024, 9, 12)));
            members.save(new MemberEntity("Mamadou", "Bah", "mamadou.bah@example.org", "+33 6 00 00 00 02", "Trésorerie", LocalDate.of(2024, 10, 3)));
            members.save(new MemberEntity("Fatoumata", "Diallo", "fatoumata.diallo@example.org", "+33 6 00 00 00 03", "Secrétariat", LocalDate.of(2025, 1, 18)));
            members.save(new MemberEntity("Ibrahima", "Barry", "ibrahima.barry@example.org", "+33 6 00 00 00 04", "Membre", LocalDate.of(year, 3, 6)));
            MemberEntity archived = new MemberEntity("Mariama", "Soumah", "mariama.soumah@example.org", "+33 6 00 00 00 05", "Membre", LocalDate.of(2024, 11, 22));
            archived.setStatus(MemberStatus.ARCHIVED);
            members.save(archived);
        };
    }
}
