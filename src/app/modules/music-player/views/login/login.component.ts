import {Component, OnInit} from "@angular/core";
import {AbstractControl, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {getFormControl, getFormGroup} from "@app/app.common";
import {MusicService} from "@modules/music-player/services/music.service";
import {SpinnerService} from "@modules/spinner/services/spinner.service";

interface LoginForm {
  user: string;
  password: string;
}

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  form = getFormGroup<LoginForm>({
    user: getFormControl("", {
      validators: [
        (control: AbstractControl) => {
          const emailError = Validators.email(control);
          const phoneNumError = Validators.pattern(/^1[3-9]\d{9}$/)(control);
          return !emailError ? emailError : phoneNumError;
        }
      ]
    }),
    password: getFormControl("")
  });

  constructor(private spinner: SpinnerService, private music: MusicService, private router: Router, private route: ActivatedRoute) {}

  async ngOnInit() {
    await this.music.refreshLoginStatus();
    this.goHome();
  }

  async submit() {
    const form = this.form;
    if (form.untouched) {
      form.markAllAsTouched();
    }
    const {user, password} = form.value;
    if (form.valid && user && password) {
      this.spinner.show(this.spinner.defaultLoaderId, {text: "正在登录..."});
      await this.music.login(user, password, !Validators.email(form.get("user") as AbstractControl));
      this.spinner.hide(this.spinner.defaultLoaderId);
      this.goHome();
    }
  }

  goHome() {
    if (this.music.user$.value) {
      this.router.navigate(["home"], {relativeTo: this.route.parent});
    }
  }
}
