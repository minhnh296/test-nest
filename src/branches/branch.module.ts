import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { BranchesService } from "./branch.service";
import { BranchesController } from "./branch.controller";
import { BranchMiddleware } from "./middleware/branch.middleware";

@Module({
	controllers: [BranchesController],
	providers: [BranchesService],
})
export class BranchesModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(BranchMiddleware).forRoutes(BranchesController);
	}
}
