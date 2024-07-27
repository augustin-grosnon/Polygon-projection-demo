import { Polygon } from './Polygon.js';

export class Drawer {
  constructor(canvas, polygon) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this
      .resetValues(polygon)
      .initDefaultToggles()
      .initColorPickers()
      .initButtons()
      .updateButtonStates()
      .initOffscreenCanvas();
  }

  initOffscreenCanvas() {
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = canvas.width;
    this.offscreenCanvas.height = canvas.height;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');

    this.gridSize = 20;
    this.drawGrid();
  }

  initDefaultToggles() {
    this.shouldClosePath = false;
    this.shouldFill = false;
    this.showPointLabels = false;
    this.dragBasePolygon = false;
    this.showGrid = false;

    return this;
  }

  initColorPickers() {
    document.getElementById('basePolygonColorPicker').addEventListener('change', (event) => {
      this.basePolygonColor = event.target.value;
      this.draw();
    });
    document.getElementById('dragPolygonColorPicker').addEventListener('change', (event) => {
      this.dragPolygonColor = event.target.value;
      this.draw();
    });
    document.getElementById('enclosingPolygonColorPicker').addEventListener('change', (event) => {
      this.enclosingPolygonColor = event.target.value;
      this.draw();
    });
    document.getElementById('vectorColorPicker').addEventListener('change', (event) => {
      this.vectorColor = event.target.value;
      this.draw();
    });

    return this;
  }

  initButtons() {
    const buttons = [
      'toggleClose', 'toggleFill', 'toggleConvex', 'togglePointLabels',
      'reset', 'removeLast', 'undo', 'redo', 'save', 'load',
      'svgExport', 'toggleDragBasePolygon', 'toggleGrid'
    ];

    const buttonActions = {
      'toggleClose': this.toggleShouldClosePath.bind(this),
      'toggleFill': this.toggleFill.bind(this),
      'toggleConvex': this.toggleConvexOnly.bind(this),
      'togglePointLabels': this.togglePointLabels.bind(this),
      'reset': this.reset.bind(this),
      'removeLast': this.removeLastPoint.bind(this),
      'undo': this.undo.bind(this),
      'redo': this.redo.bind(this),
      'save': this.save.bind(this),
      'load': this.load.bind(this),
      'svgExport': this.exportToSvg.bind(this),
      'toggleDragBasePolygon': this.toggleDragBasePolygon.bind(this),
      'toggleGrid': this.toggleGrid.bind(this)
    };

    buttons.forEach(id => {
      const button = document.getElementById(id);
      if (!button || !buttonActions[id])
        return;

      button.addEventListener('click', () => {
        buttonActions[id]();
        this.updateButtonStates();
      });
    });

    return this;
  }

  updateButtonStates() {
    document.getElementById('toggleClose').disabled = this.polygon.isClosed();
    document.getElementById('toggleConvex').disabled = this.polygon.isClosed();
    document.getElementById('removeLast').disabled = this.polygon.isClosed();
    document.getElementById('reset').disabled = this.polygon.isEmpty();
    document.getElementById('undo').disabled = !this.polygon.canUndo();
    document.getElementById('redo').disabled = !this.polygon.canRedo();
    document.getElementById('save').disabled = this.polygon.isEmpty();
    document.getElementById('svgExport').disabled = !this.polygon.isClosed();
    document.getElementById('toggleDragBasePolygon').disabled = !this.polygon.isClosed();

    return this;
  }

  resetValues(polygon) {
    this.polygon = polygon;
    this.isDragging = false;
    this.resetDragValues();

    this.basePolygonColor = '#000000';
    this.dragPolygonColor = '#0000FF';
    this.enclosingPolygonColor = '#FF0000';
    this.vectorColor = '#00FF00';

    return this;
  }

  resetDragValues() {
    this.dragStart = null;
    this.vectorStart = null;
    this.vectorEnd = null;
    this.vectorSave = null;
    this.dragPolygon = null;
    this.dragBaseRef = null;
    this.dragBaseCopy = null;
    this.currentMousePos = null;
    this.enclosingPolygon = null;

    return this;
  }

  snapToGrid(point) {
    if (!this.showGrid)
      return point;

    const snappedX = Math.round(point.x / this.gridSize) * this.gridSize;
    const snappedY = Math.round(point.y / this.gridSize) * this.gridSize;

    return { x: snappedX, y: snappedY };
  }

  handleMouseDown(e) {
    const { offsetX, offsetY } = e;
    const point = this.snapToGrid({ x: offsetX, y: offsetY });

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
    if (!polygon?.isClosed() || !polygon.contains(point) || this.isDragging || (this.dragBasePolygon && polygon === this.dragPolygon))
      return this;

    this.isDragging = true;
    this.dragStart = point;

    if (polygon === this.polygon && !this.dragBasePolygon) {
      this.vectorStart = point;
      this.vectorEnd = point;
    } else {
      this.vectorSave = this.dragBasePolygon ? this.vectorStart : this.vectorEnd;
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
    const point = this.snapToGrid({ x: offsetX, y: offsetY });

    this
      .updateMousePos(point)
      .updateDraggedPolygonPosition(point.x, point.y)
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

  // ! might split later for clarity
  updateDraggedPoints(x, y) {
    if (!this.isDragging ||
      !this.dragBaseCopy ||
      !this.dragStart)
      return this;

    const dx = x - this.dragStart.x;
    const dy = y - this.dragStart.y;
    const newPoints = this.dragBaseCopy.getTranslatedPoints(dx, dy);

    if (this.dragBasePolygon) {
      this.polygon.setPoints(newPoints);

      if (!this.vectorStart || !this.vectorSave)
        return this;

      this.vectorStart = {
        x: this.vectorSave.x + dx,
        y: this.vectorSave.y + dy
      };
    } else {
      this.dragPolygon.setPoints(newPoints);

      if (!this.vectorEnd || !this.dragBaseRef || !this.dragPolygon)
        return this;

      if (this.dragBaseRef === this.polygon) {
        this.vectorEnd = { x, y };
      } else if (this.dragBaseRef === this.dragPolygon && this.vectorSave) {
        this.vectorEnd = {
          x: this.vectorSave.x + dx,
          y: this.vectorSave.y + dy
        };
      }
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
      this.vectorSave = null;
    }
    this.draw();
  }

  drawPolygon(points, color = 'black', fillColor = null) {
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    points.forEach(point => this.ctx.lineTo(point.x, point.y));

    if (this.shouldClosePath)
      this.ctx.closePath();

    if (fillColor) {
      this.ctx.fillStyle = fillColor;
      this.ctx.fill();
    }

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    if (this.showPointLabels) {
      this.ctx.font = '12px Arial';
      this.ctx.fillStyle = color;
      points.forEach(point => {
        this.ctx.fillText(`(${Math.round(point.x)}, ${Math.round(point.y)})`, point.x + 5, point.y - 5);
      });
    }

    return this;
  }

  static hexToRgba(hex, opacity) {
    const val = parseInt(hex.slice(1), 16);
    const r = (val >> 16) & 255;
    const g = (val >> 8) & 255;
    const b = val & 255;
    return `rgba(${r},${g},${b},${opacity})`;
  }

  drawAllPolygons() {
    if (!this.polygon.isEmpty())
      this.drawPolygon(
        this.polygon.getPoints(),
        this.basePolygonColor,
        this.shouldFill ? Drawer.hexToRgba(this.basePolygonColor, 0.5) : null
      );
    if (this.dragPolygon)
      this.drawPolygon(
        this.dragPolygon.getPoints(),
        this.dragPolygonColor,
        this.shouldFill ? Drawer.hexToRgba(this.dragPolygonColor, 0.5) : null
      );
    if (this.enclosingPolygon)
      this.drawPolygon(
        this.enclosingPolygon.getPoints(),
        this.enclosingPolygonColor,
        this.shouldFill ? Drawer.hexToRgba(this.enclosingPolygonColor, 0.5) : null
      );

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
      return this;

    this.ctx.beginPath();
    this.ctx.moveTo(this.vectorStart.x, this.vectorStart.y);
    this.ctx.lineTo(this.vectorEnd.x, this.vectorEnd.y);
    this.ctx.strokeStyle = this.vectorColor;
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    return this;
  }

  drawGrid() {
    const { width, height } = this.offscreenCanvas;

    this.offscreenCtx.clearRect(0, 0, width, height);

    this.offscreenCtx.strokeStyle = '#e0e0e0';
    this.offscreenCtx.lineWidth = 0.5;

    this.offscreenCtx.beginPath();
    for (let x = 0; x <= width; x += this.gridSize) {
      this.offscreenCtx.moveTo(x, 0);
      this.offscreenCtx.lineTo(x, height);
    }
    this.offscreenCtx.stroke();

    this.offscreenCtx.beginPath();
    for (let y = 0; y <= height; y += this.gridSize) {
      this.offscreenCtx.moveTo(0, y);
      this.offscreenCtx.lineTo(width, y);
    }
    this.offscreenCtx.stroke();

    return this;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.showGrid)
      this.ctx.drawImage(this.offscreenCanvas, 0, 0);

    return this
      .drawAllPolygons()
      .drawLineFromLastPointToMouse()
      .drawVector()
      .updateButtonStates();
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

  toggleFill() {
    this.shouldFill = !this.shouldFill;
    this.draw();
  }

  togglePointLabels() {
    this.showPointLabels = !this.showPointLabels;
    this.draw();
  }

  toggleDragBasePolygon() {
    this.dragBasePolygon = !this.dragBasePolygon;
  }

  toggleGrid() {
    this.showGrid = !this.showGrid;
  }

  reset() {
    this
      .resetValues(new Polygon())
      .draw();
  }

  undo() {
    const closed = this.polygon.isClosed();

    this.polygon.undo();

    if (closed && !this.polygon.isClosed())
      this.resetDragValues();

    this.draw();
  }

  redo() {
    this.polygon.redo();

    this.draw();
  }

  save() {
    const filename = prompt('Enter filename');
    if (!filename)
      return;

    const state = {
      polygon: this.polygon.getPoints(),
      dragPolygon: this.dragPolygon ? this.dragPolygon.getPoints() : null,
      enclosingPolygon: this.enclosingPolygon ? this.enclosingPolygon.getPoints() : null,
      vectorStart: this.vectorStart,
      vectorEnd: this.vectorEnd,
      shouldClosePath: this.shouldClosePath,
      shouldFill: this.shouldFill,
      convexOnly: this.polygon.convexOnly,
      showPointLabels: this.showPointLabels,
      basePolygonColor: this.basePolygonColor,
      dragPolygonColor: this.dragPolygonColor,
      enclosingPolygonColor: this.enclosingPolygonColor,
      vectorColor: this.vectorColor,
      dragBasePolygon: this.dragBasePolygon,
      showGrid: this.showGrid,
    };
    const data = btoa(JSON.stringify(state));
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.sav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  load() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.sav';
    document.body.appendChild(input);

    input.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();

        reader.onload = (event) => {
          const data = atob(event.target.result);
          const state = JSON.parse(data);
          this.polygon = new Polygon(state.polygon);
          this.polygon.convexOnly = state.convexOnly;
          this.dragPolygon = state.dragPolygon ? new Polygon(state.dragPolygon) : null;
          this.enclosingPolygon = state.enclosingPolygon ? new Polygon(state.enclosingPolygon) : null;
          this.vectorStart = state.vectorStart;
          this.vectorEnd = state.vectorEnd;
          this.shouldClosePath = state.shouldClosePath;
          this.shouldFill = state.shouldFill;
          this.showPointLabels = state.showPointLabels;
          this.dragBasePolygon = state.dragBasePolygon;
          this.basePolygonColor = state.basePolygonColor || '#000000';
          this.dragPolygonColor = state.dragPolygonColor || '#0000FF';
          this.enclosingPolygonColor = state.enclosingPolygonColor || '#FF0000';
          this.vectorColor = state.vectorColor || '#00FF00';
          this.showGrid = state.showGrid;

          this
            .draw()
            .updateButtonStates();
        };

        reader.readAsText(file);
      }
      document.body.removeChild(input);
    });

    input.click();
  }

  exportToSvg() {
    if (!this.polygon.isClosed()) {
      alert('The base polygon must be closed to export as SVG.');
      return;
    }

    const createSvgPolygon = (points, fillColor, strokeColor) => {
      const pointsAttr = points.map(point => `${point.x},${point.y}`).join(' ');
      return `<polygon points="${pointsAttr}" fill="${fillColor || 'none'}" stroke="${strokeColor || 'black'}" stroke-width="2"/>`;
    };

    let svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${this.canvas.width}" height="${this.canvas.height}">
        ${!this.polygon.isEmpty() ? createSvgPolygon(this.polygon.getPoints(), this.shouldFill ? Drawer.hexToRgba(this.basePolygonColor, 0.5) : null, this.basePolygonColor) : ''}
        ${this.dragPolygon ? createSvgPolygon(this.dragPolygon.getPoints(), this.shouldFill ? Drawer.hexToRgba(this.dragPolygonColor, 0.5) : null, this.dragPolygonColor) : ''}
        ${this.enclosingPolygon ? createSvgPolygon(this.enclosingPolygon.getPoints(), this.shouldFill ? Drawer.hexToRgba(this.enclosingPolygonColor, 0.5) : null, this.enclosingPolygonColor) : ''}
      </svg>
    `;

    const filename = prompt('Enter filename for SVG');
    if (!filename)
      return;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
