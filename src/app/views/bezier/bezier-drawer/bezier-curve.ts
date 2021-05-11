import {Point} from "@lucilor/utils";

export class BezierCurve {
    ctrlPoints: Point[];

    constructor(ctrlPoints: Point[] = []) {
        this.ctrlPoints = ctrlPoints;
    }

    static calcCtrlPoints(points: Point[]) {
        const distance = (x1: number, y1: number, x2: number, y2: number) => new Point(x1, y1).distanceTo(new Point(x2, y2));
        const result: Point[] = [];
        const length = points.length;
        for (let i = 0; i < length; i++) {
            const next = (i + 1) % length;
            const nextnext = (i + 2) % length;
            const x1 = points[i].x;
            const y1 = points[i].y;
            const x2 = points[next].x;
            const y2 = points[next].y;
            const x3 = points[nextnext].x;
            const y3 = points[nextnext].y;
            const x4 = (x2 + x1) / 2;
            const y4 = (y2 + y1) / 2;
            const x5 = (x3 + x2) / 2;
            const y5 = (y3 + y2) / 2;
            const l1 = distance(x1, y1, x2, y2);
            const l2 = distance(x2, y2, x3, y3);
            const l3 = distance(x4, y4, x5, y5);
            const k = l1 / l2;
            const l4 = (l3 * k) / (k + 1);
            const a = Math.atan((y5 - y4) / (x5 - x4));
            let x6 = x4 + l4 / Math.cos(a);
            let y6 = y4 + l4 / Math.sin(a);
            for (let j = 0; j < x5; j += 0.1) {
                const x = x4 + j;
                const y = ((y5 - y4) * x - x4 * y5 + x5 * y4) / (x5 - x4);
                if (Math.abs(distance(x, y, x4, y4) - l4) < 0.1) {
                    x6 = x;
                    y6 = y;
                    break;
                }
            }
            const offsetX = x6 - x2;
            const offsetY = y6 - y2;
            const cp1 = new Point(x4 - offsetX, y4 - offsetY);
            const cp2 = new Point(x5 - offsetX, y5 - offsetY);
            result.push(cp1);
            result.push(cp2);
        }
        return result;
    }

    // De Casteljau's algorithm
    // the core of bezier curve
    deCasteljau(t: number) {
        let currPoints = this.ctrlPoints;
        let nextPoints: Point[];
        const result: Point[][] = [currPoints];
        while (true) {
            nextPoints = [];
            for (let i = 0; i < currPoints.length - 1; i++) {
                const p1 = currPoints[i];
                const p2 = currPoints[i + 1];
                const x = p1.x + (p2.x - p1.x) * t;
                const y = p1.y + (p2.y - p1.y) * t;
                nextPoints.push(new Point(x, y));
            }
            if (nextPoints.length < 1) {
                break;
            }
            result.push(nextPoints);
            currPoints = nextPoints;
        }
        return result;
    }

    getPoint(t: number) {
        return this.deCasteljau(t).pop()?.[0];
    }

    getPoints(segments: number) {
        if (this.ctrlPoints.length < 2) {
            return [];
        }
        let t = 0;
        const step = 1 / segments;
        const points = [this.getPoint(t)];
        while (t < 1) {
            t = Math.min(1, t + step);
            points.push(this.getPoint(t));
        }
        return points.filter((v) => v) as Point[];
    }
}
