
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

describe("Testes de interface do CozyPomodoro", () => {
    let driver;

    beforeAll(async () => {
        const options = new chrome.Options();

        options.addArguments(
            "--headless=new",
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu"
        );

        driver = await new Builder()
            .forBrowser("chrome")
            .setChromeOptions(options)
            .build();
    }, 60000);

    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    test("Deve abrir a página inicial do CozyPomodoro", async () => {
        await driver.get("http://localhost:3000");

        await driver.wait(
            until.elementLocated(By.css("body")),
            10000
        );

        const titulo = await driver.getTitle();

        expect(titulo).toContain("CozyPomodoro");
    }, 30000);
});

