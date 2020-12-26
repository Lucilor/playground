export class ChineseChess {
    red = new ChineseChessSide("red");
    black = new ChineseChessSide("black");

    constructor() {}
}

export class ChineseChessSide {
    pieces: ChineseChessPiece[];

    constructor(public name: "red" | "black") {
        this.pieces = [new ChineseChessPawn()];
    }
}

export abstract class ChineseChessPiece {
    position = [0, 0];
    eaten = false;

    constructor(public name: {red: string; black: string}) {}
}

export class ChineseChessPawn extends ChineseChessPiece {
    constructor() {
        super({red: "兵", black: "卒"});
    }
}
