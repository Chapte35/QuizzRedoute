// Configuration Firebase
// Remplacez ces valeurs par votre configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyANRVNNOYHP6959ujOl0694G2pz-Vb_Hwk",
  authDomain: "quizzcapitales-76ee3.firebaseapp.com",
  databaseURL: "https://quizzcapitales-76ee3-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "quizzcapitales-76ee3",
  storageBucket: "quizzcapitales-76ee3.firebasestorage.app",
  messagingSenderId: "222950845814",
  appId: "1:222950845814:web:b4715f2476600675e95e57"
};

// Initialisation Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Classe GameManager pour une architecture modulaire
class GameManager {
  constructor() {
    this.gameId = null;
    this.playerId = null;
    this.isHost = false;
    this.listeners = {};
  }

  // Créer une partie
  async createGame() {
    this.gameId = this.generateId(6);
    this.isHost = true;
    
    const gameData = {
      id: this.gameId,
      host: true,
      players: {},
      currentQuestion: null,
      currentQuestionIndex: 0,
      gameState: 'waiting',
      settings: {
        questionTime: 30,
        pointsPerCorrect: 10,
        maxPlayers: 20
      },
      createdAt: firebase.database.ServerValue.TIMESTAMP
    };

    await database.ref(`games/${this.gameId}`).set(gameData);
    this.setupGameListeners();
    return this.gameId;
  }

  // Rejoindre une partie
  async joinGame(gameId, playerName) {
    // Vérifier que la partie existe
    const gameSnapshot = await database.ref(`games/${gameId}`).once('value');
    if (!gameSnapshot.exists()) {
      throw new Error('Partie introuvable');
    }

    const gameData = gameSnapshot.val();
    if (gameData.gameState !== 'waiting') {
      throw new Error('La partie a déjà commencé');
    }

    // Vérifier le nombre de joueurs
    const playerCount = Object.keys(gameData.players || {}).length;
    if (playerCount >= (gameData.settings?.maxPlayers || 20)) {
      throw new Error('Partie complète');
    }

    this.gameId = gameId;
    this.playerId = this.generateId(9);
    this.isHost = false;

    const playerData = {
      id: this.playerId,
      name: playerName,
      score: 0,
      answers: {},
      status: 'connected',
      joinedAt: firebase.database.ServerValue.TIMESTAMP
    };

    await database.ref(`games/${gameId}/players/${this.playerId}`).set(playerData);
    this.setupGameListeners();
    return this.playerId;
  }

  // Configuration des écouteurs d'événements
  setupGameListeners() {
    // Écouter les changements d'état du jeu
    this.listeners.gameState = database.ref(`games/${this.gameId}/gameState`)
      .on('value', (snapshot) => {
        const gameState = snapshot.val();
        this.onGameStateChange(gameState);
      });

    // Écouter les changements de joueurs
    this.listeners.players = database.ref(`games/${this.gameId}/players`)
      .on('value', (snapshot) => {
        const players = snapshot.val() || {};
        this.onPlayersChange(players);
      });

    // Écouter la question actuelle
    this.listeners.currentQuestion = database.ref(`games/${this.gameId}/currentQuestion`)
      .on('value', (snapshot) => {
        const question = snapshot.val();
        this.onQuestionChange(question);
      });

    // Écouter l'index de la question
    this.listeners.questionIndex = database.ref(`games/${this.gameId}/currentQuestionIndex`)
      .on('value', (snapshot) => {
        const index = snapshot.val();
        this.onQuestionIndexChange(index);
      });
  }

  // Méthodes d'événements (à override dans l'interface)
  onGameStateChange(gameState) {
    console.log('Game state changed:', gameState);
  }

  onPlayersChange(players) {
    console.log('Players changed:', players);
  }

  onQuestionChange(question) {
    console.log('Question changed:', question);
  }

  onQuestionIndexChange(index) {
    console.log('Question index changed:', index);
  }

  // Démarrer la partie (hôte uniquement)
  async startGame() {
    if (!this.isHost) throw new Error('Seul l\'hôte peut démarrer la partie');
    
    await database.ref(`games/${this.gameId}/gameState`).set('question');
    await database.ref(`games/${this.gameId}/currentQuestionIndex`).set(0);
  }

