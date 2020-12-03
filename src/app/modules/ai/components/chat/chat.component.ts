import {AfterViewInit, Component, ViewChild} from "@angular/core";
import {timeout} from "@lucilor/utils";
import {HttpService} from "@src/app/modules/http/services/http.service";
import {PerfectScrollbarComponent} from "ngx-perfect-scrollbar";

export interface User {
    name: string;
    avatar: string;
    description: string;
}

interface MessageBase {
    user?: string;
    timestamp?: string;
    isLoading?: boolean;
}

interface MessageText extends MessageBase {
    type: "text";
    text: string;
}

interface MessageImage extends MessageBase {
    type: "image";
    url: string;
}

export type Message = MessageText | MessageImage;

export class MessageManager {
    messages: Message[] = [];

    constructor(public dom: HTMLElement | null) {}

    private _formatTime(time = new Date()) {
        const hr = time.getHours().toString().padStart(2, "0");
        const m = time.getMinutes().toString().padStart(2, "0");
        return [hr, m].join(":");
    }

    async pushText(text: string | Promise<string>, user?: string) {
        const message: Message = {type: "text", text: "", user};
        this.messages.push(message);
        if (text instanceof Promise) {
            message.isLoading = true;
            text = await text;
            message.isLoading = false;
        }
        message.text = text.replace(/\n/g, "<br />");
        message.timestamp = this._formatTime();
        if (this.dom) {
            await timeout();
            this.dom.scrollTop = this.dom.scrollHeight;
        }
    }

    async pushImage(url: string, user?: string) {
        const message: Message = {type: "image", url, user};
        this.messages.push(message);
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
        // ? type check
        return this.messageManager.messages as any[];
    }

    constructor(private http: HttpService) {}

    ngAfterViewInit() {
        this.messageManager.dom = document.querySelector(".messages-content perfect-scrollbar > div");
        this.messageManager.pushText("人类，是世界上最有趣的生物。", this.moli.name);
    }

    onKeyDown(event: KeyboardEvent) {
        if (event.code === "Enter") {
            event.preventDefault();
            this.send();
        }
    }

    send() {
        if (!this.input) {
            return;
        }
        const question = this.input;
        this.messageManager.pushText(question);
        if (question.match(/^help|\?|帮助$/i)) {
            this.messageManager.pushImage("https://candypurity.com/static/images/itpk.png", this.moli.name);
            return;
        }
        this.input = "";
        const textPromise = new Promise<string>(async (resolve) => {
            const result = await this.http.get<string>("static/itpk/ask.php", {question}, {headers: {"Cache-Control": "no-cache"}});
            if (typeof result?.data === "string") {
                resolve(result.data);
            } else {
                resolve("放弃思考");
            }
        });
        this.messageManager.pushText(textPromise, this.moli.name);
    }
}
