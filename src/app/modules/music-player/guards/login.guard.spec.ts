import {TestBed} from "@angular/core/testing";
import {HttpModule} from "@modules/http/http.module";
import {MessageModule} from "@modules/message/message.module";
import {LoginGuard} from "./login.guard";

describe("LoginGuard", () => {
  let guard: LoginGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpModule, MessageModule]});
    guard = TestBed.inject(LoginGuard);
  });

  it("should be created", () => {
    expect(guard).toBeTruthy();
  });
});
