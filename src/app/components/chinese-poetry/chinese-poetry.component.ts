import {Component, OnInit} from "@angular/core";
import {MatDialog} from "@angular/material/dialog";
import {PageEvent} from "@angular/material/paginator";
import {ChinesePoetryService, Poem} from "@src/app/services/chinese-poetry.service";
import {openChinesePoetrySearchDialog} from "../chinese-poetry-search/chinese-poetry-search.component";

@Component({
	selector: "app-chinese-poetry",
	templateUrl: "./chinese-poetry.component.html",
	styleUrls: ["./chinese-poetry.component.scss"]
})
export class ChinesePoetryComponent implements OnInit {
	poems: Poem[] = [];
	page: {poems: Poem[]; paragraphs: string[][]; tags: string[][]};
	pageInfo = {
		length: 0,
		pageSize: 10,
		pageSizeOptions: [1, 5, 10, 15, 20, 50, 100]
	};
	isRandom = true;

	constructor(private service: ChinesePoetryService, private dialog: MatDialog) {
		this.setPage([], 0);
	}

	async ngOnInit() {
		this.random();
		Object.assign(window, {cp: this});
	}

	async random() {
		const poems = await this.service.random(10);
		this.poems = poems;
		this.setPage(poems, poems.length);
	}

	async search() {
		openChinesePoetrySearchDialog(this.dialog, {});
	}

	setPage(poems: Poem[], length: number) {
		this.page = {
			poems,
			paragraphs: parsePoem(poems, "paragraphs"),
			tags: parsePoem(poems, "tags")
		};
		this.pageInfo.length = length;
	}

	changePage(event: PageEvent) {
		console.log(event);
		const {pageIndex, pageSize} = event;
		if (this.isRandom) {
			this.setPage(this.poems.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize), this.poems.length);
		} else {
		}
	}
}

function parsePoem(poems: Poem[], field: keyof Poem) {
	const result = [];
	poems.forEach((poem) => {
		const str = poem[field] as string;
		let arr: string[];
		try {
			arr = JSON.parse(str);
		} catch (error) {
			console.warn(str);
			return [];
		}
		if (Array.isArray(arr)) {
			result.push(arr);
		} else {
			result.push([]);
		}
	});
	return result;
}
