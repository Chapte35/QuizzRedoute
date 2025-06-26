# 🚀 Guide de Déploiement - Quiz des Capitales

Ce guide vous accompagne étape par étape pour déployer votre quiz sur différentes plateformes.

## 📋 Prérequis

- Un compte GitHub
- Un compte Firebase (gratuit)
- Un navigateur web moderne
- (Optionnel) Un nom de domaine personnalisé

## 🔥 Configuration Firebase Détaillée

### 1. Création du projet Firebase

1. Rendez-vous sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur **"Ajouter un projet"**
3. Nom du projet : `quiz-capitales-[votre-nom]`
4. Désactivez Google Analytics (optionnel pour ce projet)
5. Cliquez sur **"Créer un projet"**

### 2. Configuration de Realtime Database

1. Dans le menu latéral, sélectionnez **"Realtime Database"**
2. Cliquez sur **"Créer une base de données"**
3. Choisissez une localisation proche :
   - **Europe** : `europe-west1`
   - **États-Unis** : `us-central1`
   - **Asie** : `asia-southeast1`
4. Sélectionnez **"Commencer en mode test"**

### 3. Configuration des règles de sécurité

Dans l'onglet **"Règles"**, remplacez le contenu par :

```json
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": true,
        ".write": true,
        ".validate": "newData.hasChildren(['id', 'gameState'])",
        "players": {
          "$playerId": {
            ".validate": "newData.hasChildren(['id', 'name', 'score'])"
          }
        },
        "currentQuestion": {
          ".validate": "newData.hasChildren(['id', 'question', 'options', 'correct'])"
        }
      }
    },
    ".read": false,
    ".write": false
  }
}
```

### 4. Configuration de l'authentification (optionnel)

Si vous souhaitez ajouter l'authentification plus tard :

1. Allez dans **"Authentication"**
2. Cliquez sur **"Commencer"**
3. Dans l'onglet **"Sign-in method"**, activez :
   - **Anonyme** (pour les invités)
   - **Google** (optionnel)
   - **E-mail/Mot de passe** (optionnel)

### 5. Récupération de la configuration

1. Allez dans **"Paramètres du projet"** (icône ⚙️)
2. Scrollez jusqu'à **"Vos applications"**
3. Cliquez sur l'icône **Web** `</>`
4. Nom de l'app : `quiz-web`
5. Cochez **"Configurer aussi Firebase Hosting"** (optionnel)
6. Copiez la configuration qui apparaît

## 🌐 Déploiement sur GitHub Pages

### 1. Préparation des fichiers

Créez la structure suivante :

```
quiz-capitales/
├── index.html
├── questions.json
├── questions-extended.json (optionnel)
├── game-config.json (optionnel)
├── firebase-config.js (optionnel)
├── README.md
├── DEPLOYMENT-GUIDE.md
└── assets/ (optionnel)
    ├── sounds/
    ├── images/
    └── icons/
```

### 2. Configuration Firebase dans index.html

Remplacez la section de configuration Firebase dans `index.html` :

```javascript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://VOTRE_PROJECT_ID-default-rtdb.REGION.firebasedatabase.app/",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_PROJECT_ID.appspot.com",
  messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
  appId: "VOTRE_APP_ID"
};
```

### 3. Création du repository GitHub

