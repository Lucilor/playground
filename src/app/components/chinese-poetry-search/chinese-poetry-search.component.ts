import {Component, Inject, OnInit} from "@angular/core";
import {MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import {ChinesePoetryService, Poet} from "@src/app/services/chinese-poetry.service";

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
	poetFields = Object.keys(this.poet);

	constructor(
		public dialogRef: MatDialogRef<ChinesePoetrySearchComponent, Poet[]>,
		@Inject(MAT_DIALOG_DATA) public data: Partial<Poet>,
		private service: ChinesePoetryService
	) {
		if (data) {
			for (const key in data) {
				if (typeof data[key] === "string") {
					this.poet[key] = data[key];
				}
			}
		}
	}

	ngOnInit() {}

	async submit() {
		const poetry = await this.service.search(this.poet, 1, 10);
		console.log(poetry);
	}

	cancle() {
		this.dialogRef.close();
	}
}

export function openChinesePoetrySearchDialog(dialog: MatDialog, config: MatDialogConfig<Partial<Poet>>) {
	return dialog.open<ChinesePoetrySearchComponent, Partial<Poet>, Poet[]>(ChinesePoetrySearchComponent, config);
}
