import { Polygon } from './Polygon.js';

export class Drawer {
  constructor(canvas, polygon) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resetValues(polygon);

    this.shouldClosePath = false;
  }

  resetValues(polygon) {
    this.polygon = polygon;
    this.isDragging = false;
    this.resetDragValues();
  }

  resetDragValues() {
    this.dragStart = null;
    this.vectorStart = null;
    this.vectorEnd = null;
    this.vectorEndSave = null;
    this.dragPolygon = null;
    this.dragBaseRef = null;
    this.dragBaseCopy = null;
    this.currentMousePos = null;
    this.enclosingPolygon = null;
  }

  handleMouseDown(e) {
    const { offsetX, offsetY } = e;
    const point = { x: offsetX, y: offsetY };

    this
      .handlePointPlacement(point)
      .handleVectorStart(point, this.dragPolygon)
      .handleVectorStart(point, this.polygon)
      .updateEnclosingPolygon()
      .draw();
  }

  handlePointPlacement(point) {
    if (this.polygon.isClosed())
      return this;

    this.polygon.addPoint(point);

    return this;
  }

  handleVectorStart(point, polygon) {
    if (!polygon?.isClosed() || !polygon.contains(point) || this.isDragging)
      return this;

    this.isDragging = true;
    this.dragStart = point;
    if (polygon === this.polygon) {
      this.vectorStart = point;
      this.vectorEnd = point;
    } else {
      this.vectorEndSave = this.vectorEnd;
    }
    if (!this.dragPolygon)
      this.dragPolygon = new Polygon([...polygon.getPoints()]);
    this.dragBaseRef = polygon;
    this.dragBaseCopy = new Polygon([...polygon.getPoints()]);

    this.updateDraggedPoints(point.x, point.y);

    return this;
  }

  handleMouseMove(e) {
    const { offsetX, offsetY } = e;

    this
      .updateMousePos({ x: offsetX, y: offsetY })
      .updateDraggedPolygonPosition(offsetX, offsetY)
      .draw();
  }

  updateMousePos(point) {
    this.currentMousePos = point;

    return this;
  }

  updateDraggedPolygonPosition(x, y) {
    if (this.isDragging) {
      this
        .updateDraggedPoints(x, y)
        .updateEnclosingPolygon()
    }

    return this;
  }

  updateDraggedPoints(x, y) {
    if (!this.isDragging ||
      !this.dragPolygon ||
      !this.dragBaseRef ||
      !this.dragBaseCopy ||
      !this.dragStart ||
      !this.vectorEnd)
      return this;

    const dx = x - this.dragStart.x;
    const dy = y - this.dragStart.y;
    this.dragPolygon.setPoints(this.dragBaseCopy.getTranslatedPoints(dx, dy)) // ! we set the points again each time, there must be a way to avoid this (using translate and some saved values for example)

    if (this.dragBaseRef === this.polygon) {
      this.vectorEnd = { x, y };
    } else if (this.dragBaseRef === this.dragPolygon && this.vectorEndSave) {
      this.vectorEnd = {
        x: this.vectorEndSave.x + dx,
        y: this.vectorEndSave.y + dy
      };
    }

    return this;
  }

  updateEnclosingPolygon() {
    if (this.polygon.isClosed() && this.dragPolygon?.isClosed())
      this.enclosingPolygon = new Polygon(Polygon.convexHull([...this.polygon.getPoints(), ...this.dragPolygon.getPoints()]));

    return this;
  }

  handleMouseUp(_) {
    if (this.isDragging) {
      this.isDragging = false;
      this.dragBaseRef = null;
      this.dragBaseCopy = null;
      this.vectorEndSave = null;
    }
    this.draw();
  }

  drawPolygon(points, color = 'black') {
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    points.forEach(point => this.ctx.lineTo(point.x, point.y));

    if (this.shouldClosePath)
      this.ctx.closePath();

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  drawAllPolygons() {
    if (!this.polygon.isEmpty())
      this.drawPolygon(this.polygon.getPoints());
    if (this.dragPolygon)
      this.drawPolygon(this.dragPolygon.getPoints(), 'blue');
    if (this.enclosingPolygon)
      this.drawPolygon(this.enclosingPolygon.getPoints(), 'red');

    return this;
  }

  drawLineFromLastPointToMouse() {
    if (this.polygon.isEmpty() || this.polygon.isClosed() || !this.currentMousePos)
      return this;

    const lastPoint = this.polygon.getLastPoint();
    if (!lastPoint)
      return this;

    this.ctx.beginPath();
    this.ctx.moveTo(lastPoint.x, lastPoint.y);
    this.ctx.lineTo(this.currentMousePos.x, this.currentMousePos.y);
    this.ctx.strokeStyle = this.polygon.isConvexAfterAdding({ x: this.currentMousePos.x, y: this.currentMousePos.y }) ? 'gray' : 'red';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    return this
  }

  drawVector() {
    if (!this.vectorStart || !this.vectorEnd)
      return;

    this.ctx.beginPath();
    this.ctx.moveTo(this.vectorStart.x, this.vectorStart.y);
    this.ctx.lineTo(this.vectorEnd.x, this.vectorEnd.y);
    this.ctx.strokeStyle = 'green';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this
      .drawAllPolygons()
      .drawLineFromLastPointToMouse()
      .drawVector();
  }

  removeLastPoint() {
    this.polygon.removeLastPoint();
    this.draw();
  }

  toggleConvexOnly() {
    this.polygon.convexOnly = !this.polygon.convexOnly;
  }

  toggleShouldClosePath() {
    this.shouldClosePath = !this.shouldClosePath;
    this.draw();
  }

  reset() {
    this.resetValues(new Polygon());
    this.draw();
  }

  undo() {
    const closed = this.polygon.isClosed();

    this.polygon.undo();

    if (closed && !this.polygon.isClosed())
      this.resetDragValues();
  }

  redo() {
    this.polygon.redo();
  }
}
