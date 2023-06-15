import {Injectable} from "@angular/core";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar, MatSnackBarConfig} from "@angular/material/snack-bar";
import {InputInfo} from "@modules/input/components/input.types";
import {BehaviorSubject, lastValueFrom} from "rxjs";
import {
  AlertMessageData,
  BookMessageData,
  ButtonMessageData,
  ConfirmMessageData,
  EditorMessageData,
  FormMessageData,
  getListEl,
  IFrameMessageData,
  JsonMessageData,
  MessageData,
  MessageDataMap,
  MessageOutput
} from "../components/message/message-types";
import {MessageComponent} from "../components/message/message.component";

export type MessageDataParams<T> = Omit<T, "type">;
export type MessageDataParams2<T> = Omit<MatDialogConfig<T>, "data">;

@Injectable({
  providedIn: "root"
})
export class MessageService {
  openedDialogs: MatDialogRef<MessageComponent, MessageOutput>[] = [];
  open$ = new BehaviorSubject<MatDialogConfig<MessageData>>({});
  close$ = new BehaviorSubject<MessageOutput>(null);
  constructor(private dialog: MatDialog, private snackBar: MatSnackBar) {}

  async open(config: MatDialogConfig<MessageData>) {
    config = {width: "40%", ...config};
    const data = config.data;
    if (data?.disableCancel || config.disableClose === undefined) {
      config.disableClose = true;
    }
    const ref = this.dialog.open<MessageComponent, MessageData, MessageOutput>(MessageComponent, config);
    this.openedDialogs.push(ref);
    this.open$.next(config);
    const result = await lastValueFrom(ref.afterClosed());
    this.openedDialogs = this.openedDialogs.filter((dialog) => dialog.id !== ref.id);
    this.close$.next(result);
    return result;
  }

  private _getData<T extends MessageData, K extends MessageData["type"]>(data: string | MessageDataParams<T>, type: K): MessageDataMap[K] {
    if (typeof data === "string") {
      data = {content: data} as MessageDataParams<T>;
    }
    return {...data, type} as MessageData as MessageDataMap[K];
  }

  async alert(data: string | MessageDataParams<AlertMessageData>, others: MessageDataParams2<AlertMessageData> = {}) {
    await this.open({data: this._getData(data, "alert"), ...others});
  }

  async error(
    message: string | MessageDataParams<AlertMessageData>,
    details: string[] | string = [],
    others: MessageDataParams2<AlertMessageData> = {}
  ) {
    const data = this._getData(message, "alert");
    if (Array.isArray(details)) {
      const el = getListEl(details, data.content);
      data.content = el;
    } else {
      data.content = `${data.content}<br>${details}`;
    }
    if (!data.title) {
      data.title = `<span style="color:red">错误</span>`;
    }
    await this.open({data, width: "80vw", ...others});
  }

  async confirm(data: string | MessageDataParams<ConfirmMessageData>, others: MessageDataParams2<ConfirmMessageData> = {}) {
    return !!(await this.open({data: this._getData(data, "confirm"), ...others}));
  }

  async form(data: InputInfo[] | MessageDataParams<FormMessageData>, others: MessageDataParams2<FormMessageData> = {}) {
    if (Array.isArray(data)) {
      data = {inputs: data};
    }
    const result = await this.open({data: this._getData(data, "form"), ...others});
    if (result && typeof result === "object") {
      return result;
    }
    return null;
  }

  async prompt(
    info: InputInfo,
    data?: Omit<MessageDataParams<FormMessageData>, "inputs">,
    others: MessageDataParams2<FormMessageData> = {}
  ) {
    const result = await this.form({inputs: [info], ...data}, others);
    if (result && typeof result === "object") {
      return Object.values(result)[0];
    }
    return null;
  }

  async book(data: string | MessageDataParams<BookMessageData>, others: MessageDataParams2<BookMessageData> = {}) {
    await this.open({data: this._getData(data, "book"), width: "80vw", ...others});
  }

  async editor(data: string | MessageDataParams<EditorMessageData>, others: MessageDataParams2<EditorMessageData> = {}) {
    return String(await this.open({data: this._getData(data, "editor"), width: "80vw", ...others}));
  }

  async button(data: string | MessageDataParams<ButtonMessageData>, others: MessageDataParams2<ButtonMessageData> = {}) {
    return String(await this.open({data: this._getData(data, "button"), ...others}));
  }

  async iframe(data: string | MessageDataParams<IFrameMessageData>, others: MessageDataParams2<IFrameMessageData> = {}) {
    return String(await this.open({data: this._getData(data, "iframe"), width: "100vw", height: "100vh", ...others}));
  }

  async json(json: any, data: Omit<MessageDataParams<JsonMessageData>, "json"> = {}, others: MessageDataParams2<JsonMessageData> = {}) {
    const data2 = {...data, content: "", json};
    return (await this.open({data: this._getData(data2, "json"), width: "80vw", height: "80vh", ...others})) as any;
  }

  async snack(message: string, action?: string, config?: MatSnackBarConfig) {
    const snackBarRef = this.snackBar.open(message, action, config);
    try {
      await lastValueFrom(snackBarRef.onAction());
    } catch (error) {}
    if (!action) {
      snackBarRef.dismiss();
    }
  }
}
