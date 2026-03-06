import { Test, type TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("root", () => {
    it("should redirect to /docs", () => {
      expect(appController.redirectToDocs()).toEqual({
        url: "/docs",
        statusCode: 302,
      });
    });
  });
});
