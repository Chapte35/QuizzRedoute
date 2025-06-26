# 🌍 Quiz des Capitales - Version Firebase

Un quiz multijoueur en temps réel où les joueurs peuvent se connecter avec leur téléphone via QR code pour répondre aux questions affichées sur l'écran hôte.

## ✨ Fonctionnalités

- 🎮 **Mode Hôte** : Créez et gérez une partie depuis un ordinateur
- 📱 **Mode Joueur** : Rejoignez avec votre téléphone via QR code
- 🔥 **Synchronisation temps réel** avec Firebase
- ⏱️ **Timer automatique** pour chaque question (30 secondes)
- 🏆 **Système de score** et classement en direct
- 📊 **Résultats détaillés** après chaque question
- 🎯 **Interface responsive** adaptée mobile/desktop

## 🚀 Configuration Firebase

### 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Créer un projet"
3. Donnez un nom à votre projet (ex: "quiz-capitales")
4. Activez Google Analytics (optionnel)

### 2. Configurer Realtime Database

1. Dans la console Firebase, allez dans "Realtime Database"
2. Cliquez sur "Créer une base de données"
3. Choisissez une localisation (ex: europe-west1)
4. Commencez en **mode test** pour le développement

### 3. Configurer les règles de sécurité

Dans l'onglet "Règles" de Realtime Database, remplacez les règles par :

```json
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": true,
        ".write": true,
        "players": {
          "$playerId": {
            ".write": "auth == null || auth.uid == $playerId"
          }
        }
      }
    }
  }
}
```

### 4. Obtenir les clés de configuration

1. Allez dans "Paramètres du projet" (icône engrenage)
2. Dans l'onglet "Général", scrollez jusqu'à "Vos applications"
3. Cliquez sur "Ajouter une application" → "Web"
4. Donnez un nom à votre app (ex: "Quiz Web")
5. Copiez les clés de configuration

### 5. Configurer l'application

Ouvrez le fichier `index.html` et remplacez la configuration Firebase :

```javascript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://VOTRE_PROJECT_ID-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_PROJECT_ID.appspot.com",
  messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
  appId: "VOTRE_APP_ID"
};
```

## 📂 Structure du projet

```
quiz-capitales/
├── index.html          # Application principale
├── questions.json      # Base de données des questions
├── firebase-config.js  # Configuration Firebase (optionnel)
└── README.md          # Ce fichier
```

## 🌐 Déploiement sur GitHub Pages

### 1. Créer un repository GitHub

1. Créez un nouveau repository sur GitHub
2. Nommez-le `quiz-capitales` (ou autre nom)
3. Rendez-le public

### 2. Uploader les fichiers

1. Uploadez tous les fichiers dans le repository :
   - `index.html`
   - `questions.json`
   - `README.md`

### 3. Activer GitHub Pages

1. Allez dans Settings → Pages
2. Source : "Deploy from a branch"
3. Branch : "main" (ou "master")
4. Folder : "/ (root)"
5. Cliquez sur "Save"

### 4. Accéder à votre quiz

Votre quiz sera accessible à l'adresse :
`https://VOTRE_USERNAME.github.io/quiz-capitales/`

## 🎯 Utilisation

### Mode Hôte (Ordinateur)
1. Ouvrez l'application dans un navigateur
2. Cliquez sur "Créer une partie"
3. Partagez le code de la partie ou le QR code
4. Attendez que les joueurs se connectent
5. Cliquez sur "Commencer la partie"

### Mode Joueur (Téléphone)
1. Scannez le QR code ou entrez le code manuellement
2. Entrez votre nom
3. Attendez le début de la partie
4. Répondez aux questions en temps réel

## 🔧 Personnalisation

### Ajouter des questions

Modifiez le fichier `questions.json` :

```json
{
  "questions": [
    {
      "id": 1,
      "question": "Votre question ?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0
    }
  ]
}
```

### Modifier le design

Les styles CSS sont dans le `<style>` du fichier `index.html`. Vous pouvez :
- Changer les couleurs
- Modifier les animations
- Adapter le responsive design

### Ajouter des fonctionnalités

L'architecture modulaire permet d'ajouter facilement :
- Nouveaux types de questions
- Système de badges
- Historique des parties
- Chat en temps réel
- Thèmes personnalisés

## 🔒 Sécurité

Pour la production, considérez :
- Authentification des utilisateurs
- Règles de sécurité Firebase plus strictes
- Validation côté serveur
- Limitation du nombre de parties par IP

## 🐛 Dépannage

### Erreur de connexion Firebase
- Vérifiez votre configuration Firebase
- Assurez-vous que Realtime Database est activé
- Vérifiez les règles de sécurité

### QR Code ne fonctionne pas
- Vérifiez que l'URL est correcte
- Testez avec un lecteur QR code standard

### Joueurs ne se connectent pas
- Vérifiez la connectivité internet
- Regardez la console du navigateur pour les erreurs

## 📱 Compatibilité

- ✅ Chrome, Firefox, Safari, Edge (dernières versions)
- ✅ iOS Safari, Chrome Mobile, Firefox Mobile
- ✅ Responsive design pour toutes les tailles d'écran

## 🎉 Améliorations futures possibles

- [ ] Système d'authentification
- [ ] Parties privées avec mots de passe
- [ ] Statistiques détaillées
- [ ] Thèmes de quiz multiples
- [ ] Mode tournament
- [ ] Intégration avec réseaux sociaux
- [ ] Sauvegarde des scores
- [ ] Questions avec images
- [ ] Mode solo avec IA

## 📄 Licence

Ce projet est sous licence MIT. Vous êtes libre de l'utiliser, le modifier et le distribuer.

---

**Bon quiz ! 🎯**