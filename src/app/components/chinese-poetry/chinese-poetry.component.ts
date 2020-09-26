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
	randomPoems: Poem[] = [];
	searchPoem: Partial<Poem> = {};
	page: {poems: Poem[]; paragraphs: string[][]; tags: string[][]};
	pageInfo = {
		length: 0,
		pageSize: 10,
		pageSizeOptions: [1, 5, 10, 15, 20, 50, 100],
		pageIndex: 0
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
		this.randomPoems = poems;
		this.setPage(poems, poems.length);
	}

	async search() {
		const ref = openChinesePoetrySearchDialog(this.dialog, {data: this.searchPoem});
		const poem = await ref.afterClosed().toPromise();
		if (poem) {
			this.isRandom = false;
			this.searchPoem = poem;
			const event = new PageEvent();
			event.pageIndex = 0;
			event.pageSize = this.pageInfo.pageSize;
			this.changePage(event);
		}
	}

	setPage(poems: Poem[], length: number) {
		this.page = {
			poems,
			paragraphs: parsePoem(poems, "paragraphs"),
			tags: parsePoem(poems, "tags")
		};
		this.pageInfo.length = length;
	}

	async changePage(event: PageEvent) {
		const {pageIndex, pageSize} = event;
		if (this.isRandom) {
			this.setPage(this.randomPoems.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize), this.randomPoems.length);
		} else {
			const [poems, count] = await this.service.search(this.searchPoem, pageIndex + 1, pageSize);
			this.setPage(poems, count);
		}
		this.pageInfo.pageIndex = pageIndex;
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
		if (!Array.isArray(arr)) {
			arr = [];
		}
		if (field === "tags" && poem.collection) {
			arr.unshift(poem.collection);
		}
		result.push(arr);
	});
	return result;
}
