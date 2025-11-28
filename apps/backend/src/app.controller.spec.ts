import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";

describe("AppController", () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'mock-jwt-token'),
            verify: jest.fn(() => ({ userId: 1, email: 'test@test.com' })),
          },
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe("root", () => {
    it('should return welcome message with API info', () => {
      const result = appController.getHello();
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result.success).toBe(true);
      expect(result.data.service).toBe("ChatBotDysa Backend API");
      expect(result.data.version).toBe("1.0.0");
      expect(result.data).toHaveProperty('endpoints');
      expect(result.data).toHaveProperty('features');
    });
  });

  describe("getDashboardStats", () => {
    it("should return dashboard statistics", () => {
      const result = appController.getDashboardStats();
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("totalConversations");
      expect(result.data).toHaveProperty("activeCustomers");
      expect(result.data).toHaveProperty("totalOrders");
      expect(result.data.totalConversations).toBe(1247);
    });
  });

  describe("getAnalyticsDashboard", () => {
    it("should return analytics dashboard data", () => {
      const result = appController.getAnalyticsDashboard();
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("analytics");
      expect(result.data).toHaveProperty("charts");
      expect(result.data.charts).toHaveProperty("conversationsOverTime");
    });
  });

  describe("getSettings", () => {
    it("should return settings data", () => {
      const result = appController.getSettings();
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("restaurant");
      expect(result.data).toHaveProperty("business");
      expect(result.data).toHaveProperty("communications");
      expect(result.data).toHaveProperty("ai");
    });
  });
});
