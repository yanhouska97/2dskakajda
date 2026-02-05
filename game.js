// Získání canvasu a kontextu
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Nastavení velikosti canvasu
canvas.width = 800;
canvas.height = 600;

// Herní proměnné
let score = 0;
let lives = 3;
let currentLevel = 1;
let isInvincible = false;
let invincibilityTimer = 0;

const scoreElement = document.getElementById('score');
const heartsElement = document.getElementById('hearts');
const levelElement = document.getElementById('currentLevel');

// Objekt hráče
const player = {
    x: 100,
    y: 100,
    width: 40,
    height: 40,
    color: '#FF0000',
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    jumpPower: 12,
    isJumping: false,
    onGround: false
};

// Gravitace
const gravity = 0.5;

// Klávesy
const keys = {
    a: false,
    d: false,
    space: false
};

// Level 1 data
const level1Data = {
    platforms: [
        { x: 0, y: 550, width: 800, height: 50, color: '#8B4513' },
        { x: 200, y: 450, width: 150, height: 20, color: '#8B4513' },
        { x: 450, y: 350, width: 150, height: 20, color: '#8B4513' },
        { x: 100, y: 250, width: 120, height: 20, color: '#8B4513' },
        { x: 600, y: 450, width: 150, height: 20, color: '#8B4513' },
        { x: 350, y: 150, width: 100, height: 20, color: '#8B4513' }
    ],
    coins: [
        { x: 250, y: 400, width: 20, height: 20, collected: false },
        { x: 500, y: 300, width: 20, height: 20, collected: false },
        { x: 150, y: 200, width: 20, height: 20, collected: false },
        { x: 650, y: 400, width: 20, height: 20, collected: false },
        { x: 400, y: 100, width: 20, height: 20, collected: false },
        { x: 700, y: 500, width: 20, height: 20, collected: false },
        { x: 50, y: 500, width: 20, height: 20, collected: false }
    ],
    enemies: [
        { x: 300, y: 420, width: 30, height: 30, speed: 2, direction: 1, minX: 200, maxX: 350 },
        { x: 500, y: 320, width: 30, height: 30, speed: 1.5, direction: 1, minX: 450, maxX: 600 },
        { x: 650, y: 420, width: 30, height: 30, speed: 2, direction: -1, minX: 600, maxX: 750 }
    ],
    door: { x: 700, y: 480, width: 50, height: 70 },
    playerStart: { x: 50, y: 100 }
};

// Level 2 data
const level2Data = {
    platforms: [
        { x: 0, y: 550, width: 300, height: 50, color: '#8B4513' },
        { x: 500, y: 550, width: 300, height: 50, color: '#8B4513' },
        { x: 350, y: 450, width: 100, height: 20, color: '#8B4513' },
        { x: 100, y: 400, width: 120, height: 20, color: '#8B4513' },
        { x: 600, y: 400, width: 120, height: 20, color: '#8B4513' },
        { x: 250, y: 300, width: 100, height: 20, color: '#8B4513' },
        { x: 450, y: 300, width: 100, height: 20, color: '#8B4513' },
        { x: 350, y: 200, width: 100, height: 20, color: '#8B4513' },
        { x: 150, y: 150, width: 80, height: 20, color: '#8B4513' },
        { x: 570, y: 150, width: 80, height: 20, color: '#8B4513' }
    ],
    coins: [
        { x: 150, y: 350, width: 20, height: 20, collected: false },
        { x: 400, y: 420, width: 20, height: 20, collected: false },
        { x: 650, y: 350, width: 20, height: 20, collected: false },
        { x: 290, y: 250, width: 20, height: 20, collected: false },
        { x: 490, y: 250, width: 20, height: 20, collected: false },
        { x: 400, y: 150, width: 20, height: 20, collected: false },
        { x: 190, y: 100, width: 20, height: 20, collected: false },
        { x: 610, y: 100, width: 20, height: 20, collected: false }
    ],
    enemies: [
        { x: 150, y: 370, width: 30, height: 30, speed: 2, direction: 1, minX: 100, maxX: 220 },
        { x: 630, y: 370, width: 30, height: 30, speed: 2, direction: -1, minX: 600, maxX: 720 },
        { x: 280, y: 270, width: 30, height: 30, speed: 1.5, direction: 1, minX: 250, maxX: 350 },
        { x: 480, y: 270, width: 30, height: 30, speed: 1.5, direction: -1, minX: 450, maxX: 550 },
        { x: 190, y: 120, width: 30, height: 30, speed: 1, direction: 1, minX: 150, maxX: 230 },
        { x: 610, y: 120, width: 30, height: 30, speed: 1, direction: -1, minX: 570, maxX: 650 }
    ],
    door: { x: 375, y: 130, width: 50, height: 70 },
    playerStart: { x: 50, y: 480 }
};

