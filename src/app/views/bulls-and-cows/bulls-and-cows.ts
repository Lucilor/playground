export interface BullsAndCowsConfig {
    chars: string;
    digits: number;
    uniqueChars: boolean;
}

export interface BullsAndCowsAttempt {
    answer: string;
    result: string | false;
}

export class BullsAndCows {
    config: BullsAndCowsConfig = {
        chars: "0123456789",
        digits: 4,
        uniqueChars: true
    };
    private _answer: string | null = null;
    private _solved = false;
    attempts: BullsAndCowsAttempt[] = [];

    get solved() {
        return this._solved;
    }

    constructor(config: Partial<BullsAndCowsConfig> = {}) {
        Object.assign(this.config, config);
    }

    private _generateAnswer() {
        const {chars, digits, uniqueChars} = this.config;
        const charSet = new Set(chars.split(""));
        let answer = "";
        for (let i = 0; i < digits; i++) {
            const j = Math.floor(Math.random() * charSet.size);
            const char = Array.from(charSet)[j];
            if (uniqueChars) {
                charSet.delete(char);
            }
            answer += char;
        }
        this._answer = answer;
    }

    start() {
        this.attempts.length = 0;
        this._generateAnswer();
        this._solved = false;
        return this;
    }

    surrender() {
        if (this._answer && !this._solved) {
            this.guess(this._answer);
        }
        return this._answer;
    }

    isAnswerValid(answer: string) {
        if (!this._answer) {
            return "尚未开始";
        }
        if (this._solved) {
            return "已经结束";
        }
        if (answer.length !== this._answer.length) {
            return `长度应为${this._answer.length}位`;
        }
        if (!answer.match(new RegExp(`^[${this.config.chars}]*$`))) {
            return "包含非法字符";
        }
        return true;
    }

    guess(answer: string) {
        const valid = this.isAnswerValid(answer);
        if (typeof valid === "string") {
            throw new Error(`输入 ${answer} 无效： ${valid}。`);
        }
        if (!this._answer) {
            throw new Error("尚未开始。");
        }
        const a = new Set<number>();
        const b = new Set<number>();
        for (let i = 0; i < answer.length; i++) {
            if (answer[i] === this._answer[i]) {
                a.add(i);
            }
        }
        for (let i = 0; i < answer.length; i++) {
            if (a.has(i)) {
                continue;
            }
            for (let j = 0; j < answer.length; j++) {
                if (i !== j && answer[i] === this._answer[j] && !a.has(j) && !b.has(j)) {
                    b.add(j);
                    break;
                }
            }
        }
        const attempt: BullsAndCowsAttempt = {answer, result: `${a.size}A${b.size}B`};
        this.attempts.push(attempt);
        if (a.size === this._answer.length) {
            this._solved = true;
        }
        return attempt;
    }
}
