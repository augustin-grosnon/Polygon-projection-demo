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
        canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
    }

    handleMouseDown(e) {
        if (this.polygon.isClosed())
            return;

        const { offsetX, offsetY } = e;
        this.isDrawing = this.polygon
                            .addPoint({ x: offsetX, y: offsetY }) // ! this syntax might be bad, to check later
                            .isClosed();

        this.draw();
    }

    handleMouseMove(e) {
        // TODO: handle separate mouse movement logic in separate functions
        // * -> drawing = display line
        // * -> dragging = full dragging logic and update

        if (this.isDrawing || this.isDragging) {
            const { offsetX, offsetY } = e;

            if (this.isDragging) {
                const dx = offsetX - this.dragStart.x;
                const dy = offsetY - this.dragStart.y;
                this.dragPolygon = new Polygon(this.polygon.getTranslatedPoints(dx, dy));
            }

            this.draw();
        }
    }

    handleMouseUp(e) {
        if (this.isDragging) {
            const dx = e.offsetX - this.dragStart.x;
            const dy = e.offsetY - this.dragStart.y;
            this.polygon.translate(dx, dy);
            this.isDragging = false;
            this.dragPolygon = null;

            // TODO: draw full polygon based on the base and dragged one
            // ? add method / constructor to polygon class to create based on two polygons?
            // ? add method / constructor to polygon class to only keep the outline of the points? (find adapted algorithm)
            // TODO: save full polygon in the Drawer class
        }
        this.draw();
    }

    handleDoubleClick(e) {
        // ? use normal click instead, and only after the polygon is complete?

        const { offsetX, offsetY } = e;

        if (this.polygon.contains({ x: offsetX, y: offsetY })) {
            this.isDragging = true;
            this.dragStart = { x: offsetX, y: offsetY };
            this.dragPolygon = [...this.polygon.getPoints()];
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

        // TODO: if a line is currently being added, display it (line from the last point to the mouse)

        if (!this.polygon.isDefault())
            this.drawPolygon(this.polygon.getPoints());

        if (this.isDragging && this.dragPolygon) // TODO: draw even after dragging is done (do not remove)
            this.drawPolygon(this.dragPolygon, 'red'); // TODO: use another color (blue?) or line kind (if possible) -> keep red for the enclosing polygon

        // TODO: draw enclosing polygon possible
    }
}
