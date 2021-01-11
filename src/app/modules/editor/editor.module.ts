import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {NgxEditorModule} from "ngx-editor";
import {EditorComponent} from "./components/editor/editor.component";
import {PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import { FormsModule } from "@angular/forms";

@NgModule({
    declarations: [EditorComponent],
    imports: [
        CommonModule,
        FormsModule,
        NgxEditorModule.forRoot({
            locals: {
                // menu
                bold: "Bold",
                italic: "Italic",
                code: "Code",
                blockquote: "Blockquote",
                underline: "Underline",
                strike: "Strike",
                bullet_list: "Bullet List",
                ordered_list: "Ordered List",
                heading: "Heading",
                h1: "Header 1",
                h2: "Header 2",
                h3: "Header 3",
                h4: "Header 4",
                h5: "Header 5",
                h6: "Header 6",
                align_left: "Left Align",
                align_center: "Center Align",
                align_right: "Right Align",
                align_justify: "Justify",
                text_color: "Text Color",
                background_color: "Background Color",

                // pupups, forms, others...
                url: "URL",
                text: "Text",
                openInNewTab: "Open in new tab",
                insert: "Insert",
                altText: "Alt Text",
                title: "Title",
                remove: "Remove"
            }
        }),
        PerfectScrollbarModule
    ],
    exports: [EditorComponent]
})
export class EditorModule {}
