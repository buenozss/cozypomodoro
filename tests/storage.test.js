

const { lerBanco, salvarBanco } = require("../src/services/storage");

describe("Serviço de armazenamento", () => {

    let dadosOriginais;

    beforeEach(async () => {
        dadosOriginais = await lerBanco();
    });

    afterEach(async () => {
        await salvarBanco(dadosOriginais);
    });

    test("Deve ler os dados do arquivo JSON", async () => {
        const dados = await lerBanco();

        expect(dados).toHaveProperty("tarefas");
        expect(dados).toHaveProperty("notas");
        expect(dados).toHaveProperty("sessoes");
    });

    test("Deve salvar dados no arquivo JSON", async () => {
        const dadosTeste = {
            tarefas: [],
            notas: [],
            sessoes: [],
            adesivosDesbloqueados: 2,
            posicoesAdesivos: {},
            paginaAtual: 1
        };

        await salvarBanco(dadosTeste);

        const dadosSalvos = await lerBanco();

        expect(dadosSalvos.adesivosDesbloqueados).toBe(2);
    });
});
