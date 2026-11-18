
jest.mock("../src/services/storage", () => ({
    lerBanco: jest.fn(),
    salvarBanco: jest.fn()
}));

const request = require("supertest");
const app = require("../src/app");
const storage = require("../src/services/storage");

let banco;

beforeEach(() => {
    banco = {
        tarefas: [
            {
                id: "tarefa-1",
                texto: "Estudar JavaScript",
                concluida: false
            }
        ],
        notas: [],
        sessoes: [],
        adesivosDesbloqueados: 0,
        posicoesAdesivos: {},
        paginaAtual: 1
    };

    storage.lerBanco.mockImplementation(async () => banco);

    storage.salvarBanco.mockImplementation(async (dados) => {
        banco = dados;
    });
});

describe("API de tarefas", () => {
    test("Deve listar as tarefas", async () => {
        const response = await request(app).get("/api/tarefas");

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].texto).toBe("Estudar JavaScript");
    });

    test("Deve cadastrar uma nova tarefa", async () => {
        const response = await request(app)
            .post("/api/tarefas")
            .send({ texto: "Aprender Node.js" });

        expect(response.status).toBe(201);
        expect(response.body.texto).toBe("Aprender Node.js");
        expect(response.body.concluida).toBe(false);
        expect(banco.tarefas).toHaveLength(2);
    });

    test("Não deve cadastrar uma tarefa sem texto", async () => {
        const response = await request(app)
            .post("/api/tarefas")
            .send({ texto: "   " });

        expect(response.status).toBe(400);
        expect(banco.tarefas).toHaveLength(1);
    });

    test("Deve atualizar a conclusão de uma tarefa", async () => {
        const response = await request(app)
            .patch("/api/tarefas/tarefa-1")
            .send({ concluida: true });

        expect(response.status).toBe(200);
        expect(response.body.concluida).toBe(true);
        expect(banco.tarefas[0].concluida).toBe(true);
    });

    test("Deve retornar erro ao atualizar tarefa inexistente", async () => {
        const response = await request(app)
            .patch("/api/tarefas/inexistente")
            .send({ concluida: true });

        expect(response.status).toBe(404);
    });

    test("Deve excluir uma tarefa", async () => {
        const response = await request(app)
            .delete("/api/tarefas/tarefa-1");

        expect(response.status).toBe(200);
        expect(banco.tarefas).toHaveLength(0);
    });

    test("Deve retornar erro ao excluir tarefa inexistente", async () => {
        const response = await request(app)
            .delete("/api/tarefas/inexistente");

        expect(response.status).toBe(404);
    });
});
