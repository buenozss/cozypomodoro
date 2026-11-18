
// ==========================================
// CONFIGURAÇÕES
// ==========================================

const TEMPO_INICIAL = 25 * 60;

const CHAVE_ADESIVOS = "cozyAdesivosDesbloqueados";
const CHAVE_POSICOES = "cozyPosicoesAdesivos";
const CHAVE_PAGINA = "cozyPaginaAtual"

const TOTAL_PAGINAS = 10;

// ==========================================
// ELEMENTOS DO HTML
// ==========================================

const timerDisplay = document.getElementById("timer");
const timerMessage = document.getElementById("timer-message");

const startButton = document.getElementById("start-timer");
const pauseButton = document.getElementById("pause-timer");
const resetButton = document.getElementById("reset-timer");

const stickerArea = document.getElementById("sticker-area");
const stickerInventory = document.getElementById("sticker-inventory");

const collectionTitle = document.getElementById("collection-count");
const progressFill = document.getElementById("progress-fill");
const collectionMessage = document.getElementById("collection-message");

const pageCounter = document.getElementById("page-counter");
const previousButton = document.getElementById("previous-page");
const nextButton = document.getElementById("next-page");

const pageTitle = document.querySelector(".right-page .page-title");
const pageNumber = document.querySelector(".right-page .page-number");

// Elementos das tarefas
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

// Elementos do diário
const noteForm = document.getElementById("note-form");
const noteTitle = document.getElementById("note-title");
const noteContent = document.getElementById("note-content");
const notesList = document.getElementById("notes-list");

// ==========================================
// COLEÇÃO DE ADESIVOS
// ==========================================

const adesivos = [
    { id: "morango", nome: "Morango", emoji: "🍓" },
    { id: "cha", nome: "Chazinho", emoji: "☕" },
    { id: "flor", nome: "Flor", emoji: "🌷" },
    { id: "lua", nome: "Lua", emoji: "🌙" },
    { id: "livro", nome: "Livro", emoji: "📖" },
    { id: "nuvem", nome: "Nuvem", emoji: "☁️" },
    { id: "estrela", nome: "Estrela", emoji: "⭐" },
    { id: "cogumelo", nome: "Cogumelo", emoji: "🍄" },
    { id: "gatinho", nome: "Gatinho", emoji: "🐈" },
    { id: "buque", nome: "Buquê", emoji: "💐" }
];

// ==========================================
// RECUPERAR DADOS SALVOS
// ==========================================

let quantidadeDesbloqueada = Number(
    localStorage.getItem(CHAVE_ADESIVOS)
) || 0;

quantidadeDesbloqueada = Math.max(
    0,
    Math.min(quantidadeDesbloqueada, adesivos.length)
);

let posicoesAdesivos = {};

try {
    posicoesAdesivos = JSON.parse(
        localStorage.getItem(CHAVE_POSICOES)
    ) || {};
} catch {
    posicoesAdesivos = {};
}

// Compatibilidade com posições da versão anterior
const formatoAntigo = Object.keys(posicoesAdesivos)
    .some(chave => adesivos.some(a => a.id === chave));

if (formatoAntigo) {
    posicoesAdesivos = {
        "1": posicoesAdesivos
    };

    localStorage.setItem(
        CHAVE_POSICOES,
        JSON.stringify(posicoesAdesivos)
    );
}

// Recuperar página atual
let paginaAtual = Number(
    localStorage.getItem(CHAVE_PAGINA)
) || 1;

paginaAtual = Math.max(
    1,
    Math.min(paginaAtual, TOTAL_PAGINAS)
);

// ==========================================
// CONTROLE DO TEMPORIZADOR
// ==========================================

let tempoRestante = TEMPO_INICIAL;
let intervalo = null;
let sessaoConcluida = false;

// ==========================================
// ATUALIZAR DISPLAY
// ==========================================