1. Connectez-vous à [GitHub](https://github.com)
2. Cliquez sur **"New repository"**
3. Nom : `quiz-capitales`
4. Description : `Quiz multijoueur des capitales avec Firebase`
5. Public ✅
6. Ajoutez un README ✅
7. Cliquez sur **"Create repository"**

### 4. Upload des fichiers

**Option A : Interface web GitHub**
1. Cliquez sur **"uploading an existing file"**
2. Glissez-déposez tous vos fichiers
3. Commit message : `Initial quiz setup`
4. Cliquez sur **"Commit changes"**

**Option B : Git en ligne de commande**
```bash
git clone https://github.com/VOTRE_USERNAME/quiz-capitales.git
cd quiz-capitales
# Copiez vos fichiers dans ce dossier
git add .
git commit -m "Initial quiz setup"
git push origin main
```

### 5. Activation de GitHub Pages

1. Allez dans **Settings** de votre repository
2. Scrollez jusqu'à **"Pages"**
3. Source : **"Deploy from a branch"**
4. Branch : **"main"** ou **"master"**
5. Folder : **"/ (root)"**
6. Cliquez sur **"Save"**

### 6. Test du déploiement

Votre quiz sera accessible à :
```
https://VOTRE_USERNAME.github.io/quiz-capitales/
```

## 🎯 Domaine personnalisé (optionnel)

### 1. Configuration DNS

Si vous avez un domaine (ex: `quiz.monsite.com`) :

1. Chez votre fournisseur DNS, créez un enregistrement CNAME :
   ```
   quiz.monsite.com → VOTRE_USERNAME.github.io
   ```

### 2. Configuration GitHub

1. Dans **Settings → Pages**
2. **Custom domain** : `quiz.monsite.com`
3. Cochez **"Enforce HTTPS"**
4. Attendez la vérification (quelques minutes)

## 🔧 Déploiement sur Firebase Hosting

### 1. Installation de Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Connexion à Firebase

```bash
firebase login
```

### 3. Initialisation du projet

```bash
firebase init hosting
```

Répondez aux questions :
- **Project** : Sélectionnez votre projet
- **Public directory** : `.` (répertoire actuel)
- **Single-page app** : `Yes`
- **GitHub automatic builds** : `Yes` (optionnel)

### 4. Déploiement

```bash
firebase deploy
```

Votre quiz sera accessible à :
```
https://VOTRE_PROJECT_ID.web.app/
```

## 🛠️ Personnalisation avancée

### 1. Modification des thèmes

Éditez `game-config.json` pour ajouter de nouveaux thèmes :

```json
{
  "themes": {
    "votre_theme": {
      "name": "Mon Thème",
      "colors": {
        "primary": "#votre_couleur",
        "secondary": "#votre_couleur"
      },
      "background": "linear-gradient(...)"
    }
  }
}
```

### 2. Ajout de nouvelles questions

Modifiez `questions.json` ou créez de nouveaux fichiers :

```json
{
  "questions": [
    {
      "id": 51,
      "question": "Nouvelle question ?",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "category": "Nouvelle catégorie",
      "difficulty": "moyen"
    }
  ]
}
```

### 3. Sons et effets

Ajoutez des fichiers audio dans le dossier `assets/sounds/` :

```
assets/sounds/
├── correct.mp3
├── wrong.mp3
├── question.mp3
├── start.mp3
└── end.mp3
```

### 4. Favicon et métadonnées

Ajoutez dans `<head>` de `index.html` :

```html
<link rel="icon" type="image/png" href="assets/icons/favicon.png">
<meta name="description" content="Quiz multijoueur des capitales">
<meta property="og:title" content="Quiz des Capitales">
<meta property="og:description" content="Testez vos connaissances géographiques">
<meta property="og:image" content="assets/images/preview.jpg">
```

## 📊 Analytics et monitoring

### 1. Google Analytics (optionnel)

Ajoutez dans `<head>` :

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 2. Firebase Analytics

Dans votre configuration Firebase :

```javascript
// Initialize Analytics
const analytics = firebase.analytics();

// Track events
analytics.logEvent('game_created');
analytics.logEvent('player_joined');
analytics.logEvent('question_answered', {
  question_id: questionId,
  is_correct: isCorrect
});
```

## 🔒 Sécurité en production

### 1. Règles Firebase strictes

```json
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": "auth != null || data.child('settings/public').val() == true",
        ".write": "auth != null",
        ".validate": "newData.hasChildren(['id', 'gameState'])",
        "players": {
          "$playerId": {
            ".write": "auth.uid == $playerId || root.child('games').child($gameId).child('host').val() == auth.uid"
          }
        }
      }
    }
  }
}
```

### 2. Limitations de débit

Configurez des quotas dans Firebase Console :
- **Lectures simultanées** : 100,000
- **Écritures simultanées** : 10,000
- **Connexions simultanées** : 100,000

### 3. HTTPS et sécurité

- Activez **"Enforce HTTPS"** sur GitHub Pages
- Configurez les **Content Security Policy headers**
- Utilisez **Firebase App Check** pour la protection

## 🐛 Débogage et monitoring

### 1. Console du navigateur

Activez les logs détaillés :

```javascript
// Dans firebase-config.js
firebase.database.enableLogging(true);
```

### 2. Firebase Debugging

```javascript
// Monitoring des connexions
database.ref('.info/connected').on('value', (snapshot) => {
  if (snapshot.val() === true) {
    console.log('Connected to Firebase');
  } else {
    console.log('Disconnected from Firebase');
  }
});
```

### 3. Error Reporting

```javascript
// Capture des erreurs
window.addEventListener('error', (error) => {
  console.error('Application error:', error);
  // Envoyer à un service de monitoring
});
```

## 📱 Progressive Web App (PWA)

### 1. Manifest.json

Créez `manifest.json` :

```json
{
  "name": "Quiz des Capitales",
  "short_name": "QuizCap",
  "description": "Quiz multijoueur des capitales",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#667eea",
  "theme_color": "#667eea",
  "icons": [
    {
      "src": "assets/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### 2. Service Worker

Créez `sw.js` :

```javascript
const CACHE_NAME = 'quiz-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/questions.json',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

## 🚀 Optimisations de performance

### 1. Compression des images

- Utilisez WebP pour les images
- Optimisez les PNG avec TinyPNG
- Redimensionnez aux tailles nécessaires

### 2. Minification

- Minifiez le CSS et JavaScript
- Compressez les fichiers JSON
- Utilisez la compression gzip

### 3. CDN et caching

- Utilisez les CDN Firebase
- Configurez les headers de cache
- Implémentez le lazy loading

## 📈 Scaling et performance

### 1. Firebase quotas

- **Realtime Database** : 100,000 connexions simultanées
- **Hosting** : 1GB stockage, 10GB transfert/mois
- **Functions** : 2M invocations/mois (si utilisées)

### 2. Optimisations base de données

```javascript
// Utilisez des index pour les requêtes
database.ref('games').orderByChild('createdAt').limitToLast(10);

// Déconnectez les listeners inactifs
const listener = database.ref('games/ABC123').on('value', callback);
database.ref('games/ABC123').off('value', listener);
```

---

## 🎉 Prêt à jouer !

Votre quiz est maintenant déployé et prêt à accueillir des joueurs du monde entier !

### URLs utiles

- **Repository GitHub** : `https://github.com/VOTRE_USERNAME/quiz-capitales`
- **Site en ligne** : `https://VOTRE_USERNAME.github.io/quiz-capitales/`
- **Console Firebase** : `https://console.firebase.google.com/project/VOTRE_PROJECT_ID`
- **Documentation** : [Firebase Docs](https://firebase.google.com/docs)

### Support

- 📧 Issues GitHub pour les bugs
- 💬 Discussions pour les suggestions
- 📖 Wiki pour la documentation étendue