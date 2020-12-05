import {Constructor, LocalStorage, SessionStorage} from "@lucilor/utils";

export const Storaged = <T extends Constructor>(base: T = class {} as T) =>
    class extends base {
        key: string;
        storage: LocalStorage | SessionStorage;

        constructor(...args: any[]) {
            super();
            this.key = args[0];
            this.storage = args[1];
        }

        load(key: string) {
            const data = this.storage.load(this.key) || {};
            return data[key];
        }

        save(key: string, value: any) {
            const data = this.storage.load(this.key) || {};
            data[key] = value;
            this.storage.save(this.key, data);
        }
    };
