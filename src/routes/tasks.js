
const express = require("express");
const { randomUUID } = require("crypto");
const { lerBanco, salvarBanco } = require("../services/storage");

const router = express.Router();

// Listar todas as tarefas
router.get("/", async (req, res) => {
    const dados = await lerBanco();

    res.status(200).json(dados.tarefas);
});

// Cadastrar uma nova tarefa
router.post("/", async (req, res) => {
    const texto = req.body.texto;

    if (typeof texto !== "string" || texto.trim() === "") {
        return res.status(400).json({
            erro: "O texto da tarefa é obrigatório."
        });
    }

    const dados = await lerBanco();

    const novaTarefa = {
        id: randomUUID(),
        texto: texto.trim(),
        concluida: false
    };

    dados.tarefas.push(novaTarefa);

    await salvarBanco(dados);

    res.status(201).json(novaTarefa);
});

// Atualizar o estado de conclusão
router.patch("/:id", async (req, res) => {
    if (typeof req.body.concluida !== "boolean") {
        return res.status(400).json({
            erro: "O campo concluida deve ser verdadeiro ou falso."
        });
    }

    const dados = await lerBanco();

    const tarefa = dados.tarefas.find(
        item => item.id === req.params.id
    );

    if (!tarefa) {
        return res.status(404).json({
            erro: "Tarefa não encontrada."
        });
    }

    tarefa.concluida = req.body.concluida;

    await salvarBanco(dados);

    res.status(200).json(tarefa);
});

// Excluir uma tarefa
router.delete("/:id", async (req, res) => {
    const dados = await lerBanco();

    const indice = dados.tarefas.findIndex(
        item => item.id === req.params.id
    );

    if (indice === -1) {
        return res.status(404).json({
            erro: "Tarefa não encontrada."
        });
    }

    dados.tarefas.splice(indice, 1);

    await salvarBanco(dados);

    res.status(200).json({
        mensagem: "Tarefa excluída com sucesso."
    });
});

module.exports = router;
