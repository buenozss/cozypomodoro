
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
        tarefas: [],
        notas: [
            {
                id: "nota-1",
                titulo: "Meus estudos",
                conteudo: "Estudar JavaScript",
                data: "2026-11-18T12:00:00.000Z"
            }
        ],
        sessoes: [],
        adesivosDesbloqueados: 0,
        posicoesAdesivos: {},
        paginaAtual: 1
    };

    storage.lerBanco.mockImplementation(async () => banco);

    storage.salvarBanco.mockImplementation(async dados => {
        banco = dados;
    });
});

describe("API do Meu Diário", () => {

    test("Deve listar as anotações", async () => {
        const response = await request(app).get("/api/notas");

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].titulo).toBe("Meus estudos");
    });

    test("Deve cadastrar uma anotação", async () => {
        const response = await request(app)
            .post("/api/notas")
            .send({
                titulo: "Meu diário",
                conteudo: "Hoje aprendi Node.js"
            });

        expect(response.status).toBe(201);
        expect(response.body.titulo).toBe("Meu diário");
        expect(banco.notas).toHaveLength(2);
    });

    test("Não deve cadastrar anotação sem título ou conteúdo", async () => {
        const response = await request(app)
            .post("/api/notas")
            .send({
                titulo: "",
                conteudo: "Texto de teste"
            });

        expect(response.status).toBe(400);
        expect(banco.notas).toHaveLength(1);
    });

    test("Deve editar uma anotação", async () => {
        const response = await request(app)
            .put("/api/notas/nota-1")
            .send({
                titulo: "Estudos atualizados",
                conteudo: "Estudar JavaScript e Node.js"
            });

        expect(response.status).toBe(200);
        expect(response.body.titulo).toBe("Estudos atualizados");
        expect(banco.notas[0].conteudo).toBe("Estudar JavaScript e Node.js");
    });

    test("Deve retornar erro ao editar anotação inexistente", async () => {
        const response = await request(app)
            .put("/api/notas/inexistente")
            .send({
                titulo: "Teste",
                conteudo: "Conteúdo"
            });

        expect(response.status).toBe(404);
    });

    test("Deve excluir uma anotação", async () => {
        const response = await request(app)
            .delete("/api/notas/nota-1");

        expect(response.status).toBe(200);
        expect(banco.notas).toHaveLength(0);
    });

    test("Deve retornar erro ao excluir anotação inexistente", async () => {
        const response = await request(app)
            .delete("/api/notas/inexistente");

        expect(response.status).toBe(404);
    });
});
