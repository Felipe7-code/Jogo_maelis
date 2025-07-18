const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- Elementos da Interface ---
const pontuacaoDiv = document.getElementById("pontuacao");
const caixaDialogo = document.getElementById("caixa-dialogo");
const textoDialogo = document.getElementById("texto-dialogo");
const btnContinuar = document.getElementById("btn-continuar"); // Manter aqui, usado no diálogo final
const fimDeFaseDiv = document.getElementById("fim-de-fase");
const btnVoltarMenuFase = document.getElementById("btnVoltarMenuFase");
const telaFalha = document.getElementById("tela-falha");
const btnTentarNovamente = document.getElementById("btn-tentar-novamente");
const avisoEscape = document.getElementById("aviso-escape");

const magiaBarContainer = document.getElementById("magia-bar-container");
const magiaBarFill = document.getElementById("magia-bar-fill");
const magiaBrilho = document.getElementById("magia-brilho");

// --- Constantes do Jogo ---
const limiteEsquerdo = 50;
const limiteDireito = canvas.width - 50;
const limiteDano = 900;

// --- Configuração das Hordas ---
const totalDeOndas = 4; // O jogo deve ter 4 hordas no total
const inimigosPorOndaInicial = 7; // Inimigos na 1ª e 2ª horda
const inimigosHorda3 = 9; // Inimigos na 3ª horda
const inimigosHorda4 = 13; // Inimigos na 4ª horda

// --- Constantes da Magia das Sombras ---
const inimigosParaMagia = 7;
const magicBeamWidth = 100;
const magicBeamSpeed = 15;
const magicBeamDuration = 2000;
const MAGIC_COLOR_START = '#5e17eb';
const MAGIC_COLOR_END = '#b500f7';
const MAGIC_COLOR_BRIGHT = '#b500f7';

// --- Variáveis de Estado do Jogo ---
let player;
let tiros = [];
let inimigos = [];
let inimigoTiros = [];
let particulas = [];
let estrelas = [];

let pontos = 0;
let leftPressed = false;
let rightPressed = false;
let spacePressed = false;
let shiftPressed = false;

let jogoAtivo = false;
let estadoFase = 'DIALOGO_INICIAL';
let ondaAtual = 0; // Começa em 0, incrementa para 1 na primeira horda
let inimigoEscapou = false;
let primeiroAvisoDado = false;

// --- Variáveis de Estado da Magia ---
let magiaDesbloqueada = false;
let magiaCarregada = 0;
let magiaBeamAtivo = null;
let magiaBeamTimer = null;
// let magiaDialogoMostrado = false; // Removida, não é mais necessária

// --- Imagem do Player ---
let playerImage = new Image();
playerImage.src = 'assets/cabeca.png';

// =======================================================
// ===== CONTROLE DE FLUXO DA FASE =======================
// =======================================================

function inicializar() {
    player = { x: canvas.width / 2, y: canvas.height - 80, width: 50, height: 50, speed: 6, lives: 3, invincible: false };
    tiros = [];
    inimigos = [];
    inimigoTiros = [];
    particulas = [];
    estrelas = [];
    
    pontos = 0;
    ondaAtual = 0; // Garante que a contagem de hordas comece do zero
    inimigoEscapou = false;
    primeiroAvisoDado = false;
    leftPressed = false;
    rightPressed = false;
    spacePressed = false;
    shiftPressed = false;
    jogoAtivo = false;
    estadoFase = 'DIALOGO_INICIAL';

    magiaDesbloqueada = false;
    magiaCarregada = 0;
    magiaBeamAtivo = null;
    if (magiaBeamTimer) clearTimeout(magiaBeamTimer);
    magiaBeamTimer = null;
    // magiaDialogoMostrado = false; // Removida

    magiaBarContainer.style.display = 'none';
    magiaBrilho.style.display = 'none';
    pontuacaoDiv.textContent = "Pontos: 0";
    fimDeFaseDiv.style.display = 'none';
    telaFalha.style.display = 'none';
    avisoEscape.style.display = 'none';
    caixaDialogo.style.display = 'none';
    btnContinuar.style.display = 'none'; // Sempre começa escondido

    criarEstrelas();
    mostrarDialogoInicial();
}

