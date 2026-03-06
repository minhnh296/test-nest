import { Controller, Get, Redirect } from "@nestjs/common";
import { Public } from "./auth/public.decorator";

@Controller()
export class AppController {
  @Public()
  @Get()
  @Redirect()
  redirectToDocs() {
    return { url: "/docs", statusCode: 302 };
  }
}
