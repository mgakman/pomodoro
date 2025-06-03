class PomodoroTimer {
    constructor() {
        // Timer settings
        this.focusTime = 25;
        this.breakTime = 5;
        this.currentMode = 'focus';
        
        // State
        this.timeLeft = this.focusTime * 60;
        this.totalTime = this.timeLeft;
        this.isRunning = false;
        this.timer = null;

        // DOM Elements
        this.timerDisplay = document.getElementById('timer');
        this.startButton = document.getElementById('start');
        this.settingsButton = document.querySelector('.settings-btn');
        this.modal = document.getElementById('settings-modal');
        this.cancelSettingsButton = document.getElementById('cancel-settings');
        this.saveSettingsButton = document.getElementById('save-settings');
        this.focusTimeInput = document.getElementById('focus-time');
        this.breakTimeInput = document.getElementById('break-time');
        
        // Progress Ring Elements
        this.circle = document.querySelector('.progress-ring__circle');
        this.radius = this.circle.r.baseVal.value;
        this.circumference = this.radius * 2 * Math.PI;
        
        // Initialize progress ring
        this.circle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        this.setProgress(0); // Start at 0 progress

        this.initializeEventListeners();
        this.loadSettings();
    }

    initializeEventListeners() {
        this.startButton.addEventListener('click', () => this.toggleTimer());
        this.settingsButton.addEventListener('click', () => this.openSettings());
        this.cancelSettingsButton.addEventListener('click', () => this.closeSettings());
        this.saveSettingsButton.addEventListener('click', () => this.saveSettings());

        // Time adjustment buttons
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const target = e.target.dataset.target;
                const input = document.getElementById(`${target}-time`);
                const currentValue = parseInt(input.value);
                
                if (action === 'increase') {
                    input.value = Math.min(parseInt(input.max), currentValue + 1);
                } else {
                    input.value = Math.max(parseInt(input.min), currentValue - 1);
                }
            });
        });

        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeSettings();
            }
        });
    }

    setProgress(percent) {
        const offset = this.circumference - (percent / 100 * this.circumference);
        this.circle.style.strokeDashoffset = offset;
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    updateDisplay() {
        this.timerDisplay.textContent = this.formatTime(this.timeLeft);
        const progress = ((this.totalTime - this.timeLeft) / this.totalTime) * 100;
        this.setProgress(progress);
    }

    toggleTimer() {
        if (this.isRunning) {
            this.pause();
            this.startButton.textContent = 'Start';
        } else {
            this.start();
            this.startButton.textContent = 'Pause';
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;

            this.timer = setInterval(() => {
                this.timeLeft--;
                this.updateDisplay();

                if (this.timeLeft <= 0) {
                    this.handleTimerComplete();
                }
            }, 1000);
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.timer);
        }
    }

    handleTimerComplete() {
        this.pause();
        this.playNotification();
        
        // Switch modes
        this.currentMode = this.currentMode === 'focus' ? 'break' : 'focus';
        this.timeLeft = (this.currentMode === 'focus' ? this.focusTime : this.breakTime) * 60;
        this.totalTime = this.timeLeft;
        
        this.updateDisplay();
        this.startButton.textContent = 'Start';
    }

    async playNotification() {
        const audio = new AudioContext();
        const oscillator = audio.createOscillator();
        const gainNode = audio.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audio.destination);

        oscillator.frequency.setValueAtTime(440, audio.currentTime);
        gainNode.gain.setValueAtTime(0.1, audio.currentTime);

        oscillator.start();
        await new Promise(resolve => setTimeout(resolve, 500));
        oscillator.stop();
    }

    openSettings() {
        this.focusTimeInput.value = this.focusTime;
        this.breakTimeInput.value = this.breakTime;
        this.modal.classList.add('show');
    }

    closeSettings() {
        this.modal.classList.remove('show');
    }

    saveSettings() {
        const newFocusTime = parseInt(this.focusTimeInput.value);
        const newBreakTime = parseInt(this.breakTimeInput.value);

        if (newFocusTime !== this.focusTime || newBreakTime !== this.breakTime) {
            this.focusTime = newFocusTime;
            this.breakTime = newBreakTime;
            
            // Reset current timer if it's running
            if (this.isRunning) {
                this.pause();
                this.startButton.textContent = 'Start';
            }
            
            this.timeLeft = (this.currentMode === 'focus' ? this.focusTime : this.breakTime) * 60;
            this.totalTime = this.timeLeft;
            this.updateDisplay();
            
            // Save to localStorage
            localStorage.setItem('pomodoroSettings', JSON.stringify({
                focusTime: this.focusTime,
                breakTime: this.breakTime
            }));
        }
        
        this.closeSettings();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('pomodoroSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            this.focusTime = settings.focusTime;
            this.breakTime = settings.breakTime;
            this.timeLeft = this.focusTime * 60;
            this.totalTime = this.timeLeft;
            this.updateDisplay();
        }
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
}); 