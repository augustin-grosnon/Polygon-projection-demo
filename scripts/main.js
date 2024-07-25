import { Polygon } from './Polygon.js';
import { Drawer } from './Drawer.js';

const drawer = new Drawer(
    document.getElementById('canvas'),
    new Polygon()
);
