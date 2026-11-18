
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
        notas: [],
        sessoes: [],
        adesivosDesbloqueados: 0,
        pomodoro: {
            status: "parado",
            duracao: 1500,
            tempoRestante: 1500,
            iniciadoEm: null
        }
    };

    storage.lerBanco.mockImplementation(async () => banco);

    storage.salvarBanco.mockImplementation(async dados => {
        banco = dados;
    });
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe("API do Pomodoro", () => {

    test("Deve consultar o estado do Pomodoro", async () => {
        const response = await request(app).get("/api/pomodoro");

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("parado");
        expect(response.body.duracao).toBe(1500);
        expect(response.body.adesivosDesbloqueados).toBe(0);
    });

    test("Deve inicializar o Pomodoro caso não exista", async () => {
        banco.pomodoro = undefined;

        const response = await request(app).get("/api/pomodoro");

        expect(response.status).toBe(200);
        expect(response.body.duracao).toBe(1500);
        expect(banco.pomodoro.status).toBe("parado");
        expect(storage.salvarBanco).toHaveBeenCalled();
    });

    test("Deve iniciar uma sessão", async () => {
        jest.spyOn(Date, "now").mockReturnValue(100000);

        const response = await request(app)
            .post("/api/pomodoro/iniciar");

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("rodando");
        expect(response.body.iniciadoEm).toBe(100000);
    });

    test("Não deve iniciar uma sessão que já está rodando", async () => {
        banco.pomodoro.status = "rodando";
        banco.pomodoro.iniciadoEm = 100000;

        const response = await request(app)
            .post("/api/pomodoro/iniciar");

        expect(response.status).toBe(400);
        expect(response.body.erro).toBeDefined();
    });

    test("Deve pausar uma sessão", async () => {
        jest.spyOn(Date, "now").mockReturnValue(105000);

        banco.pomodoro.status = "rodando";
        banco.pomodoro.iniciadoEm = 100000;

        const response = await request(app)
            .post("/api/pomodoro/pausar");

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("pausado");
        expect(response.body.tempoRestante).toBe(1495);
        expect(response.body.iniciadoEm).toBeNull();
    });

    test("Não deve pausar uma sessão que não está rodando", async () => {
        const response = await request(app)
            .post("/api/pomodoro/pausar");

        expect(response.status).toBe(400);
    });

    test("Deve reiniciar o Pomodoro", async () => {
        banco.pomodoro.status = "pausado";
        banco.pomodoro.tempoRestante = 500;

        const response = await request(app)
            .post("/api/pomodoro/reiniciar");

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("parado");
        expect(response.body.tempoRestante).toBe(1500);
    });

    test("Não deve iniciar uma sessão sem tempo restante", async () => {
        banco.pomodoro.tempoRestante = 0;

        const response = await request(app)
            .post("/api/pomodoro/iniciar");

        expect(response.status).toBe(400);
    });

    test("Não deve concluir uma sessão que não está rodando", async () => {
        const response = await request(app)
            .post("/api/pomodoro/concluir");

        expect(response.status).toBe(400);
    });

    test("Não deve concluir uma sessão antes do tempo terminar", async () => {
        jest.spyOn(Date, "now").mockReturnValue(101000);

        banco.pomodoro.status = "rodando";
        banco.pomodoro.iniciadoEm = 100000;

        const response = await request(app)
            .post("/api/pomodoro/concluir");

        expect(response.status).toBe(400);
        expect(banco.sessoes).toHaveLength(0);
    });

    test("Deve concluir uma sessão e desbloquear um adesivo", async () => {
        jest.spyOn(Date, "now").mockReturnValue(1600000);

        banco.pomodoro.status = "rodando";
        banco.pomodoro.iniciadoEm = 100000;

        const response = await request(app)
            .post("/api/pomodoro/concluir");

        expect(response.status).toBe(201);
        expect(response.body.sessao).toBeDefined();
        expect(response.body.adesivosDesbloqueados).toBe(1);
        expect(banco.sessoes).toHaveLength(1);
        expect(banco.pomodoro.status).toBe("concluido");
        expect(banco.pomodoro.tempoRestante).toBe(0);
    });

    test("Não deve liberar mais de 10 adesivos", async () => {
        jest.spyOn(Date, "now").mockReturnValue(1600000);

        banco.pomodoro.status = "rodando";
        banco.pomodoro.iniciadoEm = 100000;
        banco.adesivosDesbloqueados = 10;

        const response = await request(app)
            .post("/api/pomodoro/concluir");

        expect(response.status).toBe(201);
        expect(response.body.adesivosDesbloqueados).toBe(10);
    });

    test("Deve concluir automaticamente uma sessão encerrada", async () => {
        jest.spyOn(Date, "now").mockReturnValue(1600000);

        banco.pomodoro.status = "rodando";
        banco.pomodoro.iniciadoEm = 100000;

        const response = await request(app)
            .get("/api/pomodoro");

        expect(response.status).toBe(200);
        expect(response.body.status).toBe("concluido");
        expect(banco.sessoes).toHaveLength(1);
        expect(banco.adesivosDesbloqueados).toBe(1);
    });

});
