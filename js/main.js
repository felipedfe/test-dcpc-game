'use strict';

/**
 * @type bool
 */
const debug = true;

/**
 * Largura do jogo (game.world)
 * @type int
 */
const gameWidth = 1360;

/**
 * Altura do jogo (game.world)
 * @type int 
 */
const gameHeight = 740;

/**
 * Largura da barra de carregamento
 * @type int		
 */
const progressBarWidth = 400;

/**
 * Altura da barra de carregamento
 * @type int	
 */
const progressBarHeight = 30;

/**
 * Borda interna da barra de carregamento
 * @type int		
 */
const progressBarInner = 0;

/**
 * Phaser.Game
 * @type object				
 */
const game = new Phaser.Game({
	type: Phaser.AUTO,
	width: gameWidth,
	height: gameHeight,
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH
	},
	autoRound: false,
	audio: {
		disableWebAudio: false,
		noAudio: false
	},
	scene: {
		preload: preload,
		create: create
	}
});

/**
 * Tela inicial com nome do jogo e botão 'JOGAR'
 * @type Phaser.Container
 */
let telaInicial;

/**
 * Área com ícones de acertos e erros
 * @type Phaser.Container
 */
let iconesCertoErrado;

/**
 * Tela 'Como Jogar'
 * @type Phaser.Container
 */
let telaComoJogar;

/**
 * Tela principal do jogo
 * @type Phaser.Container
 */
let telaJogo;

/**
 * Texto 'FASE X'
 * @type Phaser.Text
 */
let textoFase;

/**
 * 13 frames de animação do relógio
 * @type Phaser.Animation
 */
let relogio;

/**
 * Retorna se jogo está pausado (quando browser ou aba perde o foco) ou não
 * @type bool
 */
let pausado;

/**
 * Fase atual (inicial)
 * @type int
 */
let fase = 1;

/**
 * Total de fases no jogo
 * @type int
 */
let totalFases = 3;

/**
 * Sub-fase atual (inicial)
 * @type int
 */
let subFase = 1;

/**
 * Total de sub-fases
 * @type int
 */
let totalSubFases = 5;

/**
 * Total de erros
 * @type int
 */
let totalErros = 0;

/**
 * Total de acertos
 * @type int
 */
let totalAcertos = 0;

// -------------------
const fundoPorFase = {
	1: 'parede_1',
	2: 'parede_2',
	3: 'parede_3',
};

// guarda um Phaser.GameObjects.Image
let fundoSprite;

// guarda os GameObjects das crianças
let containerPersonagens;

let containerPratos;

let containerPedidos;

// onde guardamos os pedidos de cada subFase
let pedidosDaRodada = [];

let personagensDaRodada;

// -------------------

/**
 * Phaser.preload
 */
function preload() {
	(debug && console.log('Preloading...'));

	let progressBar = this.add.graphics();
	let progressBox = this.add.graphics();
	progressBox.fillStyle(0x222222, 0.8);
	progressBox.fillRect(
		(gameWidth - progressBarWidth) >> 1,
		(gameHeight - progressBarHeight) >> 1,
		progressBarWidth,
		progressBarHeight
	);

	let loadingText = this.make.text({
		x: gameWidth >> 1,
		y: (gameHeight >> 1) - 50,
		text: "Carregando...",
		style: {
			font: "26px"
		}
	}).setOrigin(0.5, 0.5);

	let percentText = this.make.text({
		x: gameWidth >> 1,
		y: gameHeight >> 1,
		text: "0%"
	}).setOrigin(0.5, 0.5);

	(debug && this.load.on('fileprogress', function (file) {
		console.log('Loading asset: ' + file.key);
	}));

	this.load.on("progress", function (e) {
		percentText.setText(parseInt(e * 100) + "%");
		progressBar.clear();
		progressBar.fillStyle(0x00cc99, 1);
		progressBar.fillRect(
			((gameWidth - progressBarWidth) >> 1) + progressBarInner,
			((gameHeight - progressBarHeight) >> 1) + progressBarInner,
			progressBarWidth * e - (progressBarInner << 1),
			progressBarHeight - (progressBarInner << 1)
		);
	});

	this.load.on("complete", function (e) {
		(debug && console.log('Loading complete'));
		[progressBar, progressBox, loadingText, percentText].map(function (e) {
			e.destroy(true);
		});
	});

	this.load.image("bg", "./assets/bg.jpg");
	this.load.image("mesa", "./assets/mesa.png");
	this.load.image("parede_1", "./assets/parede_1.jpg");
	this.load.image("parede_2", "./assets/parede_2.jpg");
	this.load.image("parede_3", "./assets/parede_3.jpg");
	this.load.image("bg_cj", "./assets/comojogar.jpg");
	this.load.atlas('atlas', './assets/atlas/texture.png', './assets/atlas/texture.json');
}

