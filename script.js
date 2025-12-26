// Casino Simulation Game
class CasinoGame {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('casinoUsers')) || {};
        this.currentUser = null;
        this.currentGame = null;
        this.isSpinning = false;

        this.initEventListeners();
        this.displayLoginScreen();
    }

    initEventListeners() {
        // Login Screen
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('createAccountBtn').addEventListener('click', () => this.showCreateAccountScreen());
        
        // Create Account Screen
        document.getElementById('createAccountForm').addEventListener('submit', (e) => this.handleCreateAccount(e));
        document.getElementById('backToLoginBtn').addEventListener('click', () => this.displayLoginScreen());
        
        // Lobby Screen
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.startGame(e.target.dataset.game));
        });
        document.getElementById('addFundsBtn').addEventListener('click', () => this.addFunds());
        document.getElementById('removeFundsBtn').addEventListener('click', () => this.removeFunds());
        
        // Game Screen
        document.getElementById('backToLobbyBtn').addEventListener('click', () => this.goToLobby());
        document.getElementById('spinBtn').addEventListener('click', () => this.spin());
        document.getElementById('betAmount').addEventListener('change', () => this.updateTotalBet());
    }

    // Login/Auth Management
    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (this.users[username] && this.users[username].password === password) {
            this.currentUser = username;
            this.displayLobby();
            document.getElementById('loginForm').reset();
        } else {
            alert('Invalid username or password!');
        }
    }

    handleCreateAccount(e) {
        e.preventDefault();
        const username = document.getElementById('newUsername').value;
        const password = document.getElementById('newPassword').value;
        const initialFunds = parseFloat(document.getElementById('initialFunds').value);

        if (this.users[username]) {
            alert('Username already exists!');
            return;
        }

        this.users[username] = {
            password: password,
            balance: initialFunds
        };
        localStorage.setItem('casinoUsers', JSON.stringify(this.users));
        alert('Account created successfully! You can now login.');
        this.displayLoginScreen();
        document.getElementById('createAccountForm').reset();
    }

    handleLogout() {
        this.currentUser = null;
        this.displayLoginScreen();
    }

    // Screen Display
    showCreateAccountScreen() {
        this.hideAllScreens();
        document.getElementById('createAccountScreen').classList.add('active');
    }

    displayLoginScreen() {
        this.hideAllScreens();
        document.getElementById('loginScreen').classList.add('active');
    }

    displayLobby() {
        this.hideAllScreens();
        document.getElementById('lobbyScreen').classList.add('active');
        this.updateUserDisplay();
    }

    goToLobby() {
        this.displayLobby();
        this.currentGame = null;
    }

    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    }

    // User Display
    updateUserDisplay() {
        const balance = this.users[this.currentUser].balance;
        document.getElementById('userDisplay').textContent = this.currentUser;
        document.getElementById('balanceDisplay').textContent = '$' + balance.toFixed(2);
        document.getElementById('gameBalanceDisplay').textContent = '$' + balance.toFixed(2);
    }

    // Funds Management
    addFunds() {
        const amount = parseFloat(document.getElementById('addAmount').value);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        this.users[this.currentUser].balance += amount;
        localStorage.setItem('casinoUsers', JSON.stringify(this.users));
        this.updateUserDisplay();
        document.getElementById('addAmount').value = '';
        alert(`Added $${amount.toFixed(2)} to your account!`);
    }

    removeFunds() {
        const amount = parseFloat(document.getElementById('removeAmount').value);
        const currentBalance = this.users[this.currentUser].balance;
        
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        
        if (amount > currentBalance) {
            alert('Insufficient funds!');
            return;
        }
        
        this.users[this.currentUser].balance -= amount;
        localStorage.setItem('casinoUsers', JSON.stringify(this.users));
        this.updateUserDisplay();
        document.getElementById('removeAmount').value = '';
        alert(`Removed $${amount.toFixed(2)} from your account!`);
    }

    // Game Management
    startGame(gameType) {
        this.currentGame = gameType;
        this.hideAllScreens();
        document.getElementById('gameScreen').classList.add('active');
        
        const gameName = gameType === 'classic' ? 'Classic Slots' : 'Diamond Rush';
        document.getElementById('gameTitle').textContent = gameName;
        
        this.updateGameDisplay();
        this.initializeReels();
    }

    updateGameDisplay() {
        const balance = this.users[this.currentUser].balance;
        document.getElementById('gameBalanceDisplay').textContent = '$' + balance.toFixed(2);
    }

    updateTotalBet() {
        const betPerLine = parseFloat(document.getElementById('betAmount').value) || 0;
        const totalBet = betPerLine * 5; // 5 paylines
        document.getElementById('totalBet').textContent = '$' + totalBet.toFixed(2);
    }

    initializeReels() {
        this.updateTotalBet();
        document.getElementById('spinBtn').disabled = false;
        document.getElementById('winMessage').textContent = '';
        document.getElementById('resultDetails').textContent = '';
    }

    // Slot Machine Logic
    spin() {
        const betPerLine = parseFloat(document.getElementById('betAmount').value);
        const totalBet = betPerLine * 5;
        const balance = this.users[this.currentUser].balance;

        if (totalBet > balance) {
            alert('Insufficient funds for this bet!');
            return;
        }

        // Deduct bet
        this.users[this.currentUser].balance -= totalBet;
        localStorage.setItem('casinoUsers', JSON.stringify(this.users));

        // Disable spin button and show spinning animation
        document.getElementById('spinBtn').disabled = true;
        this.isSpinning = true;

        // Add spinning animation
        const reels = document.querySelectorAll('.reel');
        reels.forEach(reel => reel.classList.add('spinning'));

        // Spin for 2-3 seconds
        const spinDuration = 2000 + Math.random() * 1000;
        
        setTimeout(() => {
            reels.forEach(reel => reel.classList.remove('spinning'));
            
            // Get results based on game type
            const results = this.generateSpinResults();
            this.displayResults(results, betPerLine);
            
            this.isSpinning = false;
        }, spinDuration);
    }

    generateSpinResults() {
        if (this.currentGame === 'classic') {
            return this.generateClassicSlotsResults();
        } else {
            return this.generateDiamondRushResults();
        }
    }

    generateClassicSlotsResults() {
        const symbols = ['🎯', '👑', '💰', '⭐', '🔔', '7️⃣'];
        const reels = [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)]
        ];
        return reels;
    }

    generateDiamondRushResults() {
        const symbols = ['💎', '💍', '🏆', '⚡', '🌟', '💫'];
        const reels = [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)]
        ];
        return reels;
    }

    displayResults(reels, betPerLine) {
        // Display reel results
        document.getElementById('reel1').textContent = reels[0];
        document.getElementById('reel2').textContent = reels[1];
        document.getElementById('reel3').textContent = reels[2];

        // Calculate win
        const winAmount = this.calculateWin(reels, betPerLine);
        
        // Display result message
        const winMessageEl = document.getElementById('winMessage');
        const resultDetailsEl = document.getElementById('resultDetails');

        if (winAmount > 0) {
            // Add win to balance
            this.users[this.currentUser].balance += winAmount;
            localStorage.setItem('casinoUsers', JSON.stringify(this.users));

            winMessageEl.textContent = '🎉 YOU WIN! 🎉';
            winMessageEl.classList.add('big-win');
            resultDetailsEl.textContent = `You won $${winAmount.toFixed(2)}!`;
        } else {
            winMessageEl.classList.remove('big-win');
            winMessageEl.textContent = 'No match - Better luck next time!';
            resultDetailsEl.textContent = 'Keep spinning...';
        }

        this.updateGameDisplay();
        document.getElementById('spinBtn').disabled = false;
    }

    calculateWin(reels, betPerLine) {
        const [reel1, reel2, reel3] = reels;
        let winAmount = 0;
        let winCount = 0;

        // Check each payline
        // Payline 1: All three same
        if (reel1 === reel2 && reel2 === reel3) {
            winAmount += betPerLine * 50; // 50x multiplier
            winCount++;
        }
        // Payline 2: First two same
        else if (reel1 === reel2) {
            winAmount += betPerLine * 5;
            winCount++;
        }
        // Payline 3: Last two same
        else if (reel2 === reel3) {
            winAmount += betPerLine * 3;
            winCount++;
        }
        // Payline 4 & 5: Random bonus wins (25% chance each)
        if (Math.random() < 0.25) {
            winAmount += betPerLine * 2;
            winCount++;
        }
        if (Math.random() < 0.25) {
            winAmount += betPerLine * 2;
            winCount++;
        }

        return winAmount;
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CasinoGame();
});
