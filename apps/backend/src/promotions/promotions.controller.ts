import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from "@nestjs/common";
import { PromotionsService } from "./promotions.service";
import { CreatePromotionDto } from "./dto/create-promotion.dto";
import { UpdatePromotionDto } from "./dto/update-promotion.dto";

@Controller("promotions")
export class PromotionsController {
  constructor(private readonly promoService: PromotionsService) {}

  @Post()
  create(@Body() dto: CreatePromotionDto) {
    return this.promoService.create(dto);
  }

  @Get()
  findAll() {
    return this.promoService.findAll();
  }

  @Get("active")
  findActive() {
    return this.promoService.findActive();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.promoService.findOne(id);
  }

  @Put(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdatePromotionDto,
  ) {
    return this.promoService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.promoService.remove(id);
  }
}
