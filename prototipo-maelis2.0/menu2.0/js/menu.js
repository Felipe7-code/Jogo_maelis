document.addEventListener('DOMContentLoaded', () => {
    // Pegando os elementos da tela
    const telaInicial = document.getElementById('tela-inicial');
    const menuPrincipal = document.getElementById('menu-principal');
    const telaCreditos = document.getElementById('tela-creditos');
    const telaCutscene = document.getElementById('tela-cutscene');

    // << NOVO: Pega a referência do áudio
    const musicaMenu = document.getElementById('musica-menu');
    // << NOVO: Pega a referência do áudio do clique
    const somClick = document.getElementById('som-click');
    // << NOVO: Pega a referência do áudio de hover
    const somHover = document.getElementById('som-hover');

    // Pegando os botões
    const botaoIniciar = document.getElementById('botao-iniciar'); // << NOVO: Referência para o botão Iniciar
    const botaoFase2 = document.getElementById('botao-fase2');
    const botaoModoInfinito = document.getElementById('botao-modo-infinito');
    const botaoCreditos = document.getElementById('botao-creditos');

    // =================================================================
    // ===== LÓGICA AVANÇADA DE ROLAGEM DOS CRÉDITOS ===================
    // =================================================================

    const creditosAnimacaoContainer = document.querySelector('.creditos-animacao-container');
    
    let scrollPosition = 0;
    let scrollSpeed = 0.5;
    let isAutoScrolling = false;
    let scrollTimeout;
    let animationFrameId;

    function animateCredits() {
        if (isAutoScrolling) {
            scrollPosition -= scrollSpeed;
            const umBlocoHeight = creditosAnimacaoContainer.children[0].offsetHeight;
            if (Math.abs(scrollPosition) >= umBlocoHeight) {
                scrollPosition += umBlocoHeight;
            }
        }
        
        if (creditosAnimacaoContainer) {
            creditosAnimacaoContainer.style.transform = `translateY(${scrollPosition}px)`;
        }
        animationFrameId = requestAnimationFrame(animateCredits);
    }

    function startCredits() {
        scrollPosition = 0; 
        if (creditosAnimacaoContainer) {
            creditosAnimacaoContainer.style.transform = `translateY(0px)`;
        }
        isAutoScrolling = true;
        menuPrincipal.style.display = 'none';
        telaCreditos.style.display = 'flex';
        animateCredits();
        telaCreditos.addEventListener('wheel', handleManualScroll);
        window.addEventListener('keydown', stopCredits, { once: true });
    }

    function stopCredits() {
        if (telaCreditos.style.display === 'flex') {
            cancelAnimationFrame(animationFrameId);
            isAutoScrolling = false;
            telaCreditos.removeEventListener('wheel', handleManualScroll);
            telaCreditos.style.display = 'none';
            menuPrincipal.style.display = 'flex';
        }
    }

    function handleManualScroll(event) {
        event.preventDefault();
        isAutoScrolling = false;
        clearTimeout(scrollTimeout);
        scrollPosition -= event.deltaY;
        const umBlocoHeight = creditosAnimacaoContainer.children[0].offsetHeight;
        scrollPosition = Math.max(-umBlocoHeight, scrollPosition);
        scrollPosition = Math.min(0, scrollPosition);
        scrollTimeout = setTimeout(() => {
            isAutoScrolling = true;
        }, 2000);
    }
    
    // =================================================================
    // ===== FLUXO PRINCIPAL DO MENU ===================================
    // =================================================================

    function mostrarCutscene() {
        telaInicial.style.display = 'none';
        telaCutscene.style.display = 'block';
        window.addEventListener('keydown', mostrarMenuPrincipal, { once: true });
    }

    function mostrarMenuPrincipal() {
        telaInicial.style.display = 'none';
        telaCutscene.style.display = 'none';
        menuPrincipal.style.display = 'flex'; 

    // << NOVO: Toca a música quando o menu aparecer
        // A verificação 'musicaMenu.paused' garante que a música não reinicie se já estiver tocando
        if (musicaMenu && musicaMenu.paused) {
            musicaMenu.play().catch(error => {
                // A reprodução automática pode ser bloqueada pelo navegador.
                // Uma interação do usuário (clique) é necessária para iniciar.
                console.log("A reprodução de áudio foi bloqueada pelo navegador. O usuário precisa interagir com a página primeiro.");
            });
        }

        stopCredits();
    }

    

    if (window.location.hash === '#menu-principal') {
        mostrarMenuPrincipal();
    } else {
        window.addEventListener('keydown', mostrarCutscene, { once: true });
    }

    // <<<<<<<<<<<<<<< ALTERAÇÕES AQUI >>>>>>>>>>>>>>>>>

    // Função para o som do clique
    function tocarSomDeClique() {
        if (somClick) {
            somClick.currentTime = 0;
            somClick.play();
        }
    }

    // << NOVO: Função para o som de hover
    function tocarSomDeHover() {
        if (somHover) {
            somHover.currentTime = 0; // Garante que o som toque sempre
            somHover.play();
        }
    }
    
    // --- EVENTOS DE CLIQUE ---
    botaoIniciar.addEventListener('click', () => {
        tocarSomDeClique();
        setTimeout(() => {
            window.location.href = '../Jogo/fase1.html'; //
        }, 150);
    });

    botaoFase2.addEventListener('click', () => {
        tocarSomDeClique();
        setTimeout(() => {
            window.location.href = '../Jogo/fase2.html'; //
        }, 150);
    });

    botaoModoInfinito.addEventListener('click', () => {
        tocarSomDeClique();
        setTimeout(() => {
            window.location.href = '../Jogo/modoInfinito.html'; //
        }, 150);
    });

    botaoCreditos.addEventListener('click', () => {
        tocarSomDeClique();
        startCredits(); //
    });

    // --- NOVO: EVENTOS DE HOVER ---
    botaoIniciar.addEventListener('mouseover', tocarSomDeHover);
    botaoFase2.addEventListener('mouseover', tocarSomDeHover);
    botaoModoInfinito.addEventListener('mouseover', tocarSomDeHover);
    botaoCreditos.addEventListener('mouseover', tocarSomDeHover);
});