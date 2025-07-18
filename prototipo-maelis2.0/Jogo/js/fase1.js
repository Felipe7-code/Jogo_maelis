const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- Elementos da Interface ---
const pontuacaoDiv = document.getElementById("pontuacao");
const tutorialMovimento = document.getElementById("tutorial-movimento");
const tutorialAtaque = document.getElementById("tutorial-ataque");
const caixaDialogo = document.getElementById("caixa-dialogo");
const textoDialogo = document.getElementById("texto-dialogo");
const btnContinuar = document.getElementById("btn-continuar");
const fimDeFaseDiv = document.getElementById("fim-de-fase");
const btnVoltarMenuFase = document.getElementById("btnVoltarMenuFase");
const telaFalha = document.getElementById("tela-falha");
const btnTentarNovamente = document.getElementById("btn-tentar-novamente");
const avisoEscape = document.getElementById("aviso-escape"); // Referência para o aviso

// --- Constantes ---
const limiteEsquerdo = 50;
const limiteDireito = canvas.width - 50;
const limiteDano = 900;
const totalDeOndas = 3;

// --- Variáveis de Estado ---
let player, tiros, inimigos, pontos, estrelas, particulas;
let leftPressed = false, rightPressed = false, spacePressed = false;
let jogoAtivo = false;
let estadoFase = 'TUTORIAL_MOVIMENTO';
let ondaAtual = 0;
let inimigoEscapou = false; // Flag de falha final
let primeiroAvisoDado = false; // Flag para o primeiro aviso

// --- Imagem do Player ---
let playerImage = new Image();
playerImage.src = 'assets/cabeca.png';

// =======================================================
// ===== CONTROLE DE FLUXO DA FASE =======================
// =======================================================

function inicializar() {
    player = { x: canvas.width / 2, y: canvas.height - 80, width: 50, height: 50, speed: 6, lives: 3, invincible: false };
    tiros = []; inimigos = []; particulas = [];
    pontos = 0; ondaAtual = 0;
    inimigoEscapou = false;
    primeiroAvisoDado = false; // Reseta as flags
    leftPressed = false; rightPressed = false; spacePressed = false;
    jogoAtivo = true;
    estadoFase = 'TUTORIAL_MOVIMENTO';

    pontuacaoDiv.textContent = "Pontos: 0";
    tutorialMovimento.style.display = 'block';
    tutorialAtaque.style.display = 'none';
    caixaDialogo.style.display = 'none';
    fimDeFaseDiv.style.display = 'none';
    telaFalha.style.display = 'none';
    avisoEscape.style.display = 'none';

    criarEstrelas();
    atualizar();
}

