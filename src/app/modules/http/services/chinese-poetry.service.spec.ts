import {TestBed} from "@angular/core/testing";
import {MessageModule} from "../../message/message.module";
import {HttpModule} from "../http.module";

import {ChinesePoetryService} from "./chinese-poetry.service";

describe("ChinesePoetryService", () => {
    let service: ChinesePoetryService;

    beforeEach(() => {
        TestBed.configureTestingModule({imports: [HttpModule, MessageModule]});
        service = TestBed.inject(ChinesePoetryService);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });
});
