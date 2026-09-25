# User Stories – AJEGT ERP

## Présentation

Ce document recense l'ensemble des User Stories de l'ERP AJEGT.

Chaque User Story décrit un besoin fonctionnel exprimé du point de vue d'un utilisateur.

---

# Epic 1 - Authentification

## US-001 - Connexion

### Epic
Authentification

### Priorité
Haute

### Acteur
Membre

### Description

En tant que membre,

Je veux me connecter à mon espace personnel,

Afin de consulter mes informations et accéder aux fonctionnalités réservées.

### Critères d'acceptation

- Authentification avec email et mot de passe
- Vérification des identifiants
- Redirection vers le tableau de bord
- Message d'erreur si la connexion échoue

---

## US-002 - Déconnexion

### Epic
Authentification

### Priorité
Haute

### Acteur
Membre

### Description

En tant que membre,

Je veux me déconnecter,

Afin de sécuriser mon compte.

---

## US-003 - Mot de passe oublié

### Epic
Authentification

### Priorité
Haute

### Acteur
Membre

### Description

En tant que membre,

Je veux réinitialiser mon mot de passe,

Afin de retrouver l'accès à mon compte.

---

## US-062 - Demander un compte et faire approuver l'inscription

### Epic
Authentification

### Priorité
Haute

### Acteurs
Personne souhaitant rejoindre l'association, secrétaire, administrateur

### Description

En tant que futur membre,

Je veux demander la création d'un compte avec mon adresse e-mail et mon nom,

Afin d'accéder à l'ERP après validation par un responsable AJEGT.

### Critères d'acceptation

- La demande attribue uniquement le rôle de membre et reste en attente d'approbation.
- Un compte en attente ou refusé ne peut pas se connecter.
- Un secrétaire ou administrateur peut approuver ou refuser une demande.
- Seul un administrateur peut attribuer un rôle privilégié.
- Une demande déjà traitée ne peut pas être approuvée ou refusée une seconde fois.

---

# Epic 2 - Gestion des membres

## US-004 - Consulter son profil

### Priorité
Haute

### Acteur
Membre

### Description

En tant que membre,

Je veux consulter mon profil,

Afin de vérifier mes informations personnelles.

---

## US-005 - Modifier son profil

### Priorité
Haute

### Acteur
Membre

### Description

En tant que membre,

Je veux modifier mes informations personnelles,

Afin qu'elles restent à jour.

---

## US-006 - Consulter l'annuaire des membres

### Priorité
Haute

### Acteur
Membre

### Description

En tant que membre,

Je veux consulter l'annuaire des membres,

Afin de retrouver un autre membre.

---

## US-007 - Ajouter un membre

### Priorité
Haute

### Acteur
Secrétaire

### Description

En tant que secrétaire,

Je veux enregistrer un nouveau membre,

Afin de gérer les adhésions.

---

## US-008 - Modifier un membre

### Priorité
Haute

### Acteur
Secrétaire

### Description

En tant que secrétaire,

Je veux modifier les informations d'un membre,

Afin de corriger ou mettre à jour son dossier.

---

## US-009 - Archiver un membre

### Priorité
Haute

### Acteur
Secrétaire

### Description

En tant que secrétaire,

Je veux archiver un membre,

Afin de conserver son historique sans supprimer ses données.

---

## US-010 - Consulter les cotisations d'un membre

### Priorité
Moyenne

### Acteur
Trésorier

### Description

En tant que trésorier,

Je veux consulter les cotisations d'un membre,

Afin de vérifier sa situation financière.

---

## US-011 - Télécharger sa carte de membre

### Priorité
Moyenne

### Acteur
Membre

### Description

En tant que membre,

Je veux télécharger ma carte de membre,

Afin de pouvoir la présenter lors des événements.

---

# Epic 3 - Gestion des bureaux

## US-012 - Créer un mandat

## US-013 - Modifier un mandat

## US-014 - Affecter un poste à un membre

## US-015 - Consulter l'historique des bureaux

## US-016 - Archiver un mandat

## US-017 - Déposer le bilan d'un mandat

---

# Epic 4 - Gestion des événements

## US-018 - Créer un événement

## US-019 - Modifier un événement

## US-020 - Annuler un événement

## US-021 - Publier un événement

## US-022 - S'inscrire à un événement

## US-023 - Se désinscrire d'un événement

## US-024 - Gérer les participants

## US-025 - Scanner les présences avec un QR Code

## US-026 - Ajouter les photos d'un événement

## US-027 - Consulter le bilan d'un événement

---

# Epic 5 - Gestion financière

## US-028 - Enregistrer une cotisation

## US-029 - Enregistrer une recette

## US-030 - Enregistrer une dépense

## US-031 - Consulter le budget

## US-032 - Générer le bilan financier

---

# Epic 6 - Gestion documentaire

## US-033 - Déposer un document

## US-034 - Modifier un document

## US-035 - Télécharger un document

## US-036 - Archiver un document

## US-037 - Rechercher un document

---

# Epic 7 - Communication

## US-038 - Publier une actualité

## US-039 - Modifier une actualité

## US-040 - Archiver une actualité

## US-041 - Gérer la galerie photo

## US-042 - Envoyer une newsletter

---

# Epic 8 - Votes

## US-043 - Organiser un vote

## US-044 - Participer à un vote

## US-045 - Consulter les résultats

---

# Epic 9 - Alumni

## US-046 - Ajouter un alumni

## US-047 - Mettre à jour son parcours

## US-048 - Consulter l'annuaire des alumni

---

# Epic 10 - Tableau de bord

## US-049 - Consulter le tableau de bord

### Priorité
Haute

### Acteur
Président

### Description

En tant que président,

Je veux consulter le tableau de bord,

Afin de suivre l'activité de l'association.

---

## US-050 - Consulter les statistiques

## US-051 - Consulter les dernières adhésions

## US-052 - Consulter les prochains événements

---

# Epic 11 - Administration

## US-053 - Gérer les rôles

## US-054 - Gérer les permissions

## US-055 - Gérer les paramètres de l'association

## US-056 - Sauvegarder les données

## US-057 - Restaurer une sauvegarde

---

# Epic 12 - Archives

## US-058 - Consulter les archives des événements

## US-059 - Consulter les archives des mandats

## US-060 - Télécharger les anciens comptes rendus

## US-061 - Rechercher dans les archives
