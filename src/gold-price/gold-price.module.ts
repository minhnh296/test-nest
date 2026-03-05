import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { GoldPriceService } from "./gold-price.service";
import { GoldPriceController } from "./gold-price.controller";

@Module({
	imports: [HttpModule],
	controllers: [GoldPriceController],
	providers: [GoldPriceService],
	exports: [GoldPriceService],
})
export class GoldPriceModule {}
