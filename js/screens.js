'use strict';

// coloquei aqui as telas de fim de fase e fim de jogo

function fimDeFase() {
	(debug && console.log(`===== FIM DA FASE ${fase} | acertos: ${totalAcertos} erros: ${totalErros} =====`));

	if (fase === totalFases) {
		fimDeJogo();
		return;
	}

	let faseEncerrada = fase;

	let bloqueador = $this.add.zone(0, 0, gameWidth, gameHeight)
		.setOrigin(0, 0)
		.setInteractive();

	let overlay = $this.add.graphics();
	overlay.fillStyle(0x000000, 0.7);
	overlay.fillRect(0, 0, gameWidth, gameHeight);

	let titulo = $this.make.text({
		x: gameWidth >> 1,
		y: 180,
		text: 'FIM DA FASE ' + faseEncerrada,
		style: { fontFamily: 'Dosis', fontSize: '60px', fill: '#ffcc00' }
	}).setOrigin(0.5, 0.5);

	let textoPlacar = $this.make.text({
		x: gameWidth >> 1,
		y: 580,
		text: 'ACERTOS: ' + totalAcertos + '   ERROS: ' + totalErros,
		style: { fontFamily: 'Dosis', fontSize: '36px', fill: '#ffffff' }
	}).setOrigin(0.5, 0.5);

	let btnRepetir = $this.add.image(360, 370, 'atlas', 'botao_repetir_fase')
		.setInteractive()
		.on('pointerdown', function () {
			telaFimDeFase.destroy(true);
			totalAcertos = 0;
			totalErros = 0;
			subFase = 1;
			$icones.reset();
			containerPratos.destroy(true);
			iniciaJogo();
		});

	let btnProxima = $this.add.image(1000, 370, 'atlas', 'botao_proxima_fase')
		.setInteractive()
		.on('pointerdown', function () {
			telaFimDeFase.destroy(true);
			totalAcertos = 0;
			totalErros = 0;
			subFase = 1;
			fase++;
			$icones.reset();
			containerPratos.destroy(true);

			if (fase > totalFases) {
				fimDeJogo();
			} else {
				iniciaJogo();
			}
		});

	let telaFimDeFase = $this.add.container(0, 0, [bloqueador, overlay, titulo, textoPlacar, btnRepetir, btnProxima]);
}

function fimDeJogo() {
	(debug && console.log(`===== FIM DE JOGO | acertos: ${acertosJogo} erros: ${errosJogo} =====`));

	let bloqueador = $this.add.zone(0, 0, gameWidth, gameHeight)
		.setOrigin(0, 0)
		.setInteractive();

	let overlay = $this.add.graphics();
	overlay.fillStyle(0x000000, 0.7);
	overlay.fillRect(0, 0, gameWidth, gameHeight);

	let comida = $this.add.image(gameWidth >> 1, 100, 'atlas', 'comidas')
		.setOrigin(0.5, 0.5);

	let titulo = $this.make.text({
		x: gameWidth >> 1,
		y: 220,
		text: 'FIM DE JOGO',
		style: { fontFamily: 'Dosis', fontSize: '60px', fill: '#ffcc00' }
	}).setOrigin(0.5, 0.5);

	let textoPlacar = $this.make.text({
		x: gameWidth >> 1,
		y: 600,
		text: 'ACERTOS: ' + acertosJogo + '   ERROS: ' + errosJogo,
		style: { fontFamily: 'Dosis', fontSize: '36px', fill: '#ffffff' }
	}).setOrigin(0.5, 0.5);

	let btnRepetir = $this.add.image(340, 370, 'atlas', 'botao_repetir_fase')
		.setInteractive()
		.on('pointerdown', function () {
			telaFimDeJogo.destroy(true);
			acertosJogo = 0;
			errosJogo = 0;
			totalAcertos = 0;
			totalErros = 0;
			subFase = 1;
			$icones.reset();
			containerPratos.destroy(true);
			iniciaJogo();
		});

	let btnJogarNovamente = $this.add.image(1000, 370, 'atlas', 'botao_jogar_novamente')
		.setInteractive()
		.on('pointerdown', function () {
			telaFimDeJogo.destroy(true);
			acertosJogo = 0;
			errosJogo = 0;
			totalAcertos = 0;
			totalErros = 0;
			fase = 1;
			subFase = 1;
			$icones.reset();
			containerPratos.destroy(true);
			iniciaJogo();
		});

	let telaFimDeJogo = $this.add.container(0, 0, [bloqueador, overlay, comida, titulo, textoPlacar, btnRepetir, btnJogarNovamente]);
}
