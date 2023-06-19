import {TestBed} from "@angular/core/testing";
import {HttpModule} from "@modules/http/http.module";
import {MessageModule} from "@modules/message/message.module";
import {DddjService} from "./dddj.service";

describe("DddjService", () => {
  let service: DddjService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpModule, MessageModule]});
    service = TestBed.inject(DddjService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
