import {
	Injectable,
	NotFoundException,
	ConflictException,
	BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.services";
import { CreateSettingDto } from "./dto/create-setting.dto";
import { UpdateSettingDto } from "./dto/update-setting.dto";
import { evaluate } from "mathjs";

@Injectable()
export class SettingService {
	constructor(private readonly prisma: PrismaService) {}

	async findOne(idOrKey: number | string) {
		const where =
			typeof idOrKey === "number" ? { id: idOrKey } : { key: idOrKey };
		const setting = await this.prisma.setting.findUnique({ where });

		if (!setting) {
			throw new NotFoundException(
				`Setting với ${typeof idOrKey === "number" ? "ID" : "Key"} "${idOrKey}" không tồn tại.`,
			);
		}
		return setting;
	}

	async create(data: CreateSettingDto) {
		try {
			await this.findOne(data.key);
			throw new ConflictException(`Mã cấu hình ${data.key} đã tồn tại rồi.`);
		} catch (error) {
			if (error instanceof NotFoundException) {
				return this.prisma.setting.create({ data });
			}
			throw error;
		}
	}

	async findAll() {
		return this.prisma.setting.findMany();
	}

	async update(id: number, data: UpdateSettingDto) {
		const setting = await this.findOne(id);

		if (data.key && data.key !== setting.key) {
			try {
				await this.findOne(data.key);
				throw new ConflictException(
					`Mã cấu hình ${data.key} đã được sử dụng bởi bản ghi khác.`,
				);
			} catch (error) {
				if (!(error instanceof NotFoundException)) throw error;
			}
		}

		return this.prisma.setting.update({
			where: { id },
			data,
		});
	}

	async remove(id: number) {
		await this.findOne(id);
		return this.prisma.setting.delete({ where: { id } });
	}

	async calculate(
		key: string,
		context: Record<string, unknown> = {},
	): Promise<number> {
		const setting = await this.findOne(key);

		const scope: Record<string, number> = {};
		if (context) {
			Object.keys(context).forEach((prop) => {
				const val = context[prop];
				if (typeof val === "number") {
					scope[prop] = val;
				}
			});
		}

		try {
			const result = evaluate(setting.value, scope);
			return Number(result);
		} catch (error) {
			throw new BadRequestException(
				`Lỗi công thức "${setting.value}": ${error.message}`,
			);
		}
	}
}
