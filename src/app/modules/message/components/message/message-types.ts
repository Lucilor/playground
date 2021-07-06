import {ValidatorFn} from "@angular/forms";
import {ObjectOf} from "@utils";

export interface BaseMessageData {
    title?: string;
    content?: any;
    cancelable?: boolean;
}

export interface AlertMessageData extends BaseMessageData {
    type: "alert";
    btnTexts?: {ok?: string};
}

export interface ConfirmMessageData extends BaseMessageData {
    type: "confirm";
    btnTexts?: {yes?: string; no?: string};
}

export interface ButtonMessageData extends BaseMessageData {
    type: "button";
    buttons: (string | {label: string; value: string})[];
}

export interface PromptData {
    type?: string;
    hint?: string;
    value?: string;
    placeholder?: string;
    validators?: ValidatorFn | ValidatorFn[] | null;
    errorText?: ObjectOf<string> | string;
}

export interface PromptMessageData extends BaseMessageData {
    type: "prompt";
    promptData?: PromptData;
    btnTexts?: {submit?: string; cancle?: string};
}

export interface BookPageData {
    title?: string;
    content: string;
}

export type BookData = BookPageData[];

export interface BookMessageData extends BaseMessageData {
    type: "book";
    bookData: BookData;
    btnTexts?: {prev?: string; next?: string; exit?: string};
}

export interface EditorMessageData extends BaseMessageData {
    type: "editor";
    editable: boolean;
    btnTexts?: {submit?: string; cancle?: string};
}

export type MessageData =
    | AlertMessageData
    | ConfirmMessageData
    | PromptMessageData
    | BookMessageData
    | EditorMessageData
    | ButtonMessageData;

export interface MessageDataMap {
    alert: AlertMessageData;
    confirm: ConfirmMessageData;
    prompt: PromptMessageData;
    book: BookMessageData;
    editor: EditorMessageData;
    button: ButtonMessageData;
}
