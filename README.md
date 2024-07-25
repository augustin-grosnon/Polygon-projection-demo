# Polygon projection demo

This project is an interactive tool for visualizing the projection of a convex polygon and it's enclosing polygon using a translation vector. The user can define a convex polygon, move it around using the mouse, and observe the results in real-time. Several other features are available.

## Features

- **Draw convex polygon**: Interactively create a convex polygon by clicking on the canvas to set points.
- **Translate polygon**: Move the polygon around by dragging it.
- **Real-time updates**: The canvas automatically updates to show the current state of the polygon and its projection.
- **Auto shape close**: Toggle visual auto-closing of the polygon shape to have a visual clue of how the shape would look like when closed. (*off* by default)
- **Convex only mode**: Toggle whether the polygon should be convex-only. When enabled, the polygon must remain convex as you add points. Disabling it after drawing a non convex shape might lead to some issues. (*on* by default)
- **Reset**: Start over by clearing the current polygon and starting with a fresh canvas.
- **Remove last point**: Remove the most recently added point from the polygon. Disabled when the polygon is closed.

## Technologies

- **HTML5**: For the structure of the canvas.
- **CSS**: Basic styling for the canvas.
- **JavaScript**: To handle the logic for drawing and interacting with the polygon using the Canvas API.

## Project structure

- `index.html`: The main HTML file that includes the canvas and links to JavaScript files.
- `styles/`: Directory containing CSS files.
- `scripts/`: Directory containing JavaScript files:
  - `Polygon.js`: Defines the `Polygon` class with methods to manage polygon points and transformations.
  - `Drawer.js`: Defines the `Drawer` class for handling user interactions and drawing the polygon on the canvas.
  - `main.js`: Initializes the Drawer, the base Polygon and the listeners.

## Setup and running the project

1. **Clone the repository**

   ```bash
   git clone https://github.com/augustin-grosnon/Polygon-projection-demo.git
   cd Polygon-projection-demo
   ```

2. **Run the project**

   To run the project, you will need to upload the code using a local server. Here’s how you can do it using Python:

   - **Python 3**

     ```bash
     python -m http.server
     ```

   Navigate to `http://localhost:8000` in your web browser to see the project in action.

## Usage

1. **Drawing the polygon**
   - Click on the canvas to add points and create a convex polygon. The polygon will automatically close when you click near the starting point.

2. **Moving the polygon**
   - Click inside a closed polygon to start dragging. Move the mouse to translate a copy of the polygon around the canvas. Release the mouse button to drop the new polygon to it's new location. (WIP)

3. **Auto shape close**
   - Use the "Toggle auto shape close" button to enable or disable visual automatic closing of the polygon.

4. **Convex only mode**
   - Use the "Toggle convex only" button to switch between convex-only mode and normal mode. In convex-only mode, the polygon must remain convex as you add points.

5. **Resetting**
   - Click the "Reset" button to clear the current polygon and start with a fresh canvas.

6. **Removing the last point**
   - Click the "Remove last point" button to remove the most recently added point from the polygon.
