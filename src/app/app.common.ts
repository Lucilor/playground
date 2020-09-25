export const host = "https://localhost:8000";

export interface Response {
	code: number;
	msg?: string;
	data?: any;
	count?: number;
	importance?: number;
}

export const paths = {
	index: "index"
};
