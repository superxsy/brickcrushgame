class MatchThreeGame {
    constructor() {
        this.board = [];
        this.boardSize = 8;
        this.gemTypes = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        this.selectedGem = null;
        this.score = 0;
        this.level = 1;
        this.moves = 30;
        this.combo = 0;
        this.isAnimating = false;
        this.musicEnabled = true;
        this.soundEnabled = true;
        this.bgmTimeoutId = null;
        this.bgmTimeoutIds = []; // 用于跟踪背景音乐循环
        
        // 拖拽相关变量
        this.isDragging = false;
        this.dragStartGem = null;
        
        // 道具系统
        this.powerUps = {
            bomb: 2,      // 炸弹：消除3x3区域
            lightning: 1, // 闪电：消除整行整列
            rainbow: 1,   // 彩虹：消除同色宝石
            shuffle: 1    // 重排：重新排列棋盘
        };
        this.activePowerUp = null; // 当前激活的道具
        this.powerUpMode = false;  // 是否处于道具使用模式
        
        this.initAudio();
        this.init();
    }
    
    initAudio() {
        // 创建音频上下文和音效
        this.audioContext = null;
        this.sounds = {
            bgm: document.getElementById('bgm'),
            match: document.getElementById('match-sound'),
            swap: document.getElementById('swap-sound'),
            combo: document.getElementById('combo-sound'),
            levelUp: document.getElementById('level-up-sound')
        };
        
        // 生成音效
        this.generateSounds();
        
        // 开始播放背景音乐
        this.playBackgroundMusic();
    }
    
    generateSounds() {
        // 为每个音频元素生成简单的音效
        const generateTone = (frequency, duration, type = 'sine') => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
        
        // 为不同事件创建音效
        this.playMatchSound = () => {
            if (this.soundEnabled) {
                generateTone(523.25, 0.2); // C5
                setTimeout(() => generateTone(659.25, 0.2), 100); // E5
            }
        };
        
        this.playSwapSound = () => {
            if (this.soundEnabled) {
                generateTone(440, 0.1, 'square'); // A4
            }
        };
        
        this.playComboSound = () => {
            if (this.soundEnabled) {
                generateTone(523.25, 0.15); // C5
                setTimeout(() => generateTone(659.25, 0.15), 50); // E5
                setTimeout(() => generateTone(783.99, 0.15), 100); // G5
                setTimeout(() => generateTone(1046.50, 0.2), 150); // C6
            }
        };
        
        this.playLevelUpSound = () => {
            if (this.soundEnabled) {
                const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];
                notes.forEach((note, index) => {
                    setTimeout(() => generateTone(note, 0.2), index * 100);
                });
            }
        };
    }
    
    playBackgroundMusic() {
        // 停止之前的音乐循环和所有音符定时器
        this.stopBackgroundMusic();
        
        if (this.musicEnabled) {
            // 创建简单的背景音乐循环
            const playBGMLoop = () => {
                if (!this.musicEnabled) return;
                
                // 超级玛丽主题曲完整旋律
                const melody = [
                    // 第一段主旋律
                    {freq: 659.25, duration: 0.125}, // E5
                    {freq: 659.25, duration: 0.125}, // E5
                    {freq: 0, duration: 0.125},      // 休止符
                    {freq: 659.25, duration: 0.125}, // E5
                    {freq: 0, duration: 0.125},      // 休止符
                    {freq: 523.25, duration: 0.125}, // C5
                    {freq: 659.25, duration: 0.125}, // E5
                    {freq: 0, duration: 0.125},      // 休止符
                    {freq: 783.99, duration: 0.125}, // G5
                    {freq: 0, duration: 0.375},      // 休止符
                    {freq: 392.00, duration: 0.125}, // G4
                    {freq: 0, duration: 0.375},      // 休止符
                    
                    // 第二段
                    {freq: 523.25, duration: 0.125}, // C5
                    {freq: 0, duration: 0.25},       // 休止符
                    {freq: 392.00, duration: 0.125}, // G4
                    {freq: 0, duration: 0.25},       // 休止符
                    {freq: 329.63, duration: 0.125}, // E4
                    {freq: 0, duration: 0.25},       // 休止符
                    {freq: 440.00, duration: 0.125}, // A4
                    {freq: 0, duration: 0.125},      // 休止符
                    {freq: 493.88, duration: 0.125}, // B4
                    {freq: 0, duration: 0.125},      // 休止符
                    {freq: 466.16, duration: 0.125}, // A#4
                    {freq: 440.00, duration: 0.125}, // A4
                    {freq: 0, duration: 0.125},      // 休止符
                    
                    // 第三段
                    {freq: 392.00, duration: 0.167}, // G4
                    {freq: 659.25, duration: 0.167}, // E5
                    {freq: 783.99, duration: 0.167}, // G5
                    {freq: 880.00, duration: 0.125}, // A5
                    {freq: 0, duration: 0.125},      // 休止符
                    {freq: 698.46, duration: 0.125}, // F5
                    {freq: 783.99, duration: 0.125}, // G5
                    {freq: 0, duration: 0.125},      // 休止符
                    {freq: 659.25, duration: 0.125}, // E5
                    {freq: 0, duration: 0.125},      // 休止符
                    {freq: 523.25, duration: 0.125}, // C5
                    {freq: 587.33, duration: 0.125}, // D5
                    {freq: 493.88, duration: 0.125}, // B4
                    {freq: 0, duration: 0.25},       // 休止符
                    
                    // 第四段 - 重复主旋律变奏
                    {freq: 523.25, duration: 0.125}, // C5
                    {freq: 392.00, duration: 0.125}, // G4
                    {freq: 0, duration: 0.125},      // 休止符
                    {freq: 329.63, duration: 0.125}, // E4
                    {freq: 0, duration: 0.25},       // 休止符
                    {freq: 440.00, duration: 0.125}, // A4
                    {freq: 0, duration: 0.125},      // 休止符
                    {freq: 493.88, duration: 0.125}, // B4
                    {freq: 0, duration: 0.125},      // 休止符
                    {freq: 466.16, duration: 0.125}, // A#4
                    {freq: 440.00, duration: 0.125}, // A4
                    {freq: 0, duration: 0.125},      // 休止符
                    
                    // 第五段 - 高音部分
                    {freq: 392.00, duration: 0.125}, // G4
                    {freq: 659.25, duration: 0.125}, // E5
                    {freq: 783.99, duration: 0.125}, // G5
                    {freq: 880.00, duration: 0.125}, // A5
                    {freq: 0, duration: 0.125},      // 休止符
                    {freq: 698.46, duration: 0.125}, // F5
                    {freq: 783.99, duration: 0.125}, // G5
                    {freq: 0, duration: 0.125},      // 休止符
                    {freq: 659.25, duration: 0.125}, // E5
                    {freq: 0, duration: 0.125},      // 休止符
                    {freq: 523.25, duration: 0.125}, // C5
                    {freq: 587.33, duration: 0.125}, // D5
                    {freq: 493.88, duration: 0.125}, // B4
                    {freq: 0, duration: 0.25},       // 休止符
                    
                    // 第六段 - 结尾部分
                    {freq: 783.99, duration: 0.125}, // G5
                    {freq: 740.00, duration: 0.125}, // F#5
                    {freq: 698.46, duration: 0.125}, // F5
                    {freq: 622.25, duration: 0.125}, // D#5
                    {freq: 0, duration: 0.125},      // 休止符
                    {freq: 659.25, duration: 0.125}, // E5
                    {freq: 0, duration: 0.125},      // 休止符
                    {freq: 415.30, duration: 0.125}, // G#4
                    {freq: 440.00, duration: 0.125}, // A4
                    {freq: 523.25, duration: 0.125}, // C5
                    {freq: 0, duration: 0.125},      // 休止符
                    {freq: 440.00, duration: 0.125}, // A4
                    {freq: 523.25, duration: 0.125}, // C5
                    {freq: 587.33, duration: 0.125}, // D5
                    {freq: 0, duration: 0.25},       // 休止符
                    
                    // 第七段 - 回到主题
                    {freq: 783.99, duration: 0.125}, // G5
                    {freq: 740.00, duration: 0.125}, // F#5
                    {freq: 698.46, duration: 0.125}, // F5
                    {freq: 622.25, duration: 0.125}, // D#5
                    {freq: 0, duration: 0.125},      // 休止符
                    {freq: 659.25, duration: 0.125}, // E5
                    {freq: 0, duration: 0.125},      // 休止符
                    {freq: 1046.50, duration: 0.125}, // C6
                    {freq: 0, duration: 0.125},      // 休止符
                    {freq: 1046.50, duration: 0.125}, // C6
                    {freq: 1046.50, duration: 0.125}, // C6
                    {freq: 0, duration: 0.25},       // 休止符
                    
                    // 第八段 - 最终重复
                    {freq: 659.25, duration: 0.125}, // E5
                    {freq: 659.25, duration: 0.125}, // E5
                    {freq: 0, duration: 0.125},      // 休止符
                    {freq: 659.25, duration: 0.125}, // E5
                    {freq: 0, duration: 0.125},      // 休止符
                    {freq: 523.25, duration: 0.125}, // C5
                    {freq: 659.25, duration: 0.125}, // E5
                    {freq: 0, duration: 0.125},      // 休止符
                    {freq: 783.99, duration: 0.25},  // G5 (延长)
                    {freq: 0, duration: 0.5}         // 最终休止符
                ];
                
                let currentTime = 0;
                melody.forEach(note => {
                    const timeoutId = setTimeout(() => {
                        if (this.musicEnabled && this.audioContext) {
                            const oscillator = this.audioContext.createOscillator();
                            const gainNode = this.audioContext.createGain();
                            
                            oscillator.connect(gainNode);
                            gainNode.connect(this.audioContext.destination);
                            
                            oscillator.frequency.setValueAtTime(note.freq, this.audioContext.currentTime);
                            oscillator.type = 'triangle';
                            
                            gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + note.duration);
                            
                            oscillator.start(this.audioContext.currentTime);
                            oscillator.stop(this.audioContext.currentTime + note.duration);
                        }
                    }, currentTime * 1000);
                    
                    // 保存所有音符的定时器ID
                    this.bgmTimeoutIds.push(timeoutId);
                    currentTime += note.duration;
                });
                
                // 循环播放
                this.bgmTimeoutId = setTimeout(playBGMLoop, currentTime * 1000 + 2000);
            };
            
            // 延迟开始，避免立即播放
            this.bgmTimeoutId = setTimeout(playBGMLoop, 1000);
        }
    }
    
    stopBackgroundMusic() {
        // 停止主循环定时器
        if (this.bgmTimeoutId) {
            clearTimeout(this.bgmTimeoutId);
            this.bgmTimeoutId = null;
        }
        
        // 停止所有音符定时器
        if (this.bgmTimeoutIds) {
            this.bgmTimeoutIds.forEach(id => clearTimeout(id));
            this.bgmTimeoutIds = [];
        }
    }
    
    init() {
        this.createBoard();
        this.generateBoard();
        this.bindEvents();
        this.updateUI();
    }
    
    createBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                const gem = document.createElement('div');
                gem.className = 'gem';
                gem.dataset.row = row;
                gem.dataset.col = col;
                gameBoard.appendChild(gem);
                this.board[row][col] = {
                    element: gem,
                    type: null
                };
            }
        }
    }
    
    generateBoard() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                let gemType;
                do {
                    gemType = this.gemTypes[Math.floor(Math.random() * this.gemTypes.length)];
                } while (this.wouldCreateMatch(row, col, gemType));
                
                this.setGem(row, col, gemType);
            }
        }
    }
    
    wouldCreateMatch(row, col, type) {
        // 检查水平方向
        let horizontalCount = 1;
        for (let c = col - 1; c >= 0 && this.board[row][c].type === type; c--) {
            horizontalCount++;
        }
        for (let c = col + 1; c < this.boardSize && this.board[row][c].type === type; c++) {
            horizontalCount++;
        }
        
        // 检查垂直方向
        let verticalCount = 1;
        for (let r = row - 1; r >= 0 && this.board[r][col].type === type; r--) {
            verticalCount++;
        }
        for (let r = row + 1; r < this.boardSize && this.board[r][col].type === type; r++) {
            verticalCount++;
        }
        
        return horizontalCount >= 3 || verticalCount >= 3;
    }
    
    setGem(row, col, type) {
        this.board[row][col].type = type;
        this.board[row][col].element.className = `gem ${type}`;
    }
    
    bindEvents() {
        const gameBoard = document.getElementById('game-board');
        
        // 点击事件 - 禁用，因为我们通过mouseup处理点击
        // gameBoard.addEventListener('click', (e) => {
        //     if (e.target.classList.contains('gem') && !this.isAnimating && !this.isDragging) {
        //         this.handleGemClick(e.target);
        //     }
        // });
        
        // 拖拽事件
        gameBoard.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('gem') && !this.isAnimating) {
                this.handleMouseDown(e);
            }
        });
        
        // 将mousemove和mouseup绑定到document，确保拖拽到游戏板外也能正常工作
        document.addEventListener('mousemove', (e) => {
            if (this.mouseDownGem) {
                this.handleMouseMove(e);
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (this.mouseDownGem) {
                this.handleMouseUp(e);
            }
        });
        
        // 防止拖拽时选中文本
        gameBoard.addEventListener('selectstart', (e) => {
            e.preventDefault();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
        
        document.getElementById('hint-btn').addEventListener('click', () => {
            this.showHint();
        });
        
        document.getElementById('play-again').addEventListener('click', () => {
            this.restart();
            document.getElementById('game-over').classList.add('hidden');
        });
        
        document.getElementById('music-toggle').addEventListener('click', () => {
            this.toggleMusic();
        });
        
        document.getElementById('sound-toggle').addEventListener('click', () => {
            this.toggleSound();
        });
        
        // 道具事件绑定
        this.bindPowerUpEvents();
    }
    
    handleGemClick(gemElement) {
        const row = parseInt(gemElement.dataset.row);
        const col = parseInt(gemElement.dataset.col);
        
        console.log('点击宝石:', row, col, '当前选中:', this.selectedGem);
        
        // 如果处于道具模式，使用道具
        if (this.powerUpMode && this.activePowerUp) {
            this.usePowerUp(this.activePowerUp, row, col);
            return;
        }
        
        if (!this.selectedGem) {
            this.selectedGem = { row, col, element: gemElement };
            gemElement.classList.add('selected');
            console.log('选中宝石:', row, col);
        } else {
            if (this.selectedGem.row === row && this.selectedGem.col === col) {
                // 取消选择
                this.selectedGem.element.classList.remove('selected');
                this.selectedGem = null;
                console.log('取消选择');
            } else if (this.isAdjacent(this.selectedGem.row, this.selectedGem.col, row, col)) {
                // 尝试交换
                console.log('尝试交换:', this.selectedGem.row, this.selectedGem.col, '->', row, col);
                this.attemptSwap(this.selectedGem.row, this.selectedGem.col, row, col);
            } else {
                // 选择新的宝石
                console.log('选择新宝石:', row, col);
                this.selectedGem.element.classList.remove('selected');
                this.selectedGem = { row, col, element: gemElement };
                gemElement.classList.add('selected');
            }
        }
    }
    
    handleMouseDown(e) {
        e.preventDefault();
        // 只记录鼠标按下信息，不立即进入拖拽状态
        this.mouseDownGem = {
            element: e.target,
            row: parseInt(e.target.dataset.row),
            col: parseInt(e.target.dataset.col),
            startX: e.clientX,
            startY: e.clientY,
            startTime: Date.now()
        };
        this.isDragging = false;
    }
    
    handleMouseMove(e) {
        if (!this.mouseDownGem) return;
        
        const deltaX = e.clientX - this.mouseDownGem.startX;
        const deltaY = e.clientY - this.mouseDownGem.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const timeInterval = Date.now() - this.mouseDownGem.startTime;
        
        // 如果时间超过200ms且移动距离超过5px，开始拖拽
        if (!this.isDragging && timeInterval >= 200 && distance > 5) {
            this.isDragging = true;
            
            // 清除之前的选择
            if (this.selectedGem) {
                this.selectedGem.element.classList.remove('selected');
                this.selectedGem = null;
            }
            
            // 添加拖拽样式
            this.mouseDownGem.element.classList.add('dragging');
            this.mouseDownGem.element.style.zIndex = '1000';
        }
        
        // 如果已经在拖拽状态，更新位置
        if (this.isDragging) {
            // 移动宝石
            this.mouseDownGem.element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            
            // 检测拖拽到的目标位置
            const targetElement = document.elementFromPoint(e.clientX, e.clientY);
            
            // 移除之前的拖拽目标高亮
            document.querySelectorAll('.drag-target').forEach(el => {
                el.classList.remove('drag-target');
            });
            
            if (targetElement && targetElement.classList.contains('gem') && targetElement !== this.mouseDownGem.element) {
                const targetRow = parseInt(targetElement.dataset.row);
                const targetCol = parseInt(targetElement.dataset.col);
                
                // 检查是否相邻
                if (this.isAdjacent(this.mouseDownGem.row, this.mouseDownGem.col, targetRow, targetCol)) {
                    targetElement.classList.add('drag-target');
                }
            }
        }
    }
    
    handleMouseUp(e) {
        if (!this.mouseDownGem) return;
        
        const timeInterval = Date.now() - this.mouseDownGem.startTime;
        console.log('鼠标松开 - 时间间隔:', timeInterval + 'ms', '是否拖拽:', this.isDragging);
        
        if (this.isDragging) {
            // 执行拖拽结束逻辑
            this.handleDragEnd(e);
        } else {
            // 检查鼠标松开位置是否与按下位置相同
            const currentElement = document.elementFromPoint(e.clientX, e.clientY);
            if (currentElement && currentElement === this.mouseDownGem.element) {
                // 执行点击逻辑
                console.log('执行点击操作');
                this.handleGemClick(this.mouseDownGem.element);
            }
        }
        
        // 重置状态
        this.mouseDownGem = null;
        this.isDragging = false;
    }
    
    handleDragEnd(e) {
        console.log('拖拽结束 - 起始位置:', this.mouseDownGem.row, this.mouseDownGem.col);
        
        // 重置拖拽样式
        this.mouseDownGem.element.classList.remove('dragging');
        this.mouseDownGem.element.style.transform = '';
        this.mouseDownGem.element.style.zIndex = '';
        
        // 移除拖拽目标高亮
        document.querySelectorAll('.drag-target').forEach(el => {
            el.classList.remove('drag-target');
        });
        
        // 计算拖拽距离和方向
        const deltaX = e.clientX - this.mouseDownGem.startX;
        const deltaY = e.clientY - this.mouseDownGem.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        console.log('拖拽距离:', distance, '方向:', deltaX, deltaY);
        
        // 改进的目标检测逻辑
        let targetElement = null;
        let detectionMethod = '';
        
        // 方法1：临时隐藏拖拽元素进行精确检测
        const originalDisplay = this.mouseDownGem.element.style.display;
        this.mouseDownGem.element.style.display = 'none';
        
        const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
        
        this.mouseDownGem.element.style.display = originalDisplay;
        
        if (elementUnderMouse && elementUnderMouse.classList.contains('gem')) {
            const mouseTargetRow = parseInt(elementUnderMouse.dataset.row);
            const mouseTargetCol = parseInt(elementUnderMouse.dataset.col);
            
            // 只有当检测到的元素确实相邻时才使用精确检测结果
            if (this.isAdjacent(this.mouseDownGem.row, this.mouseDownGem.col, mouseTargetRow, mouseTargetCol)) {
                targetElement = elementUnderMouse;
                detectionMethod = '精确检测';
            } else {
                console.log('精确检测到非相邻元素，使用方向检测');
                detectionMethod = '精确检测失效，转方向检测';
            }
        }
        
        if (!targetElement) {
            // 方法2：基于拖拽方向的智能检测
            const threshold = 25;
            let targetRow = this.mouseDownGem.row;
            let targetCol = this.mouseDownGem.col;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平拖拽
                if (Math.abs(deltaX) > threshold) {
                    targetCol += deltaX > 0 ? 1 : -1;
                }
            } else {
                // 垂直拖拽
                if (Math.abs(deltaY) > threshold) {
                    targetRow += deltaY > 0 ? 1 : -1;
                }
            }
            
            if (targetRow >= 0 && targetRow < this.boardSize && 
                targetCol >= 0 && targetCol < this.boardSize &&
                (targetRow !== this.mouseDownGem.row || targetCol !== this.mouseDownGem.col)) {
                targetElement = this.board[targetRow][targetCol].element;
                detectionMethod = '方向检测';
            }
        }
        
        console.log('检测方法:', detectionMethod);
        
        // 尝试交换
        if (targetElement && targetElement !== this.mouseDownGem.element) {
            const targetRow = parseInt(targetElement.dataset.row);
            const targetCol = parseInt(targetElement.dataset.col);
            
            console.log('目标位置:', targetRow, targetCol);
            
            // 检查是否相邻
            const isAdjacent = this.isAdjacent(this.mouseDownGem.row, this.mouseDownGem.col, targetRow, targetCol);
            console.log('是否相邻:', isAdjacent);
            
            if (isAdjacent) {
                console.log('执行交换');
                this.attemptSwap(this.mouseDownGem.row, this.mouseDownGem.col, targetRow, targetCol);
            } else {
                console.log('不相邻，交换失败');
            }
        } else {
            console.log('未找到有效目标');
        }
    }
    
    isAdjacent(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }
    
    async attemptSwap(row1, col1, row2, col2) {
        this.isAnimating = true;
        
        // 播放交换音效
        this.playSwapSound();
        
        // 交换宝石
        this.swapGems(row1, col1, row2, col2);
        
        // 检查是否有匹配
        const matches = this.findMatches();
        
        if (matches.length > 0) {
            // 有匹配，消耗步数
            this.moves--;
            
            // 清除选择状态（如果存在）
            if (this.selectedGem) {
                this.selectedGem.element.classList.remove('selected');
                this.selectedGem = null;
            }
            
            // 处理匹配
            await this.processMatches();
        } else {
            // 没有匹配，交换回来
            this.swapGems(row1, col1, row2, col2);
            
            // 清除选择状态（如果存在）
            if (this.selectedGem) {
                this.selectedGem.element.classList.remove('selected');
                this.selectedGem = null;
            }
        }
        
        this.updateUI();
        this.checkGameOver();
        this.isAnimating = false;
    }
    
    swapGems(row1, col1, row2, col2) {
        const temp = this.board[row1][col1].type;
        this.setGem(row1, col1, this.board[row2][col2].type);
        this.setGem(row2, col2, temp);
    }
    
    findMatches() {
        const matches = [];
        
        // 检查水平匹配
        for (let row = 0; row < this.boardSize; row++) {
            let count = 1;
            let currentType = this.board[row][0].type;
            
            for (let col = 1; col < this.boardSize; col++) {
                if (this.board[row][col].type === currentType) {
                    count++;
                } else {
                    if (count >= 3) {
                        for (let i = col - count; i < col; i++) {
                            matches.push({ row, col: i });
                        }
                    }
                    count = 1;
                    currentType = this.board[row][col].type;
                }
            }
            
            if (count >= 3) {
                for (let i = this.boardSize - count; i < this.boardSize; i++) {
                    matches.push({ row, col: i });
                }
            }
        }
        
        // 检查垂直匹配
        for (let col = 0; col < this.boardSize; col++) {
            let count = 1;
            let currentType = this.board[0][col].type;
            
            for (let row = 1; row < this.boardSize; row++) {
                if (this.board[row][col].type === currentType) {
                    count++;
                } else {
                    if (count >= 3) {
                        for (let i = row - count; i < row; i++) {
                            matches.push({ row: i, col });
                        }
                    }
                    count = 1;
                    currentType = this.board[row][col].type;
                }
            }
            
            if (count >= 3) {
                for (let i = this.boardSize - count; i < this.boardSize; i++) {
                    matches.push({ row: i, col });
                }
            }
        }
        
        return matches;
    }
    
    async processMatches() {
        let totalMatches = 0;
        
        while (true) {
            const matches = this.findMatches();
            if (matches.length === 0) break;
            
            totalMatches += matches.length;
            this.combo++;
            
            // 播放匹配音效
            this.playMatchSound();
            
            // 标记匹配的宝石
            matches.forEach(match => {
                this.board[match.row][match.col].element.classList.add('matching');
            });
            
            await this.delay(300);
            
            // 创建爆炸效果和粒子
            matches.forEach(match => {
                this.createExplosion(match.row, match.col);
                this.createParticles(match.row, match.col);
            });
            
            // 播放爆炸动画
            matches.forEach(match => {
                this.board[match.row][match.col].element.classList.add('exploding');
            });
            
            await this.delay(500);
            
            // 移除匹配的宝石
            matches.forEach(match => {
                this.board[match.row][match.col].type = null;
                this.board[match.row][match.col].element.className = 'gem';
            });
            
            // 下落宝石
            await this.dropGems();
            
            // 填充新宝石
            await this.fillBoard();
        }
        
        if (totalMatches > 0) {
            // 奖励道具（基于匹配数量）
            this.awardPowerUps(totalMatches);
            
            const baseScore = totalMatches * 10;
            // 连击奖励：连击数越多，奖励越多
            let comboBonus = 0;
            if (this.combo > 1) {
                comboBonus = (this.combo - 1) * 50 * this.combo; // 连击数平方增长
            }
            const totalScore = baseScore + comboBonus;
            
            this.score += totalScore;
            this.showScorePopup(totalScore);
            
            // 步数奖励机制：无连击0步数，2连击+1步数，3连击+2步数，4连击+3步数
            if (this.combo === 1) {
                // 无连击：0步数（不做任何操作）
            } else if (this.combo >= 2) {
                this.moves += (this.combo - 1); // 2连击+1，3连击+2，4连击+3，以此类推
            }
            
            if (this.combo > 1) {
                this.showComboText();
                this.playComboSound();
            }
        }
        
        this.combo = 0;
    }
    
    async dropGems() {
        for (let col = 0; col < this.boardSize; col++) {
            let writeRow = this.boardSize - 1;
            
            for (let row = this.boardSize - 1; row >= 0; row--) {
                if (this.board[row][col].type !== null) {
                    if (row !== writeRow) {
                        this.setGem(writeRow, col, this.board[row][col].type);
                        this.board[row][col].type = null;
                        this.board[row][col].element.className = 'gem';
                        
                        // 添加下落动画
                        this.board[writeRow][col].element.classList.add('falling');
                    }
                    writeRow--;
                }
            }
        }
        
        await this.delay(300);
        
        // 移除下落动画类
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                this.board[row][col].element.classList.remove('falling');
            }
        }
    }
    
    async fillBoard() {
        for (let col = 0; col < this.boardSize; col++) {
            for (let row = 0; row < this.boardSize; row++) {
                if (this.board[row][col].type === null) {
                    const gemType = this.gemTypes[Math.floor(Math.random() * this.gemTypes.length)];
                    this.setGem(row, col, gemType);
                    this.board[row][col].element.classList.add('falling');
                }
            }
        }
        
        await this.delay(300);
        
        // 移除下落动画类
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                this.board[row][col].element.classList.remove('falling');
            }
        }
    }
    
    createParticles(row, col) {
        const container = document.getElementById('particles-container');
        const gemElement = this.board[row][col].element;
        const rect = gemElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        const centerX = rect.left - containerRect.left + rect.width / 2;
        const centerY = rect.top - containerRect.top + rect.height / 2;
        
        const gemType = this.board[row][col].type;
        const colors = {
            red: '#ff6b6b',
            blue: '#4ecdc4',
            green: '#95e1d3',
            yellow: '#fce38a',
            purple: '#a8e6cf',
            orange: '#ffaaa5'
        };
        
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.backgroundColor = colors[gemType];
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            
            const angle = (i / 12) * Math.PI * 2;
            const distance = 50 + Math.random() * 30;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            
            particle.style.setProperty('--dx', dx + 'px');
            particle.style.setProperty('--dy', dy + 'px');
            
            container.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }
    }
    
    createExplosion(row, col) {
        // 这里可以添加更复杂的爆炸效果
        const gemElement = this.board[row][col].element;
        gemElement.style.transform = 'scale(1.5)';
        
        setTimeout(() => {
            gemElement.style.transform = '';
        }, 200);
    }
    
    createFireworks() {
        // 创建升级烟花特效
        const container = document.querySelector('.game-container');
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.className = 'firework';
                firework.style.position = 'absolute';
                firework.style.left = Math.random() * 80 + 10 + '%';
                firework.style.top = Math.random() * 60 + 20 + '%';
                firework.style.width = '4px';
                firework.style.height = '4px';
                firework.style.borderRadius = '50%';
                firework.style.pointerEvents = 'none';
                firework.style.zIndex = '1000';
                
                const colors = ['#ff6b6b', '#4ecdc4', '#95e1d3', '#fce38a', '#a8e6cf', '#ffaaa5'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                firework.style.backgroundColor = color;
                firework.style.boxShadow = `0 0 20px ${color}`;
                
                container.appendChild(firework);
                
                // 烟花爆炸效果
                setTimeout(() => {
                    for (let j = 0; j < 12; j++) {
                        const spark = document.createElement('div');
                        spark.style.position = 'absolute';
                        spark.style.width = '3px';
                        spark.style.height = '3px';
                        spark.style.backgroundColor = color;
                        spark.style.borderRadius = '50%';
                        spark.style.pointerEvents = 'none';
                        spark.style.left = firework.style.left;
                        spark.style.top = firework.style.top;
                        
                        const angle = (j / 12) * Math.PI * 2;
                        const distance = 80 + Math.random() * 40;
                        const dx = Math.cos(angle) * distance;
                        const dy = Math.sin(angle) * distance;
                        
                        spark.style.transition = 'all 1s ease-out';
                        container.appendChild(spark);
                        
                        setTimeout(() => {
                            spark.style.transform = `translate(${dx}px, ${dy}px)`;
                            spark.style.opacity = '0';
                        }, 50);
                        
                        setTimeout(() => {
                            if (spark.parentNode) {
                                spark.parentNode.removeChild(spark);
                            }
                        }, 1100);
                    }
                    
                    if (firework.parentNode) {
                        firework.parentNode.removeChild(firework);
                    }
                }, 200);
            }, i * 300);
        }
    }
    
    playCelebrationSound() {
        // 播放庆祝音效
        if (!this.soundEnabled || !this.audioContext) return;
        
        const celebrationMelody = [
            {freq: 523.25, duration: 0.1}, // C5
            {freq: 659.25, duration: 0.1}, // E5
            {freq: 783.99, duration: 0.1}, // G5
            {freq: 1046.50, duration: 0.2}, // C6
            {freq: 783.99, duration: 0.1}, // G5
            {freq: 1046.50, duration: 0.3}  // C6
        ];
        
        let currentTime = this.audioContext.currentTime;
        
        celebrationMelody.forEach(note => {
            if (note.freq > 0) {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(note.freq, currentTime);
                oscillator.type = 'triangle';
                
                gainNode.gain.setValueAtTime(0, currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + note.duration);
                
                oscillator.start(currentTime);
                oscillator.stop(currentTime + note.duration);
            }
            currentTime += note.duration;
        });
    }
    
    showScorePopup(score) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = '+' + score;
        popup.style.left = '50%';
        popup.style.top = '50%';
        
        document.querySelector('.game-board-container').appendChild(popup);
        
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 1000);
    }
    
    showComboText() {
        const comboText = document.createElement('div');
        comboText.className = 'combo-text';
        comboText.textContent = `${this.combo}x COMBO!`;
        
        document.querySelector('.game-board-container').appendChild(comboText);
        
        setTimeout(() => {
            if (comboText.parentNode) {
                comboText.parentNode.removeChild(comboText);
            }
        }, 1000);
    }
    
    showHint() {
        // 简单的提示系统：高亮一个可能的移动
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize - 1; col++) {
                // 尝试水平交换
                this.swapGems(row, col, row, col + 1);
                if (this.findMatches().length > 0) {
                    this.swapGems(row, col, row, col + 1); // 交换回来
                    this.board[row][col].element.style.boxShadow = '0 0 20px #fff';
                    this.board[row][col + 1].element.style.boxShadow = '0 0 20px #fff';
                    
                    setTimeout(() => {
                        this.board[row][col].element.style.boxShadow = '';
                        this.board[row][col + 1].element.style.boxShadow = '';
                    }, 2000);
                    return;
                }
                this.swapGems(row, col, row, col + 1); // 交换回来
            }
        }
        
        for (let row = 0; row < this.boardSize - 1; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                // 尝试垂直交换
                this.swapGems(row, col, row + 1, col);
                if (this.findMatches().length > 0) {
                    this.swapGems(row, col, row + 1, col); // 交换回来
                    this.board[row][col].element.style.boxShadow = '0 0 20px #fff';
                    this.board[row + 1][col].element.style.boxShadow = '0 0 20px #fff';
                    
                    setTimeout(() => {
                        this.board[row][col].element.style.boxShadow = '';
                        this.board[row + 1][col].element.style.boxShadow = '';
                    }, 2000);
                    return;
                }
                this.swapGems(row, col, row + 1, col); // 交换回来
            }
        }
    }
    
    updateUI() {
        // 检查升级
        const newLevel = Math.floor(this.score / 1000) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            // 取消升级步数奖励
            this.playLevelUpSound(); // 播放升级音效
            this.createFireworks(); // 创建烟花特效
            this.playCelebrationSound(); // 播放庆祝音效
        }
        
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('moves').textContent = this.moves;
        
        // 更新道具UI
        this.updatePowerUpUI();
    }
    
    checkGameOver() {
        if (this.moves <= 0) {
            document.getElementById('final-score').textContent = this.score;
            document.getElementById('game-over').classList.remove('hidden');
        }
    }
    
    restart() {
        this.score = 0;
        this.level = 1;
        this.moves = 30;
        this.combo = 0;
        this.selectedGem = null;
        this.isAnimating = false;
        
        // 重置道具
        this.powerUps = {
            bomb: 2,
            lightning: 1,
            rainbow: 1
        };
        this.activePowerUp = null;
        this.powerUpMode = false;
        
        this.generateBoard();
        this.updateUI();
        this.updatePowerUpUI();
    }
    
    // 道具系统方法
    bindPowerUpEvents() {
        const powerUps = document.querySelectorAll('.power-up');
        powerUps.forEach(powerUp => {
            powerUp.addEventListener('click', () => {
                const type = powerUp.dataset.type;
                this.activatePowerUp(type);
            });
        });
    }
    
    activatePowerUp(type) {
        if (this.powerUps[type] <= 0 || this.isAnimating) return;
        
        // 如果已经激活了道具，先取消
        if (this.activePowerUp) {
            this.deactivatePowerUp();
        }
        
        this.activePowerUp = type;
        this.powerUpMode = true;
        
        // 更新UI
        document.querySelectorAll('.power-up').forEach(el => {
            el.classList.remove('active');
        });
        document.getElementById(`${type}-power`).classList.add('active');
        
        // 改变游戏板状态
        document.getElementById('game-board').classList.add('power-up-mode');
        

    }
    
    deactivatePowerUp() {
        this.activePowerUp = null;
        this.powerUpMode = false;
        
        document.querySelectorAll('.power-up').forEach(el => {
            el.classList.remove('active');
        });
        document.getElementById('game-board').classList.remove('power-up-mode');
    }
    
    async usePowerUp(type, row = null, col = null) {
        if (this.powerUps[type] <= 0) return;
        
        this.powerUps[type]--;
        this.updatePowerUpUI();
        
        // 播放道具使用动画
        const powerUpElement = document.getElementById(`${type}-power`);
        powerUpElement.classList.add('power-up-used');
        setTimeout(() => {
            powerUpElement.classList.remove('power-up-used');
        }, 600);
        
        this.isAnimating = true;
        
        switch (type) {
            case 'bomb':
                await this.useBombPowerUp(row, col);
                break;
            case 'lightning':
                await this.useLightningPowerUp(row, col);
                break;
            case 'rainbow':
                await this.useRainbowPowerUp(row, col);
                break;
        }
        
        this.deactivatePowerUp();
        this.isAnimating = false;
        
        // 检查是否有新的匹配
        await this.processMatches();
        
        this.checkGameOver();
    }
    
    async useBombPowerUp(row, col) {
        // 消除3x3区域
        const gemsToRemove = [];
        
        for (let r = Math.max(0, row - 1); r <= Math.min(this.boardSize - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(this.boardSize - 1, col + 1); c++) {
                if (this.board[r][c].type !== null) {
                    gemsToRemove.push({row: r, col: c});
                }
            }
        }
        
        // 创建爆炸效果
        gemsToRemove.forEach(gem => {
            this.createExplosion(gem.row, gem.col);
            this.createParticles(gem.row, gem.col);
            this.board[gem.row][gem.col].element.classList.add('exploding');
        });
        
        await this.delay(500);
        
        // 移除宝石
        gemsToRemove.forEach(gem => {
            this.board[gem.row][gem.col].type = null;
            this.board[gem.row][gem.col].element.className = 'gem';
        });
        
        // 计算分数
        const score = gemsToRemove.length * 15;
        this.score += score;
        this.showScorePopup(score);
        
        // 下落和填充
        await this.dropGems();
        await this.fillBoard();
    }
    
    async useLightningPowerUp(row, col) {
        // 消除整行整列
        const gemsToRemove = [];
        
        // 添加整行
        for (let c = 0; c < this.boardSize; c++) {
            if (this.board[row][c].type !== null) {
                gemsToRemove.push({row: row, col: c});
            }
        }
        
        // 添加整列
        for (let r = 0; r < this.boardSize; r++) {
            if (this.board[r][col].type !== null && !gemsToRemove.some(gem => gem.row === r && gem.col === col)) {
                gemsToRemove.push({row: r, col: col});
            }
        }
        
        // 创建闪电效果
        gemsToRemove.forEach(gem => {
            this.createExplosion(gem.row, gem.col);
            this.createParticles(gem.row, gem.col);
            this.board[gem.row][gem.col].element.classList.add('exploding');
        });
        
        await this.delay(500);
        
        // 移除宝石
        gemsToRemove.forEach(gem => {
            this.board[gem.row][gem.col].type = null;
            this.board[gem.row][gem.col].element.className = 'gem';
        });
        
        // 计算分数
        const score = gemsToRemove.length * 12;
        this.score += score;
        this.showScorePopup(score);
        
        // 下落和填充
        await this.dropGems();
        await this.fillBoard();
    }
    
    async useRainbowPowerUp(row, col) {
        // 消除同色宝石
        const targetType = this.board[row][col].type;
        if (!targetType) return;
        
        const gemsToRemove = [];
        
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                if (this.board[r][c].type === targetType) {
                    gemsToRemove.push({row: r, col: c});
                }
            }
        }
        
        // 创建彩虹效果
        gemsToRemove.forEach(gem => {
            this.createExplosion(gem.row, gem.col);
            this.createParticles(gem.row, gem.col);
            this.board[gem.row][gem.col].element.classList.add('exploding');
        });
        
        await this.delay(500);
        
        // 移除宝石
        gemsToRemove.forEach(gem => {
            this.board[gem.row][gem.col].type = null;
            this.board[gem.row][gem.col].element.className = 'gem';
        });
        
        // 计算分数
        const score = gemsToRemove.length * 20;
        this.score += score;
        this.showScorePopup(score);
        
        // 下落和填充
        await this.dropGems();
        await this.fillBoard();
    }
    

    
    // 道具获取机制
    awardPowerUps(matchCount) {
        // 根据消除的宝石数量奖励道具
        if (matchCount >= 5) {
            // 消除5个或以上宝石，随机获得一个道具
            const powerUpTypes = ['bomb', 'lightning', 'rainbow'];
            const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
            this.powerUps[randomType]++;
            
            // 显示获得道具的提示
            this.showPowerUpAward(randomType);
        } else if (matchCount >= 4) {
            // 消除4个宝石，有50%概率获得炸弹
            if (Math.random() < 0.5) {
                this.powerUps.bomb++;
                this.showPowerUpAward('bomb');
            }
        }
        
        this.updatePowerUpUI();
    }
    
    showPowerUpAward(type) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.style.color = '#ffd700';
        popup.style.fontSize = '20px';
        
        const icons = {
            bomb: '💣',
            lightning: '⚡',
            rainbow: '🌈'
        };
        
        popup.textContent = `获得道具 ${icons[type]}`;
        popup.style.left = '50%';
        popup.style.top = '30%';
        
        document.querySelector('.game-board-container').appendChild(popup);
        
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 2000);
    }
    
    updatePowerUpUI() {
        document.getElementById('bomb-count').textContent = this.powerUps.bomb;
        document.getElementById('lightning-count').textContent = this.powerUps.lightning;
        document.getElementById('rainbow-count').textContent = this.powerUps.rainbow;
        
        // 更新道具可用状态
        Object.keys(this.powerUps).forEach(type => {
            const element = document.getElementById(`${type}-power`);
            if (element) { // 检查元素是否存在
                if (this.powerUps[type] > 0) {
                    element.classList.remove('disabled');
                } else {
                    element.classList.add('disabled');
                }
            }
        });
    }
    
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        const button = document.getElementById('music-toggle');
        
        // 停止所有音乐定时器
        this.stopBackgroundMusic();
        
        if (this.musicEnabled) {
            button.textContent = '🎵 音乐';
            button.style.opacity = '1';
            // 恢复音频上下文
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            // 重新开始背景音乐
            setTimeout(() => this.playBackgroundMusic(), 100);
        } else {
            button.textContent = '🔇 音乐';
            button.style.opacity = '0.6';
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const button = document.getElementById('sound-toggle');
        
        if (this.soundEnabled) {
            button.textContent = '🔊 音效';
            button.style.opacity = '1';
        } else {
            button.textContent = '🔇 音效';
            button.style.opacity = '0.6';
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 启动游戏
window.addEventListener('DOMContentLoaded', () => {
    const game = new MatchThreeGame();
    
    // 添加用户交互启动音频
    const startAudio = () => {
        if (game.audioContext && game.audioContext.state === 'suspended') {
            game.audioContext.resume();
        }
        document.removeEventListener('click', startAudio);
        document.removeEventListener('keydown', startAudio);
    };
    
    document.addEventListener('click', startAudio);
    document.addEventListener('keydown', startAudio);
});

// 添加一些额外的视觉效果
document.addEventListener('DOMContentLoaded', () => {
    // 创建背景粒子效果
    function createBackgroundParticles() {
        const container = document.body;
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animation = `float ${3 + Math.random() * 4}s ease-in-out infinite`;
            particle.style.animationDelay = Math.random() * 2 + 's';
            
            container.appendChild(particle);
        }
    }
    
    // 添加浮动动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }
    `;
    document.head.appendChild(style);
    
    createBackgroundParticles();
});