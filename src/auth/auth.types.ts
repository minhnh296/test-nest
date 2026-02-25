export interface SignInResponse {
	message: string;
	access_token: string;
}

export interface SignUpResponse {
	message: string;
	userId: number;
	username: string;
}

export interface SignOutResponse {
	message: string;
}
