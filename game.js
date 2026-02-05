// Získání canvasu a kontextu
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Nastavení velikosti canvasu
canvas.width = 800;
canvas.height = 600;

// Načítání obrázků
const images = {
    player: new Image(),
    enemy: new Image(),
    background: new Image()
};

let imagesLoaded = 0;
const totalImages = 3;

// Funkce pro kontrolu načtení všech obrázků
function checkImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        console.log('Všechny obrázky načteny!');
        updateLives();
        gameLoop();
    }
}

// Načtení obrázků
images.player.onload = checkImagesLoaded;
images.player.src = 'player.png';

images.enemy.onload = checkImagesLoaded;
images.enemy.src = 'enemy.png';

images.background.onload = checkImagesLoaded;
images.background.src = 'background.png';

// Herní proměnné
let score = 0;
let lives = 3;
let currentLevel = 1;
let isInvincible = false;
let invincibilityTimer = 0;

// Kamera
const camera = {
    x: 0,
    y: 0
};

const scoreElement = document.getElementById('score');
const heartsElement = document.getElementById('hearts');
const levelElement = document.getElementById('currentLevel');

// Objekt hráče
const player = {
    x: 100,
    y: 100,
    width: 40,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    jumpPower: 12,
    isJumping: false,
    onGround: false,
    facingRight: true
};

// Střely (ohnivé koule)
let fireballs = [];

// Gravitace
const gravity = 0.5;

// Klávesy
const keys = {
    a: false,
    d: false,
    space: false,
    k: false
};

// Level 1 data - DELŠÍ MAPA!
const level1Data = {
    worldWidth: 3000,
    platforms: [
        { x: 0, y: 550, width: 3000, height: 50, color: '#8B4513' },
        { x: 200, y: 450, width: 150, height: 20, color: '#8B4513' },
        { x: 400, y: 350, width: 150, height: 20, color: '#8B4513' },
        { x: 600, y: 250, width: 120, height: 20, color: '#8B4513' },
        { x: 850, y: 450, width: 100, height: 20, color: '#8B4513' },
        { x: 1050, y: 400, width: 150, height: 20, color: '#8B4513' },
        { x: 1300, y: 300, width: 100, height: 20, color: '#8B4513' },
        { x: 1500, y: 200, width: 120, height: 20, color: '#8B4513' },
        { x: 1700, y: 350, width: 150, height: 20, color: '#8B4513' },
        { x: 1950, y: 450, width: 80, height: 20, color: '#8B4513' },
        { x: 2100, y: 400, width: 80, height: 20, color: '#8B4513' },
        { x: 2250, y: 350, width: 80, height: 20, color: '#8B4513' },
        { x: 2400, y: 250, width: 100, height: 20, color: '#8B4513' },
        { x: 2600, y: 450, width: 150, height: 20, color: '#8B4513' },
        { x: 2800, y: 400, width: 150, height: 20, color: '#8B4513' }
    ],
    coins: [
        { x: 250, y: 400, width: 20, height: 20, collected: false },
        { x: 450, y: 300, width: 20, height: 20, collected: false },
        { x: 650, y: 200, width: 20, height: 20, collected: false },
        { x: 900, y: 400, width: 20, height: 20, collected: false },
        { x: 1100, y: 350, width: 20, height: 20, collected: false },
        { x: 1350, y: 250, width: 20, height: 20, collected: false },
        { x: 1550, y: 150, width: 20, height: 20, collected: false },
        { x: 1750, y: 300, width: 20, height: 20, collected: false },
        { x: 2000, y: 400, width: 20, height: 20, collected: false },
        { x: 2150, y: 350, width: 20, height: 20, collected: false },
        { x: 2300, y: 300, width: 20, height: 20, collected: false },
        { x: 2450, y: 200, width: 20, height: 20, collected: false },
        { x: 2650, y: 400, width: 20, height: 20, collected: false },
        { x: 2850, y: 350, width: 20, height: 20, collected: false }
    ],
    enemies: [
        { x: 300, y: 420, width: 40, height: 40, speed: 2, direction: 1, minX: 200, maxX: 400, alive: true },
        { x: 500, y: 320, width: 40, height: 40, speed: 1.5, direction: 1, minX: 400, maxX: 600, alive: true },
        { x: 900, y: 420, width: 40, height: 40, speed: 2, direction: -1, minX: 850, maxX: 1000, alive: true },
        { x: 1150, y: 370, width: 40, height: 40, speed: 1.8, direction: 1, minX: 1050, maxX: 1250, alive: true },
        { x: 1350, y: 270, width: 40, height: 40, speed: 1.5, direction: -1, minX: 1300, maxX: 1450, alive: true },
        { x: 1750, y: 320, width: 40, height: 40, speed: 2, direction: 1, minX: 1700, maxX: 1900, alive: true },
        { x: 2000, y: 420, width: 40, height: 40, speed: 1.5, direction: -1, minX: 1950, maxX: 2100, alive: true },
        { x: 2150, y: 370, width: 40, height: 40, speed: 1.8, direction: 1, minX: 2100, maxX: 2250, alive: true },
        { x: 2450, y: 220, width: 40, height: 40, speed: 2, direction: -1, minX: 2400, maxX: 2550, alive: true },
        { x: 2700, y: 420, width: 40, height: 40, speed: 1.5, direction: 1, minX: 2600, maxX: 2800, alive: true }
    ],
    door: { x: 2850, y: 330, width: 50, height: 70 },
    playerStart: { x: 50, y: 100 }
};