function atualizarDisplay() {
    const minutos = Math.floor(tempoRestante / 60);
    const segundos = tempoRestante % 60;

    timerDisplay.textContent =
        `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
}

// ==========================================
// SALVAR POSIÇÕES DOS ADESIVOS
// ==========================================

function salvarPosicoes() {
    localStorage.setItem(
        CHAVE_POSICOES,
        JSON.stringify(posicoesAdesivos)
    );
}

// ==========================================
// NAVEGAÇÃO DO ÁLBUM
// ==========================================

function atualizarNavegacao() {
    const numero = String(paginaAtual).padStart(2, "0");

    pageCounter.textContent =
        `${numero} / ${String(TOTAL_PAGINAS).padStart(2, "0")}`;

    pageNumber.textContent = numero;

    previousButton.disabled = paginaAtual === 1;
    nextButton.disabled = paginaAtual === TOTAL_PAGINAS;

    const titulos = [
        "minhas conquistas",
        "meus momentos",
        "pequenas alegrias",
        "meus estudos",
        "dias especiais",
        "minhas inspirações",
        "coisas favoritas",
        "meus progressos",
        "boas lembranças",
        "minha jornada"
    ];

    pageTitle.textContent = titulos[paginaAtual - 1];
}

function mudarPagina(direcao) {
    const novaPagina = paginaAtual + direcao;

    if (novaPagina < 1 || novaPagina > TOTAL_PAGINAS) {
        return;
    }

    paginaAtual = novaPagina;

    localStorage.setItem(CHAVE_PAGINA, paginaAtual);

    atualizarNavegacao();
    atualizarInventario();
    atualizarAlbum();
}

// ==========================================
// ATUALIZAR COLEÇÃO
// ==========================================

function atualizarColecao() {
    collectionTitle.textContent =
        `${quantidadeDesbloqueada} de ${adesivos.length} adesivos`;

    const progresso =
        (quantidadeDesbloqueada / adesivos.length) * 100;

    progressFill.style.width = `${progresso}%`;

    collectionMessage.textContent =
        quantidadeDesbloqueada === adesivos.length
            ? "Você completou sua coleção! ♡"
            : "Suas conquistas estão apenas começando!";

    atualizarInventario();
    atualizarAlbum();
}

// ==========================================
// VERIFICAR ADESIVOS JÁ POSICIONADOS
// ==========================================

function adesivoJaFoiPosicionado(id) {
    return Object.values(posicoesAdesivos)
        .some(pagina => pagina && pagina[id]);
}

// ==========================================
// ATUALIZAR INVENTÁRIO
// ==========================================

function atualizarInventario() {
    stickerInventory.replaceChildren();

    const disponiveis = adesivos
        .slice(0, quantidadeDesbloqueada)
        .filter(adesivo => !adesivoJaFoiPosicionado(adesivo.id));

    if (disponiveis.length === 0) {
        const mensagem = document.createElement("p");

        mensagem.textContent =
            quantidadeDesbloqueada === 0
                ? "Nenhum adesivo disponível ainda."
                : "Todos os seus adesivos já estão no álbum! ♡";

        stickerInventory.appendChild(mensagem);
        return;
    }

    disponiveis.forEach(adesivo => {
        const sticker = document.createElement("div");

        sticker.classList.add("sticker-item");
        sticker.textContent = adesivo.emoji;
        sticker.title = `Arraste ${adesivo.nome} para o álbum`;
        sticker.dataset.stickerId = adesivo.id;

        stickerInventory.appendChild(sticker);
    });
}

// ==========================================
// ATUALIZAR PÁGINA DO ÁLBUM
// ==========================================

function atualizarAlbum() {
    stickerArea.querySelectorAll(".sticker-placed")
        .forEach(sticker => sticker.remove());

    const placeholder = stickerArea.querySelector(
        ".sticker-placeholder"
    );

    const adesivosDaPagina =
        posicoesAdesivos[paginaAtual] || {};

    const idsNaPagina = Object.keys(adesivosDaPagina);

    if (placeholder) {
        placeholder.style.display =
            idsNaPagina.length === 0 ? "block" : "none";
    }

    adesivos.forEach(adesivo => {
        const posicao = adesivosDaPagina[adesivo.id];

        if (posicao) {
            criarAdesivoNoAlbum(adesivo, posicao);
        }
    });
}

// ==========================================
// CRIAR ADESIVO NO ÁLBUM
// ==========================================

function criarAdesivoNoAlbum(adesivo, posicao) {
    const sticker = document.createElement("div");

    sticker.classList.add("sticker-item", "sticker-placed");

    sticker.textContent = adesivo.emoji;
    sticker.title = adesivo.nome;

    sticker.dataset.stickerId = adesivo.id;

    sticker.style.left = `${posicao.x}%`;
    sticker.style.top = `${posicao.y}%`;

    stickerArea.appendChild(sticker);
}

// ==========================================
// DESBLOQUEAR ADESIVO
// ==========================================



// ==========================================
// ARRASTAR ADESIVOS
// ==========================================

let arrastando = null;

function iniciarArraste(event) {
    const sticker = event.target.closest(".sticker-item");

    if (!sticker) return;

    event.preventDefault();

    const stickerId = sticker.dataset.stickerId;

    const adesivo = adesivos.find(
        item => item.id === stickerId
    );

    if (!adesivo) return;

    const rect = stickerArea.getBoundingClientRect();

    const elementoInventario = !sticker.classList.contains(
        "sticker-placed"
    );

    if (elementoInventario) {
        const preview = document.createElement("div");

        preview.classList.add("sticker-item", "sticker-preview");
        preview.textContent = adesivo.emoji;

        document.body.appendChild(preview);

        arrastando = {
            id: stickerId,
            origem: "inventario",
            elemento: preview,
            rect
        };
    } else {
        arrastando = {
            id: stickerId,
            origem: "album",
            elemento: sticker,
            rect
        };
    }

    moverArraste(event);
}

function moverArraste(event) {
    if (!arrastando) return;

    const { elemento, origem, rect } = arrastando;

    if (origem === "inventario") {
        elemento.style.left = `${event.clientX}px`;
        elemento.style.top = `${event.clientY}px`;
    } else {
        const margem = 22;

        const x = Math.max(
            margem,
            Math.min(event.clientX - rect.left, rect.width - margem)
        );

        const y = Math.max(
            margem,
            Math.min(event.clientY - rect.top, rect.height - margem)
        );

        elemento.style.left = `${(x / rect.width) * 100}%`;
        elemento.style.top = `${(y / rect.height) * 100}%`;
    }
}

function finalizarArraste(event) {
    if (!arrastando) return;

    const { id, origem, elemento, rect } = arrastando;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const dentroDoAlbum =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

    if (origem === "inventario") {
        elemento.remove();

        if (dentroDoAlbum) {
            const margem = 22;

            const posicaoX = Math.max(
                margem,
                Math.min(x, rect.width - margem)
            );

            const posicaoY = Math.max(
                margem,
                Math.min(y, rect.height - margem)
            );

            if (!posicoesAdesivos[paginaAtual]) {
                posicoesAdesivos[paginaAtual] = {};
            }

            posicoesAdesivos[paginaAtual][id] = {
                x: (posicaoX / rect.width) * 100,
                y: (posicaoY / rect.height) * 100
            };

            salvarPosicoes();
            atualizarInventario();
            atualizarAlbum();
        }
    } else {
        if (dentroDoAlbum) {
            const margem = 22;

            const posicaoX = Math.max(
                margem,
                Math.min(x, rect.width - margem)
            );

            const posicaoY = Math.max(
                margem,
                Math.min(y, rect.height - margem)
            );

            posicoesAdesivos[paginaAtual][id] = {
                x: (posicaoX / rect.width) * 100,
                y: (posicaoY / rect.height) * 100
            };

            salvarPosicoes();
        } else {
            const posicaoAnterior =
                posicoesAdesivos[paginaAtual][id];

            elemento.style.left = `${posicaoAnterior.x}%`;
            elemento.style.top = `${posicaoAnterior.y}%`;
        }
    }

    arrastando = null;
}

// ==========================================
// EVENTOS DE ARRASTE
// ==========================================

stickerInventory.addEventListener("pointerdown", iniciarArraste);
stickerArea.addEventListener("pointerdown", iniciarArraste);

document.addEventListener("pointermove", moverArraste);
document.addEventListener("pointerup", finalizarArraste);
document.addEventListener("pointercancel", finalizarArraste);


// ==========================================
// LISTA DE TAREFAS
// ==========================================

let tarefas = [];

// Buscar tarefas no backend
async function carregarTarefas() {
    try {
        const resposta = await fetch("/api/tarefas");

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar as tarefas.");
        }

        tarefas = await resposta.json();

        atualizarTarefas();

    } catch (erro) {
        console.error("Erro ao carregar tarefas:", erro);
    }
}

// Atualizar a lista visualmente
function atualizarTarefas() {
    taskList.replaceChildren();

    if (tarefas.length === 0) {
        const mensagem = document.createElement("li");

        mensagem.textContent = "Nenhuma tarefa por enquanto. ♡";
        mensagem.classList.add("task-empty");

        taskList.appendChild(mensagem);
        return;
    }

    tarefas.forEach(tarefa => {
        const item = document.createElement("li");

        item.classList.add("task-item");

        if (tarefa.concluida) {
            item.classList.add("completed");
        }

        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = tarefa.concluida;

        checkbox.addEventListener("change", async () => {
            try {
                const resposta = await fetch(
                    `/api/tarefas/${tarefa.id}`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            concluida: checkbox.checked
                        })
                    }
                );

                if (!resposta.ok) {
                    throw new Error("Não foi possível atualizar a tarefa.");
                }

                const tarefaAtualizada = await resposta.json();

                tarefas = tarefas.map(item =>
                    item.id === tarefaAtualizada.id
                        ? tarefaAtualizada
                        : item
                );

                atualizarTarefas();

            } catch (erro) {
                console.error("Erro ao atualizar tarefa:", erro);
                checkbox.checked = tarefa.concluida;
                alert("Não foi possível atualizar a tarefa.");
            }
        });

        const texto = document.createElement("span");
        texto.textContent = tarefa.texto;

        const excluir = document.createElement("button");

        excluir.type = "button";
        excluir.textContent = "×";
        excluir.title = "Excluir tarefa";

        excluir.addEventListener("click", async () => {
            try {
                const resposta = await fetch(
                    `/api/tarefas/${tarefa.id}`,
                    {
                        method: "DELETE"
                    }
                );

                if (!resposta.ok) {
                    throw new Error("Não foi possível excluir a tarefa.");
                }

                tarefas = tarefas.filter(
                    item => item.id !== tarefa.id
                );

                atualizarTarefas();

            } catch (erro) {
                console.error("Erro ao excluir tarefa:", erro);
                alert("Não foi possível excluir a tarefa.");
            }
        });

        item.append(checkbox, texto, excluir);

        taskList.appendChild(item);
    });
}

// Cadastrar uma nova tarefa
taskForm.addEventListener("submit", async event => {
    event.preventDefault();

    const texto = taskInput.value.trim();

    if (texto === "") return;

    try {
        const resposta = await fetch("/api/tarefas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ texto })
        });

        if (!resposta.ok) {
            throw new Error("Não foi possível cadastrar a tarefa.");
        }

        const novaTarefa = await resposta.json();

        tarefas.push(novaTarefa);

        carregarTarefas();

        taskInput.value = "";

    } catch (erro) {
        console.error("Erro ao cadastrar tarefa:", erro);
        alert("Não foi possível salvar sua tarefa.");
    }
});




// ==========================================
// MEU DIÁRIO
// ==========================================

let notas = [];

// Identificar se estamos editando uma anotação
let notaEmEdicao = null;

// Carregar anotações do backend
async function carregarNotas() {
    try {
        const resposta = await fetch("/api/notas");

        if (!resposta.ok) {
            throw new Error("Erro ao carregar anotações.");
        }

        notas = await resposta.json();
        atualizarNotas();

    } catch (erro) {
        console.error("Erro ao carregar anotações:", erro);
    }
}

// Limpar formulário
function limparFormularioNota() {
    noteForm.reset();
    notaEmEdicao = null;

    const botao = noteForm.querySelector("button[type='submit']");
    botao.textContent = "+ Guardar anotação";
}

// Mostrar anotações
function atualizarNotas() {
    notesList.replaceChildren();

    if (notas.length === 0) {
        const mensagem = document.createElement("p");

        mensagem.classList.add("notes-empty");
        mensagem.textContent = "Seu diário ainda está vazio. Escreva sua primeira lembrança! ♡";

        notesList.appendChild(mensagem);
        return;
    }

    notas.forEach(nota => {
        const card = document.createElement("article");
        card.classList.add("note-item");

        const titulo = document.createElement("h3");
        titulo.textContent = nota.titulo;

        const conteudo = document.createElement("p");
        conteudo.textContent = nota.conteudo;

        const data = document.createElement("small");
        data.textContent = new Date(nota.data).toLocaleDateString("pt-BR");

        const acoes = document.createElement("div");
        acoes.classList.add("note-actions");

        // Botão editar
        const editar = document.createElement("button");
        editar.type = "button";
        editar.textContent = "Editar";

        editar.addEventListener("click", () => {
            noteTitle.value = nota.titulo;
            noteContent.value = nota.conteudo;

            notaEmEdicao = nota.id;

            const botao = noteForm.querySelector("button[type='submit']");
            botao.textContent = "Salvar alterações";

            noteTitle.focus();
        });

        // Botão excluir
        const excluir = document.createElement("button");
        excluir.type = "button";
        excluir.textContent = "Excluir";

        excluir.addEventListener("click", async () => {
            try {
                const resposta = await fetch(`/api/notas/${nota.id}`, {
                    method: "DELETE"
                });

                if (!resposta.ok) {
                    throw new Error("Erro ao excluir anotação.");
                }

                notas = notas.filter(item => item.id !== nota.id);
                atualizarNotas();

                if (notaEmEdicao === nota.id) {
                    limparFormularioNota();
                }

            } catch (erro) {
                console.error("Erro ao excluir anotação:", erro);
                alert("Não foi possível excluir a anotação.");
            }
        });

        acoes.append(editar, excluir);
        card.append(titulo, conteudo, data, acoes);
        notesList.appendChild(card);
    });
}

// Criar ou editar anotação
noteForm.addEventListener("submit", async event => {
    event.preventDefault();

    const titulo = noteTitle.value.trim();
    const conteudo = noteContent.value.trim();

    if (!titulo || !conteudo) return;

    try {
        let resposta;

        if (notaEmEdicao !== null) {
            resposta = await fetch(`/api/notas/${notaEmEdicao}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ titulo, conteudo })
            });

        } else {
            resposta = await fetch("/api/notas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ titulo, conteudo })
            });
        }

        if (!resposta.ok) {
            throw new Error("Erro ao salvar anotação.");
        }

        const notaSalva = await resposta.json();

        if (notaEmEdicao !== null) {
            notas = notas.map(nota =>
                nota.id === notaSalva.id ? notaSalva : nota
            );
        } else {
            notas.unshift(notaSalva);
        }

        atualizarNotas();
        limparFormularioNota();

    } catch (erro) {
        console.error("Erro ao salvar anotação:", erro);
        alert("Não foi possível salvar sua anotação.");
    }
});


