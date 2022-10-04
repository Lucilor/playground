import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {RouteInfo} from "@app/app-routing.module";
import {navigate} from "@app/app.common";
import {AppStatusService} from "@services/app-status.service";

@Component({
    selector: "app-page-not-found",
    templateUrl: "./page-not-found.component.html",
    styleUrls: ["./page-not-found.component.scss"]
})
export class PageNotFoundComponent implements OnInit, OnDestroy {
    routeInfo: RouteInfo | null;

    constructor(private route: ActivatedRoute, private router: Router, private status: AppStatusService) {
        this.routeInfo = this.route.snapshot.data.redirect;
    }

    ngOnInit() {
        this.status.setFixedBgUrl("");
    }

    ngOnDestroy() {
        this.status.setFixedBgUrl(null);
    }

    redirect() {
        if (this.routeInfo) {
            navigate(this.router, this.routeInfo);
        }
    }
}
