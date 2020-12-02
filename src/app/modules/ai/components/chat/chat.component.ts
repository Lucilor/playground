import {AfterViewInit, Component, OnInit, ViewChild} from "@angular/core";
import {timeout} from "@lucilor/utils";
import {HttpService} from "@src/app/modules/http/services/http.service";
import {PerfectScrollbarComponent} from "ngx-perfect-scrollbar";

export interface User {
    name: string;
    avatar: string;
    description: string;
}

export interface Message {
    text: string;
    user?: string;
    timestamp?: string;
    isLoading?: boolean;
}

export class MessageManager {
    messages: Message[] = [];

    constructor(public dom: HTMLElement | null) {}

    private _formatTime(time = new Date()) {
        const hr = time.getHours().toString().padStart(2, "0");
        const m = time.getMinutes().toString().padStart(2, "0");
        return [hr, m].join(":");
    }

    async push(text: string | Promise<string>, user?: string) {
        if (text instanceof Promise) {
            this.messages.push({text: "", user, isLoading: true});
            const index = this.messages.length - 1;
            const realText = await text;
            const message = this.messages[index];
            message.text = realText;
            message.timestamp = this._formatTime();
            message.isLoading = false;
        } else {
            this.messages.push({text, user, timestamp: this._formatTime()});
        }
        if (this.dom) {
            await timeout();
            this.dom.scrollTop = this.dom.scrollHeight;
        }
    }
}

@Component({
    selector: "app-chat",
    templateUrl: "./chat.component.html",
    styleUrls: ["./chat.component.scss"]
})
export class ChatComponent implements AfterViewInit {
    moli: User = {name: "茉莉", avatar: "https://candypurity.com/static/images/users/untitled.png", description: "人见人爱，花见花开"};
    messageManager = new MessageManager(null);
    input = "";
    @ViewChild(PerfectScrollbarComponent) scrollbar?: PerfectScrollbarComponent;

    get messages() {
        return this.messageManager.messages;
    }

    constructor(private http: HttpService) {}

    ngAfterViewInit() {
        console.log(this);
        this.messageManager.dom = document.querySelector(".messages-content perfect-scrollbar > div");
        this.messageManager.push("人类，是世界上最有趣的生物。", this.moli.name);
    }

    onType(event: Event) {
        const inputEl = event.target as HTMLInputElement;
        this.input = inputEl.value;
        if (this.input.endsWith("\n")) {
            this.send();
        }
    }

    send() {
        const question = this.input.replace(/\n$/, "");
        this.messageManager.push(question);
        this.input = "";
        const textPromise = new Promise<string>(async (resolve) => {
            const result = await this.http.get<string>("static/itpk/ask.php", {question}, {headers: {"Cache-Control": "no-cache"}});
            if (typeof result?.data === "string") {
                resolve(result.data);
            } else {
                resolve("放弃思考");
            }
        });
        this.messageManager.push(textPromise, this.moli.name);
    }
}