function mostrarDialogoInicial() {
    textoDialogo.textContent = "Aqui, onde os pilares caíram... os protetores se ajoelharam diante da Névoa. Você ousa seguir onde eles ruíram?";
    caixaDialogo.style.display = 'block';
    
    const iniciarGameListener = () => {
        canvas.removeEventListener('click', iniciarGameListener);
        document.removeEventListener('keydown', handleInitialInput);
        iniciarGameplay();
    };

    const handleInitialInput = (e) => {
        if (e.key === " " || e.type === "click") {
            iniciarGameListener();
        }
    };

    canvas.addEventListener('click', iniciarGameListener);
    document.addEventListener('keydown', handleInitialInput);
}

function iniciarGameplay() {
    caixaDialogo.style.display = 'none';
    jogoAtivo = true;
    estadoFase = 'GAMEPLAY';

    if (inimigos.length === 0 && ondaAtual < totalDeOndas + 1) { 
        iniciarProximaOnda();
    }
    atualizar();
}

function avancarEstadoFase() {
    if (inimigos.length === 0 && inimigoTiros.length === 0) {
        if (ondaAtual < totalDeOndas) { 
            iniciarProximaOnda(); 
        } else {
            if (inimigoEscapou) {
                mostrarTelaDeFalha();
            } else {
                estadoFase = 'NARRATIVA';
                mostrarDialogoFinal();
            }
        }
    }
}

// Removida a função `mostrarDialogoMagia()`

function mostrarDialogoFinal() {
    textoDialogo.textContent = "Parabéns! Todas as hordas foram purificadas. Você está se tornando mais forte!";
    caixaDialogo.style.display = 'block';
    btnContinuar.style.display = 'block';

    if (btnContinuar.currentListener) {
        btnContinuar.removeEventListener('click', btnContinuar.currentListener);
    }

    const backToMenuListener = () => {
        window.location.href = '../menu2.0/menu.html#menu-principal';
        btnContinuar.removeEventListener('click', backToMenuListener);
        btnContinuar.currentListener = null;
    };
    btnContinuar.addEventListener('click', backToMenuListener);
    btnContinuar.currentListener = backToMenuListener;
}

function mostrarTelaDeFalha() {
    jogoAtivo = false;
    estadoFase = 'FALHA';
    telaFalha.style.display = 'flex';
}

function mostrarAvisoDeEscape() {
    if (avisoEscape.style.display === 'block') return;
    avisoEscape.style.display = 'block';
    avisoEscape.style.opacity = 1;

    setTimeout(() => {
        avisoEscape.style.opacity = 0;
        setTimeout(() => {
            avisoEscape.style.display = 'none';
        }, 500);
    }, 3500);
}

function gameOver() {
    jogoAtivo = false;
    estadoFase = 'GAMEOVER';
    fimDeFaseDiv.querySelector('h1').textContent = "Game Over";
    fimDeFaseDiv.style.display = 'block';
    magiaBarContainer.style.display = 'none';
}

function aplicarDanoAoJogador() {
    if (player.invincible) return;
    player.lives--;
    criarExplosao(player.x, player.y, '#FFA500');

    if (player.lives <= 0) {
        gameOver();
    } else {
        player.invincible = true;
        setTimeout(() => { player.invincible = false; }, 2000);
    }
}

