# ERP AJEGT

Application de gestion de l’Association des Jeunes et Étudiants Guinéens de Toulouse.

## État actuel

Le dépôt contient un prototype de gestion des membres : annuaire, recherche, filtres, création, modification et archivage. Le frontend communique avec l’API Spring Boot ; les exemples et changements sont stockés dans une base H2 locale persistante.

**Ne saisissez pas de données personnelles réelles.** Le profil de développement utilise une API sans authentification, accessible uniquement depuis la machine locale. L’authentification et le déploiement sécurisé ne sont pas encore en place.

## Technologies

- Frontend : React, TypeScript, Vite et React Router
- Backend : Java 21, Spring Boot, Spring Data JPA et Bean Validation
- Base de données de développement : H2, enregistrée dans le dossier ignoré `backend/target/`
- Base cible prévue : PostgreSQL (configuration par variables d’environnement)

## Démarrer l’application en développement

Prérequis : Node.js, npm et Java 21.

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

Les données de démonstration sont fictives. L’API valide les champs, empêche les e-mails en double, et permet de créer, modifier, archiver et réactiver les membres.

## Documentation

Les besoins fonctionnels sont recensés dans [`docs/user-stories.md`](docs/user-stories.md).
