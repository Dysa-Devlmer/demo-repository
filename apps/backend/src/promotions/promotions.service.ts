import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThanOrEqual } from "typeorm";
import { Promotion } from "../entities/promotion.entity";
import { CreatePromotionDto } from "./dto/create-promotion.dto";
import { UpdatePromotionDto } from "./dto/update-promotion.dto";

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promoRepo: Repository<Promotion>,
  ) {}

  async create(dto: CreatePromotionDto): Promise<Promotion> {
    const promo = this.promoRepo.create(dto);
    return this.promoRepo.save(promo);
  }

  async findAll(): Promise<Promotion[]> {
    return this.promoRepo.find();
  }

  async findActive(): Promise<Promotion[]> {
    return this.promoRepo.find({
      where: [{ active: true }, { valid_until: LessThanOrEqual(new Date()) }],
    });
  }

  async findOne(id: number): Promise<Promotion> {
    const promo = await this.promoRepo.findOne({ where: { id } });
    if (!promo) throw new NotFoundException(`Promotion ${id} not found`);
    return promo;
  }

  async update(id: number, dto: UpdatePromotionDto): Promise<Promotion> {
    const promo = await this.findOne(id);
    Object.assign(promo, dto);
    return this.promoRepo.save(promo);
  }

  async remove(id: number): Promise<void> {
    const promo = await this.findOne(id);
    await this.promoRepo.remove(promo);
  }
}
