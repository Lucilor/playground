import {Component, Inject, OnInit} from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import {Poem} from "@modules/http/services/chinese-poetry.service";
import {getOpenDialogFunc} from "../dialog.common";

@Component({
  selector: "app-chinese-poetry-search",
  templateUrl: "./chinese-poetry-search.component.html",
  styleUrls: ["./chinese-poetry-search.component.scss"]
})
export class ChinesePoetrySearchComponent implements OnInit {
  poem: Poem = {
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
  poetFields = Object.keys(this.poem) as (keyof Poem)[];

  constructor(public dialogRef: MatDialogRef<ChinesePoetrySearchComponent, Poem>, @Inject(MAT_DIALOG_DATA) public data: Partial<Poem>) {
    if (data) {
      let key: keyof Poem;
      for (key in data) {
        if (typeof data[key] === "string") {
          this.poem[key] = data[key] as string;
        }
      }
    }
  }

  ngOnInit() {
    return;
  }

  submit() {
    this.dialogRef.close(this.poem);
  }

  cancle() {
    this.dialogRef.close();
  }
}

export const openChinesePoetrySearchDialog = getOpenDialogFunc<ChinesePoetrySearchComponent, Partial<Poem>, Poem>(
  ChinesePoetrySearchComponent
);
