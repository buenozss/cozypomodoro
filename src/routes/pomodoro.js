
const express = require("express");
const { randomUUID } = require("crypto");
const { lerBanco, salvarBanco } = require("../services/storage");

const router = express.Router();

const TEMPO_INICIAL = 25 * 60;

// Consultar o estado atual do Pomodoro

router.get("/", async (req, res) => {
    const dados = await lerBanco();

    if (!dados.pomodoro) {
        dados.pomodoro = {
            status: "parado",
            duracao: TEMPO_INICIAL,
            tempoRestante: TEMPO_INICIAL,
            iniciadoEm: null
        };

        await salvarBanco(dados);
    }

    const pomodoro = dados.pomodoro;

    if (pomodoro.status === "rodando") {
        const tempoDecorrido = Math.floor(
            (Date.now() - pomodoro.iniciadoEm) / 1000
        );

        const restante = Math.max(
            0,
            pomodoro.tempoRestante - tempoDecorrido
        );

        if (restante === 0) {
            dados.sessoes.push({
                id: randomUUID(),
                duracao: pomodoro.duracao,
                concluidaEm: new Date().toISOString()
            });

            dados.adesivosDesbloqueados = Math.min(
                10,
                (dados.adesivosDesbloqueados || 0) + 1
            );

            pomodoro.status = "concluido";
            pomodoro.tempoRestante = 0;
            pomodoro.iniciadoEm = null;

            await salvarBanco(dados);
        } else {
            return res.status(200).json({
    ...pomodoro,
    tempoRestante: restante,
    adesivosDesbloqueados: dados.adesivosDesbloqueados || 0
});
        }
    }

    res.status(200).json({
    ...pomodoro,
    adesivosDesbloqueados: dados.adesivosDesbloqueados || 0
});
});


// Iniciar ou continuar uma sessão
router.post("/iniciar", async (req, res) => {
    const dados = await lerBanco();

    if (!dados.pomodoro) {
        dados.pomodoro = {
            status: "parado",
            duracao: TEMPO_INICIAL,
            tempoRestante: TEMPO_INICIAL,
            iniciadoEm: null
        };
    }

    const pomodoro = dados.pomodoro;

    if (pomodoro.status === "rodando") {
        return res.status(400).json({
            erro: "O Pomodoro já está em andamento."
        });
    }

    if (pomodoro.tempoRestante <= 0) {
        return res.status(400).json({
            erro: "Reinicie o Pomodoro antes de iniciar outra sessão."
        });
    }

    pomodoro.status = "rodando";
    pomodoro.iniciadoEm = Date.now();

    await salvarBanco(dados);

    res.status(200).json(pomodoro);
});

// Pausar uma sessão
router.post("/pausar", async (req, res) => {
    const dados = await lerBanco();
    const pomodoro = dados.pomodoro;

    if (!pomodoro || pomodoro.status !== "rodando") {
        return res.status(400).json({
            erro: "Não existe uma sessão em andamento."
        });
    }

    const tempoDecorrido = Math.floor(
        (Date.now() - pomodoro.iniciadoEm) / 1000
    );

    pomodoro.tempoRestante = Math.max(
        0,
        pomodoro.tempoRestante - tempoDecorrido
    );

    pomodoro.status = "pausado";
    pomodoro.iniciadoEm = null;

    await salvarBanco(dados);

    res.status(200).json(pomodoro);
});

// Reiniciar o Pomodoro
router.post("/reiniciar", async (req, res) => {
    const dados = await lerBanco();

    if (!dados.pomodoro) {
        dados.pomodoro = {};
    }

    dados.pomodoro = {
        status: "parado",
        duracao: TEMPO_INICIAL,
        tempoRestante: TEMPO_INICIAL,
        iniciadoEm: null
    };

    await salvarBanco(dados);

    res.status(200).json(dados.pomodoro);
});

// Registrar uma sessão concluída
router.post("/concluir", async (req, res) => {
    const dados = await lerBanco();

    if (!dados.pomodoro || dados.pomodoro.status !== "rodando") {
        return res.status(400).json({
            erro: "Não existe uma sessão em andamento."
        });
    }

    const tempoDecorrido = Math.floor(
        (Date.now() - dados.pomodoro.iniciadoEm) / 1000
    );

    if (tempoDecorrido < dados.pomodoro.tempoRestante) {
        return res.status(400).json({
            erro: "O tempo da sessão ainda não terminou."
        });
    }

    const sessao = {
        id: randomUUID(),
        duracao: dados.pomodoro.duracao,
        concluidaEm: new Date().toISOString()
    };

    dados.sessoes.push(sessao);
    dados.adesivosDesbloqueados = Math.min(
        10,
        (dados.adesivosDesbloqueados || 0) + 1
    );

    dados.pomodoro.status = "concluido";
    dados.pomodoro.tempoRestante = 0;
    dados.pomodoro.iniciadoEm = null;

    await salvarBanco(dados);

    res.status(201).json({
        sessao,
        pomodoro: dados.pomodoro,
        adesivosDesbloqueados: dados.adesivosDesbloqueados
    });
});

module.exports = router;
