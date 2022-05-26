import {Component, ViewChild} from "@angular/core";
import {Validators} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {local} from "@app/app.common";
import {
    BullsAndCowsDifficulty,
    difficulties,
    openBullsAndCowsDifficultyDialog
} from "@components/dialogs/bulls-and-cows-difficulty/bulls-and-cows-difficulty.component";
import {timeout} from "@lucilor/utils";
import {AppStorage} from "@mixins/app-storage.mixin";
import {MessageService} from "@modules/message/services/message.service";
import md5 from "md5";
import {typedFormControl, typedFormGroup, TypedFormGroup} from "ngx-forms-typed";
import {NgScrollbar} from "ngx-scrollbar";
import {BullsAndCows} from "./bulls-and-cows";

export interface BullsAndCowsForm {
    guess: string;
}

@Component({
    selector: "app-bulls-and-cows",
    templateUrl: "./bulls-and-cows.component.html",
    styleUrls: ["./bulls-and-cows.component.scss"]
})
export class BullsAndCowsComponent extends AppStorage() {
    bc: BullsAndCows;
    difficulty: BullsAndCowsDifficulty;
    answerPrompt = "点击重来按钮生成数字";
    answer = "";
    form: TypedFormGroup<BullsAndCowsForm>;
    get guessInput() {
        return this.form.value.guess;
    }
    get canGuess() {
        return this.guessInput && this.bc.canGuess && this.form.valid;
    }
    get guessValidators() {
        return Validators.pattern(new RegExp(`^[${this.bc.config.chars}]*$`));
    }
    @ViewChild(NgScrollbar) scrollbar!: NgScrollbar;

    constructor(private message: MessageService, private dialog: MatDialog) {
        super("bullsAndCows", local);
        this.difficulty = this.load("difficulty") || difficulties[1];
        this.bc = new BullsAndCows(this.difficulty.config);
        this.form = typedFormGroup({
            guess: typedFormControl("", this.guessValidators)
        });
        this.form.markAllAsTouched();
        this.start();
    }

    onKeyDown(event: KeyboardEvent) {
        if (event.key === "Enter") {
            this.guess();
        }
    }

    guess() {
        const {bc, guessInput} = this;
        if (!this.canGuess) {
            return;
        }
        try {
            bc.guess(guessInput);
        } catch (error) {
            this.message.alert((error as Error).message);
        }
        if (bc.solved) {
            this.answer = guessInput;
            const minAttempts = this.load("minAttempts") || {};
            const key = md5(JSON.stringify(Object.values(bc.config).sort()));
            minAttempts[key] = Math.min(minAttempts[key] || Infinity, bc.attempts.length);
            this.save("minAttempts", minAttempts);
            this.message.alert({
                content: `用了${bc.attempts.length}步，你得到了正确答案！此难度下历史最低步数为${minAttempts[key]}`,
                title: "游戏结束"
            });
        }
        (async () => {
            await timeout(0);
            this.scrollbar.scrollTo({bottom: 0});
        })();
    }

    surrender() {
        const bc = this.bc;
        if (bc.canGuess) {
            this.answer = bc.surrender();
            this.form.get("guess")?.setValue(this.answer);
            this.message.alert({content: "答案是： " + this.answer, title: "就这？"});
        }
    }

    start() {
        const bc = this.bc;
        this.bc.start();
        this.answerPrompt = `答案有${bc.config.digits}位（${bc.config.uniqueChars ? "无" : "有"}重复），包含字符：${bc.config.chars}`;
        this.form.get("guess")?.setValue("");
    }

    async changeDifficulty() {
        const result = await openBullsAndCowsDifficultyDialog(this.dialog, {data: this.difficulty});
        if (result) {
            this.save("difficulty", result);
            this.difficulty = result;
            this.bc.config = result.config;
            this.form.controls.guess.setValidators(this.guessValidators);
            this.start();
        }
    }
}
