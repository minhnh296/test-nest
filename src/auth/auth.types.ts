export interface SignInResponse {
	access_token: string;
	message: string;
	type: string;
}

export interface SignUpResponse {
	message: string;
	userId: number;
	username: string;
}

export interface SignOutResponse {
	message: string;
}
