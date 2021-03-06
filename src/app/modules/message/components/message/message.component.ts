import {HttpErrorResponse} from "@angular/common/http";
import {Component, OnInit, Inject, ViewChild, OnDestroy} from "@angular/core";
import {FormControl} from "@angular/forms";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {clamp, cloneDeep, debounce} from "lodash";
import {QuillEditorComponent, QuillViewComponent} from "ngx-quill";
import {MessageData, PromptData} from "./message-types";

@Component({
    selector: "app-message",
    templateUrl: "./message.component.html",
    styleUrls: ["./message.component.scss"]
})
export class MessageComponent implements OnInit, OnDestroy {
    input = new FormControl();
    titleHTML: SafeHtml = "";
    subTitleHTML: SafeHtml = "";
    contentHTML: SafeHtml = "";
    page = 0;
    @ViewChild(QuillEditorComponent) editor?: QuillViewComponent;

    private get _editorToolbarHeight() {
        if (this.editor) {
            const el = this.editor.elementRef.nativeElement as HTMLElement;
            const toolbar = el.querySelector(".ql-toolbar");
            if (toolbar) {
                return toolbar.getBoundingClientRect().height;
            }
        }
        return 0;
    }
    private _resizeEditor = debounce(() => {
        if (this.editor) {
            const el = this.editor.editorElem;
            const height = this._editorToolbarHeight;
            if (height) {
                el.style.height = `calc(100% - ${height}px)`;
                return true;
            }
        }
        return false;
    }, 500).bind(this);

    get promptData() {
        let result: PromptData = {};
        if (this.data.type === "prompt" && typeof this.data.promptData === "object") {
            result = this.data.promptData;
        }
        return result;
    }

    get minPage() {
        return 0;
    }
    get maxPage() {
        if (this.data.type === "book") {
            return this.data.bookData.length - 1;
        }
        return 0;
    }

    get editable() {
        if (this.data.type === "editor") {
            return this.data.editable;
        }
        return false;
    }

    constructor(
        public dialogRef: MatDialogRef<MessageComponent, boolean | string>,
        private sanitizer: DomSanitizer,
        @Inject(MAT_DIALOG_DATA) public data: MessageData
    ) {
        this.data = cloneDeep(this.data);
    }

    ngOnInit() {
        const data = this.data;
        if (data.title === null || data.title === undefined) {
            data.title = "";
        }
        this.titleHTML = this.sanitizer.bypassSecurityTrustHtml(this.data.title || "");
        if (data.content === null || data.content === undefined) {
            data.content = "";
        } else if (data.content instanceof Error) {
            data.title = "Oops!";
            data.content = data.content.message;
            console.warn(data.content);
        } else if (data.content instanceof HttpErrorResponse) {
            data.title = "网络错误";
            if (typeof data.content.error === "string") {
                data.content = data.content.error;
            } else if (typeof data.content.error?.text === "string") {
                data.content = data.content.error.text;
            } else {
                data.content = "未知网络错误";
            }
        } else if (typeof data.content !== "string") {
            try {
                data.content = JSON.stringify(data.content);
            } catch (error) {
                console.warn(error);
            }
        }
        this.contentHTML = this.sanitizer.bypassSecurityTrustHtml(data.content);

        if (data.type === "prompt") {
            if (!data.promptData) {
                data.promptData = {};
            }
            data.promptData = {
                ...{
                    type: "text",
                    hint: "",
                    errorText: "",
                    value: "",
                    placeholder: "请输入",
                    validators: null
                },
                ...data.promptData
            };
            this.input = new FormControl(data.promptData.value, data.promptData.validators);
        }
        if (data.type === "book") {
            if (!data.bookData) {
                data.bookData = [];
            }
            this.setPage(0);
        }

        const id = window.setInterval(() => {
            if (this._resizeEditor()) {
                window.clearInterval(id);
            }
        }, 600);
        window.addEventListener("resize", this._resizeEditor);
    }

    ngOnDestroy() {
        window.removeEventListener("resize", this._resizeEditor);
    }

    getErrorText() {
        const errorText = this.promptData.errorText;
        if (this.input.invalid) {
            if (typeof errorText === "string") {
                return errorText;
            } else if (typeof errorText === "object") {
                const keys = Object.keys(this.input.errors || {});
                return errorText[keys[0]] || "";
            }
        }
        return "";
    }

    submit() {
        if (this.data.type === "confirm") {
            this.dialogRef.close(true);
        } else if (this.data.type === "prompt") {
            if (this.input.untouched) {
                this.input.markAsTouched();
            }
            if (this.input.valid) {
                this.dialogRef.close(this.input.value);
            }
        } else if (this.data.type === "editor") {
            this.dialogRef.close(this.data.content);
        } else {
            this.cancle();
        }
    }

    cancle() {
        if (this.data.type === "prompt") {
            if (this.input.untouched) {
                this.input.markAsTouched();
            }
            if (this.input.invalid) {
                return;
            }
        }
        this.dialogRef.close(false);
    }

    setPage(page: number) {
        if (this.data.type !== "book") {
            return;
        }
        if (this.data.bookData) {
            this.page = clamp(page, this.minPage, this.maxPage);
            const data = this.data.bookData[this.page];
            this.contentHTML = this.sanitizer.bypassSecurityTrustHtml(data.content);
            if (data.title) {
                this.subTitleHTML = this.sanitizer.bypassSecurityTrustHtml(data.title);
            }
        } else {
            this.page = 0;
        }
    }
}
