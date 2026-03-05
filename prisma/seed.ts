import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as Prisma.PrismaClientOptions);

async function main() {
	console.log("Bắt đầu dọn dẹp và seeding...");
	try {
		// 1. DỌN DẸP DỮ LIỆU CŨ VÀ RESET ID (Sử dụng TRUNCATE để đưa ID về lại 1)
		const tableNames = [
			"ActivityLog",
			"Attendance",
			"Payroll",
			"Warranty",
			"Invoice",
			"Inventory",
			"Customer",
			"User",
			"RolePermission",
			"Role",
			"Permission",
			"Branch",
			"Warehouse",
			"AccountingAccount",
			"Product",
			"Setting",
			"GoldPrice",
		];

		for (const tableName of tableNames) {
			await prisma.$executeRawUnsafe(
				`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`,
			);
		}
		console.log("--- Đã xóa sạch dữ liệu và reset ID về 1 ---");

		const hashedPassword = await bcrypt.hash("Admin@123", 10);
		const hashedPassword1 = await bcrypt.hash("User@123", 10);
		console.log("Đã hash mật khẩu xong.");

		// 2. TẠO CÁC QUYỀN (PERMISSIONS)
		const permissionData = [
			{ name: "FULL_ACCESS", description: "Toàn quyền hệ thống" },
			{ name: "VIEW", description: "Xem thông tin" },
			{ name: "CREATE", description: "Tạo thông tin" },
			{ name: "EDIT", description: "Chỉnh sửa thông tin" },
			{ name: "DELETE", description: "Xóa thông tin" },
			{ name: "APPROVE", description: "Duyệt thông tin" },
		];

		const permissions: Record<string, { id: number }> = {};
		for (const p of permissionData) {
			permissions[p.name] = await prisma.permission.create({
				data: p,
			});
		}
		console.log("Đã tạo xong danh sách Permissions.");

		// 3. TẠO CÁC ROLE VÀ GÁN QUYỀN
		const roles = [
			{ name: "ADMIN", description: "Quản trị viên" },
			{ name: "MANAGER", description: "Quản lý" },
			{ name: "EMPLOYEE", description: "Nhân viên" },
		];

		for (const roleData of roles) {
			const role = await prisma.role.create({
				data: roleData,
			});

			if (role.name === "ADMIN") {
				await prisma.rolePermission.create({
					data: {
						roleId: role.id,
						permissionId: permissions.FULL_ACCESS.id,
					},
				});
				for (const pName of ["VIEW", "CREATE", "EDIT", "DELETE", "APPROVE"]) {
					await prisma.rolePermission.create({
						data: {
							roleId: role.id,
							permissionId: permissions[pName].id,
						},
					});
				}
			} else if (role.name === "EMPLOYEE") {
				for (const pName of ["VIEW", "CREATE", "EDIT"]) {
					await prisma.rolePermission.create({
						data: {
							roleId: role.id,
							permissionId: permissions[pName].id,
						},
					});
				}
			}
		}
		console.log("Đã tạo xong Roles và gán quyền tương ứng.");

		// 4. TẠO CHI NHÁNH MẶC ĐỊNH
		const branch = await prisma.branch.create({
			data: {
				name: "Hội sở chính",
				code: "HQ",
				address: "Số 1 Trần Duy Hưng, Hà Nội",
				phone: "0243123456",
				type: "HEADQUARTERS",
			},
		});

		const branchQ1 = await prisma.branch.create({
			data: {
				name: "Chi nhánh Quận 1",
				code: "CN_Q1",
				address: "123 Lê Lợi, Quận 1, TP.HCM",
				phone: "0283123456",
				type: "BRANCH",
			},
		});
		console.log("Đã tạo các chi nhánh mẫu.");

		// 5. TẠO ADMIN USER
		const admin = await prisma.user.create({
			data: {
				username: "Admin",
				password: hashedPassword,
				email: "admin@kimthanh.com",
				fullName: "Nguyễn Admin",
				isActive: true,
				isSuperAdmin: true,
				role: {
					connect: { name: "ADMIN" },
				},
				branch: {
					connect: { id: branch.id },
				},
				baseSalary: 20000000,
				bankName: "Vietcombank",
				bankAccount: "999988887777",
				taxCode: "123456789",
			},
		});
		const userAcc = await prisma.user.create({
			data: {
				username: "User",
				password: hashedPassword1,
				email: "user@kimthanh.com",
				fullName: "Trần Nhân Viên",
				isActive: true,
				isSuperAdmin: false,
				role: {
					connect: { name: "EMPLOYEE" },
				},
				branch: {
					connect: { id: branchQ1.id },
				},
				baseSalary: 10000000,
				bankName: "Vietcombank",
				bankAccount: "444455556666",
				taxCode: "1909090909",
			},
		});
		console.log("Đã tạo tài khoản thành công:");

		// 6. MOCK DATA ATTENDANCE
		const now = new Date();
		const todayStr = now.toISOString().split("T")[0];
		const today = new Date(`${todayStr}T00:00:00.000Z`);
		const yesterday = new Date(today.getTime() - 24 * 3600 * 1000);

		await prisma.attendance.createMany({
			data: [
				{
					userId: admin.id,
					date: yesterday,
					checkIn: new Date(
						`${yesterday.toISOString().split("T")[0]}T08:00:00.000+07:00`,
					),
					checkOut: new Date(
						`${yesterday.toISOString().split("T")[0]}T17:30:00.000+07:00`,
					),
					status: "PRESENT",
					type: "REGULAR",
					workingHours: 570,
				},
				{
					userId: admin.id,
					date: today,
					checkIn: new Date(`${todayStr}T08:15:00.000+07:00`),
					status: "LATE",
					type: "REGULAR",
				},
				{
					userId: userAcc.id,
					date: yesterday,
					checkIn: new Date(
						`${yesterday.toISOString().split("T")[0]}T07:55:00.000+07:00`,
					),
					checkOut: new Date(
						`${yesterday.toISOString().split("T")[0]}T17:15:00.000+07:00`,
					),
					status: "PRESENT",
					type: "REGULAR",
					workingHours: 560,
				},
				{
					userId: userAcc.id,
					date: today,
					checkIn: new Date(`${todayStr}T08:00:00.000+07:00`),
					status: "PRESENT",
					type: "REGULAR",
				},
			],
		});
		console.log("Đã mock xong dữ liệu Attendance.");

		const accounts = [
			{
				accountNumber: "111",
				name: "Tiền mặt",
				nature: "DEBIT" as const,
				level: 1,
			},
			{
				accountNumber: "1111",
				name: "Tiền Việt Nam",
				nature: "DEBIT" as const,
				level: 2,
			},
			{
				accountNumber: "112",
				name: "Tiền gửi Ngân hàng",
				nature: "DEBIT" as const,
				level: 1,
			},
			{
				accountNumber: "131",
				name: "Phải thu của khách hàng",
				nature: "DUAL" as const,
				level: 1,
			},
			{
				accountNumber: "331",
				name: "Phải trả cho người bán",
				nature: "DUAL" as const,
				level: 1,
			},
			{
				accountNumber: "511",
				name: "Doanh thu bán hàng và cung cấp dịch vụ",
				nature: "CREDIT" as const,
				level: 1,
			},
		];

		for (const acc of accounts.filter((a) => a.level === 1)) {
			await prisma.accountingAccount.create({ data: acc });
		}
		for (const acc of accounts.filter((a) => a.level === 2)) {
			const parent = await prisma.accountingAccount.findUnique({
				where: { accountNumber: acc.accountNumber.substring(0, 3) },
			});
			await prisma.accountingAccount.create({
				data: { ...acc, parentId: parent?.id },
			});
		}
		console.log("Đã mock xong Hệ thống tài khoản kế toán.");
	} catch (error) {
		console.error("Lỗi khi seeding:", error);
	}
}

main()
	.catch((e) => {
		console.error("Lỗi Main:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
