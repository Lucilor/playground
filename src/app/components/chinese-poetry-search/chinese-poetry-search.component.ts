import {Component, Inject, OnInit} from "@angular/core";
import {MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import {ChinesePoetryService, Poem} from "@src/app/services/chinese-poetry.service";

@Component({
	selector: "app-chinese-poetry-search",
	templateUrl: "./chinese-poetry-search.component.html",
	styleUrls: ["./chinese-poetry-search.component.scss"]
})
export class ChinesePoetrySearchComponent implements OnInit {
	poem: Poem = {
		id: 0,
		author: "",
		dynasty: "",
		title: "",
		rhythmic: "",
		chapter: "",
		paragraphs: "",
		notes: "",
		collection: "",
		section: "",
		content: "",
		comment: "",
		tags: ""
	};
	poetFields = Object.keys(this.poem).slice(1);

	constructor(public dialogRef: MatDialogRef<ChinesePoetrySearchComponent, Poem>, @Inject(MAT_DIALOG_DATA) public data: Partial<Poem>) {
		if (data) {
			for (const key in data) {
				if (typeof data[key] === "string") {
					this.poem[key] = data[key];
				}
			}
		}
	}

	ngOnInit() {}

	submit() {
		this.dialogRef.close(this.poem);
	}

	cancle() {
		this.dialogRef.close();
	}
}

export function openChinesePoetrySearchDialog(dialog: MatDialog, config: MatDialogConfig<Partial<Poem>>) {
	return dialog.open<ChinesePoetrySearchComponent, Partial<Poem>, Poem>(ChinesePoetrySearchComponent, config);
}
