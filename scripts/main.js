import { Polygon } from './Polygon.js';
import { Drawer } from './Drawer.js';

const canvas = document.getElementById('canvas');
const polygon = new Polygon();
const drawer = new Drawer(canvas, polygon);

canvas.addEventListener('mousedown', drawer.handleMouseDown.bind(drawer));
canvas.addEventListener('mousemove', drawer.handleMouseMove.bind(drawer));
canvas.addEventListener('mouseup', drawer.handleMouseUp.bind(drawer));