function avancarEstadoFase() {
    switch (estadoFase) {
        case 'TUTORIAL_MOVIMENTO':
            tutorialMovimento.style.display = 'none';
            tutorialAtaque.style.display = 'block';
            estadoFase = 'TUTORIAL_ATAQUE';
            break;
        case 'TUTORIAL_ATAQUE':
            tutorialAtaque.style.display = 'none';
            estadoFase = 'GAMEPLAY';
            iniciarProximaOnda();
            break;
        case 'GAMEPLAY':
            if (inimigos.length === 0) {
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
            break;
        case 'NARRATIVA':
            caixaDialogo.style.display = 'none';
            fimDeFaseDiv.style.display = 'block';
            estadoFase = 'FIM';
            jogoAtivo = false;
            break;
    }
}

function mostrarDialogoFinal() {
    textoDialogo.textContent = "Nada mal! Mas é bom se preparar para o que vem mais a frente.";
    caixaDialogo.style.display = 'block';
}

function mostrarTelaDeFalha() {
    jogoAtivo = false;
    estadoFase = 'FALHA';
    telaFalha.style.display = 'flex';
}

function mostrarAvisoDeEscape() {
    if (avisoEscape.style.display === 'block') return; // Evita mostrar múltiplos avisos
    avisoEscape.style.display = 'block';
    avisoEscape.style.opacity = 1;

    setTimeout(() => {
        avisoEscape.style.opacity = 0;
        setTimeout(() => {
            avisoEscape.style.display = 'none';
        }, 500);
    }, 3500); // Aviso dura 3.5 segundos
}

function gameOver() {
    jogoAtivo = false;
    estadoFase = 'GAMEOVER';
    fimDeFaseDiv.querySelector('h1').textContent = "Game Over";
    fimDeFaseDiv.style.display = 'block';
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
// ===== CRIAÇÃO DE INIMIGOS (Sem alterações) ============
// =======================================================
function iniciarProximaOnda() {
    ondaAtual++;
    if (ondaAtual === 1) {
        for (let i = 0; i < 3; i++) criarAranhaCorrompida(150, -50 - (i * 60));
        criarAranhaCorrompida(canvas.width / 2, -150);
        criarAranhaCorrompida(canvas.width / 2 - 60, -210);
        criarAranhaCorrompida(canvas.width / 2 + 60, -210);
    } else if (ondaAtual === 2) {
        for (let i = 0; i < 7; i++) criarAranhaCorrompida(limiteEsquerdo + 50 + (i * 100), -50);
    } else if (ondaAtual === 3) {
        for (let i = 0; i < 4; i++) {
            criarAranhaCorrompida(limiteEsquerdo + 80 + (i * 50), -50 - (i * 50));
            criarAranhaCorrompida(limiteDireito - 80 - (i * 50), -50 - (i * 50));
        }
    }
}
function criarAranhaCorrompida(x, y) {
    inimigos.push({
        x: x, y: y, width: 40, height: 30, speed: 1.2 + Math.random() * 0.5, hp: 1, tipo: 'ARANHA'
    });
}
// =======================================================
// ===== FUNÇÕES DE DESENHO (Sem alterações) =============
// =======================================================
function criarEstrelas(){estrelas=[];for(let i=0;i<150;i++){estrelas.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,radius:Math.random()*1.5,speed:Math.random()*.4+.2})}}
function desenharEAtualizarEstrelas(){ctx.fillStyle="rgba(173, 216, 230, 0.7)";for(const estrela of estrelas){estrela.y+=estrela.speed;if(estrela.y>canvas.height){estrela.y=0;estrela.x=Math.random()*canvas.width}ctx.beginPath();ctx.arc(estrela.x,estrela.y,estrela.radius,0,Math.PI*2);ctx.fill()}}
function criarExplosao(x,y,cor){for(let i=0;i<20;i++){particulas.push({x:x,y:y,vx:(Math.random()-.5)*4,vy:(Math.random()-.5)*4,radius:Math.random()*3,cor:cor,vida:40})}}
function desenharEAtualizarParticulas(){for(let i=particulas.length-1;i>=0;i--){const p=particulas[i];p.x+=p.vx;p.y+=p.vy;p.vida--;if(p.vida<=0){particulas.splice(i,1);continue}ctx.fillStyle=p.cor;ctx.globalAlpha=p.vida/40;ctx.beginPath();ctx.arc(p.x,p.y,p.radius,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}}
function desenharPlayer(){ctx.globalAlpha=1;if(player.invincible){ctx.globalAlpha=Math.floor(Date.now()/150)%2===0?.9:.4}ctx.drawImage(playerImage,player.x-player.width/2,player.y-player.height/2,player.width,player.height);ctx.globalAlpha=1}
function desenharVidas(){const heartSize=20,padding=10,startX=30,startY=60;ctx.fillStyle='#FF3C3C';ctx.shadowColor='#FF3C3C';ctx.shadowBlur=10;ctx.font="24px 'Press Start 2P'";for(let i=0;i<player.lives;i++){const x=startX+i*(heartSize+padding+10);ctx.fillText("❤️",x,startY)}ctx.shadowBlur=0}
function desenharInimigo(inimigo){ctx.fillStyle="#8B008B";ctx.shadowColor="#FF00FF";ctx.shadowBlur=15;ctx.beginPath();ctx.arc(inimigo.x,inimigo.y,inimigo.width/2,0,Math.PI*2);ctx.fill();ctx.fillStyle="red";ctx.fillRect(inimigo.x-5,inimigo.y-5,4,4);ctx.fillRect(inimigo.x+1,inimigo.y-5,4,4);ctx.shadowBlur=0}
function desenharTiro(tiro){ctx.fillStyle="#FFFF00";ctx.shadowColor="#FFFF00";ctx.shadowBlur=15;ctx.fillRect(tiro.x-tiro.width/2,tiro.y,tiro.width,tiro.height);ctx.shadowBlur=0}
// =======================================================
// ===== LOOP PRINCIPAL DO JOGO (ATUALIZAR) ==============
// =======================================================
function atualizar() {
    if (estadoFase === 'FIM' || estadoFase === 'FALHA' || estadoFase === 'GAMEOVER') return;
    requestAnimationFrame(atualizar);

    if (jogoAtivo) {
        if (leftPressed) player.x -= player.speed;
        if (rightPressed) player.x += player.speed;
        if (player.x - player.width / 2 < limiteEsquerdo) player.x = limiteEsquerdo + player.width / 2;
        if (player.x + player.width / 2 > limiteDireito) player.x = limiteDireito - player.width / 2;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharEAtualizarEstrelas();
    desenharPlayer();
    desenharVidas();

    for (let i = tiros.length - 1; i >= 0; i--) {
        const tiro = tiros[i];
        tiro.y -= tiro.speed;
        desenharTiro(tiro);
        if (tiro.y < -tiro.height) { tiros.splice(i, 1); }
    }

    for (let i = inimigos.length - 1; i >= 0; i--) {
        const inimigo = inimigos[i];
        if (jogoAtivo) inimigo.y += inimigo.speed;
        desenharInimigo(inimigo);

        for (let j = tiros.length - 1; j >= 0; j--) {
            const tiro = tiros[j];
            const dx = tiro.x - inimigo.x; const dy = tiro.y - inimigo.y;
            if (Math.sqrt(dx * dx + dy * dy) < tiro.width / 2 + inimigo.width / 2) {
                criarExplosao(inimigo.x, inimigo.y, '#FF00FF');
                inimigos.splice(i, 1);
                tiros.splice(j, 1);
                pontos += 10;
                pontuacaoDiv.textContent = "Pontos: " + pontos;
                if (estadoFase === 'GAMEPLAY') avancarEstadoFase();
                break;
            }
        }

        if (inimigos[i]) {
            if (!player.invincible) {
                const dx = inimigo.x - player.x; const dy = inimigo.y - player.y;
                if (Math.sqrt(dx * dx + dy * dy) < inimigo.width / 2 + player.width / 2) {
                    aplicarDanoAoJogador();
                    inimigos.splice(i, 1);
                    if (estadoFase === 'GAMEPLAY') avancarEstadoFase();
                    continue;
                }
            }

            // <<<<<<<<<<<< LÓGICA DE AVISO E FALHA AQUI >>>>>>>>>>>>
            if (inimigo.y > limiteDano) {
                if (!primeiroAvisoDado) {
                    primeiroAvisoDado = true;
                    mostrarAvisoDeEscape(); // Mostra o aviso e não penaliza
                } else {
                    inimigoEscapou = true; // A partir do segundo, marca a condição de falha
                }
                inimigos.splice(i, 1);
                if (estadoFase === 'GAMEPLAY') avancarEstadoFase();
            }
            // <<<<<<<<<<<<<<< FIM DA LÓGICA >>>>>>>>>>>>>>>>>
        }
    }

    desenharEAtualizarParticulas();
}
// =======================================================
// ===== EVENTOS DE ENTRADA ==============================
// =======================================================
document.addEventListener("keydown",(e)=>{if(!jogoAtivo)return;if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a"){leftPressed=!0;if(estadoFase==='TUTORIAL_MOVIMENTO')avancarEstadoFase()}if(e.key==="ArrowRight"||e.key.toLowerCase()==="d"){rightPressed=!0;if(estadoFase==='TUTORIAL_MOVIMENTO')avancarEstadoFase()}if(e.key===" "&&!spacePressed){spacePressed=!0;tiros.push({x:player.x,y:player.y-player.height/2,width:6,height:20,speed:8});if(estadoFase==='TUTORIAL_ATAQUE')avancarEstadoFase()}});
document.addEventListener("keyup",(e)=>{if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")leftPressed=!1;if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")rightPressed=!1;if(e.key===" ")spacePressed=!1});
btnContinuar.addEventListener("click",()=>{if(estadoFase==='NARRATIVA')avancarEstadoFase()});
btnVoltarMenuFase.addEventListener("click",()=>{window.location.href='../menu2.0/menu.html#menu-principal'});
btnTentarNovamente.addEventListener("click", inicializar);

// --- Inicia o Jogo ---
inicializar();