let $this;
function create() {
	(debug && console.log('Create'));

	$this = this;

	// Tela de abertura
	let bg = this.add.image(gameWidth >> 1, gameHeight >> 1, "bg");
	let botaoIniciar = this.add.image(gameWidth >> 1, (gameHeight >> 1) + 60, 'atlas', 'btn_jogar').setInteractive().on('pointerdown', function () {
		[telaInicial, botaoIniciar, bg].map(function (e) {
			e.destroy(true);
		});
		telaComoJogar.setVisible(true);
	});

	// Tela 'Como Jogar'
	let bg_cj = this.add.image(gameWidth >> 1, gameHeight >> 1, "bg_cj");
	let botaoIniciar_cj = this.add.image(1150, 570, 'atlas', 'btn_jogar2').setInteractive().on('pointerdown', function () {
		[telaComoJogar, botaoIniciar_cj, bg_cj].map(function (e) {
			e.destroy(true);
		});
		fnJogo();
	});

	telaInicial = this.add.container(0, 0, [bg, botaoIniciar]);
	telaComoJogar = this.add.container(0, 0, [bg_cj, botaoIniciar_cj]).setVisible(false);
}

/**
 * Cria jogo após clique em 'JOGAR'
 * @returns void
 */
function fnJogo() {
	(debug && console.log('fnJogo'));

	// Texto 'FASE X'
	textoFase = $this.make.text({
		x: 30,
		y: gameHeight - 120,
		style: {
			fontFamily: 'Dosis',
			fontSize: '40px',
			fill: '#c66',
		}
	});

	$relogio.onStop = function () {
		const eraUltimaSubFase = subFase === totalSubFases;
		erros.value++;

		if (!eraUltimaSubFase) {
			novaSubFase();
		} else {
			fimDeFase();
		}
	}

	// Ícones e relógio
	$icones.create();
	$relogio.create();

	// Container: a ordem dos itens na Array define o z-index do objeto no stage
	telaJogo = $this.add.container(0, 0, [
		relogio,
		iconesCertoErrado,
		textoFase
	]);

	// cria personagens e pedidos
	renderizaPersonagens();
	containerPersonagens.setDepth(-3);
	containerPersonagens.y = 90;

	let mesa = $this.add.image(0, (gameHeight / 2) - 30, "mesa");
	mesa.setOrigin(0, 0);
	mesa.setDepth(-3);

	renderizaPedidos();

	// eventos de drag
	$this.input.on('dragstart', function (_pointer, gameObject) {
		containerPratos.bringToTop(gameObject);
	});

	$this.input.on('drag', function (_pointer, gameObject, dragX, dragY) {
		gameObject.x = dragX;
		gameObject.y = dragY;
	});

	$this.input.on('drop', function (_pointer, gameObject, dropZone) {
		console.log("---> GameObject: ", gameObject);
		console.log("---> DropZone: ", dropZone);
	});

	$this.input.on('dragend', function (_pointer, gameObject) {
		gameObject.x = gameObject.initialXPos;
		gameObject.y = gameObject.initialYPos;
	});

	iniciaJogo();
}

function fimDeFase() {
	(debug && console.log(`===== FIM DA FASE ${fase} =====`));
	subFase = 1;
	fase++;
	$icones.reset();
	containerPratos.destroy(true);

	if (fase > totalFases) {
		fimDeJogo();
	} else {
		iniciaJogo();
	}
}

function fimDeJogo() {
	(debug && console.log('===== FIM DE JOGO ====='));
}

function aplicarFundoDaFase(faseAtual) {
	const key = fundoPorFase[faseAtual] ?? 'parede_1';
	if (!fundoSprite) {
		fundoSprite = $this.add.image(0, 0, key).setOrigin(0, 0);
		fundoSprite.setDepth(-5);
	} else {
		fundoSprite.setTexture(key);
	}
}

function renderizaPedidos() {
	containerPedidos = $this.add.container(0, 0);
	const totalPedidos = 5;

	for (let id = 1; id <= totalPedidos; id += 1) {
		const balao = $this.add.sprite(0, 0, 'atlas', 'pedido_' + id)
			.setOrigin(0, 0)
			.setData('id', id)
			.setVisible(false);
		containerPedidos.add(balao);
	}
}