  // Soumettre une réponse (joueur uniquement)
  async submitAnswer(questionIndex, answerIndex) {
    if (this.isHost) throw new Error('L\'hôte ne peut pas soumettre de réponse');
    
    await database.ref(`games/${this.gameId}/players/${this.playerId}/answers/${questionIndex}`)
      .set(answerIndex);
  }

  // Passer à la question suivante (hôte uniquement)
  async nextQuestion() {
    if (!this.isHost) return;
    
    const currentIndex = await this.getCurrentQuestionIndex();
    const nextIndex = currentIndex + 1;
    
    await database.ref(`games/${this.gameId}/currentQuestionIndex`).set(nextIndex);
  }

  // Terminer la partie (hôte uniquement)
  async endGame() {
    if (!this.isHost) return;
    
    await database.ref(`games/${this.gameId}/gameState`).set('finished');
  }

  // Quitter la partie
  async leaveGame() {
    if (this.playerId && !this.isHost) {
      await database.ref(`games/${this.gameId}/players/${this.playerId}`).remove();
    }
    
    if (this.isHost) {
      await database.ref(`games/${this.gameId}`).remove();
    }
    
    this.cleanup();
  }

  // Nettoyer les écouteurs
  cleanup() {
    Object.keys(this.listeners).forEach(key => {
      if (this.listeners[key]) {
        database.ref(`games/${this.gameId}/${key}`).off('value', this.listeners[key]);
      }
    });
    this.listeners = {};
  }

  // Utilitaires
  generateId(length = 6) {
    return Math.random().toString(36).substr(2, length).toUpperCase();
  }

  async getCurrentQuestionIndex() {
    const snapshot = await database.ref(`games/${this.gameId}/currentQuestionIndex`).once('value');
    return snapshot.val() || 0;
  }

  async getGameData() {
    const snapshot = await database.ref(`games/${this.gameId}`).once('value');
    return snapshot.val();
  }

  async getPlayers() {
    const snapshot = await database.ref(`games/${this.gameId}/players`).once('value');
    return snapshot.val() || {};
  }
}

// Classe QuestionManager pour gérer les questions
class QuestionManager {
  constructor() {
    this.questions = [];
    this.currentIndex = 0;
  }

  async loadQuestions() {
    try {
      const response = await fetch('./questions.json');
      const data = await response.json();
      this.questions = data.questions;
      return this.questions;
    } catch (error) {
      console.error('Erreur lors du chargement des questions:', error);
      throw error;
    }
  }

  getQuestion(index) {
    return this.questions[index] || null;
  }

  getCurrentQuestion() {
    return this.getQuestion(this.currentIndex);
  }

  hasNextQuestion() {
    return this.currentIndex < this.questions.length - 1;
  }

  nextQuestion() {
    if (this.hasNextQuestion()) {
      this.currentIndex++;
      return this.getCurrentQuestion();
    }
    return null;
  }

  getTotalQuestions() {
    return this.questions.length;
  }

  shuffleQuestions() {
    for (let i = this.questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
    }
  }

  shuffleOptions(question) {
    const correctAnswer = question.options[question.correct];
    const shuffled = [...question.options];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return {
      ...question,
      options: shuffled,
      correct: shuffled.indexOf(correctAnswer)
    };
  }
}

// Classe ScoreManager pour gérer les scores
class ScoreManager {
  constructor() {
    this.scores = new Map();
  }

  calculateScore(playerAnswers, questions, pointsPerCorrect = 10) {
    let score = 0;
    
    Object.keys(playerAnswers).forEach(questionIndex => {
      const question = questions[parseInt(questionIndex)];
      const playerAnswer = playerAnswers[questionIndex];
      
      if (question && playerAnswer === question.correct) {
        score += pointsPerCorrect;
      }
    });
    
    return score;
  }

  getLeaderboard(players) {
    return Object.values(players)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map((player, index) => ({
        ...player,
        rank: index + 1
      }));
  }

