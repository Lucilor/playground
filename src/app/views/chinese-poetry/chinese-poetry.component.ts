import {Component, OnInit} from "@angular/core";
import {MatDialog} from "@angular/material/dialog";
import {PageEvent} from "@angular/material/paginator";
import {openChinesePoetrySearchDialog} from "@src/app/components/dialogs/chinese-poetry-search/chinese-poetry-search.component";
import {ChinesePoetryService, Poem} from "@src/app/modules/http/services/chinese-poetry.service";
import {AppStatusService} from "@src/app/services/app-status.service";

@Component({
    selector: "app-chinese-poetry",
    templateUrl: "./chinese-poetry.component.html",
    styleUrls: ["./chinese-poetry.component.scss"]
})
export class ChinesePoetryComponent implements OnInit {
    randomPoems: Poem[] = [];
    searchPoem: Partial<Poem> = {};
    page: {poems: Poem[]; paragraphs: string[][]; tags: string[][]} = {poems: [], paragraphs: [], tags: []};
    pageInfo = {
        length: 0,
        pageSize: 10,
        pageSizeOptions: [1, 5, 10, 15, 20, 50, 100],
        pageIndex: 0
    };
    isRandom = true;
    loaderId = "chinese-poetry";

    constructor(private service: ChinesePoetryService, private dialog: MatDialog, private status: AppStatusService) {
        this.setPage([], 0);
    }

    async ngOnInit() {
        this.random();
        Object.assign(window, {cp: this});
    }

    async random() {
        this.status.startLoader();
        const poems = await this.service.random(10);
        this.status.stopLoader();
        this.randomPoems = poems;
        this.setPage(poems, poems.length);
    }

    async search() {
        const poem = await openChinesePoetrySearchDialog(this.dialog, {data: this.searchPoem});
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
            this.status.startLoader();
            const [poems, count] = await this.service.search(this.searchPoem, pageIndex + 1, pageSize);
            this.status.stopLoader();
            this.setPage(poems, count);
        }
        this.pageInfo.pageIndex = pageIndex;
    }
}

const parsePoem = (poems: Poem[], field: keyof Poem) => {
    const result: string[][] = [];
    for (const poem of poems) {
        const str = poem[field] as string;
        let arr: string[];
        try {
            arr = JSON.parse(str);
        } catch (error) {
            console.warn(str);
            continue;
        }
        if (!Array.isArray(arr)) {
            arr = [];
        }
        if (field === "tags" && poem.collection) {
            arr.unshift(poem.collection);
        }
        result.push(arr);
    }
    return result;
};