function mostraPedidos() {
	for (let i = 0; i < personagensDaRodada.length; i += 1) {
		const personagem = personagensDaRodada[i];
		const idPedido = personagem.getData('idPedido');
		const balao = containerPedidos.list.find(function (b) {
			return b.getData('id') === idPedido;
		});

		if (balao) {
			if (personagensDaRodada[i].getData('id') === 5) {
				balao.x = containerPersonagens.x + personagem.x + 80;
			} else {
				balao.x = containerPersonagens.x + personagem.x + 140;
			}
			balao.y = containerPersonagens.y + personagem.y - 80;
			balao.setVisible(true);
		}
	}
}

function escondePedidos() {
	containerPedidos.iterate(function (balao) {
		balao.setVisible(false);
	});
}

// renderiza sprites das crianças
function criaPersonagem(id, x, y) {
	const personagem = $this.add
		.sprite(x, y, 'atlas', 'crianca_' + id + '_normal')
		.setOrigin(0, 0)
		.setInteractive()
		.setData('id', id)
		.setData('estado', 'normal')
		.setData('idPedido', -1);

	personagem.input.dropZone = true;

	return personagem;
}

function renderizaPersonagens() {
	containerPersonagens = $this.add.container(0, 0);

	let espacoEntrePersonagens = 0;
	const totalPersonagens = 5;

	for (let id = 1; id <= totalPersonagens; id += 1) {
		const offsetX = (id === 2) ? -50 : 0; // puxa o segundo um pouco pra esquerda
		const personagem = criaPersonagem(id, espacoEntrePersonagens + offsetX, 0);
		containerPersonagens.add(personagem);
		espacoEntrePersonagens += 280;
	}

	console.log("---->", containerPersonagens.list[0])
	return containerPersonagens;
}

const SABORES_PRATO = ['cupcake', 'morango', 'rosquinha'];

function escolheSaborPratoAleatorio() {
	return SABORES_PRATO[Math.floor(Math.random() * SABORES_PRATO.length)];
}

function embaralhaOrdemPratos() {
	const ordem = [1, 2, 3, 4, 5];
	let i = ordem.length - 1;
	for (; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		const t = ordem[i];
		ordem[i] = ordem[j];
		ordem[j] = t;
	}
	return ordem;
}

function criaPrato(id, x, y, sabor) {
	const referenciaPrato = 'prato_' + id + '_' + sabor;
	const prato = $this.add
		.sprite(x, y, 'atlas', referenciaPrato)
		.setOrigin(0, 0)
		.setInteractive()
		.setData('id', id)

	prato.initialXPos = x;
	prato.initialYPos = y;

	$this.input.setDraggable(prato);

	return prato;
}

function renderizaPratos() {
	containerPratos = $this.add.container(0, 0);

	let posXDoPrato = 40;
	const posYLinhaPar = 540;
	const posYLinhaImpar = 420;
	const espacoHorizontal = 250;
	const totalPratos = 5;
	const ordemIds = embaralhaOrdemPratos();

	for (let slot = 0; slot < totalPratos; slot += 1) {
		const id = ordemIds[slot];

		const posYDoPrato = (slot + 1) % 2 === 0 ? posYLinhaPar : posYLinhaImpar;
		const sabor = escolheSaborPratoAleatorio();
		const prato = criaPrato(id, posXDoPrato, posYDoPrato, sabor);
		containerPratos.add(prato);
		posXDoPrato += espacoHorizontal;
	}

	return containerPratos;
}

function iniciaJogo() {
	(debug && console.log('iniciaJogo'));
	textoFase.text = 'FASE ' + fase;

	aplicarFundoDaFase(fase);
	renderizaPratos();
	novaSubFase();
}

// aqui só preciso sortear os ids dos pedidos p/ depois associar ao personagens
function sorteioPedidos() {
	const disponiveis = [1, 2, 3, 4, 5];
	// fase = 3
	for (let i = 1; i <= fase; i += 1) {
		const indice = Math.floor(Math.random() * disponiveis.length);
		const numeroSorteado = disponiveis.splice(indice, 1)[0];
		pedidosDaRodada.push(numeroSorteado);
	}
}

