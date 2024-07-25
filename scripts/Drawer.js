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

        canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    handleMouseDown(e) {
        const { offsetX, offsetY } = e;
        const point = { x: offsetX, y: offsetY };

        this
          .handlePointPlacement(point)
          .handleVectorStart(point)
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

    handleVectorStart(point) {
        if (!this.polygon.isClosed())
            return this;
        if (!this.polygon.contains(point))
            return this;

        this.isDragging = true;
        this.dragStart = point;
        this.dragPolygon = new Polygon([...this.polygon.getPoints()]);

        return this;
    }

    handleMouseMove(e) {
        // TODO: handle separate mouse movement logic in separate functions
        // * -> drawing = display line
        // * -> dragging = full dragging logic and update

        if (this.isDrawing)
            console.log("placeholder for the line placing");

        if (this.isDragging) {
            const { offsetX, offsetY } = e;

            if (this.isDragging && this.dragPolygon) {
                const dx = offsetX - this.dragStart.x;
                const dy = offsetY - this.dragStart.y;
                this.dragPolygon.setPoints(this.polygon.getTranslatedPoints(dx, dy))
            }

            // TODO: add full polygon based on the base and dragged one
            // ? add method / constructor to polygon class to create based on two polygons?
            // ? add method / constructor to polygon class to only keep the outline of the points? (find adapted algorithm)
            // TODO: save full polygon in the Drawer class
        }

        this.draw();
    }

    handleMouseUp(_) {
        if (this.isDragging)
            this.isDragging = false;
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

        // TODO: if a line is currently being added, display it (line from the last point to the mouse)

        if (!this.polygon.isDefault())
            this.drawPolygon(this.polygon.getPoints());

        if (this.dragPolygon)
            this.drawPolygon(this.dragPolygon.getPoints(), 'blue');

        // TODO: draw enclosing polygon (red)
    }
}
