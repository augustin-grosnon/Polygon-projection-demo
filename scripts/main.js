import { Polygon } from './Polygon.js';
import { Drawer } from './Drawer.js';

const canvas = document.getElementById('canvas');
const polygon = new Polygon();
const drawer = new Drawer(canvas, polygon);

canvas.addEventListener('mousedown', drawer.handleMouseDown.bind(drawer));
canvas.addEventListener('mousemove', drawer.handleMouseMove.bind(drawer));
canvas.addEventListener('mouseup', drawer.handleMouseUp.bind(drawer));

const toggleCloseButton = document.getElementById('toggleClose');
const toggleFillButton = document.getElementById('toggleFill');
const toggleConvexButton = document.getElementById('toggleConvex');
const togglePointLabelsButton = document.getElementById('togglePointLabels');
const resetButton = document.getElementById('reset');
const removeLastButton = document.getElementById('removeLast');
const undoButton = document.getElementById('undo');
const redoButton = document.getElementById('redo');
const saveButton = document.getElementById('save');
const loadButton = document.getElementById('load');
const svgExportButton = document.getElementById('svgExport');

toggleCloseButton.addEventListener('click', drawer.toggleShouldClosePath.bind(drawer));
toggleFillButton.addEventListener('click', drawer.toggleFill.bind(drawer));
toggleConvexButton.addEventListener('click', drawer.toggleConvexOnly.bind(drawer));
togglePointLabelsButton.addEventListener('click', drawer.togglePointLabels.bind(drawer));
resetButton.addEventListener('click', drawer.reset.bind(drawer));
removeLastButton.addEventListener('click', drawer.removeLastPoint.bind(drawer));
undoButton.addEventListener('click', drawer.undo.bind(drawer));
redoButton.addEventListener('click', drawer.redo.bind(drawer));
saveButton.addEventListener('click', drawer.save.bind(drawer));
loadButton.addEventListener('click', drawer.load.bind(drawer));
svgExportButton.addEventListener('click', drawer.exportToSvg.bind(drawer));
