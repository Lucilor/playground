import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlSegment} from "@angular/router";
import {MusicService} from "../services/music.service";

@Injectable({
  providedIn: "root"
})
export class LoginGuard {
  constructor(private music: MusicService, private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    await this.music.refreshLoginStatus();
    const user = this.music.user$.value;
    if (!user) {
      const urlTree = this.router.parseUrl(state.url);
      urlTree.root.children.primary.segments.splice(-1, 1, new UrlSegment("login", {}));
      return urlTree;
    }
    return true;
  }
}
