import {Component, OnInit} from "@angular/core";
import {MatDialog} from "@angular/material/dialog";
import {ChinesePoetryService, Poet} from "@src/app/services/chinese-poetry.service";
import {openChinesePoetrySearchDialog} from "../chinese-poetry-search/chinese-poetry-search.component";

@Component({
	selector: "app-chinese-poetry",
	templateUrl: "./chinese-poetry.component.html",
	styleUrls: ["./chinese-poetry.component.scss"]
})
export class ChinesePoetryComponent implements OnInit {
	poet: Poet = null;
	parsedParagraphs: string[];

	constructor(private service: ChinesePoetryService, private dialog: MatDialog) {}

	async ngOnInit() {
		this.random();
	}

	async random() {
		const poetry = await this.service.random();
		console.log(poetry);
		this.poet = poetry[0];
		this.parsedParagraphs = parseParagraphs(this.poet);
	}

	async search() {
		openChinesePoetrySearchDialog(this.dialog, {});
	}
}

function parseParagraphs(poet: Poet) {
	const str = poet.paragraphs;
	let arr: string[];
	try {
		arr = JSON.parse(str);
	} catch (error) {
		console.warn(str);
		return [];
	}
	if (Array.isArray(arr)) {
		return arr;
	} else {
		return [];
	}
}