// Level 2 data
const level2Data = {
    worldWidth: 3500,
    platforms: [
        { x: 0, y: 550, width: 500, height: 50, color: '#8B4513' },
        { x: 700, y: 550, width: 600, height: 50, color: '#8B4513' },
        { x: 1500, y: 550, width: 500, height: 50, color: '#8B4513' },
        { x: 2200, y: 550, width: 600, height: 50, color: '#8B4513' },
        { x: 3000, y: 550, width: 500, height: 50, color: '#8B4513' },
        { x: 550, y: 450, width: 100, height: 20, color: '#8B4513' },
        { x: 1350, y: 450, width: 100, height: 20, color: '#8B4513' },
        { x: 2050, y: 450, width: 100, height: 20, color: '#8B4513' },
        { x: 200, y: 400, width: 120, height: 20, color: '#8B4513' },
        { x: 400, y: 300, width: 100, height: 20, color: '#8B4513' },
        { x: 800, y: 400, width: 150, height: 20, color: '#8B4513' },
        { x: 1000, y: 300, width: 100, height: 20, color: '#8B4513' },
        { x: 1200, y: 200, width: 120, height: 20, color: '#8B4513' },
        { x: 1600, y: 400, width: 100, height: 20, color: '#8B4513' },
        { x: 1800, y: 300, width: 120, height: 20, color: '#8B4513' },
        { x: 2300, y: 400, width: 150, height: 20, color: '#8B4513' },
        { x: 2550, y: 300, width: 100, height: 20, color: '#8B4513' },
        { x: 2800, y: 200, width: 120, height: 20, color: '#8B4513' },
        { x: 3100, y: 350, width: 150, height: 20, color: '#8B4513' },
        { x: 3300, y: 450, width: 150, height: 20, color: '#8B4513' }
    ],
    coins: [
        { x: 250, y: 350, width: 20, height: 20, collected: false },
        { x: 450, y: 250, width: 20, height: 20, collected: false },
        { x: 600, y: 400, width: 20, height: 20, collected: false },
        { x: 850, y: 350, width: 20, height: 20, collected: false },
        { x: 1050, y: 250, width: 20, height: 20, collected: false },
        { x: 1250, y: 150, width: 20, height: 20, collected: false },
        { x: 1400, y: 400, width: 20, height: 20, collected: false },
        { x: 1650, y: 350, width: 20, height: 20, collected: false },
        { x: 1850, y: 250, width: 20, height: 20, collected: false },
        { x: 2100, y: 400, width: 20, height: 20, collected: false },
        { x: 2350, y: 350, width: 20, height: 20, collected: false },
        { x: 2600, y: 250, width: 20, height: 20, collected: false },
        { x: 2850, y: 150, width: 20, height: 20, collected: false },
        { x: 3150, y: 300, width: 20, height: 20, collected: false },
        { x: 3350, y: 400, width: 20, height: 20, collected: false }
    ],
    enemies: [
        { x: 250, y: 370, width: 40, height: 40, speed: 2, direction: 1, minX: 200, maxX: 350, alive: true },
        { x: 850, y: 370, width: 40, height: 40, speed: 2.5, direction: -1, minX: 800, maxX: 950, alive: true },
        { x: 1050, y: 270, width: 40, height: 40, speed: 1.8, direction: 1, minX: 1000, maxX: 1150, alive: true },
        { x: 1250, y: 170, width: 40, height: 40, speed: 1.5, direction: -1, minX: 1200, maxX: 1350, alive: true },
        { x: 1650, y: 370, width: 40, height: 40, speed: 2, direction: 1, minX: 1600, maxX: 1750, alive: true },
        { x: 1850, y: 270, width: 40, height: 40, speed: 2.2, direction: -1, minX: 1800, maxX: 1950, alive: true },
        { x: 2350, y: 370, width: 40, height: 40, speed: 2, direction: 1, minX: 2300, maxX: 2450, alive: true },
        { x: 2600, y: 270, width: 40, height: 40, speed: 1.8, direction: -1, minX: 2550, maxX: 2700, alive: true },
        { x: 2850, y: 170, width: 40, height: 40, speed: 1.5, direction: 1, minX: 2800, maxX: 2950, alive: true },
        { x: 3150, y: 320, width: 40, height: 40, speed: 2.5, direction: -1, minX: 3100, maxX: 3250, alive: true },
        { x: 600, y: 420, width: 40, height: 40, speed: 2, direction: 1, minX: 550, maxX: 700, alive: true },
        { x: 1400, y: 420, width: 40, height: 40, speed: 2, direction: -1, minX: 1350, maxX: 1500, alive: true }
    ],
    door: { x: 3350, y: 380, width: 50, height: 70 },
    playerStart: { x: 50, y: 480 }
};

