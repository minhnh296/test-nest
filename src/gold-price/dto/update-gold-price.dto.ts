import { PartialType } from "@nestjs/swagger";
import { CreateGoldPriceDto } from "./create-gold-price.dto";

export class UpdateGoldPriceDto extends PartialType(CreateGoldPriceDto) {}