  getPlayerRank(playerId, players) {
    const leaderboard = this.getLeaderboard(players);
    const playerData = leaderboard.find(p => p.id === playerId);
    return playerData ? playerData.rank : -1;
  }

  formatScore(score) {
    return `${score || 0} point${(score || 0) !== 1 ? 's' : ''}`;
  }
}

// Classe TimerManager pour gérer les timers
class TimerManager {
  constructor() {
    this.timers = new Map();
  }

  startTimer(name, duration, onTick, onComplete) {
    this.stopTimer(name); // Arrêter le timer existant s'il y en a un
    
    let timeLeft = duration;
    
    const interval = setInterval(() => {
      if (onTick) onTick(timeLeft);
      
      timeLeft--;
      
      if (timeLeft < 0) {
        this.stopTimer(name);
        if (onComplete) onComplete();
      }
    }, 1000);
    
    this.timers.set(name, interval);
    
    // Appeler onTick immédiatement avec le temps initial
    if (onTick) onTick(duration);
  }

  stopTimer(name) {
    if (this.timers.has(name)) {
      clearInterval(this.timers.get(name));
      this.timers.delete(name);
    }
  }

  stopAllTimers() {
    this.timers.forEach((interval, name) => {
      clearInterval(interval);
    });
    this.timers.clear();
  }
}