// Aktuální herní data
let worldWidth = level1Data.worldWidth;
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
    if (e.key.toLowerCase() === 'k') {
        if (!keys.k) {
            shootFireball();
        }
        keys.k = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 'a') keys.a = false;
    if (e.key.toLowerCase() === 'd') keys.d = false;
    if (e.key === ' ' || e.key === 'Spacebar') keys.space = false;
    if (e.key.toLowerCase() === 'k') keys.k = false;
});

// Funkce pro střelbu ohnivé koule
function shootFireball() {
    const fireball = {
        x: player.facingRight ? player.x + player.width : player.x,
        y: player.y + player.height / 2 - 5,
        width: 15,
        height: 15,
        speed: 8,
        direction: player.facingRight ? 1 : -1
    };
    fireballs.push(fireball);
}

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
    invincibilityTimer = 120;
    
    if (lives <= 0) {
        alert('Prohra! Tvoje skóre: ' + score);
        resetGame();
    } else {
        if (currentLevel === 1) {
            player.x = level1Data.playerStart.x;
            player.y = level1Data.playerStart.y;
        } else {
            player.x = level2Data.playerStart.x;
            player.y = level2Data.playerStart.y;
        }
        player.velocityX = 0;
        player.velocityY = 0;
        camera.x = 0;
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
    camera.x = 0;
    fireballs = [];
    loadLevel(1);
}

// Funkce pro načtení levelu
function loadLevel(levelNum) {
    currentLevel = levelNum;
    levelElement.textContent = currentLevel;
    fireballs = [];
    
    if (levelNum === 1) {
        worldWidth = level1Data.worldWidth;
        platforms = [...level1Data.platforms];
        coins = JSON.parse(JSON.stringify(level1Data.coins));
        enemies = JSON.parse(JSON.stringify(level1Data.enemies));
        door = { ...level1Data.door };
        player.x = level1Data.playerStart.x;
        player.y = level1Data.playerStart.y;
    } else if (levelNum === 2) {
        worldWidth = level2Data.worldWidth;
        platforms = [...level2Data.platforms];
        coins = JSON.parse(JSON.stringify(level2Data.coins));
        enemies = JSON.parse(JSON.stringify(level2Data.enemies));
        door = { ...level2Data.door };
        player.x = level2Data.playerStart.x;
        player.y = level2Data.playerStart.y;
    }
    
    player.velocityX = 0;
    player.velocityY = 0;
    camera.x = 0;
}

// Funkce pro kontrolu, zda jsou všechny coiny sebrané
function allCoinsCollected() {
    return coins.every(coin => coin.collected);
}

// Aktualizace kamery
function updateCamera() {
    const targetX = player.x - canvas.width / 3;
    camera.x = Math.max(0, Math.min(targetX, worldWidth - canvas.width));
}

// Funkce pro kreslení pozadí
function drawBackground() {
    // Kreslení opakujícího se pozadí
    const bgWidth = images.background.width;
    const bgHeight = images.background.height;
    
    // Parallax efekt - pozadí se pohybuje pomaleji než kamera
    const parallaxX = camera.x * 0.5;
    const startX = Math.floor(parallaxX / bgWidth) * bgWidth - parallaxX;
    
    // Kreslit pozadí opakovaně přes celou obrazovku
    for (let x = startX; x < canvas.width; x += bgWidth) {
        ctx.drawImage(images.background, x, 0, bgWidth, canvas.height);
    }
}

// Funkce pro kreslení hráče s obrázkem
function drawPlayer() {
    const drawX = player.x - camera.x;
    const drawY = player.y;
    
    // Blikání při nesmrtelnosti
    if (isInvincible && Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }
    
    // Kreslení panáčka
    if (player.facingRight) {
        ctx.drawImage(images.player, drawX, drawY, player.width, player.height);
    } else {
        // Zrcadlení pro pohyb doleva
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(images.player, -drawX - player.width, drawY, player.width, player.height);
        ctx.restore();
    }
    
    ctx.globalAlpha = 1.0;
}