// ==========================================
// TEMPORIZADOR
// ==========================================


async function iniciarTemporizador() {
    if (intervalo !== null || sessaoConcluida) return;

    try {
        const resposta = await fetch("/api/pomodoro/iniciar", {
            method: "POST"
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro);
        }

        tempoRestante = dados.tempoRestante;

        timerMessage.textContent =
            "Seu momento de foco começou. Você consegue! ♡";

        startButton.textContent = "Continuar sessão";

        intervalo = setInterval(() => {
            tempoRestante--;

            atualizarDisplay();

            if (tempoRestante <= 0) {
                clearInterval(intervalo);
                intervalo = null;
                tempoRestante = 0;

                atualizarDisplay();

                setTimeout(concluirSessao, 1000);
            }
        }, 1000);

    } catch (erro) {
        timerMessage.textContent = erro.message;
    }
}

async function pausarTemporizador() {
    if (intervalo === null) return;

    clearInterval(intervalo);
    intervalo = null;

    try {
        const resposta = await fetch("/api/pomodoro/pausar", {
            method: "POST"
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro);
        }

        tempoRestante = dados.tempoRestante;
        atualizarDisplay();

        timerMessage.textContent =
            "Sessão pausada. Respire um pouquinho. ♡";

    } catch (erro) {
        timerMessage.textContent = erro.message;
    }
}

