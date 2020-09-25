import {Action} from "@ngrx/store";

export type LoadingActionType = "add loading" | "remove loading" | "set loading progress";
export interface LoadingAction extends Action {
	readonly type: LoadingActionType;
	name: string;
	progress?: number;
}
