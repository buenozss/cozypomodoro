
const fs = require("fs/promises");
const path = require("path");

const caminhoBanco = path.join(__dirname, "../data/db.json");

// Lê os dados armazenados no arquivo JSON
async function lerBanco() {
    const conteudo = await fs.readFile(caminhoBanco, "utf-8");

    return JSON.parse(conteudo);
}

// Salva os dados no arquivo JSON
async function salvarBanco(dados) {
    const conteudo = JSON.stringify(dados, null, 4);

    const arquivoTemporario = `${caminhoBanco}.tmp`;

    await fs.writeFile(arquivoTemporario, conteudo, "utf-8");
    await fs.rename(arquivoTemporario, caminhoBanco);
}

module.exports = {
    lerBanco,
    salvarBanco
};