// Classe UtilsManager pour fonctions utilitaires
class UtilsManager {
  static formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  static generateQRCodeURL(gameId) {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?game=${gameId}`;
  }

  static isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  static validateGameId(gameId) {
    return /^[A-Z0-9]{6}$/.test(gameId);
  }

  static validatePlayerName(name) {
    return name && name.trim().length >= 2 && name.trim().length <= 20;
  }

  static sanitizePlayerName(name) {
    return name.trim().replace(/[^a-zA-Z0-9\s\-_]/g, '').substring(0, 20);
  }

  static showNotification(message, type = 'info') {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      max-width: 300px;
    `;
    
    switch (type) {
      case 'success':
        notification.style.background = 'linear-gradient(135deg, #00b894, #00a085)';
        break;
      case 'error':
        notification.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
        break;
      case 'warning':
        notification.style.background = 'linear-gradient(135deg, #f39c12, #e67e22)';
        break;
      default:
        notification.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in forwards';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  static addStylesheet() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialisation des styles pour les notifications
UtilsManager.addStylesheet();

// Exporter les classes pour utilisation globale
window.GameManager = GameManager;
window.QuestionManager = QuestionManager;
window.ScoreManager = ScoreManager;
window.TimerManager = TimerManager;
window.UtilsManager = UtilsManager;

// Classe pour gérer le quiz
class QuizManager {
  constructor() {
    this.gameId = null;
    this.isHost = false;
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.players = {};
    this.gameState = 'waiting'; // waiting, question, results, finished
  }

  // Créer une nouvelle partie (hôte)
  async createGame() {
    this.gameId = this.generateGameId();
    this.isHost = true;
    
    await this.loadQuestions();
    
    const gameData = {
      id: this.gameId,
      host: true,
      players: {},
      currentQuestion: null,
      gameState: 'waiting',
      questions: this.questions,
      currentQuestionIndex: 0,
      createdAt: firebase.database.ServerValue.TIMESTAMP
    };

    await database.ref(`games/${this.gameId}`).set(gameData);
    this.setupHostListeners();
    return this.gameId;
  }

  // Rejoindre une partie (joueur)
  async joinGame(gameId, playerName) {
    this.gameId = gameId;
    this.isHost = false;
    
    const playerId = this.generatePlayerId();
    const playerData = {
      id: playerId,
      name: playerName,
      score: 0,
      answers: {},
      joinedAt: firebase.database.ServerValue.TIMESTAMP
    };

    await database.ref(`games/${gameId}/players/${playerId}`).set(playerData);
    this.setupPlayerListeners();
    return playerId;
  }

  // Charger les questions depuis le fichier JSON
  async loadQuestions() {
    try {
      const response = await fetch('./questions.json');
      const data = await response.json();
      this.questions = data.questions;
    } catch (error) {
      console.error('Erreur lors du chargement des questions:', error);
    }
  }

  // Générer un ID de partie unique
  generateGameId() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  // Générer un ID de joueur unique
  generatePlayerId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // Commencer la partie (hôte)
  async startGame() {
    if (!this.isHost) return;
    
    await database.ref(`games/${this.gameId}/gameState`).set('question');
    await this.showNextQuestion();
  }

  // Afficher la question suivante (hôte)
  async showNextQuestion() {
    if (!this.isHost || this.currentQuestionIndex >= this.questions.length) {
      await this.endGame();
      return;
    }

    const question = this.questions[this.currentQuestionIndex];
    await database.ref(`games/${this.gameId}/currentQuestion`).set(question);
    await database.ref(`games/${this.gameId}/currentQuestionIndex`).set(this.currentQuestionIndex);
    
    // Timer pour la question (30 secondes)
    setTimeout(() => {
      if (this.isHost) {
        this.showResults();
      }
    }, 30000);
  }

  // Afficher les résultats de la question (hôte)
  async showResults() {
    if (!this.isHost) return;
    
    await database.ref(`games/${this.gameId}/gameState`).set('results');
    
    // Calculer les scores
    const snapshot = await database.ref(`games/${this.gameId}/players`).once('value');
    const players = snapshot.val() || {};
    
    Object.keys(players).forEach(playerId => {
      const player = players[playerId];
      const answer = player.answers && player.answers[this.currentQuestionIndex];
      const correctAnswer = this.questions[this.currentQuestionIndex].correct;
      
      if (answer === correctAnswer) {
        player.score += 10;
      }
    });

    await database.ref(`games/${this.gameId}/players`).set(players);
    
    // Passer à la question suivante après 5 secondes
    setTimeout(() => {
      if (this.isHost) {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.questions.length) {
          database.ref(`games/${this.gameId}/gameState`).set('question');
          this.showNextQuestion();
        } else {
          this.endGame();
        }
      }
    }, 5000);
  }

  // Terminer la partie (hôte)
  async endGame() {
    if (!this.isHost) return;
    
    await database.ref(`games/${this.gameId}/gameState`).set('finished');
  }

  // Soumettre une réponse (joueur)
  async submitAnswer(playerId, answer) {
    if (this.isHost) return;
    
    await database.ref(`games/${this.gameId}/players/${playerId}/answers/${this.currentQuestionIndex}`).set(answer);
  }

  // Configurer les écouteurs pour l'hôte
  setupHostListeners() {
    database.ref(`games/${this.gameId}/players`).on('value', (snapshot) => {
      this.players = snapshot.val() || {};
      this.updatePlayersDisplay();
    });
  }

  // Configurer les écouteurs pour les joueurs
  setupPlayerListeners() {
    database.ref(`games/${this.gameId}/gameState`).on('value', (snapshot) => {
      const gameState = snapshot.val();
      this.handleGameStateChange(gameState);
    });

    database.ref(`games/${this.gameId}/currentQuestion`).on('value', (snapshot) => {
      const question = snapshot.val();
      if (question) {
        this.displayQuestion(question);
      }
    });

    database.ref(`games/${this.gameId}/currentQuestionIndex`).on('value', (snapshot) => {
      this.currentQuestionIndex = snapshot.val() || 0;
    });
  }

  // Gérer les changements d'état du jeu
  handleGameStateChange(gameState) {
    switch (gameState) {
      case 'waiting':
        this.showWaitingScreen();
        break;
      case 'question':
        this.showQuestionScreen();
        break;
      case 'results':
        this.showResultsScreen();
        break;
      case 'finished':
        this.showFinalResults();
        break;
    }
  }

  // Méthodes d'affichage (à implémenter dans l'interface utilisateur)
  updatePlayersDisplay() {
    // À implémenter dans l'interface
  }

  displayQuestion(question) {
    // À implémenter dans l'interface
  }

  showWaitingScreen() {
    // À implémenter dans l'interface
  }

  showQuestionScreen() {
    // À implémenter dans l'interface
  }

  showResultsScreen() {
    // À implémenter dans l'interface
  }

  showFinalResults() {
    // À implémenter dans l'interface
  }
}

// Exporter la classe pour utilisation
window.QuizManager = QuizManager;