// Aktuální herní data
let platforms = [...level1Data.platforms];
let coins = JSON.parse(JSON.stringify(level1Data.coins));
let enemies = JSON.parse(JSON.stringify(level1Data.enemies));
let door = { ...level1Data.door };

// Event listenery pro klávesy
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'a') keys.a = true;
    if (e.key.toLowerCase() === 'd') keys.d = true;
    if (e.key === ' ' || e.key === 'Spacebar') {
        keys.space = true;
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 'a') keys.a = false;
    if (e.key.toLowerCase() === 'd') keys.d = false;
    if (e.key === ' ' || e.key === 'Spacebar') keys.space = false;
});

// Funkce pro aktualizaci životů
function updateLives() {
    const hearts = '❤️'.repeat(lives);
    heartsElement.textContent = hearts;
}

// Funkce pro ztrátu života
function loseLife() {
    if (isInvincible) return;
    
    lives--;
    updateLives();
    isInvincible = true;
    invincibilityTimer = 120; // 2 sekundy nesmrtelnosti
    
    if (lives <= 0) {
        alert('Prohra! Tvoje skóre: ' + score);
        resetGame();
    } else {
        // Reset pozice hráče
        if (currentLevel === 1) {
            player.x = level1Data.playerStart.x;
            player.y = level1Data.playerStart.y;
        } else {
            player.x = level2Data.playerStart.x;
            player.y = level2Data.playerStart.y;
        }
        player.velocityX = 0;
        player.velocityY = 0;
    }
}

// Funkce pro reset hry
function resetGame() {
    lives = 3;
    score = 0;
    currentLevel = 1;
    updateLives();
    scoreElement.textContent = score;
    levelElement.textContent = currentLevel;
    loadLevel(1);
}

// Funkce pro načtení levelu
function loadLevel(levelNum) {
    currentLevel = levelNum;
    levelElement.textContent = currentLevel;
    
    if (levelNum === 1) {
        platforms = [...level1Data.platforms];
        coins = JSON.parse(JSON.stringify(level1Data.coins));
        enemies = JSON.parse(JSON.stringify(level1Data.enemies));
        door = { ...level1Data.door };
        player.x = level1Data.playerStart.x;
        player.y = level1Data.playerStart.y;
    } else if (levelNum === 2) {
        platforms = [...level2Data.platforms];
        coins = JSON.parse(JSON.stringify(level2Data.coins));
        enemies = JSON.parse(JSON.stringify(level2Data.enemies));
        door = { ...level2Data.door };
        player.x = level2Data.playerStart.x;
        player.y = level2Data.playerStart.y;
    }
    
    player.velocityX = 0;
    player.velocityY = 0;
}

// Funkce pro kontrolu, zda jsou všechny coiny sebrané
function allCoinsCollected() {
    return coins.every(coin => coin.collected);
}

// Funkce pro kreslení hráče
function drawPlayer() {
    // Blikání při nesmrtelnosti
    if (isInvincible && Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }
    
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Oči
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(player.x + 10, player.y + 10, 8, 8);
    ctx.fillRect(player.x + 22, player.y + 10, 8, 8);
    
    // Zorničky
    ctx.fillStyle = '#000000';
    ctx.fillRect(player.x + 13, player.y + 13, 4, 4);
    ctx.fillRect(player.x + 25, player.y + 13, 4, 4);
    
    ctx.globalAlpha = 1.0;
}

// Funkce pro kreslení platforem
function drawPlatforms() {
    platforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        for (let i = 0; i < platform.width; i += 30) {
            ctx.beginPath();
            ctx.moveTo(platform.x + i, platform.y);
            ctx.lineTo(platform.x + i, platform.y + platform.height);
            ctx.stroke();
        }
    });
}

