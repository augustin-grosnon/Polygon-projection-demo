export class Polygon {
  constructor(points = []) {
    this.points = points;
    this.updateState();

    this.convexOnly = true;
  }

  updateState() {
    const points = this.points;

    if (points.length >= 3 && this.arePointsEqual(points[0], points[points.length - 1]))
      this.state = 'closed';
    else if (points.length >= 2)
      this.state = 'started';
    else if (points.length == 1)
      this.state = 'point';
    else
      this.state = 'empty';

    return this;
  }

  arePointsEqual(point1, point2) {
    return point1.x === point2.x && point1.y === point2.y;
  }

  addPoint(point) {
    if (this.isClosed())
      return this;
    if (this.isClosingPoint(point))
      return this.close();
    if (!this.isConvexAfterAdding(point))
      return this;

    this.points.push(point);
    return this.updateState();
  }

  isConvexAfterAdding(point) {
    if (!this.isStarted() || !this.convexOnly)
      return true;

    const newPoints = [...this.points, point];
    const n = newPoints.length;
    let isPositive = null;

    for (let i = 0; i < n; ++i) {
      const p0 = newPoints[i];
      const p1 = newPoints[(i + 1) % n];
      const p2 = newPoints[(i + 2) % n];

      const isCurrentPositive = Polygon.crossProduct(p0, p1, p2) > 0;
      if (isPositive === null)
        isPositive = isCurrentPositive;
      else if (isCurrentPositive !== isPositive)
        return false;
    }

    return true;
  }

  static crossProduct(p0, p1, p2) {
    const dx1 = p1.x - p0.x;
    const dy1 = p1.y - p0.y;
    const dx2 = p2.x - p1.x;
    const dy2 = p2.y - p1.y;
    return dx1 * dy2 - dy1 * dx2;
  }

  close() {
    if (this.isClosed())
      return this;

    this.points.push(this.points[0]);
    return this.updateState();
  }

  translate(dx, dy) {
    this.points = this.getTranslatedPoints(dx, dy)

    return this;
  }

  getTranslatedPoints(dx, dy) {
    return this.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
  }

  setPoints(points) {
    this.points = points;
    return this;
  }

  contains(point) {
    const { x: px, y: py } = point;
    let isInside = false;

    const numPoints = this.points.length;
    for (let i = 0; i < numPoints; ++i) {
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
    if (!this.isStarted())
      return false;

    const firstPoint = this.points[0];
    const distance = Math.sqrt(
      Math.pow(firstPoint.x - point.x, 2) + Math.pow(firstPoint.y - point.y, 2)
    );
    return distance < threshold;
  }

  isEmpty() {
    return this.state === 'empty';
  }

  isPoint() {
    return this.state === 'point'
  }

  isStarted() {
    return this.state === 'started';
  }

  isClosed() {
    return this.state === 'closed';
  }

  getLastPoint() {
    return this.points.length ? this.points[this.points.length - 1] : null;
  }

  removeLastPoint() {
    if (this.points.length && !this.isClosed()) {
      this.points.pop();
      this.updateState();
    }
  }

  static convexHull(points) {
    if (points.length < 3)
      return points;

    points.sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);

    const buildHull = (points) => {
      const hull = [];
      for (let p of points) {
        while (hull.length >= 2 && Polygon.crossProduct(hull[hull.length - 2], hull[hull.length - 1], p) <= 0)
          hull.pop();
        hull.push(p);
      }
      if (this.convexOnly)
        hull.pop()
      return hull;
    };

    return buildHull(points).concat(buildHull(points.slice().reverse()));
  }
}