// Kreslení ohnivých koulí
function drawFireballs() {
    fireballs.forEach(fireball => {
        const drawX = fireball.x - camera.x;
        
        const time = Date.now() / 50;
        
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(drawX, fireball.y, fireball.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FF6600';
        ctx.beginPath();
        ctx.arc(drawX, fireball.y, fireball.width / 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(drawX, fireball.y, fireball.width / 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Funkce pro kreslení platforem
function drawPlatforms() {
    platforms.forEach(platform => {
        const drawX = platform.x - camera.x;
        
        if (drawX + platform.width > 0 && drawX < canvas.width) {
            ctx.fillStyle = platform.color;
            ctx.fillRect(drawX, platform.y, platform.width, platform.height);
            
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            for (let i = 0; i < platform.width; i += 30) {
                ctx.beginPath();
                ctx.moveTo(drawX + i, platform.y);
                ctx.lineTo(drawX + i, platform.y + platform.height);
                ctx.stroke();
            }
        }
    });
}

// Funkce pro kreslení žetonek
function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            const drawX = coin.x - camera.x;
            
            if (drawX + coin.width > 0 && drawX < canvas.width) {
                const time = Date.now() / 200;
                const scale = Math.abs(Math.sin(time)) * 0.3 + 0.7;
                
                ctx.save();
                ctx.translate(drawX + coin.width / 2, coin.y + coin.height / 2);
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
        }
    });
}

// Funkce pro kreslení nepřátel s obrázkem
function drawEnemies() {
    enemies.forEach(enemy => {
        if (enemy.alive) {
            const drawX = enemy.x - camera.x;
            
            if (drawX + enemy.width > 0 && drawX < canvas.width) {
                // Kreslení nepřítele - zrcadlení podle směru pohybu
                if (enemy.direction > 0) {
                    ctx.drawImage(images.enemy, drawX, enemy.y, enemy.width, enemy.height);
                } else {
                    ctx.save();
                    ctx.scale(-1, 1);
                    ctx.drawImage(images.enemy, -drawX - enemy.width, enemy.y, enemy.width, enemy.height);
                    ctx.restore();
                }
            }
        }
    });
}

// Funkce pro kreslení dveří
function drawDoor() {
    const drawX = door.x - camera.x;
    
    if (drawX + door.width > 0 && drawX < canvas.width) {
        const allCollected = allCoinsCollected();
        
        if (allCollected) {
            ctx.fillStyle = '#00FF00';
        } else {
            ctx.fillStyle = '#888888';
        }
        ctx.fillRect(drawX, door.y, door.width, door.height);
        
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(drawX, door.y, door.width, door.height);
        
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(drawX + 40, door.y + 35, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = allCollected ? '#00FF00' : '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(allCollected ? 'Enter!' : 'Locked', drawX + door.width / 2, door.y + door.height + 15);
    }
}

// Funkce pro kontrolu kolize
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Aktualizace ohnivých koulí
function updateFireballs() {
    fireballs.forEach((fireball, index) => {
        fireball.x += fireball.speed * fireball.direction;
        
        if (fireball.x < camera.x - 100 || fireball.x > camera.x + canvas.width + 100) {
            fireballs.splice(index, 1);
            return;
        }
        
        enemies.forEach(enemy => {
            if (enemy.alive && checkCollision(fireball, enemy)) {
                enemy.alive = false;
                fireballs.splice(index, 1);
                score += 20;
                scoreElement.textContent = score;
            }
        });
    });
}

// Aktualizace nepřátel
function updateEnemies() {
    enemies.forEach(enemy => {
        if (enemy.alive) {
            enemy.x += enemy.speed * enemy.direction;
            
            if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) {
                enemy.direction *= -1;
            }
            
            if (checkCollision(player, enemy)) {
                loseLife();
            }
        }
    });
}

// Aktualizace fyziky hráče
function updatePlayer() {
    player.velocityX = 0;
    if (keys.a) {
        player.velocityX = -player.speed;
        player.facingRight = false;
    }
    if (keys.d) {
        player.velocityX = player.speed;
        player.facingRight = true;
    }
    
    if (keys.space && player.onGround) {
        player.velocityY = -player.jumpPower;
        player.onGround = false;
    }
    
    player.velocityY += gravity;
    
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > worldWidth) player.x = worldWidth - player.width;
    
    if (player.y > canvas.height) {
        loseLife();
    }
    
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
    // Kreslení pozadí
    drawBackground();
    
    // Aktualizace
    updatePlayer();
    updateCamera();
    updateEnemies();
    updateFireballs();
    checkCoinCollection();
    checkDoorEntry();
    
    // Kreslení
    drawPlatforms();
    drawCoins();
    drawEnemies();
    drawDoor();
    drawFireballs();
    drawPlayer();
    
    // Další snímek
    requestAnimationFrame(gameLoop);
}

// Hra se spustí automaticky po načtení obrázků