async function reiniciarTemporizador() {
    clearInterval(intervalo);
    intervalo = null;

    try {
        const resposta = await fetch("/api/pomodoro/reiniciar", {
            method: "POST"
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro);
        }

        tempoRestante = dados.tempoRestante;
        sessaoConcluida = false;

        atualizarDisplay();

        startButton.textContent = "Começar sessão";

        timerMessage.textContent =
            "Respire fundo e aproveite seu momento de foco.";

    } catch (erro) {
        timerMessage.textContent = erro.message;
    }
}

async function concluirSessao() {
    try {
        const resposta = await fetch("/api/pomodoro/concluir", {
            method: "POST"
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro);
        }

        tempoRestante = 0;
        sessaoConcluida = true;

        atualizarDisplay();

        startButton.textContent = "Sessão concluída";

        timerMessage.textContent =
            "Parabéns! Você concluiu seu momento de foco! 🌷";

        quantidadeDesbloqueada = dados.adesivosDesbloqueados;

localStorage.setItem(
    CHAVE_ADESIVOS,
    quantidadeDesbloqueada
);

atualizarColecao();

        alert("Parabéns! Você concluiu uma sessão Pomodoro! ♡");

    } catch (erro) {
        timerMessage.textContent = erro.message;
    }
}


// ==========================================
// EVENTOS DOS BOTÕES
// ==========================================

