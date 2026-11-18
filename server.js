
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Permite trabalhar com dados JSON
app.use(express.json());

// Disponibiliza os arquivos da pasta public
app.use(express.static("public"));

// Rota inicial para verificar se o servidor está funcionando
app.get("/api/status", (req, res) => {
    res.json({
        message: "CozyPomodoro está funcionando!"
    });
});

// Inicia o servidor
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}

module.exports = app;
