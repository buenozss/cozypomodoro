
const request = require("supertest");
const app = require("../src/app");

describe("CozyPomodoro API", () => {
    test("Deve verificar se a aplicação está funcionando", async () => {
        const response = await request(app).get("/api/status");

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            message: "CozyPomodoro está funcionando!"
        });
    });
});
