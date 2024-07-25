import { Polygon } from './Polygon.js';

export class Drawer {
    constructor(canvas, polygon) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.polygon = polygon;
        this.isDrawing = true;
        this.isDragging = false;
        this.dragStart = null;
        this.dragPolygon = null;
        this.dragBase = null;
        this.currentMousePos = null;

        canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    handleMouseDown(e) {
        const { offsetX, offsetY } = e;
        const point = { x: offsetX, y: offsetY };

        this
          .handlePointPlacement(point)
          .handleVectorStart(point, this.dragPolygon)
          .handleVectorStart(point, this.polygon)
          .draw();
    }

    handlePointPlacement(point) {
        if (this.polygon.isClosed())
            return this;

        this.isDrawing = this.polygon
                           .addPoint(point)
                           .isClosed();

        return this;
    }

    handleVectorStart(point, polygon) {
        if (!polygon?.isClosed() || !polygon.contains(point) || this.isDragging)
            return this;

        this.isDragging = true;
        this.dragStart = point;
        this.dragPolygon = new Polygon([...polygon.getPoints()]);
        this.dragBase = polygon;

        return this;
    }

    handleMouseMove(e) {
        // TODO: handle separate mouse movement logic in separate functions
        // * -> drawing = display line
        // * -> dragging = full dragging logic and update

        const { offsetX, offsetY } = e;
        this.currentMousePos = { x: offsetX, y: offsetY };

        if (this.isDrawing)
            console.log('placeholder for the line placing');

        if (this.isDragging) {
            if (this.isDragging && this.dragPolygon && this.dragBase) {
                const dx = offsetX - this.dragStart.x;
                const dy = offsetY - this.dragStart.y;
                this.dragPolygon.setPoints(this.dragBase.getTranslatedPoints(dx, dy))
            }

            // TODO: add full polygon based on the base and dragged one
            // ? add method / constructor to polygon class to create based on two polygons?
            // ? add method / constructor to polygon class to only keep the outline of the points? (find adapted algorithm)
            // TODO: save full polygon in the Drawer class
        }

        this.draw();
    }

    handleMouseUp(_) {
        if (this.isDragging) {
            this.isDragging = false;
            this.dragBase = null;
        }
        this.draw();
    }

    drawPolygon(points, color = 'black') {
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        points.forEach(point => this.ctx.lineTo(point.x, point.y));
        this.ctx.closePath();

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.polygon.isEmpty())
            this.drawPolygon(this.polygon.getPoints());

        if (this.dragPolygon)
            this.drawPolygon(this.dragPolygon.getPoints(), 'blue');

        if (!this.polygon.isEmpty() && !this.polygon.isClosed() && this.currentMousePos)
            this.drawLineFromLastPointToMouse();

        // TODO: draw enclosing polygon (red)
    }

    drawLineFromLastPointToMouse() {
        const lastPoint = this.polygon.getLastPoint();
        if (!lastPoint || !this.currentMousePos)
            return;

        this.ctx.beginPath();
        this.ctx.moveTo(lastPoint.x, lastPoint.y);
        this.ctx.lineTo(this.currentMousePos.x, this.currentMousePos.y);
        this.ctx.strokeStyle = this.polygon.isConvexAfterAdding({ x: this.currentMousePos.x, y: this.currentMousePos.y }) ? 'gray' : 'red';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
}
