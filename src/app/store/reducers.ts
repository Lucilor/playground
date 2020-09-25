import {ActionReducerMap, MetaReducer} from "@ngrx/store";
import {environment} from "@src/environments/environment";
import {cloneDeep} from "lodash";
import {LoadingAction} from "./actions";
import {initialState, AppState} from "./state";

export function loadingReducer(loading = initialState.loading, action: LoadingAction) {
	const newLoading: AppState["loading"] = cloneDeep(loading);
	if (action.type === "add loading") {
		newLoading.list.add(action.name);
	} else if (action.type === "remove loading") {
		newLoading.list.delete(action.name);
	} else if (action.type === "set loading progress") {
		const progress = action.progress;
		if (progress < 0 || progress > 1) {
			newLoading.list.delete(action.name);
			newLoading.progress = -1;
		} else {
			if (!newLoading.list.has(action.name)) {
				newLoading.list.add(action.name);
			}
			newLoading.progress = progress;
		}
	}
	return newLoading;
}

export const reducers: ActionReducerMap<AppState> = {
	loading: loadingReducer
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];
