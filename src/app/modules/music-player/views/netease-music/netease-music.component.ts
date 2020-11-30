import {trigger, transition, style, animate} from "@angular/animations";
import {Component} from "@angular/core";
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {Subscribed} from "@src/app/mixins/Subscribed.mixin";
import {MusicService, User} from "../../services/music.service";

@Component({
    selector: "app-netease-music",
    templateUrl: "./netease-music.component.html",
    styleUrls: ["./netease-music.component.scss"],
    animations: [
        trigger("tab", [
            transition(":enter", [style({transform: "scale(0)", opacity: 0}), animate("0.3s", style({transform: "scale(1)", opacity: 1}))]),
            transition(":leave", [style({transform: "scale(1)", opacity: 0}), animate("0.3s", style({transform: "scale(0)", opacity: 1}))])
        ])
    ]
})
export class NeteaseMusicComponent extends Subscribed() {
    form: FormGroup;
    user: User | null = null;

    userValidator: ValidatorFn = (control: AbstractControl) => {
        const emailError = Validators.email(control);
        const phoneNumError = Validators.pattern(/^1[3-9]\d{9}$/)(control);
        return !emailError ? emailError : phoneNumError;
    };

    constructor(private formBuilder: FormBuilder, private music: MusicService) {
        super();
        console.log(this);
        this.form = this.formBuilder.group({
            user: ["", [Validators.required, this.userValidator]],
            password: ["", Validators.required]
        });
        this.music.userChange.subscribe((user) => {
            this.user = user;
        });
    }

    login() {
        const form = this.form;
        if (form.untouched) {
            form.markAllAsTouched();
        }
        if (form.valid) {
            const {user, password} = form.value;
            this.music.login(user, password, !Validators.email(form.get("user") as AbstractControl));
        }
    }

    logout() {
        this.music.logout();
    }
}