// =======================================================
// ===== CRIAÇÃO DE INIMIGOS (Lógica de Hordas) ==========
// =======================================================
function iniciarProximaOnda() {
    ondaAtual++; 
    inimigos = [];
    inimigoTiros = []; 

    if (ondaAtual === 3 && !magiaDesbloqueada) {
        magiaDesbloqueada = true;
        magiaBarContainer.style.display = 'block';
        atualizarBarraMagia();
        // Não há mais diálogo, o jogo apenas continua e a barra aparece.
    }

    let numInimigosNestaHorda;
    let baseSpeedAranha = 1.2;
    let baseSpeedAtirador = 1.5;
    let shootIntervalAtirador = 3000; 

    if (ondaAtual === 1 || ondaAtual === 2) {
        numInimigosNestaHorda = inimigosPorOndaInicial;
    } else if (ondaAtual === 3) {
        numInimigosNestaHorda = inimigosHorda3;
        baseSpeedAranha = 1.3;
        baseSpeedAtirador = 1.6;
        shootIntervalAtirador = 2800; 
    } else if (ondaAtual === 4) { 
        numInimigosNestaHorda = inimigosHorda4;
        baseSpeedAranha = 1.4; 
        baseSpeedAtirador = 1.7; 
        shootIntervalAtirador = 2500; 
    } else {
        numInimigosNestaHorda = inimigosPorOndaInicial;
    }

    console.log(`Iniciando Horda ${ondaAtual} com ${numInimigosNestaHorda} inimigos.`);

    for (let i = 0; i < numInimigosNestaHorda; i++) {
        const tipoAleatorio = Math.random();
        if (tipoAleatorio < 0.6) {
            criarAranhaCorrompida(
                limiteEsquerdo + 50 + (Math.random() * (limiteDireito - limiteEsquerdo - 100)),
                -50 - (i * 70) - (Math.random() * 50),
                baseSpeedAranha + (Math.random() * 0.5) 
            );
        } else {
            criarAtirador(
                limiteEsquerdo + 50 + (Math.random() * (limiteDireito - limiteEsquerdo - 100)),
                -80 - (i * 90) - (Math.random() * 60),
                baseSpeedAtirador + (Math.random() * 0.5), 
                shootIntervalAtirador - (Math.random() * 300), 
                canvas.height * (0.2 + ondaAtual * 0.05) 
            );
        }
    }
}

function criarAranhaCorrompida(x, y, speed) {
    inimigos.push({
        x: x, y: y, width: 40, height: 30, speed: speed, hp: 1, tipo: 'ARANHA'
    });
}

function criarAtirador(x, y, speed, shootInterval, stopY) {
    inimigos.push({
        x: x, y: y, width: 50, height: 40, speed: speed, hp: 2, tipo: 'ATIRADOR',
        shootInterval: shootInterval, lastShot: Date.now(), stopY: stopY
    });
}

// =======================================================
// ===== FUNÇÕES DA MAGIA DAS SOMBRAS ====================
// =======================================================

function atualizarBarraMagia() {
    const porcentagem = (magiaCarregada / inimigosParaMagia) * 100;
    magiaBarFill.style.width = `${Math.min(100, porcentagem)}%`;

    if (magiaDesbloqueada) {
        if (magiaCarregada >= inimigosParaMagia) {
            magiaBrilho.style.display = 'block';
        } else {
            magiaBrilho.style.display = 'none';
        }
    } else {
        magiaBrilho.style.display = 'none';
        magiaBarFill.style.width = '0%';
    }
}

function ativarMagiaDasSombras() {
    if (jogoAtivo && magiaDesbloqueada && magiaCarregada >= inimigosParaMagia && !magiaBeamAtivo) {
        magiaBeamAtivo = {
            x: player.x,
            y: player.y,
            width: magicBeamWidth,
            height: 0,
            speed: magicBeamSpeed
        };
        magiaCarregada = 0;
        atualizarBarraMagia();
        
        magiaBeamTimer = setTimeout(() => {
            magiaBeamAtivo = null;
            magiaBeamTimer = null;
        }, magicBeamDuration);
    }
}

// =======================================================
// ===== FUNÇÕES DE DESENHO ==============================
// =======================================================
function criarEstrelas(){
    estrelas = [];
    for(let i=0;i<150;i++){
        estrelas.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5,
            speed: Math.random() * .4 + .2
        });
    }
}

