'use strict';

// fundo
function aplicarFundoDaFase(faseAtual) {
	const key = fundoPorFase[faseAtual] ?? 'parede_1';
	if (!fundoSprite) {
		fundoSprite = $this.add.image(0, 0, key).setOrigin(0, 0);
		fundoSprite.setDepth(-5);
	} else {
		fundoSprite.setTexture(key);
	}
}

// pedidos
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

// personagens
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
		const offsetX = (id === 2) ? -50 : 0;
		const personagem = criaPersonagem(id, espacoEntrePersonagens + offsetX, 0);
		containerPersonagens.add(personagem);
		espacoEntrePersonagens += 280;
	}

	return containerPersonagens;
}

// pratos
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
