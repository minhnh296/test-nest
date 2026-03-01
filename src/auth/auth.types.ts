export interface SignInResponse {
	access_token: string;
	message: string;
	type: string;
	expiresIn: number;
	user: {
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
}

export interface SignOutResponse {
	message: string;
}