// sorteia os personagens direto pelo container para associar os ids dos pedidos
function sorteioPersonagens() {
	const disponiveis = [...containerPersonagens.list];
	const resultado = [];

	for (let i = 0; i < fase; i += 1) {
		const indice = Math.floor(Math.random() * disponiveis.length);
		const personagem = disponiveis.splice(indice, 1)[0];
		resultado.push(personagem);
	}

	return resultado;
}


// function sorteia() {
// 	const disponiveis = [1, 2, 3, 4, 5];

// 	const resultado = [];
// 	for (let i = 0; i < fase; i += 1) {
// 			const indice = Math.floor(Math.random() * disponiveis.length);
// 			const numeroSorteado = disponiveis.splice(indice, 1)[0];
// 			resultado.push(numeroSorteado);
// 	}
// 	return resultado;
// }

/**
 * Inicia nova subfase.
 * @returns {void}
 */
function novaSubFase() {
	(debug && console.log('novaSubFase'));

	// reset da subfase anterior
	escondePedidos();
	containerPersonagens.iterate(function (p) { p.setData('idPedido', -1); });
	pedidosDaRodada = [];

	$relogio.start();

	sorteioPedidos();
	personagensDaRodada = sorteioPersonagens();

	for (let i = 0; i < fase; i += 1) {
		personagensDaRodada[i].setData('idPedido', pedidosDaRodada[i]);
	}

	mostraPedidos();

	(debug && console.log('---> pedidos da rodada:', pedidosDaRodada));
	(debug && console.log('---> personagens da rodada:', personagensDaRodada.map(p => ({ id: p.getData('id'), idPedido: p.getData('idPedido') }))));

	//...
}

/**
 * Controle dos ícones de erros/acertos
 * @function create Cria linha de ícones (canto esquerdo inferior)
 * @function define Define ícone atual (subFase atual) como acerto (true) ou erro (false) e avança subFase se subFase < totalSubFases
 * @see => O método define é chamado quando se incrementa os valores de 'erros' e 'acertos'. Ex: acertos.value++ incrementa um acerto e coloca um 'check' no ícone da sub-fase atual.
 * @function reset Reinicializa estado dos ícones para 'vazio'
 * @throws onCreate, onCorrect, onError, onReset (se definidos)
 */
let $icones = {
	onCreate: null,
	onCorrect: null,
	onError: null,
	onReset: null,
	create: function () {
		let objs = [];
		let i = 0;

		for (; i < totalSubFases; i++) {
			objs.push($this.add.container(i * 55, 0, [
				$this.add.image(0, 0, 'atlas', 'vazio').setOrigin(0, 0),
				$this.add.image(0, 0, 'atlas', 'acerto').setOrigin(0, 0).setVisible(false),
				$this.add.image(0, 0, 'atlas', 'erro').setOrigin(0, 0).setVisible(false)
			]));
		}
		iconesCertoErrado = $this.add.container(0, 0, objs);

		defineSize(iconesCertoErrado);

		iconesCertoErrado.x = 20;
		iconesCertoErrado.y = game.config.height - 70;

		(debug && console.log('$icones.create'));
		($icones.onCreate && $icones.onCreate());
	},
	define: function (v) {
		iconesCertoErrado.list[subFase - 1].list[0].setVisible(false);
		iconesCertoErrado.list[subFase - 1].list[v ? 1 : 2].setVisible(true);

		(v && $icones.onCorrect && $icones.onCorrect());
		(!v && $icones.onError && $icones.onError());

		(debug && console.log(v ? 'CORRETO' : 'ERRADO'));

		subFase < totalSubFases && subFase++;
	},
	reset: function () {
		let len = iconesCertoErrado.length;
		let i = 0;
		for (; i < len; i++) {
			iconesCertoErrado.list[i].list[0].setVisible(true);		// vazio
			iconesCertoErrado.list[i].list[1].setVisible(false);	// acerto
			iconesCertoErrado.list[i].list[2].setVisible(false);	// erro
		}
		($icones.onReset && $icones.onReset());
		(debug && console.log('$icones.reset'));
	}
}

/**
 * Controle do relógio
 * @function create	Cria relógio no canto inferior direito
 * @function start	Inicia contagem
 * @function stop	Para contagem
 * @function reset	Reincia posição do ponteiro
 * @throws onCreate, onStart, onStop, onReset, onTick (se definidos)
 */
