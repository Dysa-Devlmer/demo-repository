import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { QuickRepliesService } from "./quick-replies.service";
import { QuickReplyCategory } from "../../entities/quick-reply.entity";

class CreateQuickReplyDto {
  title: string;
  content: string;
  category?: QuickReplyCategory;
  shortcut?: string;
  variables?: string[];
}

class UpdateQuickReplyDto {
  title?: string;
  content?: string;
  category?: QuickReplyCategory;
  shortcut?: string;
  is_active?: boolean;
  variables?: string[];
}

@Controller("quick-replies")
export class QuickRepliesController {
  constructor(private readonly quickRepliesService: QuickRepliesService) {}

  @Post()
  async create(@Body() dto: CreateQuickReplyDto) {
    return this.quickRepliesService.create(dto);
  }

  @Get()
  async findAll(
    @Query("category") category?: QuickReplyCategory,
    @Query("search") search?: string,
    @Query("active_only") activeOnly?: string,
  ) {
    return this.quickRepliesService.findAll({
      category,
      search,
      active_only: activeOnly !== "false",
    });
  }

  @Get("categories")
  getCategories() {
    return Object.values(QuickReplyCategory).map((value) => ({
      value,
      label: this.getCategoryLabel(value),
    }));
  }

  @Get("shortcut/:shortcut")
  async findByShortcut(@Param("shortcut") shortcut: string) {
    const quickReply = await this.quickRepliesService.findByShortcut(shortcut);
    if (!quickReply) {
      return { found: false };
    }
    return { found: true, quickReply };
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.quickRepliesService.findOne(id);
  }

  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateQuickReplyDto,
  ) {
    return this.quickRepliesService.update(id, dto);
  }

  @Post(":id/use")
  @HttpCode(HttpStatus.OK)
  async use(
    @Param("id", ParseIntPipe) id: number,
    @Body() variables?: Record<string, string>,
  ) {
    const quickReply = await this.quickRepliesService.findOne(id);
    await this.quickRepliesService.incrementUsage(id);

    const processedContent = this.quickRepliesService.processContent(
      quickReply.content,
      variables || {},
    );

    return {
      content: processedContent,
      quickReply,
    };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param("id", ParseIntPipe) id: number) {
    await this.quickRepliesService.delete(id);
  }

  @Post("seed")
  async seedDefaults() {
    await this.quickRepliesService.seedDefaults();
    return { message: "Default quick replies seeded successfully" };
  }

  private getCategoryLabel(category: QuickReplyCategory): string {
    const labels: Record<QuickReplyCategory, string> = {
      [QuickReplyCategory.GREETING]: "Saludos",
      [QuickReplyCategory.FAREWELL]: "Despedidas",
      [QuickReplyCategory.INFO]: "Información",
      [QuickReplyCategory.SUPPORT]: "Soporte",
      [QuickReplyCategory.SALES]: "Ventas",
      [QuickReplyCategory.CUSTOM]: "Personalizado",
    };
    return labels[category] || category;
  }
}
