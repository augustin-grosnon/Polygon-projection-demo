export class Polygon {
    constructor(points = []) {
        this.points = points;
    }

    addPoint(point) {
        console.log('added a point:', point);
        this.points.push(point);

        // TODO: update to force convex polygon
        // ? if non convex point, move the last one? find another way?
    }

    closePolygon() {
        console.log('closed the polygon');
        this.points.push(this.points[0]);
    }

    translate(dx, dy) {
        console.log('translate', dx, dy);
        this.points = this.getTranslatedPoints(dx, dy)
    }

    getTranslatedPoints(dx, dy) {
        return this.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
    }

    contains(point) {
        console.log('check contained point:', point);

        const { x: px, y: py } = point;
        let isInside = false;

        const numPoints = this.points.length;
        for (let i = 0; i < numPoints; i++) {
            const { x: x1, y: y1 } = this.points[i];
            const { x: x2, y: y2 } = this.points[(i + 1) % numPoints];

            const intersect = ((y1 > py) !== (y2 > py)) && (px < ((x2 - x1) * (py - y1) / (y2 - y1)) + x1);
            if (intersect)
                isInside = !isInside;
        }

        return isInside;
    }

    getPoints() {
        return this.points;
    }

    isClosingPoint(point, threshold = 5) {
        console.log('check if point is closing the polygon:', point);

        if (this.points.length <= 2)
            return false;

        const firstPoint = this.points[0];
        const distance = Math.sqrt(
            Math.pow(firstPoint.x - point.x, 2) + Math.pow(firstPoint.y - point.y, 2)
        );
        return distance < threshold;
    }

    // TODO: add method to check if the polygon is closed
    // * hold variable in the class
    // ? can we add points in a closed polygon? probably not
}
