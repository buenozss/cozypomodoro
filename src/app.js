
const express = require("express");
const path = require("path");

const app = express();

const tasksRoutes = require("./routes/tasks");
const notesRoutes = require("./routes/notes");
const pomodoroRoutes = require("./routes/pomodoro");

// Permite receber dados em JSON
app.use(express.json());

// Disponibiliza os arquivos do frontend
app.use(express.static(path.join(__dirname, "../public")));

// Rota para verificar o funcionamento da aplicação
app.get("/api/status", (req, res) => {
    res.status(200).json({
        message: "CozyPomodoro está funcionando!"
    });
});

// Rotas de tarefas
app.use("/api/tarefas", tasksRoutes);
app.use("/api/notas", notesRoutes);
app.use("/api/pomodoro", pomodoroRoutes);

module.exports = app;
