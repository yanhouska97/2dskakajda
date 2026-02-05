// Získání canvasu a kontextu
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Nastavení velikosti canvasu
canvas.width = 800;
canvas.height = 600;

// Herní proměnné
let score = 0;
const scoreElement = document.getElementById('score');

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

// Platformy
const platforms = [
    { x: 0, y: 550, width: 800, height: 50, color: '#8B4513' }, // Spodní platforma
    { x: 200, y: 450, width: 150, height: 20, color: '#8B4513' },
    { x: 450, y: 350, width: 150, height: 20, color: '#8B4513' },
    { x: 100, y: 250, width: 120, height: 20, color: '#8B4513' },
    { x: 600, y: 450, width: 150, height: 20, color: '#8B4513' },
    { x: 350, y: 150, width: 100, height: 20, color: '#8B4513' }
];

// Žetonky
const coins = [
    { x: 250, y: 400, width: 20, height: 20, collected: false },
    { x: 500, y: 300, width: 20, height: 20, collected: false },
    { x: 150, y: 200, width: 20, height: 20, collected: false },
    { x: 650, y: 400, width: 20, height: 20, collected: false },
    { x: 400, y: 100, width: 20, height: 20, collected: false },
    { x: 700, y: 500, width: 20, height: 20, collected: false },
    { x: 50, y: 500, width: 20, height: 20, collected: false }
];

// Event listenery pro klávesy
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'a') keys.a = true;
    if (e.key.toLowerCase() === 'd') keys.d = true;
    if (e.key === ' ' || e.key === 'Spacebar') {
        keys.space = true;
        e.preventDefault(); // Zabrání scrollování stránky
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 'a') keys.a = false;
    if (e.key.toLowerCase() === 'd') keys.d = false;
    if (e.key === ' ' || e.key === 'Spacebar') keys.space = false;
});

// Funkce pro kreslení hráče
function drawPlayer() {
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
}

// Funkce pro kreslení platforem
function drawPlatforms() {
    platforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Přidání textury (jednoduchá)
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
            // Rotující efekt žetonky
            const time = Date.now() / 200;
            const scale = Math.abs(Math.sin(time)) * 0.3 + 0.7;
            
            ctx.save();
            ctx.translate(coin.x + coin.width / 2, coin.y + coin.height / 2);
            ctx.scale(scale, 1);
            
            // Žlutý kruh
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, coin.width / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Vnitřní kruh
            ctx.fillStyle = '#FFA500';
            ctx.beginPath();
            ctx.arc(0, 0, coin.width / 3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    });
}

// Funkce pro kontrolu kolize s platformou
function checkPlatformCollision(player, platform) {
    return player.x < platform.x + platform.width &&
           player.x + player.width > platform.x &&
           player.y < platform.y + platform.height &&
           player.y + player.height > platform.y;
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
    
    // Kontrola pádu mimo obrazovku (reset)
    if (player.y > canvas.height) {
        player.x = 100;
        player.y = 100;
        player.velocityY = 0;
    }
    
    // Kontrola kolize s platformami
    player.onGround = false;
    platforms.forEach(platform => {
        if (checkPlatformCollision(player, platform)) {
            // Kolize shora (přistání na platformě)
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.onGround = true;
            }
            // Kolize zdola (náraz hlavou)
            else if (player.velocityY < 0 && player.y - player.velocityY >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
            // Kolize z boku (zastavení)
            else {
                if (player.velocityX > 0) {
                    player.x = platform.x - player.width;
                } else if (player.velocityX < 0) {
                    player.x = platform.x + platform.width;
                }
            }
        }
    });
}

// Kontrola sbírání žetonek
function checkCoinCollection() {
    coins.forEach(coin => {
        if (!coin.collected) {
            if (player.x < coin.x + coin.width &&
                player.x + player.width > coin.x &&
                player.y < coin.y + coin.height &&
                player.y + player.height > coin.y) {
                coin.collected = true;
                score += 10;
                scoreElement.textContent = score;
            }
        }
    });
}

// Hlavní herní smyčka
function gameLoop() {
    // Vyčištění canvasu
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Aktualizace a kreslení
    updatePlayer();
    checkCoinCollection();
    
    drawPlatforms();
    drawCoins();
    drawPlayer();
    
    // Další snímek
    requestAnimationFrame(gameLoop);
}

// Spuštění hry
gameLoop();
