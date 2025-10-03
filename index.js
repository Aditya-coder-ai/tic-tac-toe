class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.cells = document.querySelectorAll('.cell');
        this.status = document.querySelector('.status');
        this.resetButton = document.querySelector('.reset-btn');
        this.winnerDisplay = document.querySelector('.winner-display');
        this.winnerPlayer = document.querySelector('.winner-player');
        
        this.winningConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.cells.forEach((cell, index) => {
            // Add both click and touch events for better mobile support
            cell.addEventListener('click', () => this.handleCellClick(index));
            cell.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent double-tap zoom
                this.handleCellClick(index);
            }, { passive: false });

            // Add keyboard navigation
            cell.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleCellClick(index);
                }
            });
            cell.setAttribute('tabindex', '0'); // Make cells focusable
        });

        this.resetButton.addEventListener('click', () => this.resetGame());
        this.resetButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.resetGame();
        }, { passive: false });

        // Add keyboard shortcut for reset
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                this.resetGame();
            }
        });

        this.updateStatus(`Player ${this.currentPlayer}'s turn`);
    }
    
    handleCellClick(index) {
        if (this.board[index] !== '' || !this.gameActive) {
            return;
        }

        // Add haptic feedback for mobile devices
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }

        this.makeMove(index);
        this.checkGameResult();
    }
    
    makeMove(index) {
        this.board[index] = this.currentPlayer;
        this.cells[index].textContent = this.currentPlayer;
        this.cells[index].classList.add(this.currentPlayer.toLowerCase());
        
        // Add a subtle animation
        this.cells[index].style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.cells[index].style.transform = 'scale(1)';
        }, 150);
    }
    
    checkGameResult() {
        let roundWon = false;
        let winningCombination = null;
        
        for (let i = 0; i < this.winningConditions.length; i++) {
            const [a, b, c] = this.winningConditions[i];
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                roundWon = true;
                winningCombination = [a, b, c];
                break;
            }
        }
        
        if (roundWon) {
            this.gameActive = false;
            this.updateStatus(`Player ${this.currentPlayer} wins! 🎉`);
            this.showWinnerDisplay(this.currentPlayer);
            this.highlightWinningCells(winningCombination);
            this.disableAllCells();
            this.addGameOverAnimation();
            return;
        }
        
        if (!this.board.includes('')) {
            this.gameActive = false;
            this.updateStatus("It's a tie! 🤝");
            this.hideWinnerDisplay();
            this.addGameOverAnimation();
            return;
        }
        
        this.switchPlayer();
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateStatus(`Player ${this.currentPlayer}'s turn`);
    }
    
    highlightWinningCells(combination) {
        combination.forEach(index => {
            this.cells[index].classList.add('winner-cell');
        });
    }
    
    disableAllCells() {
        this.cells.forEach(cell => {
            cell.classList.add('disabled');
        });
    }
    
    addGameOverAnimation() {
        document.querySelector('.game-board').classList.add('game-over');
        setTimeout(() => {
            document.querySelector('.game-board').classList.remove('game-over');
        }, 500);
    }
    
    showWinnerDisplay(player) {
        this.winnerPlayer.textContent = player;
        this.winnerDisplay.classList.add('show');

        // Stronger haptic feedback for winning
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100, 50, 200]);
        }
    }
    
    hideWinnerDisplay() {
        this.winnerDisplay.classList.remove('show');
    }
    
    updateStatus(message) {
        this.status.textContent = message;
    }
    
    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell'; // Reset all classes
        });
        
        document.querySelector('.game-board').classList.remove('game-over');
        this.hideWinnerDisplay();
        this.updateStatus(`Player ${this.currentPlayer}'s turn`);
        
        // Haptic feedback for reset
        if ('vibrate' in navigator) {
            navigator.vibrate(100);
        }
        
        // Add a subtle reset animation
        document.querySelector('.game-board').style.opacity = '0.7';
        setTimeout(() => {
            document.querySelector('.game-board').style.opacity = '1';
        }, 200);
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});

// Add some fun keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        document.querySelector('.reset-btn').click();
    }
});

// Add sound effects (optional - you can add audio files later)
class SoundManager {
    constructor() {
        this.sounds = {
            move: this.createBeep(800, 100),
            win: this.createBeep(1000, 300),
            tie: this.createBeep(400, 200)
        };
    }
    
    createBeep(frequency, duration) {
        return () => {
            if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
                const audioContext = new (AudioContext || webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration / 1000);
            }
        };
    }
    
    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
}

// You can uncomment this to add sound effects
// const soundManager = new SoundManager();
