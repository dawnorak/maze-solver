const CELL_EMPTY = 0;
const CELL_WALL = 1;
const CELL_START = 2;
const CELL_END = 3;

// Initialize grid dimensions and cell size
const numRows = 10;
const numCols = 10;
const cellSize = 40;

const mazeContainer = document.getElementById('maze-container');

// Create a 2D array to represent the maze
const maze = [];

// Initialize maze grid
for (let i = 0; i < numRows; i++) {
    maze[i] = [];
    for (let j = 0; j < numCols; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.style.width = cellSize + 'px';
        cell.style.height = cellSize + 'px';

        maze[i][j] = CELL_EMPTY;
        mazeContainer.appendChild(cell);
    }
}

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

function handleCellHover(cell, row, col) {
    if (isDrawing) {
        toggleCell(cell, row, col);
    }
}

document.addEventListener('mousedown', () => isDrawing = true);
document.addEventListener('mouseup', () => isDrawing = false);
mazeContainer.addEventListener('mouseleave', () => isDrawing = false);

const solveButton = document.getElementById('solve-button');
solveButton.addEventListener('click', () => solveMaze());

function solveMaze() {
    resetCellColors();

    const directions = [ [-1, 0], [0, 1], [1, 0], [0, -1] ];

    // Heuristic function for A*
    function heuristic(row, col, endRow, endCol) {
        // Use Manhattan distance as heuristic
        return Math.abs(row - endRow) + Math.abs(col - endCol);
    }

    // Define priority queue for A*
    class PriorityQueue {
        constructor() {
            this.elements = [];
        }

        enqueue(element, priority) {
            this.elements.push({ element, priority });
            this.elements.sort((a, b) => a.priority - b.priority);
        }

        dequeue() {
            return this.elements.shift().element;
        }

        isEmpty() {
            return this.elements.length === 0;
        }
    }

    // Initialize visited array
    const visited = new Array(numRows).fill(false).map(() => new Array(numCols).fill(false));

    const distances = new Array(numRows).fill(Infinity).map(() => new Array(numCols).fill(Infinity));
    const previousCells = new Array(numRows).fill(null).map(() => new Array(numCols).fill(null));

    const startCell = findStartCell();
    const endCell = findEndCell();

    if (!startCell || !endCell) {
        alert('Start and end points are not defined.');
        return;
    }

    // Initialize priority queue with start cell
    const pq = new PriorityQueue();
    pq.enqueue(startCell, 0);
    distances[startCell[0]][startCell[1]] = 0;

    // A* algorithm
    while (!pq.isEmpty()) {
        const [row, col] = pq.dequeue();

        // Check if we reached the end cell
        if (row === endCell[0] && col === endCell[1]) {
            // Reconstruct and animate path
            let currentRow = row;
            let currentCol = col;
            while (currentRow !== startCell[0] || currentCol !== startCell[1]) {
                const prevCell = previousCells[currentRow][currentCol];
                const [prevRow, prevCol] = prevCell;
                animateCell(currentRow, currentCol);
                currentRow = prevRow;
                currentCol = prevCol;
            }
            break;
        }

        // Mark current cell as visited
        visited[row][col] = true;

        // Explore neighbors
        for (const [dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;

            if (isValidCell(newRow, newCol) && maze[newRow][newCol] !== CELL_WALL && !visited[newRow][newCol]) {
                const newDistance = distances[row][col] + 1;

                if (newDistance < distances[newRow][newCol]) {
                    distances[newRow][newCol] = newDistance;
                    previousCells[newRow][newCol] = [row, col];
                    const priority = newDistance + heuristic(newRow, newCol, endCell[0], endCell[1]);
                    pq.enqueue([newRow, newCol], priority);
                }
            }
        }
    }
}

// Animate cell
function animateCell(row, col) {
    const cell = getCellElement(row, col);
    setTimeout(() => {
        cell.style.backgroundColor = 'blue'; // Color to indicate path
    }, 100);
}

// Reset cell colors
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

// Find start cell
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

// Find end cell
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

function isValidCell(row, col) {
    return row >= 0 && row < numRows && col >= 0 && col < numCols;
}

function getCellElement(row, col) {
    return mazeContainer.children[row * numCols + col];
}