function desenharEAtualizarEstrelas(){
    ctx.fillStyle="rgba(173, 216, 230, 0.7)";
    for(const estrela of estrelas){
        estrela.y += estrela.speed;
        if(estrela.y > canvas.height){
            estrela.y = 0;
            estrela.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(estrela.x, estrela.y, estrela.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function criarExplosao(x,y,cor){
    for(let i=0;i<20;i++){
        particulas.push({
            x: x, y: y,
            vx: (Math.random() - .5) * 4,
            vy: (Math.random() - .5) * 4,
            radius: Math.random() * 3,
            cor: cor,
            vida: 40
        });
    }
}

function desenharEAtualizarParticulas(){
    for(let i = particulas.length - 1; i >= 0; i--){
        const p = particulas[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vida--;
        
        if(p.vida <= 0){
            particulas.splice(i, 1);
            continue;
        }
        ctx.fillStyle = p.cor;
        ctx.globalAlpha = p.vida / 40;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function desenharPlayer(){
    ctx.globalAlpha = 1;
    if(player.invincible){
        ctx.globalAlpha = Math.floor(Date.now() / 150) % 2 === 0 ? .9 : .4;
    }
    ctx.drawImage(playerImage, player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
    ctx.globalAlpha = 1;
}

function desenharVidas(){
    const heartSize = 20;
    const padding = 10;
    const startX = 30;
    const startY = 60;
    ctx.fillStyle = '#FF3C3C';
    ctx.shadowColor = '#FF3C3C';
    ctx.shadowBlur = 10;
    ctx.font = "24px 'Press Start 2P'";
    for(let i = 0; i < player.lives; i++){
        const x = startX + i * (heartSize + padding + 10);
        ctx.fillText("❤️", x, startY);
    }
    ctx.shadowBlur = 0;
}

function desenharInimigo(inimigo){
    ctx.fillStyle="#8B008B";
    ctx.shadowColor="#FF00FF";
    ctx.shadowBlur=15;
    ctx.beginPath();
    ctx.arc(inimigo.x, inimigo.y, inimigo.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle="red";
    ctx.fillRect(inimigo.x - 5, inimigo.y - 5, 4, 4);
    ctx.fillRect(inimigo.x + 1, inimigo.y - 5, 4, 4);
    ctx.shadowBlur = 0;
}

function desenharAtirador(inimigo) {
    ctx.fillStyle = "#FF0000";
    ctx.shadowColor = "#FF6666";
    ctx.shadowBlur = 15;

    ctx.beginPath();
    ctx.moveTo(inimigo.x - inimigo.width / 2, inimigo.y + inimigo.height / 2);
    ctx.lineTo(inimigo.x + inimigo.width / 2, inimigo.y + inimigo.height / 2);
    ctx.lineTo(inimigo.x, inimigo.y - inimigo.height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
}

function desenharTiro(tiro){
    ctx.fillStyle="#FFFF00";
    ctx.shadowColor="#FFFF00";
    ctx.shadowBlur=15;
    ctx.fillRect(tiro.x - tiro.width / 2, tiro.y, tiro.width, tiro.height);
    ctx.shadowBlur = 0;
}

function desenharTiroInimigo(tiro) {
    ctx.fillStyle = "#00BFFF";
    ctx.shadowColor = "#00BFFF";
    ctx.shadowBlur = 8;
    ctx.fillRect(tiro.x - tiro.width / 2, tiro.y, tiro.width, tiro.height);
    ctx.shadowBlur = 0;
}

function desenharMagiaBeam() {
    if (!magiaBeamAtivo) return;

    const gradient = ctx.createLinearGradient(
        magiaBeamAtivo.x - magiaBeamAtivo.width / 2,
        magiaBeamAtivo.y,
        magiaBeamAtivo.x + magiaBeamAtivo.width / 2,
        magiaBeamAtivo.y - magiaBeamAtivo.height
    );
    gradient.addColorStop(0, MAGIC_COLOR_START);
    gradient.addColorStop(1, MAGIC_COLOR_END);

    ctx.fillStyle = gradient;
    ctx.shadowColor = MAGIC_COLOR_BRIGHT;
    ctx.shadowBlur = 25;

    ctx.fillRect(
        magiaBeamAtivo.x - magiaBeamAtivo.width / 2,
        magiaBeamAtivo.y - magiaBeamAtivo.height,
        magiaBeamAtivo.width,
        magiaBeamAtivo.height
    );
    ctx.shadowBlur = 0;
}

// =======================================================
// ===== LOOP PRINCIPAL DO JOGO (ATUALIZAR) ==============
// =======================================================
function atualizar() {
    if (!jogoAtivo && estadoFase !== 'DIALOGO_INICIAL') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        desenharEAtualizarEstrelas();
        requestAnimationFrame(atualizar);
        return;
    } else if (estadoFase === 'DIALOGO_INICIAL') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        desenharEAtualizarEstrelas();
        requestAnimationFrame(atualizar);
        return;
    }

    requestAnimationFrame(atualizar);

    if (jogoAtivo) {
        if (leftPressed) player.x -= player.speed;
        if (rightPressed) player.x += player.speed;
        if (player.x - player.width / 2 < limiteEsquerdo) player.x = limiteEsquerdo + player.width / 2;
        if (player.x + player.width / 2 > limiteDireito) player.x = limiteDireito - player.width / 2;

        for (let i = tiros.length - 1; i >= 0; i--) {
            const tiro = tiros[i];
            tiro.y -= tiro.speed;
            if (tiro.y < -tiro.height) {
                tiros.splice(i, 1);
            }
        }

        for (let i = inimigoTiros.length - 1; i >= 0; i--) {
            const tiro = inimigoTiros[i];
            tiro.y += tiro.speed;
            if (tiro.y > canvas.height + tiro.height) {
                inimigoTiros.splice(i, 1);
                continue;
            }

            if (!player.invincible) {
                const dx = tiro.x - player.x;
                const dy = tiro.y - player.y;
                if (Math.sqrt(dx * dx + dy * dy) < tiro.width / 2 + player.width / 2) {
                    aplicarDanoAoJogador();
                    criarExplosao(tiro.x, tiro.y, '#00BFFF');
                    inimigoTiros.splice(i, 1);
                    continue;
                }
            }
        }

        if (magiaBeamAtivo) {
            magiaBeamAtivo.x = player.x;
            magiaBeamAtivo.height += magiaBeamAtivo.speed;

            if (magiaBeamAtivo.y - magiaBeamAtivo.height < 0 && !magiaBeamTimer) {
                magiaBeamAtivo = null;
            } else {
                for (let i = inimigos.length - 1; i >= 0; i--) {
                    const inimigo = inimigos[i];
                    if (
                        inimigo.x + inimigo.width / 2 > magiaBeamAtivo.x - magiaBeamAtivo.width / 2 &&
                        inimigo.x - inimigo.width / 2 < magiaBeamAtivo.x + magiaBeamAtivo.width / 2 &&
                        inimigo.y + inimigo.height / 2 > (magiaBeamAtivo.y - magiaBeamAtivo.height) &&
                        inimigo.y - inimigo.height / 2 < magiaBeamAtivo.y
                    ) {
                        criarExplosao(inimigo.x, inimigo.y, MAGIC_COLOR_BRIGHT);
                        inimigos.splice(i, 1);
                        pontos += (inimigo.tipo === 'ATIRADOR' ? 25 : 10);
                        pontuacaoDiv.textContent = "Pontos: " + pontos;
                    }
                }
            }
        }

        for (let i = inimigos.length - 1; i >= 0; i--) {
            const inimigo = inimigos[i];

            if (inimigo.tipo === 'ATIRADOR') {
                if (inimigo.y < inimigo.stopY) {
                    inimigo.y += inimigo.speed;
                } else {
                    if (Date.now() - inimigo.lastShot > inimigo.shootInterval) {
                        inimigoTiros.push({
                            x: inimigo.x, y: inimigo.y + inimigo.height / 2,
                            width: 8, height: 15, speed: 5
                        });
                        inimigo.lastShot = Date.now();
                    }
                }
            } else {
                inimigo.y += inimigo.speed;
            }

            for (let j = tiros.length - 1; j >= 0; j--) {
                const tiro = tiros[j];
                const dx = tiro.x - inimigo.x;
                const dy = tiro.y - inimigo.y;
                if (Math.sqrt(dx * dx + dy * dy) < tiro.width / 2 + inimigo.width / 2) {
                    inimigo.hp--;
                    tiros.splice(j, 1);
                    criarExplosao(tiro.x, tiro.y, '#FFFF00');

                    if (inimigo.hp <= 0) {
                        criarExplosao(inimigo.x, inimigo.y, '#FF00FF');
                        inimigos.splice(i, 1);
                        pontos += (inimigo.tipo === 'ATIRADOR' ? 25 : 10);
                        pontuacaoDiv.textContent = "Pontos: " + pontos;

                        if (magiaDesbloqueada && magiaCarregada < inimigosParaMagia) {
                            magiaCarregada++;
                            atualizarBarraMagia();
                        }
                    }
                    break;
                }
            }

            if (inimigos[i]) { 
                if (!player.invincible) {
                    const dx = inimigo.x - player.x;
                    const dy = inimigo.y - player.y;
                    if (Math.sqrt(dx * dx + dy * dy) < inimigo.width / 2 + player.width / 2) {
                        aplicarDanoAoJogador();
                        inimigos.splice(i, 1);
                        if (magiaDesbloqueada && magiaCarregada < inimigosParaMagia) {
                            magiaCarregada++;
                            atualizarBarraMagia();
                        }
                        continue;
                    }
                }

                if (inimigo.y > limiteDano) {
                    if (!primeiroAvisoDado) {
                        primeiroAvisoDado = true;
                        mostrarAvisoDeEscape();
                    } else {
                        inimigoEscapou = true;
                    }
                    inimigos.splice(i, 1);
                }
            }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        desenharEAtualizarEstrelas();
        desenharPlayer();
        desenharVidas();
        
        tiros.forEach(desenharTiro);
        inimigoTiros.forEach(desenharTiroInimigo);
        inimigos.forEach(inimigo => {
            if (inimigo.tipo === 'ATIRADOR') {
                desenharAtirador(inimigo);
            } else {
                desenharInimigo(inimigo);
            }
        });
        desenharMagiaBeam();
        desenharEAtualizarParticulas();

        if (estadoFase === 'GAMEPLAY' && inimigos.length === 0 && inimigoTiros.length === 0) {
            avancarEstadoFase();
        }
    }
}

// =======================================================
// ===== EVENTOS DE ENTRADA (Teclado e Botões) ===========
// =======================================================
document.addEventListener("keydown", (e) => {
    if (estadoFase === 'DIALOGO_INICIAL' && caixaDialogo.style.display === 'block' && e.key === " ") {
        return; 
    }

    if (e.key === "Shift" && !shiftPressed) {
        shiftPressed = true;
        ativarMagiaDasSombras();
    }

    if (!jogoAtivo) return; 

    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        leftPressed = true;
    }
    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        rightPressed = true;
    }
    if (e.key === " " && !spacePressed) {
        spacePressed = true;
        tiros.push({ x: player.x, y: player.y - player.height / 2, width: 6, height: 20, speed: 8 });
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") leftPressed = false;
    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") rightPressed = false;
    if (e.key === " ") spacePressed = false;
    if (e.key === "Shift") shiftPressed = false;
});

btnVoltarMenuFase.addEventListener("click", () => {
    window.location.href = '../menu2.0/menu.html#menu-principal';
});
btnTentarNovamente.addEventListener("click", inicializar);

inicializar();