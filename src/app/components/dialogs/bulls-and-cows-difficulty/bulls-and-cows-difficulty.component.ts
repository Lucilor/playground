import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {getFormControl, getFormGroup, TypedFormGroup} from "@app/app.common";
import {BullsAndCowsConfig} from "@views/bulls-and-cows/bulls-and-cows";
import {getOpenDialogFunc} from "../dialog.common";

export interface BullsAndCowsDifficulty {
  name: string;
  desc: string;
  config: BullsAndCowsConfig;
}

export const difficulties: BullsAndCowsDifficulty[] = [
  {name: "简单", desc: "有手就行。", config: {chars: "123456", digits: 3, uniqueChars: true}},
  {name: "标准", desc: "标准玩法。", config: {chars: "1234567890", digits: 4, uniqueChars: true}},
  {name: "挑战", desc: "不如挑战一下自我？", config: {chars: "1234567890", digits: 4, uniqueChars: false}},
  {name: "困难", desc: "好像有一点难度。", config: {chars: "1234567890abcd", digits: 6, uniqueChars: false}},
  {name: "地狱", desc: "我选择死亡。", config: {chars: "1234567890abcdefghijklmnopqrstuvwxyz", digits: 10, uniqueChars: false}},
  {
    name: "天堂",
    desc: "这实在太简单了！",
    config: {chars: "1234567890abcdefghijklmnopqrstuvwxyz!@#$%^&*()_+", digits: 12, uniqueChars: false}
  }
];

@Component({
  selector: "app-bulls-and-cows-difficulty",
  templateUrl: "./bulls-and-cows-difficulty.component.html",
  styleUrls: ["./bulls-and-cows-difficulty.component.scss"]
})
export class BullsAndCowsDifficultyComponent {
  form: TypedFormGroup<BullsAndCowsConfig>;
  difficulties = difficulties;
  difficultyIdx = 1;

  get difficulty() {
    return this.difficulties[this.difficultyIdx];
  }

  constructor(
    public dialogRef: MatDialogRef<BullsAndCowsDifficultyComponent, BullsAndCowsDifficulty>,
    @Inject(MAT_DIALOG_DATA) public data: BullsAndCowsDifficulty
  ) {
    this.difficultyIdx = difficulties.findIndex((v) => v.name === data.name);
    this.form = getFormGroup({
      chars: getFormControl(data.config.chars),
      digits: getFormControl(data.config.digits),
      uniqueChars: getFormControl(data.config.uniqueChars)
    });
  }

  changeDifficulty() {
    const difficulty = this.difficulty;
    if (difficulty) {
      for (const key in difficulty.config) {
        const control = this.form.get(key);
        if (control) {
          control.setValue(difficulty.config[key as keyof BullsAndCowsConfig]);
          if (key === "uniqueChars") {
            control.disable();
          }
        }
      }
    } else {
      this.form.get("uniqueChars")?.enable();
    }
  }

  submit() {
    const difficulty = this.difficulty || {name: "自定义", desc: "", config: this.form.value};
    this.dialogRef.close(difficulty);
  }

  cancle() {
    this.dialogRef.close();
  }
}

type BACD = BullsAndCowsDifficulty;
export const openBullsAndCowsDifficultyDialog = getOpenDialogFunc<BullsAndCowsDifficultyComponent, BACD, BACD>(
  BullsAndCowsDifficultyComponent
);
