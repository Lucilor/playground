import {environment} from "@src/environments/environment";

export const host = environment.production ? "https://candypurity.com/chinese-poetry-api" : "chinese-poetry-api";

export interface Response {
	code: number;
	msg?: string;
	data?: any;
	count?: number;
	importance?: number;
}

export const paths = {
	index: "index",
	bezier: "bezier",
	"rubiks-cube": "rubiks-cube",
	"chinese-poetry": "chinese-poetry"
};
