
const express = require("express");
const { randomUUID } = require("crypto");
const { lerBanco, salvarBanco } = require("../services/storage");

const router = express.Router();

// Listar todas as anotações
router.get("/", async (req, res) => {
    const dados = await lerBanco();

    res.status(200).json(dados.notas);
});

// Cadastrar uma nova anotação
router.post("/", async (req, res) => {
    const { titulo, conteudo } = req.body;

    if (
        typeof titulo !== "string" ||
        titulo.trim() === "" ||
        typeof conteudo !== "string" ||
        conteudo.trim() === ""
    ) {
        return res.status(400).json({
            erro: "O título e o conteúdo são obrigatórios."
        });
    }

    const dados = await lerBanco();

    const novaNota = {
        id: randomUUID(),
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        data: new Date().toISOString()
    };

    dados.notas.unshift(novaNota);

    await salvarBanco(dados);

    res.status(201).json(novaNota);
});

// Editar uma anotação
router.put("/:id", async (req, res) => {
    const { titulo, conteudo } = req.body;

    if (
        typeof titulo !== "string" ||
        titulo.trim() === "" ||
        typeof conteudo !== "string" ||
        conteudo.trim() === ""
    ) {
        return res.status(400).json({
            erro: "O título e o conteúdo são obrigatórios."
        });
    }

    const dados = await lerBanco();

    const nota = dados.notas.find(
        item => item.id === req.params.id
    );

    if (!nota) {
        return res.status(404).json({
            erro: "Anotação não encontrada."
        });
    }

    nota.titulo = titulo.trim();
    nota.conteudo = conteudo.trim();
    nota.data = new Date().toISOString();

    await salvarBanco(dados);

    res.status(200).json(nota);
});

// Excluir uma anotação
router.delete("/:id", async (req, res) => {
    const dados = await lerBanco();

    const indice = dados.notas.findIndex(
        item => item.id === req.params.id
    );

    if (indice === -1) {
        return res.status(404).json({
            erro: "Anotação não encontrada."
        });
    }

    dados.notas.splice(indice, 1);

    await salvarBanco(dados);

    res.status(200).json({
        mensagem: "Anotação excluída com sucesso."
    });
});

module.exports = router;
