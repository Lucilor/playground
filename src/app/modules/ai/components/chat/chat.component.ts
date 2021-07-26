import {AfterViewInit, Component, ViewChild} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {timeout} from "@lucilor/utils";
import {headerNoCache, HttpService} from "@modules/http/services/http.service";
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

    private async _pushFakeMessage(user: string) {
        const message: Message = {type: "text", text: "", user};
        this.pushMessage(message);
        message.isLoading = true;
        await timeout(500 + Math.random() * 500);
        return message;
    }

    clear() {
        this.messages.length = 0;
        return this;
    }

    async updateMessage(oldVal: Message, newVal: Partial<Message> = {}) {
        if (!newVal.timestamp) {
            newVal.timestamp = this._formatTime();
        }
        Object.assign(oldVal, newVal);
        if (this.dom) {
            await timeout();
            this.dom.scrollTop = this.dom.scrollHeight;
        }
    }

    pushMessage(message: Message) {
        this.messages.push(message);
        this.updateMessage(message);
    }

    async pushText(text: string | Promise<string>, user?: string) {
        let message: Message;
        if (user) {
            message = await this._pushFakeMessage(user);
        } else {
            message = {type: "text", text: "", user};
            this.pushMessage(message);
        }
        if (text instanceof Promise) {
            message.isLoading = true;
            text = await text;
        }
        await this.updateMessage(message, {text: text.replace(/\n/g, "<br />")});
        message.isLoading = false;
    }

    async pushImage(url: string | Promise<string>, user?: string) {
        let message: Message;
        if (user) {
            message = await this._pushFakeMessage(user);
        } else {
            message = {type: "image", url: "", user};
            this.pushMessage(message);
        }
        if (url instanceof Promise) {
            message.isLoading = true;
            url = await url;
        }
        this.updateMessage(message, {type: "image", url});
        message.isLoading = false;
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

    constructor(private http: HttpService, private route: ActivatedRoute) {}

    async ngAfterViewInit() {
        const params = this.route.snapshot.queryParams;
        this.messageManager.dom = document.querySelector(".messages-content perfect-scrollbar > div");
        if (params.sayHello !== undefined) {
            this.sayHello();
        } else {
            await this.messageManager.pushText("人类，是世界上最有趣的生物。", this.moli.name);
            this.messageManager.pushText("对我说“帮助”可以查看指令。", this.moli.name);
        }
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
            (async () => {
                await this.messageManager.pushImage("https://candypurity.com/static/images/itpk.png", this.moli.name);
                this.messageManager.pushText("经过漫长的岁月，上面的部分接口可能已经失效。", this.moli.name);
            })();
        } else {
            const textPromise = (async () => {
                const result = await this.http.get<string>(`itpk/${question}`, {}, headerNoCache);
                if (result?.data) {
                    return result.data;
                } else {
                    return "放弃思考";
                }
            })();
            this.messageManager.pushText(textPromise, this.moli.name);
        }
        this.input = "";
    }

    async sayHello() {
        this.messageManager.clear();
        const list = ["你好", "Hello", "こんにちは", "Bonjour", "Hallo", "Witam", "안녕하십니까", "Привет", "Γειά σου", "Olá", "สวัสดี"];
        for (const text of list) {
            await this.messageManager.pushText(text, this.moli.name);
        }
    }
}
