import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { DashboardSnapshotService } from "./dashboard-snapshot.service";
import { SnapshotType, SnapshotStatus } from "../entities/dashboard-snapshot.entity";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";

@ApiTags("Dashboard Snapshots")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("dashboard/snapshots")
export class DashboardSnapshotController {
  constructor(
    private readonly snapshotService: DashboardSnapshotService,
  ) {}

  @Post()
  @RequirePermissions("dashboard.manage")
  @ApiOperation({ summary: "Create a new dashboard snapshot" })
  @ApiResponse({ status: 201, description: "Snapshot created successfully" })
  async create(
    @Query("type") type?: SnapshotType,
    @Query("triggeredBy") triggeredBy?: string,
  ) {
    return this.snapshotService.createSnapshot(
      type || SnapshotType.DAILY,
      triggeredBy || "manual",
    );
  }

  @Get()
  @RequirePermissions("dashboard.read")
  @ApiOperation({ summary: "Get all snapshots with pagination" })
  @ApiResponse({ status: 200, description: "Returns paginated snapshots" })
  async findAll(
    @Query("type") type?: SnapshotType,
    @Query("status") status?: SnapshotStatus,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.snapshotService.findAll({
      type,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page,
      limit,
    });
  }

  @Get("latest")
  @RequirePermissions("dashboard.read")
  @ApiOperation({ summary: "Get latest snapshot" })
  @ApiResponse({ status: 200, description: "Returns latest snapshot" })
  async getLatest(@Query("type") type?: SnapshotType) {
    return this.snapshotService.getLatest(type);
  }

  @Get("trend")
  @RequirePermissions("dashboard.read")
  @ApiOperation({ summary: "Get snapshot trend (last N snapshots)" })
  @ApiResponse({ status: 200, description: "Returns snapshot trend" })
  async getTrend(
    @Query("type") type: SnapshotType = SnapshotType.DAILY,
    @Query("limit") limit: number = 7,
  ) {
    return this.snapshotService.getTrend(type, limit);
  }

  @Get("compare")
  @RequirePermissions("dashboard.read")
  @ApiOperation({ summary: "Compare two snapshots" })
  @ApiResponse({ status: 200, description: "Returns comparison" })
  async compare(
    @Query("snapshot1", ParseIntPipe) snapshot1Id: number,
    @Query("snapshot2", ParseIntPipe) snapshot2Id: number,
  ) {
    return this.snapshotService.compare(snapshot1Id, snapshot2Id);
  }

  @Get(":id")
  @RequirePermissions("dashboard.read")
  @ApiOperation({ summary: "Get snapshot by ID" })
  @ApiResponse({ status: 200, description: "Returns snapshot" })
  @ApiResponse({ status: 404, description: "Snapshot not found" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.snapshotService.findOne(id);
  }

  @Post("archive")
  @RequirePermissions("dashboard.manage")
  @ApiOperation({ summary: "Archive old snapshots" })
  @ApiResponse({ status: 200, description: "Returns number of archived snapshots" })
  async archiveOld(@Query("daysOld") daysOld: number = 90) {
    const count = await this.snapshotService.archiveOldSnapshots(daysOld);
    return { archived: count };
  }

  @Delete(":id")
  @RequirePermissions("dashboard.manage")
  @ApiOperation({ summary: "Soft delete snapshot" })
  @ApiResponse({ status: 200, description: "Snapshot deleted" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.snapshotService.remove(id);
    return { message: "Snapshot deleted successfully" };
  }

  @Delete(":id/hard")
  @RequirePermissions("system.admin")
  @ApiOperation({ summary: "Hard delete snapshot (admin only)" })
  @ApiResponse({ status: 200, description: "Snapshot permanently deleted" })
  async hardDelete(@Param("id", ParseIntPipe) id: number) {
    await this.snapshotService.hardDelete(id);
    return { message: "Snapshot permanently deleted" };
  }
}
