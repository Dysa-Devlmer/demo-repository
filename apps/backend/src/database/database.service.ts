import { Injectable, Logger } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly dataSource: DataSource) {}

  async healthCheck(): Promise<boolean> {
    try {
      await this.dataSource.query("SELECT 1");
      this.logger.log("✅ Database connection OK");
      return true;
    } catch (err) {
      const error = err as Error;
      this.logger.error("❌ Database connection failed", error.stack);
      return false;
    }
  }
}
