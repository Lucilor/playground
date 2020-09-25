import {Component, Inject, OnInit} from "@angular/core";
import {MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import {Poet} from "@src/app/services/chinese-poetry.service";

@Component({
	selector: "app-chinese-poetry-search",
	templateUrl: "./chinese-poetry-search.component.html",
	styleUrls: ["./chinese-poetry-search.component.scss"]
})
export class ChinesePoetrySearchComponent implements OnInit {
	poet: Poet = {
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

	constructor(public dialogRef: MatDialogRef<ChinesePoetrySearchComponent, Poet[]>, @Inject(MAT_DIALOG_DATA) public data: Partial<Poet>) {
		if (data) {
			for (const key in data) {
				if (typeof data[key] === "string") {
					this.poet[key] = data[key];
				}
			}
		}
	}

	ngOnInit() {}
}

export function openChinesePoetrySearchDialog(dialog: MatDialog, config: MatDialogConfig<Partial<Poet>>) {
	return dialog.open<ChinesePoetrySearchComponent, Partial<Poet>, Poet[]>(ChinesePoetrySearchComponent, config);
}
