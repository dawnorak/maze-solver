// Define constants for cell types
const CELL_EMPTY = 0;
const CELL_WALL = 1;
const CELL_START = 2;
const CELL_END = 3;

// Initialize grid dimensions and cell size (adjust as needed)
const numRows = 10;
const numCols = 10;
const cellSize = 40;

// Get the maze container element
const mazeContainer = document.getElementById('maze-container');

// Create a 2D array to represent the maze
const maze = [];

// Initialize the maze grid
for (let i = 0; i < numRows; i++) {
    maze[i] = [];
    for (let j = 0; j < numCols; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.style.width = cellSize + 'px';
        cell.style.height = cellSize + 'px';

        // Add event listeners to cells for user interaction
        cell.addEventListener('mousedown', () => toggleCell(cell, i, j));
        cell.addEventListener('mouseenter', () => handleCellHover(cell, i, j));

        maze[i][j] = CELL_EMPTY;
        mazeContainer.appendChild(cell);
    }
}

// Define variables for maze creation
let isDrawing = false;
let startSet = false;
let endSet = false;

// Function to toggle cell state (empty, wall, start, end)
function toggleCell(cell, row, col) {
    if (startSet && maze[row][col] === CELL_START) {
        startSet = false;
        cell.classList.remove('start');
        cell.style.backgroundColor = '#fff'; // Set it back to empty color
    } else if (endSet && maze[row][col] === CELL_END) {
        endSet = false;
        cell.classList.remove('end');
        cell.style.backgroundColor = '#fff'; // Set it back to empty color
    } else {
        maze[row][col] = (maze[row][col] + 1) % 4;
        switch (maze[row][col]) {
            case CELL_EMPTY:
                cell.style.backgroundColor = '#fff';
                break;
            case CELL_WALL:
                cell.style.backgroundColor = '#000';
                break;
            case CELL_START:
                if (!startSet) {
                    startSet = true;
                    cell.classList.add('start');
                    cell.style.backgroundColor = 'green'; // Set start cell color
                } else {
                    maze[row][col] = CELL_EMPTY;
                }
                break;
            case CELL_END:
                if (!endSet) {
                    endSet = true;
                    cell.classList.add('end');
                    cell.style.backgroundColor = 'red'; // Set end cell color
                } else {
                    maze[row][col] = CELL_EMPTY;
                }
                break;
        }
    }
}

// Function to handle cell hover (for drawing walls)
function handleCellHover(cell, row, col) {
    if (isDrawing) {
        toggleCell(cell, row, col);
    }
}

// Event listeners for drawing walls
document.addEventListener('mousedown', () => isDrawing = true);
document.addEventListener('mouseup', () => isDrawing = false);
mazeContainer.addEventListener('mouseleave', () => isDrawing = false);

// Event listener for solving the maze (implement this)
const solveButton = document.getElementById('solve-button');
solveButton.addEventListener('click', () => solveMaze());

// Function to implement maze-solving algorithm (you can add this part)
function solveMaze() {
    // Reset cell colors
    resetCellColors();

    // Define the directions for movement (up, right, down, left)
    const directions = [ [-1, 0], [0, 1], [1, 0], [0, -1] ];

    // Queue for BFS
    const queue = [];

    // Mark the start cell as visited
    const startCell = findStartCell();
    const endCell = findEndCell();

    if (!startCell || !endCell) {
        alert('Start and end points are not defined.');
        return;
    }

    const visited = new Array(numRows).fill(false).map(() => new Array(numCols).fill(false));
    visited[startCell[0]][startCell[1]] = true;

    // Create an animation queue
    const animationQueue = [];

    // Function to enqueue cell for animation
    function enqueueAnimation(row, col, delay) {
        animationQueue.push({ row, col, delay });
    }

    // BFS to find the path
    queue.push([startCell[0], startCell[1]]);
    while (queue.length > 0) {
        const [row, col] = queue.shift();

        // Check if we reached the end cell
        if (row === endCell[0] && col === endCell[1]) {
            // Reconstruct and animate the path
            let currentRow = row;
            let currentCol = col;
            while (currentRow !== startCell[0] || currentCol !== startCell[1]) {
                const [prevRow, prevCol] = visited[currentRow][currentCol];
                enqueueAnimation(currentRow, currentCol, animationQueue.length * 100);
                currentRow = prevRow;
                currentCol = prevCol;
            }
            break;
        }

        // Explore neighbors
        for (const [dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;

            if (isValidCell(newRow, newCol) && !visited[newRow][newCol] && maze[newRow][newCol] !== CELL_WALL) {
                visited[newRow][newCol] = [row, col]; // Store the parent cell
                queue.push([newRow, newCol]);
            }
        }
    }

    // Animate the path
    for (const { row, col, delay } of animationQueue) {
        setTimeout(() => {
            const cell = getCellElement(row, col);
            cell.style.backgroundColor = 'blue'; // Color to indicate path
        }, delay);
    }
}

// Function to reset cell colors
function resetCellColors() {
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            const cell = getCellElement(i, j);
            if (maze[i][j] === CELL_WALL) {
                cell.style.backgroundColor = '#000';
            } else if (maze[i][j] === CELL_START) {
                cell.style.backgroundColor = 'green';
            } else if (maze[i][j] === CELL_END) {
                cell.style.backgroundColor = 'red';
            } else {
                cell.style.backgroundColor = '#fff';
            }
        }
    }
}

// Function to find the start cell
function findStartCell() {
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            if (maze[i][j] === CELL_START) {
                return [i, j];
            }
        }
    }
    return null;
}

// Function to find the end cell
function findEndCell() {
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            if (maze[i][j] === CELL_END) {
                return [i, j];
            }
        }
    }
    return null;
}

// Function to check if a cell is valid
function isValidCell(row, col) {
    return row >= 0 && row < numRows && col >= 0 && col < numCols;
}

// Function to get cell element
function getCellElement(row, col) {
    return mazeContainer.children[row * numCols + col];
}

