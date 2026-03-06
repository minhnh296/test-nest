import { BadRequestException, Injectable } from "@nestjs/common";
import { AttendanceStatus, AttendanceType } from "@prisma/client";
import { PrismaService } from "../prisma.services";
import { CheckInDto } from "./dto/check-in.dto";
import { CheckOutDto } from "./dto/check-out.dto";
import { QueryAttendanceDto } from "./dto/query-attendance.dto";

const VN_TIMEZONE = "Asia/Ho_Chi_Minh";
const VN_OFFSET_HOURS = 7;
const WORK_START_HOUR = 8;
const WORK_START_MINUTE = 0;
const WORK_END_HOUR = 17;
const WORK_END_MINUTE = 30;

@Injectable()
export class AttendanceService {
	constructor(private readonly prisma: PrismaService) {}

	private getTodayVN(): Date {
		const parts = new Intl.DateTimeFormat("en-CA", {
			timeZone: VN_TIMEZONE,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).formatToParts(new Date());
		const get = (t: string) => parts.find((p) => p.type === t)?.value;
		return new Date(
			Date.UTC(
				Number(get("year")),
				Number(get("month")) - 1,
				Number(get("day")),
			),
		);
	}

	private getVNTime(today: Date, h: number, m: number) {
		return new Date(
			today.getTime() + (h - VN_OFFSET_HOURS) * 3600000 + m * 60000,
		);
	}

	async checkIn(userId: string, dto: CheckInDto) {
		const now = new Date(),
			today = this.getTodayVN();

		const endOfWork = this.getVNTime(today, WORK_END_HOUR, WORK_END_MINUTE);

		const type =
			now.getTime() > endOfWork.getTime()
				? AttendanceType.OVERTIME
				: AttendanceType.REGULAR;

		const exist = await this.prisma.attendance.findFirst({
			where: { userId, date: today, type },
		});

		if (exist?.checkIn)
			throw new BadRequestException(
				`Đã chấm công vào ${type === AttendanceType.OVERTIME ? "TĂNG CA" : "HÀNH CHÍNH"} lúc ${this.formatTime(exist.checkIn)} `,
			);

		const startThreshold = this.getVNTime(
			today,
			WORK_START_HOUR,
			WORK_START_MINUTE,
		);
		const status =
			type === AttendanceType.REGULAR &&
			now.getTime() > startThreshold.getTime() + 300000
				? AttendanceStatus.LATE
				: AttendanceStatus.PRESENT;

		const data = {
			userId,
			date: today,
			checkIn: now,
			status,
			type,
			note: dto.note ?? exist?.note,
		};

		const res = exist
			? await this.prisma.attendance.update({ where: { id: exist.id }, data })
			: await this.prisma.attendance.create({ data });

		const { userId: _, ...cleanData } = res;
		return {
			message: `Chấm công vào ca ${type} thành công`,
			data: cleanData,
		};
	}

	async checkOut(userId: string, dto: CheckOutDto) {
		const now = new Date(),
			today = this.getTodayVN();

		const att = await this.prisma.attendance.findFirst({
			where: { userId, date: today, checkOut: null },
			orderBy: { createdAt: "desc" },
		});

		if (!att) throw new BadRequestException("Bạn chưa check-in ca nào để ra");
		if (!att.checkIn)
			throw new BadRequestException(
				"Dữ liệu chấm công không hợp lệ (Thiếu giờ vào)",
			);

		const working = Math.floor((now.getTime() - att.checkIn.getTime()) / 60000);
		let ot = 0;
		let status = att.status;

		if (att.type === AttendanceType.REGULAR) {
			const endOfWork = this.getVNTime(today, WORK_END_HOUR, WORK_END_MINUTE);
			if (now.getTime() < endOfWork.getTime() - 300000) {
				status = AttendanceStatus.EARLY_LEAVE;
			}
			ot = Math.max(
				0,
				Math.floor((now.getTime() - endOfWork.getTime()) / 60000),
			);
		} else {
			ot = working;
		}

		const res = await this.prisma.attendance.update({
			where: { id: att.id },
			data: {
				checkOut: now,
				workingHours: working,
				overtimeMinutes: ot,
				status,
				note: dto.note ?? att.note,
			},
		});

		const { userId: _, ...cleanData } = res;
		return {
			message: `Chấm công ra ca ${att.type} thành công`,
			data: {
				...cleanData,
				summary: {
					sessionType: att.type,
					workingMinutes: working,
					overtimeMinutes: ot,
					formattedWorking: this.formatMinutes(working),
				},
			},
		};
	}

	async getTodayStatus(userId: string) {
		const today = this.getTodayVN();
		const records = await this.prisma.attendance.findMany({
			where: { userId, date: today },
		});

		const regular = records.find((r) => r.type === AttendanceType.REGULAR);
		const overtime = records.find((r) => r.type === AttendanceType.OVERTIME);

		return {
			message: "Trạng thái chấm công hôm nay",
			data: {
				regular: regular
					? { checkIn: regular.checkIn, checkOut: regular.checkOut }
					: null,
				overtime: overtime
					? { checkIn: overtime.checkIn, checkOut: overtime.checkOut }
					: null,
			},
			canCheckIn: !regular || (!!regular.checkOut && !overtime),
			canCheckOut: records.some((r) => r.checkIn && !r.checkOut),
		};
	}

	async findAll(u: { id: string; role: string }, q: QueryAttendanceDto) {
		const now = new Date(),
			month = q.month ?? now.getMonth() + 1,
			year = q.year ?? now.getFullYear();
		const start = new Date(year, month - 1, 1),
			end = new Date(year, month, 0, 23, 59, 59);
		const targetId = u.role?.toLowerCase() === "admin" ? q.userId : u.id;

		const records = await this.prisma.attendance.findMany({
			where: { userId: targetId, date: { gte: start, lte: end } },
			orderBy: { date: "desc" },
		});

		const cleanRecords = records.map(({ userId: _, ...r }) => r);

		if (targetId) {
			const user = await this.prisma.user.findUnique({
				where: { id: targetId },
				select: { fullName: true },
			});
			const stats = records.reduce(
				(acc, r) => {
					const key = r.status.toLowerCase();
					acc.counts[key] = (acc.counts[key] || 0) + 1;
					acc.work += r.workingHours ?? 0;
					acc.ot += r.overtimeMinutes ?? 0;
					return acc;
				},
				{ counts: {} as Record<string, number>, work: 0, ot: 0 },
			);

			return {
				message: "Lịch sử cá nhân",
				meta: {
					name: user?.fullName,
					month,
					year,
					stats: {
						total: records.length,
						present: stats.counts.present || 0,
						late: stats.counts.late || 0,
						absent: stats.counts.absent || 0,
						earlyLeave: stats.counts.early_leave || 0,
					},
					summary: {
						totalWorking: stats.work,
						totalHours: this.formatMinutes(stats.work),
						totalOt: stats.ot,
						totalOtHours: this.formatMinutes(stats.ot),
					},
				},
				data: cleanRecords,
			};
		}
		return {
			message: "Danh sách hệ thống",
			meta: { month, year, total: records.length },
			data: cleanRecords,
		};
	}

	async findOne(id: string, u: { id: string; role: string }) {
		const res = await this.prisma.attendance.findUnique({
			where: { id },
		});
		if (!res) throw new BadRequestException("Không tìm thấy");
		if (u.role?.toLowerCase() !== "admin" && res.userId !== u.id)
			throw new BadRequestException("Không có quyền");
		const { userId: _, ...cleanData } = res;
		return { message: "Chi tiết", data: cleanData };
	}

	private formatTime(d: Date) {
		return d.toLocaleTimeString("vi-VN", {
			timeZone: VN_TIMEZONE,
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
	}
	private formatMinutes(m: number) {
		return `${Math.floor(m / 60)}h${m % 60 > 0 ? `${m % 60}m` : ""} `;
	}
}