startButton.addEventListener("click", iniciarTemporizador);
pauseButton.addEventListener("click", pausarTemporizador);
resetButton.addEventListener("click", reiniciarTemporizador);

previousButton.addEventListener("click", () => mudarPagina(-1));
nextButton.addEventListener("click", () => mudarPagina(1));

// ==========================================
// INICIALIZAÇÃO
// ==========================================


async function carregarEstadoPomodoro() {
    try {
        const resposta = await fetch("/api/pomodoro");
        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro);
        }

        tempoRestante = dados.tempoRestante;
        quantidadeDesbloqueada = dados.adesivosDesbloqueados ?? 0;

localStorage.setItem(
    CHAVE_ADESIVOS,
    quantidadeDesbloqueada
);

atualizarColecao();
        sessaoConcluida = dados.status === "concluido";

        atualizarDisplay();

        
if (dados.status === "rodando") {
    timerMessage.textContent =
        "Seu momento de foco começou. Você consegue! ♡";

    startButton.textContent = "Continuar sessão";

    intervalo = setInterval(() => {
        tempoRestante--;

        atualizarDisplay();

        if (tempoRestante <= 0) {
            clearInterval(intervalo);
            intervalo = null;
            tempoRestante = 0;

            atualizarDisplay();

            concluirSessao();
        }
    }, 1000);
}
 else if (dados.status === "pausado") {
            timerMessage.textContent =
                "Sessão pausada. Respire um pouquinho. ♡";
            startButton.textContent = "Continuar sessão";
        } else if (dados.status === "concluido") {
            startButton.textContent = "Sessão concluída";
            timerMessage.textContent =
                "Parabéns! Você concluiu seu momento de foco! 🌷";
        }

    } catch (erro) {
        console.error("Erro ao carregar Pomodoro:", erro);
    }
}


atualizarDisplay();
atualizarNavegacao();
atualizarColecao();
atualizarTarefas();
carregarNotas();
carregarEstadoPomodoro();
