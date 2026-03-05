export interface SignInResponse {
	access_token: string;
	message: string;
	type: string;
	expiresIn: number;
	isSuperAdmin: boolean;
	user: {
		id: number;
		fullName: string | null;
		email: string;
		role: string;
		branch?: string;
	};
}

export interface SignUpResponse {
	message: string;
	userId: number;
	username: string;
	email: string;
}

export interface SignOutResponse {
	message: string;
}
