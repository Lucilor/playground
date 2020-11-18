import {TestBed} from "@angular/core/testing";
import {MessageModule} from "../../message/message.module";
import {HttpModule} from "../http.module";
import {NeteaseMusicService} from "./netease-music.service";

describe("NeteaseMusicService", () => {
    let service: NeteaseMusicService;

    beforeEach(() => {
        TestBed.configureTestingModule({imports: [HttpModule, MessageModule]});
        service = TestBed.inject(NeteaseMusicService);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });
});
