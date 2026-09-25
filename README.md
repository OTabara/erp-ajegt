# ERP AJEGT

Application de gestion de l’Association des Jeunes et Étudiants Guinéens de Toulouse.

## État actuel

Le dépôt contient un prototype de gestion associative : annuaire des membres, profils personnels, et demandes d’accès avec inscription libre suivie d’une approbation par un responsable. Le frontend communique avec l’API Spring Boot ; les exemples et changements sont stockés dans une base H2 locale persistante.

**Ne saisissez pas de données personnelles réelles.** Le profil de développement est prévu pour un usage local. Avant tout déploiement réel, configurez une base PostgreSQL, HTTPS, une gestion sûre des secrets et une procédure de sauvegarde.

## Technologies

- Frontend : React, TypeScript, Vite et React Router
- Backend : Java 21, Spring Boot, Spring Data JPA et Bean Validation
- Base de données de développement : H2, enregistrée dans le dossier ignoré `backend/target/`
- Base cible prévue : PostgreSQL (configuration par variables d’environnement)

## Démarrer l’application en développement

Prérequis : Node.js, npm et Java 21.

Avant le premier démarrage, créez les identifiants du premier administrateur (ils ne sont jamais codés dans le dépôt). Dans PowerShell :

```powershell
$env:AJEGT_BOOTSTRAP_EMAIL = "responsable@example.org"
$passwordSecure = Read-Host "Mot de passe initial (12 caractères minimum)" -AsSecureString
$env:AJEGT_BOOTSTRAP_PASSWORD = [System.Net.NetworkCredential]::new("", $passwordSecure).Password
$env:AJEGT_BOOTSTRAP_DISPLAY_NAME = "Responsable AJEGT"
```

Gardez ces variables définies dans le terminal qui lance le backend. Le premier démarrage crée le compte administrateur dans la base locale. Si aucun identifiant n’est défini, aucun compte responsable n’est créé.

Dans un premier terminal :

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Dans un second terminal :

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1
```

L’application est disponible à l’adresse locale affichée par Vite. L’API écoute sur `http://127.0.0.1:8080`.

Les données de démonstration sont fictives. Chaque personne peut demander un compte ; son accès reste bloqué jusqu’à l’approbation d’un secrétaire ou d’un administrateur. Seul un administrateur peut attribuer les rôles de secrétaire, trésorier ou administrateur. Les mots de passe sont hachés et les requêtes d’écriture protégées contre les attaques CSRF. Le compte bootstrap est le point de départ pour valider les demandes.

La récupération de mot de passe par e-mail n’est pas activée : aucun fournisseur d’e-mail n’est configuré. Les responsables peuvent gérer les demandes dans « Demandes d’accès ».

## Documentation

Les besoins fonctionnels sont recensés dans [`docs/user-stories.md`](docs/user-stories.md).
