import {Component, ElementRef} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {timeout} from "@lucilor/utils";
import {local} from "@src/app/app.common";
import {
    BullsAndCowsDifficulty,
    difficulties,
    openBullsAndCowsDifficultyDialog
} from "@src/app/components/dialogs/bulls-and-cows-difficulty/bulls-and-cows-difficulty.component";
import {AppStorage} from "@src/app/mixins/app-storage.mixin";
import {MessageService} from "@src/app/modules/message/services/message.service";
import md5 from "md5";
import {BullsAndCows} from "./bulls-and-cows";

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
    form: FormGroup;
    get guessInput() {
        return this.form.value.guess;
    }
    get canGuess() {
        return this.guessInput && this.bc.canGuess && this.form.valid;
    }

    constructor(
        private message: MessageService,
        private dialog: MatDialog,
        private elRef: ElementRef<HTMLElement>,
        private formBuilder: FormBuilder
    ) {
        super("bullsAndCows", local);
        this.difficulty = this.load("difficulty") || difficulties[1];
        this.bc = new BullsAndCows(this.difficulty.config);
        this.form = this.formBuilder.group({
            guess: ["", Validators.pattern(new RegExp(`^[${this.bc.config.chars}]*$`))]
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
            this.message.alert(`用了${bc.attempts.length}步，你得到了正确答案！此难度下历史最低步数为${minAttempts[key]}`, "游戏结束");
        }
        const el = this.elRef.nativeElement.querySelector(".attempts perfect-scrollbar > div");
        if (el) {
            (async () => {
                await timeout(0);
                el.scrollTop = el.scrollHeight;
            })();
        }
    }

    surrender() {
        const bc = this.bc;
        if (bc.canGuess) {
            this.answer = bc.surrender();
            this.form.get("guess")?.setValue(this.answer);
            this.message.alert("答案是： " + this.answer, "就这？");
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
            this.start();
        }
    }
}
