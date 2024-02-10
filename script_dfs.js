const CELL_EMPTY = 0;
const CELL_WALL = 1;
const CELL_START = 2;
const CELL_END = 3;

const numRows = 10;
const numCols = 10;
const cellSize = 40;

const mazeContainer = document.getElementById('maze-container');

const maze = [];

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

    const visited = new Array(numRows).fill(false).map(() => new Array(numCols).fill(false));

    const startCell = findStartCell();
    const endCell = findEndCell();

    if (!startCell || !endCell) {
        alert('Start and end points are not defined.');
        return;
    }

    // Perform DFS
    dfs(startCell[0], startCell[1]);

    // Function for Depth-First Search
    function dfs(row, col) {
        // Mark current cell as visited
        visited[row][col] = true;

        if (row === endCell[0] && col === endCell[1]) {
            animatePath();
            return true;
        }

        for (const [dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;

            if (isValidCell(newRow, newCol) && !visited[newRow][newCol] && maze[newRow][newCol] !== CELL_WALL) {
                // Recursively explore neighboring cells
                if (dfs(newRow, newCol)) {
                    return true;
                }
            }
        }

        return false;
    }

    function animatePath() {
        for (let i = 0; i < numRows; i++) {
            for (let j = 0; j < numCols; j++) {
                if (visited[i][j] && maze[i][j] !== CELL_START && maze[i][j] !== CELL_END) {
                    const cell = getCellElement(i, j);
                    setTimeout(() => {
                        cell.style.backgroundColor = 'blue'; // Color to indicate path
                    }, 100 * (i + j)); // Adjust delay for animation speed
                }
            }
        }
    }
}

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
