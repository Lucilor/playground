import {AfterViewInit, Component, ViewChild} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {timeout} from "@lucilor/utils";
import {ItpkResponse, ItpkService} from "@modules/ai/services/itpk.service";
import {NgScrollbar} from "ngx-scrollbar";
import urlJoin from "url-join";

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

  constructor(public scrollbar?: NgScrollbar) {}

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

  private async _updateScrollbar() {
    if (this.scrollbar) {
      await timeout();
      this.scrollbar.scrollTo({bottom: 0});
      this.scrollbar.update();
    }
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
    await this._updateScrollbar();
  }

  async pushMessage(message: Message) {
    this.messages.push(message);
    await this.updateMessage(message);
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
      await this._updateScrollbar();
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

  async pushItpkResponse(itpkResponse: ItpkResponse, user?: string) {
    if (itpkResponse.code !== "00000") {
      await this.pushText(itpkResponse.message, user);
    }
    const {data, baseUrl} = itpkResponse;
    for (const {typed, content} of data) {
      switch (typed) {
        case 1:
          await this.pushText(content, user);
          break;
        case 2:
          await this.pushImage(urlJoin(baseUrl, content), user);
          break;
        case 3:
          await this.pushText("暂不支持的消息类型：文档", user);
          break;
        case 4:
          await this.pushText("暂不支持的消息类型：音频", user);
          break;
        case 8:
          await this.pushText(content, user);
          break;
        case 9:
          await this.pushText("暂不支持的消息类型：其它文件", user);
          break;
        default:
          await this.pushText("暂不支持的消息类型：" + typed, user);
      }
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
  messageManager = new MessageManager();
  input = "";
  @ViewChild(NgScrollbar) scrollbar!: NgScrollbar;

  get messages() {
    // ? type check
    return this.messageManager.messages as any[];
  }

  constructor(private itpk: ItpkService, private route: ActivatedRoute) {}

  async ngAfterViewInit() {
    const params = this.route.snapshot.queryParams;
    this.messageManager.scrollbar = this.scrollbar;
    if (params.sayHello !== undefined) {
      this.sayHello();
    } else {
      await this.messageManager.pushText("人类，是世界上最有趣的生物。", this.moli.name);
      this.messageManager.pushText("对我说“帮助”可以查看帮助文档。", this.moli.name);
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.code === "Enter") {
      event.preventDefault();
      this.send();
    }
  }

  async send() {
    if (!this.input) {
      return;
    }
    const question = this.input;
    await this.messageManager.pushText(question);
    this.input = "";
    await timeout();
    const itpkResponse = await this.itpk.ask(question);
    if (itpkResponse) {
      await this.messageManager.pushItpkResponse(itpkResponse, this.moli.name);
    } else {
      await this.messageManager.pushText("放弃思考", this.moli.name);
    }
  }

  async sayHello() {
    this.messageManager.clear();
    const list = ["你好", "Hello", "こんにちは", "Bonjour", "Hallo", "Witam", "안녕하십니까", "Привет", "Γειά σου", "Olá", "สวัสดี"];
    for (const text of list) {
      await this.messageManager.pushText(text, this.moli.name);
    }
  }
}
