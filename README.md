# Tontine App - Gestion de Tontines Numériques 📱💰

Une application mobile moderne, sécurisée et transparente pour automatiser et gérer les groupes d'épargne solidaire (tontines), développée avec **React Native**, **Expo** et **Firebase**.

## 🌟 Fonctionnalités Clés

- **Authentification Sécurisée** : Inscription et connexion via Firebase Auth.
- **Gestion de Tontines** : 
  - Création de tontines avec paramètres personnalisés (Montant, Fréquence, Nom).
  - Adhésion simple via un code d'invitation unique.
- **Planification Intelligente** :
  - Génération automatique des tours selon la fréquence choisie (Quotidienne, Hebdomadaire, Mensuelle).
  - Algorithme de brassage aléatoire pour désigner l'ordre des bénéficiaires.
- **Suivi des Paiements** :
  - Simulation de paiement Mobile Money (PayDunya / Flutterwave).
  - Validation des versements par l'administrateur.
  - Indicateur de statut des tours (En attente, Complété).
- **Transparence & Historique** :
  - Vue détaillée des participants et de leurs statuts de paiement.
  - Exportation des résumés de tontine pour le partage.

## 🛠 Technologies utilisées

- **Frontend** : [React Native](https://reactnative.dev/) avec [Expo](https://expo.dev/) (TypeScript)
- **Navigation** : [Expo Router](https://docs.expo.dev/router/introduction/) (Routage par fichiers)
- **Backend** : [Firebase](https://firebase.google.com/) (Authentication & Firestore)
- **UI/UX** : Composants réutilisables personnalisés avec un design propre et moderne.

## 🚀 Installation et Lancement

### Prérequis
- Node.js installé.
- Compte Firebase (ou utiliser l'émulateur local).
- Application **Expo Go** sur votre téléphone (iOS/Android).

### Étapes
1. **Cloner le projet**
   ```bash
   git clone [url-du-repo]
   cd tontine-app
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Lancer l'application**
   ```bash
   npx expo start --tunnel
   ```
   *Scannez le QR Code avec votre téléphone via l'application Expo Go.*

## 📂 Structure du Projet

- `app/` : Routes et écrans de l'application (Expo Router).
- `src/services/` : Logique métier (Firebase, Paiements, Exports).
- `src/components/ui/` : Bibliothèque de composants graphiques réutilisables.
- `src/context/` : Gestion globale de l'état (Authentification).
- `src/types/` : Définitions TypeScript pour les modèles de données.

## 🛡 Sécurité

Le projet est configuré avec des règles Firestore de test. Pour une mise en production, assurez-vous de configurer les règles de sécurité Firebase pour limiter l'accès aux données par utilisateur connecté.

---
Développé avec ❤️ pour faciliter l'épargne communautaire.
