export interface AppState {
	loading: {list: Set<string>; progress: number};
}

export const initialState: AppState = {
	loading: {list: new Set(), progress: -1}
};