// Funkce pro kreslení žetonek
function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            const time = Date.now() / 200;
            const scale = Math.abs(Math.sin(time)) * 0.3 + 0.7;
            
            ctx.save();
            ctx.translate(coin.x + coin.width / 2, coin.y + coin.height / 2);
            ctx.scale(scale, 1);
            
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, coin.width / 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#FFA500';
            ctx.beginPath();
            ctx.arc(0, 0, coin.width / 3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    });
}

// Funkce pro kreslení nepřátel
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = '#8B008B';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Oči nepřítele
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(enemy.x + 5, enemy.y + 8, 6, 6);
        ctx.fillRect(enemy.x + 19, enemy.y + 8, 6, 6);
        
        // Zlý úsměv
        ctx.fillStyle = '#000000';
        ctx.fillRect(enemy.x + 8, enemy.y + 20, 14, 3);
    });
}

// Funkce pro kreslení dveří
function drawDoor() {
    const allCollected = allCoinsCollected();
    
    // Dveře
    if (allCollected) {
        ctx.fillStyle = '#00FF00'; // Zelené když jsou všechny coiny sebrané
    } else {
        ctx.fillStyle = '#888888'; // Šedé když nejsou
    }
    ctx.fillRect(door.x, door.y, door.width, door.height);
    
    // Okraje dveří
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(door.x, door.y, door.width, door.height);
    
    // Klika
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(door.x + 40, door.y + 35, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Nápis
    if (!allCollected) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Locked', door.x + door.width / 2, door.y + door.height + 15);
    } else {
        ctx.fillStyle = '#00FF00';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Enter!', door.x + door.width / 2, door.y + door.height + 15);
    }
}

// Funkce pro kontrolu kolize
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Aktualizace nepřátel
function updateEnemies() {
    enemies.forEach(enemy => {
        enemy.x += enemy.speed * enemy.direction;
        
        // Odraz od hranic
        if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) {
            enemy.direction *= -1;
        }
        
        // Kontrola kolize s hráčem
        if (checkCollision(player, enemy)) {
            loseLife();
        }
    });
}

// Aktualizace fyziky hráče
function updatePlayer() {
    // Horizontální pohyb
    player.velocityX = 0;
    if (keys.a) player.velocityX = -player.speed;
    if (keys.d) player.velocityX = player.speed;
    
    // Skok
    if (keys.space && player.onGround) {
        player.velocityY = -player.jumpPower;
        player.onGround = false;
    }
    
    // Aplikace gravitace
    player.velocityY += gravity;
    
    // Aktualizace pozice
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Kontrola kolize s hranicemi canvasu
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    
    // Kontrola pádu mimo obrazovku
    if (player.y > canvas.height) {
        loseLife();
    }
    
    // Kontrola kolize s platformami
    player.onGround = false;
    platforms.forEach(platform => {
        if (checkCollision(player, platform)) {
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.onGround = true;
            }
            else if (player.velocityY < 0 && player.y - player.velocityY >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
            else {
                if (player.velocityX > 0) {
                    player.x = platform.x - player.width;
                } else if (player.velocityX < 0) {
                    player.x = platform.x + platform.width;
                }
            }
        }
    });
    
    // Aktualizace nesmrtelnosti
    if (isInvincible) {
        invincibilityTimer--;
        if (invincibilityTimer <= 0) {
            isInvincible = false;
        }
    }
}

// Kontrola sbírání žetonek
function checkCoinCollection() {
    coins.forEach(coin => {
        if (!coin.collected && checkCollision(player, coin)) {
            coin.collected = true;
            score += 10;
            scoreElement.textContent = score;
        }
    });
}

// Kontrola vstupu do dveří
function checkDoorEntry() {
    if (checkCollision(player, door) && allCoinsCollected()) {
        if (currentLevel === 1) {
            loadLevel(2);
        } else if (currentLevel === 2) {
            alert('Gratuluju! Dokončil jsi hru! Celkové skóre: ' + score);
            resetGame();
        }
    }
}

// Hlavní herní smyčka
function gameLoop() {
    // Vyčištění canvasu
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Aktualizace a kreslení
    updatePlayer();
    updateEnemies();
    checkCoinCollection();
    checkDoorEntry();
    
    drawPlatforms();
    drawCoins();
    drawEnemies();
    drawDoor();
    drawPlayer();
    
    // Další snímek
    requestAnimationFrame(gameLoop);
}

// Spuštění hry
updateLives();
gameLoop();
