import {Component, EventEmitter, Input, OnDestroy, Output} from "@angular/core";
import {Editor, Toolbar} from "ngx-editor";
import {plugins} from "../../plugins";
import {schema} from "../../schema";
import {nodeViews} from "../../node-views";

// FIXME: codemirror doesn't work
@Component({
    selector: "app-editor",
    templateUrl: "./editor.component.html",
    styleUrls: ["./editor.component.scss"]
})
export class EditorComponent implements OnDestroy {
    @Input() content = "";
    @Input() enabled = true;
    @Output() contentChange = new EventEmitter<string>();
    editor: Editor = new Editor({
        schema,
        plugins,
        nodeViews
    });
    toolbar: Toolbar = [
        ["bold", "italic"],
        ["underline", "strike"],
        ["code", "blockquote"],
        ["ordered_list", "bullet_list"],
        [{heading: ["h1", "h2", "h3", "h4", "h5", "h6"]}],
        ["link", "image"],
        ["text_color", "background_color"],
        ["align_left", "align_center", "align_right", "align_justify"]
    ];

    ngOnDestroy() {
        this.editor.destroy();
    }

    onContentChange(event: string) {
        this.contentChange.emit(event);
    }
}