let $relogio = {
	interval: null,
	onCreate: null,
	onStart: null,
	onStop: null,
	onReset: null,
	onTick: null,
	create: function () {
		$this.anims.create({
			key: 'relogio',
			frames: $this.anims.generateFrameNames('atlas', {
				prefix: 'tempo_',
				end: 4,
				zeroPad: 2
			}), repeat: 0
		});
		relogio = $this.add.sprite(gameWidth - 70, gameHeight - 70).anims.load('relogio');
		($relogio.onCreate && $relogio.onCreate());
		(debug && console.log('$relogio.create'));
	},
	start: function () {
		$relogio.reset();
		$relogio.interval = setInterval(function () {
			if (pausado)
				return;
			if (relogio.anims.currentFrame.isLast) {
				$relogio.stop();
				return;
			}
			relogio.anims.nextFrame();
			($relogio.onTick && $relogio.onTick());
			(debug && console.log('$relogio.tick'));
		}, 1000);
		($relogio.onStart && $relogio.onStart());
		(debug && console.log('$relogio.start'));
	},
	stop: function () {
		clearInterval($relogio.interval);
		($relogio.onStop && $relogio.onStop());
		(debug && console.log('$relogio.stop'));
	},
	reset: function () {
		relogio.anims.restart();
		relogio.anims.stop();
		($relogio.onReset && $relogio.onReset());
		(debug && console.log('$relogio.reset'));
	}
};

/**
 * Accessors de erro/acerto.
 * @use erros.value = 3; acertos.value++; console.log(erros.value);...
 */
let acertos = {
	val: 0,
	get value() {
		return this.val;
	},
	set value(v) {
		this.val = v;
		if (!v)
			return;
		$icones.define(true);
	}
};
let erros = {
	val: 0,
	get value() {
		return this.val;
	},
	set value(v) {
		this.val = v;
		if (!v)
			return;
		$icones.define(false);
	}
};

/**
 * Define largura e altura de containers baseado nos itens dentro do container.
 * @author Willian
 * @link https://phasergames.com/
 * @param {container} con
 * @returns {void}
 */
function defineSize(con) {
	var top = game.config.height,
		bottom = 0,
		left = game.config.width,
		right = 0;
	con.iterate(function (child) {
		var childX = child.x;
		var childY = child.y;
		var childW = child.displayWidth;
		var childH = child.displayHeight;
		var childTop = childY - (childH * child.originY);
		var childBottom = childY + (childH * (1 - child.originY));
		var childLeft = childX - (childW * child.originX);
		var childRight = childX + (childW * (1 - child.originY));
		if (childBottom > bottom) {
			bottom = childBottom;
		}
		if (childTop < top) {
			top = childTop;
		}
		if (childLeft < left) {
			left = childLeft;
		}
		if (childRight > right) {
			right = childRight;
		}
	});
	var h = Math.abs(top - bottom);
	var w = Math.abs(right - left);
	con.setSize(w, h);
}

/**
 * IE
 */
if (!String.prototype.repeat) {
	String.prototype.repeat = function (count) {
		'use strict';
		if (this == null)
			throw new TypeError('não é possível converter ' + this + ' para um objeto');

		var str = '' + this;
		count = +count;
		if (count != count)
			count = 0;

		if (count < 0)
			throw new RangeError('o núm. de repetições não pode ser negativo');

		if (count == Infinity)
			throw new RangeError('o núm. de repetições deve ser menor que infinito');

		count = Math.floor(count);
		if (str.length == 0 || count == 0)
			return '';

		/**
		 * Garantir que count seja um inteiro de 31 bits nos dá uma grande otimização
		 * na parte principal. Porém, navegadores atuais (de agosto de 2014 pra cá)
		 * não conseguem mais manipular strings de 1 << 28 chars ou maiores, então:
		 */
		if (str.length * count >= 1 << 28)
			throw new RangeError('o núm. de repetições não deve estourar o tamanho máx. de uma string');

		var rpt = '';
		for (var i = 0; i < count; i++)
			rpt += str;

		return rpt;
	};
}

/**
 * onLoad do documento HTML
 */
(function () {
	/**
	 * Define variável para controle de pausa pelo foco no jogo
	 */
	document.addEventListener("visibilitychange", function (e) {
		pausado = e.target.visibilityState === 'hidden';
	});
	window.addEventListener('blur', function () {
		pausado = true;
	});
	window.addEventListener('focus', function () {
		pausado = false;
	});
	/**
	 * Ação do botão de fullscreen (canto superior direito)
	 */
	document.getElementById('bt_fullscreen').addEventListener("click", function (e) {
		if (!document.fullscreenElement)
			document.documentElement.requestFullscreen();
		else
			document.exitFullscreen && document.exitFullscreen();
	}, false);
})();