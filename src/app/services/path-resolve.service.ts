import {Injectable} from "@angular/core";
import {Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from "@angular/router";
import {RouteInfo} from "@app/app-routing.module";
import {ObjectOf} from "@lucilor/utils";

@Injectable({
  providedIn: "root"
})
export class PathResolveService implements Resolve<RouteInfo | null> {
  constructor(private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const url = state.url.replace(/^\//, "");
    let index = -1;
    for (let i = 0; i < url.length; i++) {
      if (["#", "?"].includes(url[i])) {
        index = i;
        break;
      }
    }
    const typoPath = url.slice(0, index);
    const threshold = this.getThreshold(typoPath);
    const routesInfo = this.router.config as RouteInfo[];
    const routesInfo2 = routesInfo.filter((routeInfo) => Math.abs(routeInfo.path.length - typoPath.length) < threshold);

    if (!routesInfo2.length) {
      return null;
    }

    this.sortByDistances(typoPath, routesInfo2);

    return routesInfo2[0];
  }

  getThreshold(path: string): number {
    if (path.length < 5) {
      return 3;
    }
    return 5;
  }

  sortByDistances(typoPath: string, routesInfo2: RouteInfo[]) {
    const pathsDistance: ObjectOf<number> = {};

    routesInfo2.sort(({path: path1}, {path: path2}) => {
      if (!(path1 in pathsDistance)) {
        pathsDistance[path1] = this.levenshtein(path1, typoPath);
      }
      if (!(path2 in pathsDistance)) {
        pathsDistance[path2] = this.levenshtein(path2, typoPath);
      }

      return pathsDistance[path1] - pathsDistance[path2];
    });
  }

  levenshtein(a: string, b: string): number {
    if (a.length === 0) {
      return b.length;
    }
    if (b.length === 0) {
      return a.length;
    }

    const matrix = [];

    // increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    // increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }
}
