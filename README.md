# ERP AJEGT

Application de gestion de l’Association des Jeunes et Étudiants Guinéens de Toulouse.

## État actuel

Le dépôt contient un premier prototype de gestion des membres : annuaire, recherche, filtres, création, modification et archivage. Les exemples sont fictifs et les changements sont conservés dans le `localStorage` du navigateur.

**Ne saisissez pas encore de données personnelles réelles.** L’authentification, l’API métier et la persistance PostgreSQL ne sont pas encore raccordées au frontend.

## Technologies

- Frontend : React, TypeScript, Vite et React Router
- Backend en préparation : Java 21, Spring Boot et Spring Data JPA
- Base de données prévue : PostgreSQL

## Démarrer le prototype frontend

Prérequis : Node.js et npm.

```bash
cd frontend
npm install
npm run dev
```

Vite affiche l’adresse locale de l’application dans le terminal.

## Documentation

Les besoins fonctionnels sont recensés dans [`docs/user-stories.md`](docs/user-stories.md).
