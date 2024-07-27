# Polygon projection demo

This project is an interactive tool for visualizing the projection of a convex polygon and it's enclosing polygon using a translation vector. The user can define a convex polygon, move it around using the mouse, and observe the results in real-time. Several other features are available.

## Features

- **Draw convex polygon**: Interactively create a convex polygon by clicking on the canvas to set points.
- **Translate polygon**: Move the polygon around by dragging it.
- **Real-time updates**: The canvas automatically updates to show the current state of the polygon and its projection.
- **Auto shape close**: Toggle visual auto-closing of the polygon shape to have a visual clue of how the shape would look like when closed. (*off* by default)
- **Filled polygon**: Toggle filled version for the polygons.
- **Convex only mode**: Toggle whether the polygon should be convex-only. When enabled, the polygon must remain convex as you add points. Disabling it after drawing a non convex shape might lead to some issues. (*on* by default)
- **Point labels**: Toggle wether the coordinates of each points are displayed or not.
- **Reset**: Start over by clearing the current polygon and starting with a fresh canvas.
- **Remove last point**: Remove the most recently added point from the polygon. Disabled when the polygon is closed.
- **Undo**: Undo an action.
- **Redo**: Redo an action removed by the `undo` button.
- **Save**: Save the current state in a `.sav` file.
- **Load**: Load a `.sav` file save.
- **Export to svg**: Export the canvas to a `.svg` file.
- **Select colors**: Select colors for each polygon and the vector.
- **Drag base polygon**: Toggle to drag the base polygon instead of the copy.
- **Draw grid**: Display a background grid.

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
   - Use the "Auto shape close" button to enable or disable visual automatic closing of the polygon.

4. **Fill mode**
   - Use the "Fill shape" button to fill the polygons.

5. **Convex only mode**
   - Use the "Convex only" button to switch between convex-only mode and normal mode. In convex-only mode, the polygon must remain convex as you add points.

6. **Show point labels**
   - Use the "Point labels" button to display or not the coordinates of each point.

7. **Resetting**
   - Click the "Reset" button to clear the current polygon and start with a fresh canvas.

8. **Removing the last point**
   - Click the "Remove last point" button to remove the most recently added point from the polygon.

9. **Undo an action**
   - Undo any action from the draw phase by clicking the "Undo" button. You can also use it to remove the last closing point.

10. **Redo an action**
   - Redo any action removed by the "Undo" button by clicking on the "Redo" button.

11. **Save to a file**
   - Save the current canvas and some parameters to a `.sav` file by clicking on the "Save" button and entering the name.

12. **Load from a file**
   - Load a save onto the canvas by clicking on the "Load" button and selecting the save file using a file explorer.

13. **Export to svg**
   - Export the canvas to a `.svg` file by clicking on the "Export to svg" button and entering a name. It will only work with at least a completed base polygon.

14. **Select colors**
   - Use the pickers at the bottom of the canvas to select the appropriate color for each polygon and the vector.

15. **Drag base polygon**
   - Click on the "Drag base polygon" button to drag the base polygon instead of the copy. It will save the current vector.

16. **Draw grid**
   - Click on the "Grid" button to display a background grid. While the grid is displayed, any point placed or movement will be set to the closest grid point.
