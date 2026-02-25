import { Controller, Get } from "@nestjs/common";
import type { AppService } from "./app.service";
import { Public } from "./auth/public.decorator";

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Public()
	@Get()
	getHello(): string {
		return this.appService.getHello();
	}
}
