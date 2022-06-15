import {Injectable} from "@angular/core";

import {sleep} from "../../../global/utils/global.utils";

export interface MazeGridType {

    x: number;
    y: number;
    bt: boolean;
    bb: boolean;
    bl: boolean;
    br: boolean;

}

export interface MazeCellType {

    grid: MazeGridType;
    visited?: boolean;
    connected?: boolean;
    weight?: number;
    goto?: WalsonMoveDirection;

}

export interface MazePathType {

    grid: MazeGridType;
    root: MazePathType | null;
    marked: boolean;
    visited: boolean;
    weight?: number;

}

export interface MazeViewType {

    grid: MazeGridType;
    marked: boolean;
    visited: boolean;
    start: boolean;
    final: boolean;

}

export interface MazeReturnMeta {

    scanner?: number;
    currCell?: MazeCellType;
    nextCell?: MazeCellType;
    startCell?: MazeCellType;
    finalCell?: MazeCellType;

}

export type MazeSetType = { [key: string | number]: MazeCellType[] };
export type BinaryTreeDirection = 'nw' | 'ne' | 'sw' | 'se';
export type WalsonMoveDirection = 'n' | 's' | 'e' | 'w' | '';
export type SpeedType = 1 | 10 | 100 | 250 | 500;

type DividePair = { currCell: MazeCellType, nextCell: MazeCellType };

const indexOfCell = (x: number, y: number, cols: number, rows: number): number => {
    if (x < 0 || x >= cols || y < 0 || y >= rows) {
        return -1;
    }

    return x + y * cols;
}

@Injectable()
export class DemoMazeGenerateAlgorithmService {

    /**
     *
     * @param cells
     * @param cols
     * @param rows
     * @param speed
     * @param callback
     */
    public async mazeAldousBroder(cells: MazeCellType[], cols: number, rows: number, speed: SpeedType,
                                  callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let visited: MazeCellType[], count: number = cols * rows;
        let currCell: MazeCellType = cells[Math.floor(Math.random() * cells.length)], nextCell: MazeCellType;

        while (count > 0) {
            currCell.visited = true;
            callback({currCell});

            let neighbors: MazeCellType[] = DemoMazeGenerateAlgorithmService.neighbors(cells, currCell, cols, rows)
                .filter(neighbor => !neighbor.visited);

            if (neighbors.length > 0) {
                nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
                nextCell.visited = true;
                callback({currCell, nextCell});

                currCell = nextCell;
            } else {
                visited = cells.filter(cell => cell.visited);

                while (neighbors.every(neighbor => neighbor.visited)) {
                    currCell = visited[Math.floor(Math.random() * visited.length)];
                    callback({currCell});

                    neighbors = DemoMazeGenerateAlgorithmService.neighbors(cells, currCell, cols, rows);
                    await sleep(speed);
                }
            }

            count = cells.filter(cell => !cell.visited).length;
            await sleep(speed);
        }

        callback({});
    }

    /**
     *
     * @param cells
     * @param cols
     * @param rows
     * @param speed
     * @param callback
     */
    public async mazeBackTracker(cells: MazeCellType[], cols: number, rows: number, speed: SpeedType,
                                 callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let stack: MazeCellType[] = [cells[Math.floor(Math.random() * cells.length)]];
        let currCell: MazeCellType | undefined;

        while (stack.length > 0) {
            currCell = stack.pop();

            if (currCell) {
                currCell.visited = true;
                callback({currCell});

                let neighbors: MazeCellType[] = DemoMazeGenerateAlgorithmService.neighbors(cells, currCell, cols, rows)
                    .filter(neighbor => !neighbor.visited);

                if (neighbors.length > 0) {
                    stack.push(currCell);

                    let nextCell: MazeCellType = neighbors[Math.floor(Math.random() * neighbors.length)];
                    nextCell.visited = true;
                    stack.push(nextCell);
                    callback({currCell, nextCell});
                }
            }

            await sleep(speed);
        }

        await callback({});
    }

    /**
     *
     * @param cells
     * @param cols
     * @param rows
     * @param dir
     * @param speed
     * @param callback
     */
    public async mazeBinaryTree(cells: MazeCellType[], cols: number, rows: number, dir: BinaryTreeDirection,
                                speed: SpeedType, callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let currCell: MazeCellType, nextCell: MazeCellType | null = null;

        for (let i = 0; i < cells.length; i++) {
            currCell = cells[i];
            currCell.visited = true;
            callback({currCell})

            switch (dir) {
                case 'nw':
                    DemoMazeGenerateAlgorithmService.binaryTreeNW(cells, currCell, nextCell, cols, rows, i, callback);
                    break;
                case 'ne':
                    DemoMazeGenerateAlgorithmService.binaryTreeNE(cells, currCell, nextCell, cols, rows, i, callback);
                    break;
                case 'sw':
                    DemoMazeGenerateAlgorithmService.binaryTreeSW(cells, currCell, nextCell, cols, rows, i, callback);
                    break;
                case 'se':
                    DemoMazeGenerateAlgorithmService.binaryTreeSE(cells, currCell, nextCell, cols, rows, i, callback);
                    break;
            }

            await sleep(speed);
        }

        nextCell = null;
        callback({});
    }

    /**
     *
     * @param array
     * @param currCell
     * @param nextCell
     * @param cols
     * @param rows
     * @param index
     * @param callback
     * @private
     */
    private static binaryTreeNW(array: MazeCellType[], currCell: MazeCellType, nextCell: MazeCellType | null,
                                cols: number, rows: number, index: number,
                                callback: (_value: MazeReturnMeta) => void): void {
        if (currCell.grid.x >= 0 && currCell.grid.x <= cols - 2 && currCell.grid.y === 0) {
            nextCell = array[index + 1];
        }

        if (currCell.grid.x === 0 && currCell.grid.y >= 1 && currCell.grid.y <= rows - 1) {
            nextCell = array[index - cols];
        }

        if (currCell.grid.x >= 1 && currCell.grid.x <= cols - 1 && currCell.grid.y >= 1 && currCell.grid.y <= rows - 1) {
            nextCell = array[Math.random() <= 0.5 ? index - 1 : index - cols];
        }

        if (nextCell !== null) {
            nextCell.visited = true;
            callback({currCell, nextCell});
        }
    }

    /**
     *
     * @param array
     * @param currCell
     * @param nextCell
     * @param cols
     * @param rows
     * @param index
     * @param callback
     * @private
     */
    private static binaryTreeNE(array: MazeCellType[], currCell: MazeCellType, nextCell: MazeCellType | null,
                                cols: number, rows: number, index: number,
                                callback: (_value: MazeReturnMeta) => void): void {
        if (currCell.grid.x >= 1 && currCell.grid.x <= cols - 1 && currCell.grid.y === 0) {
            nextCell = array[index - 1];

        }

        if (currCell.grid.x === cols - 1 && currCell.grid.y >= 1 && currCell.grid.y <= rows - 1) {
            nextCell = array[index - cols];
        }

        if (currCell.grid.x >= 0 && currCell.grid.x <= cols - 2 && currCell.grid.y >= 1 && currCell.grid.y <= rows - 1) {
            nextCell = array[Math.random() <= 0.5 ? index + 1 : index - cols];
        }

        if (nextCell !== null) {
            nextCell.visited = true;
            callback({currCell, nextCell});
        }
    }

    /**
     *
     * @param array
     * @param currCell
     * @param nextCell
     * @param cols
     * @param rows
     * @param index
     * @param callback
     * @private
     */
    private static binaryTreeSW(array: MazeCellType[], currCell: MazeCellType, nextCell: MazeCellType | null,
                                cols: number, rows: number, index: number,
                                callback: (_value: MazeReturnMeta) => void): void {
        if (currCell.grid.x === 0 && currCell.grid.y >= 0 && currCell.grid.y <= rows - 2) {
            nextCell = array[index + cols];
        }

        if (currCell.grid.x >= 1 && currCell.grid.x <= cols - 1 && currCell.grid.y === rows - 1) {
            nextCell = array[index - 1];
        }

        if (currCell.grid.x >= 1 && currCell.grid.x <= cols - 1 && currCell.grid.y >= 0 && currCell.grid.y <= rows - 2) {
            nextCell = array[Math.random() <= 0.5 ? index - 1 : index + cols];
        }

        if (nextCell !== null) {
            nextCell.visited = true;
            callback({currCell, nextCell});
        }
    }

    /**
     *
     * @param array
     * @param currCell
     * @param nextCell
     * @param cols
     * @param rows
     * @param index
     * @param callback
     * @private
     */
    private static binaryTreeSE(array: MazeCellType[], currCell: MazeCellType, nextCell: MazeCellType | null,
                                cols: number, rows: number, index: number,
                                callback: (_value: MazeReturnMeta) => void): void {
        if (currCell.grid.x === cols - 1 && currCell.grid.y >= 1 && currCell.grid.y <= rows - 1) {
            nextCell = array[index - cols];

        }

        if (currCell.grid.x >= 0 && currCell.grid.x <= cols - 2 && currCell.grid.y === rows - 1) {
            nextCell = array[index + 1];
        }

        if (currCell.grid.x >= 0 && currCell.grid.x <= cols - 2 && currCell.grid.y >= 0 && currCell.grid.y <= rows - 2) {
            nextCell = array[Math.random() <= 0.5 ? index + 1 : index + cols];
        }

        if (nextCell !== null) {
            nextCell.visited = true;
            callback({currCell, nextCell});
        }
    }

    /**
     *
     * @param cells
     * @param cols
     * @param rows
     * @param speed
     * @param callback
     */
    public async mazeEller(cells: MazeCellType[], cols: number, rows: number, speed: number = 250,
                           callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let array: MazeCellType[] = Array.from(cells);
        let currRow: MazeCellType[], nextRow: MazeCellType[] = [];
        let sets: { [key: number | string]: number }, start: number, end: number;

        for (let i = 0; i < rows; i++) {
            start = i * cols;
            end = start + cols;
            currRow = array.slice(start, end);

            if (i < rows - 1) {
                nextRow = array.slice(end, end + cols);
            }

            sets = DemoMazeGenerateAlgorithmService.ellerBuild(currRow, start);
            sets = await DemoMazeGenerateAlgorithmService.ellerROW(currRow, sets, i === rows - 1, speed, callback);

            if (i < rows - 1) {
                await DemoMazeGenerateAlgorithmService.ellerCOL(currRow, nextRow, sets, speed, callback);
            }
        }

        callback({});
    }

    /**
     *
     * @param currRow
     * @param start
     * @private
     */
    private static ellerBuild(currRow: MazeCellType[], start: number): { [key: string | number]: number } {
        let sets: { [key: string | number]: number } = {}, weight: number;

        for (let i = 0; i < currRow.length; i++) {
            if (currRow[i].weight === -1) {
                currRow[i].weight = i + 1 + start;
            }

            weight = currRow[i].weight as number;

            if (!sets[weight]) {
                sets[weight] = 1;
            } else {
                sets[weight] += 1;
            }
        }

        return sets;
    }

    /**
     *
     * @param row
     * @param sets
     * @param last
     * @param speed
     * @param callback
     * @private
     */
    private static async ellerROW(row: MazeCellType[], sets: { [key: string | number]: number },
                                  last: boolean, speed: number,
                                  callback: (_value: MazeReturnMeta) => void): Promise<{ [key: string | number]: number }> {
        let currSet: number, nextSet: number;

        for (let i = 0; i < row.length; i++) {
            if (i === row.length - 1 || row[i].weight === row[i + 1].weight || (Math.random() <= 0.5 && !last)) {
                callback({currCell: row[i]});
            } else {
                currSet = row[i].weight as number;
                nextSet = row[i + 1].weight as number;

                for (let j = 0; j < row.length; j++) {
                    if (row[j].weight === nextSet) {
                        row[j].weight = currSet;
                        sets[currSet] += 1;
                        sets[nextSet] -= 1;
                    }
                }

                callback({currCell: row[i], nextCell: row[i + 1]});
            }

            await sleep(speed);
        }

        return sets;
    }

    /**
     *
     * @param currRow
     * @param nextRow
     * @param sets
     * @param speed
     * @param callback
     * @private
     */
    private static async ellerCOL(currRow: MazeCellType[], nextRow: MazeCellType[],
                                  sets: { [key: string | number]: number }, speed: number,
                                  callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let weight: number;

        for (let i = currRow.length - 1; i >= 0; i--) {
            weight = currRow[i].weight as number;

            if (sets[weight] !== 1 && Math.random() <= 0.5) {
                sets[weight] -= 1;
                callback({currCell: currRow[i]});
            } else {
                nextRow[i].weight = currRow[i].weight;
                callback({currCell: currRow[i], nextCell: nextRow[i]});
            }

            await sleep(speed);
        }
    }

    /**
     *
     * @param cells
     * @param cols
     * @param rows
     * @param speed
     * @param callback
     */
    public async mazeGrowTree(cells: MazeCellType[], cols: number, rows: number, speed: SpeedType,
                              callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let random: number = Math.floor(Math.random() * cells.length), min: number, max: number;
        let currCell: MazeCellType = cells[random], nextCell: MazeCellType;
        let array: MazeCellType[] = [currCell], neighbors: MazeCellType[];

        while (array.length > 0) {
            min = Math.floor(Math.random() * array.length);
            max = Math.min(min + 7, array.length - 1);
            random = Math.floor(Math.random() * (max - min + 1) + min);
            currCell = array[random];
            callback({currCell});

            neighbors = DemoMazeGenerateAlgorithmService.neighbors(cells, currCell, cols, rows)
                .filter(neighbor => !neighbor.visited);

            if (neighbors.length > 0) {
                random = Math.floor(Math.random() * neighbors.length);
                nextCell = neighbors[random];
                nextCell.visited = true;
                currCell.visited = true;
                array.push(nextCell);
                callback({currCell, nextCell});
            } else {
                array.splice(random, 1);
            }

            await sleep(speed);
        }

        await callback({});
    }

    /**
     *
     * @param cells
     * @param cols
     * @param rows
     * @param speed
     * @param callback
     */
    public async mazeHuntKill(cells: MazeCellType[], cols: number, rows: number, speed: number,
                              callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let neighbors: MazeCellType[];
        let currCell: MazeCellType = cells[Math.floor(Math.random() * cells.length)], nextCell: MazeCellType;
        let count: number = cols * rows;

        currCell.visited = true;

        while (count > 0) {
            neighbors = DemoMazeGenerateAlgorithmService.neighbors(cells, currCell, cols, rows)
                .filter(neighbor => !neighbor.visited);

            if (neighbors.length > 0) {
                nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
                nextCell.visited = true;

                callback({currCell, nextCell});
                currCell = nextCell;
            } else {
                currCell = await DemoMazeGenerateAlgorithmService.hunterSeek(cells, cols, rows, speed, callback);
            }

            count = cells.filter(cell => !cell.visited).length;
            await callback({currCell});
            await sleep(speed);
        }

        await callback({});
    }

    /**
     *
     * @param array
     * @param cols
     * @param rows
     * @param speed
     * @param callback
     * @private
     */
    private static async hunterSeek(array: MazeCellType[], cols: number, rows: number, speed: number,
                                    callback: (_value: MazeReturnMeta) => void): Promise<MazeCellType> {
        let rowCells: MazeCellType[], neighbors: MazeCellType[], start: number, end: number;
        let currCell: MazeCellType | null = null, nextCell: MazeCellType | null = null;

        for (let i = 0; i < rows; i++) {
            start = i * cols;
            end = start + cols - 1;
            rowCells = array.slice(start, end + 1);
            callback({scanner: i});

            for (let j = 0; j < rowCells.length; j++) {
                currCell = rowCells[j];

                if (!currCell.visited) {
                    neighbors = DemoMazeGenerateAlgorithmService.neighbors(array, currCell, cols, rows)
                        .filter(neighbor => neighbor.visited);

                    if (neighbors.length > 0) {
                        nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
                        break;
                    }
                }
            }

            await sleep(speed);

            if (currCell && nextCell) {
                currCell.visited = true;
                await callback({currCell, nextCell});
                break;
            }
        }

        return currCell as MazeCellType;
    }

    /**
     *
     * @param cells
     * @param cols
     * @param rows
     * @param speed
     * @param callback
     */
    public async mazeKruskal(cells: MazeCellType[], cols: number, rows: number, speed: SpeedType,
                             callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let neighbors: MazeCellType[] = [], currCell: MazeCellType, nextCell: MazeCellType;
        let weight: number = 0, count: number = 0;

        while (count !== cells.length) {
            currCell = cells[Math.floor(Math.random() * cells.length)];
            callback({currCell});

            neighbors = DemoMazeGenerateAlgorithmService.neighbors(cells, currCell, cols, rows)
                .filter(neighbor => neighbor.weight !== currCell.weight);

            if (neighbors.length > 0) {
                nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
                weight = nextCell.weight as number;
                callback({currCell, nextCell});

                cells.filter(cell => cell.weight === weight).forEach(cell => cell.weight = currCell.weight);
            }

            count = cells.filter(cell => cell.weight === cells[0].weight).length;
            await sleep(speed);
        }

        await callback({});
    }

    /**
     *
     * @param cells
     * @param cols
     * @param rows
     * @param speed
     * @param callback
     */
    public async mazePrim(cells: MazeCellType[], cols: number, rows: number, speed: SpeedType,
                          callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let neighbors: MazeCellType[], visits: MazeCellType[];
        let adjacents: MazeCellType[] = [cells[Math.floor(Math.random() * cells.length)]];
        let currCell: MazeCellType, nextCell: MazeCellType, min: number, max: number;

        while (adjacents.length > 0) {
            min = Math.floor(Math.random() * adjacents.length);
            max = Math.min(min + 7, adjacents.length - 1);
            currCell = adjacents.splice(Math.floor(Math.random() * (max - min + 1) + min), 1)[0];
            currCell.visited = true;

            neighbors = DemoMazeGenerateAlgorithmService.neighbors(cells, currCell, cols, rows);
            visits = neighbors.filter(neighbor => neighbor.visited);

            if (visits.length > 0) {
                nextCell = visits[Math.floor(Math.random() * visits.length)];
                callback({currCell, nextCell});
            }

            neighbors.filter(neighbor => !neighbor.visited).forEach(neighbor => {
                if (adjacents.filter(adjacent =>
                    adjacent.grid.x === neighbor.grid.x && adjacent.grid.y === neighbor.grid.y).length === 0) {
                    adjacents.push(neighbor);
                }
            });
            await sleep(speed);
        }

        callback({});
    }

    /**
     *
     * @param cells
     * @param cols
     * @param rows
     * @param minCol
     * @param maxCol
     * @param minRow
     * @param maxRow
     * @param speed
     * @param callback
     */
    public async mazeRandomDivider(cells: MazeCellType[], cols: number, rows: number, minCol: number, maxCol: number,
                                   minRow: number, maxRow: number, speed: SpeedType,
                                   callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let dir: boolean = DemoMazeGenerateAlgorithmService
            .divideDirection(maxCol - minCol + 1, maxRow - minRow + 1);
        let fstCells: MazeCellType[], sndCells: MazeCellType[];
        let pair: DividePair = DemoMazeGenerateAlgorithmService
            .dividePairCells(cells, dir, minCol, maxCol, minRow, maxRow);
        callback({currCell: pair.currCell, nextCell: pair.nextCell});
        await sleep(speed);

        if (cells.length > 2) {
            if (dir) {
                fstCells = cells.filter(item =>
                    item.grid.x >= minCol && item.grid.x <= Math.min(pair.currCell.grid.x, pair.nextCell.grid.x));
                sndCells = cells.filter(item =>
                    item.grid.x >= Math.max(pair.currCell.grid.x, pair.nextCell.grid.x) && item.grid.x <= maxCol);
                await this.mazeRandomDivider(fstCells, cols, rows, minCol,
                    Math.min(pair.currCell.grid.x, pair.nextCell.grid.x), minRow, maxRow, speed, callback);
                await this.mazeRandomDivider(sndCells, cols, rows,
                    Math.max(pair.currCell.grid.x, pair.nextCell.grid.x), maxCol, minRow, maxRow, speed, callback);
            } else {
                fstCells = cells.filter(item =>
                    item.grid.y >= minRow && item.grid.y <= Math.min(pair.currCell.grid.y, pair.nextCell.grid.y));
                sndCells = cells.filter(item =>
                    item.grid.y >= Math.max(pair.currCell.grid.y, pair.nextCell.grid.y) && item.grid.y <= maxRow);
                await this.mazeRandomDivider(fstCells, cols, rows, minCol, maxCol,
                    minRow, Math.min(pair.currCell.grid.y, pair.nextCell.grid.y), speed, callback);
                await this.mazeRandomDivider(sndCells, cols, rows, minCol, maxCol,
                    Math.max(pair.currCell.grid.y, pair.nextCell.grid.y), maxRow, speed, callback);
            }
        }

        callback({});
    }

    /**
     *
     * @param cells
     * @param dir
     * @param minCol
     * @param maxCol
     * @param minRow
     * @param maxRow
     * @private
     */
    private static dividePairCells(cells: MazeCellType[], dir: boolean, minCol: number, maxCol: number,
                                   minRow: number, maxRow: number): DividePair {
        let x1: number = Math.floor(Math.random() * (maxCol - minCol) + minCol);
        let y1: number = Math.floor(Math.random() * (maxRow - minRow) + minRow);
        let x2: number = dir ? (x1 === minCol ? x1 + 1 : (Math.random() <= 0.5 ? x1 - 1 : x1 + 1)) : x1;
        let y2: number = dir ? y1 : (y1 === minRow ? y1 + 1 : (Math.random() <= 0.5 ? y1 - 1 : y1 + 1));
        return {
            currCell: cells.filter(cell => cell.grid.x === x1 && cell.grid.y === y1)[0],
            nextCell: cells.filter(cell => cell.grid.x === x2 && cell.grid.y === y2)[0]
        };
    }

    /**
     *
     * @param width
     * @param height
     * @private
     */
    private static divideDirection(width: number, height: number): boolean {
        if (width > height) {
            return true;
        } else if (width < height) {
            return false;
        } else {
            return Math.random() <= 0.5;
        }
    }

    /**
     *
     * @param cells
     * @param cols
     * @param rows
     * @param speed
     * @param callback
     */
    public async mazeSideWinder(cells: MazeCellType[], cols: number, rows: number, speed: number,
                                callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let currRow: MazeCellType[], prevRow: MazeCellType[] = [];
        let map: MazeSetType = {}, start: number, end: number;

        for (let i = 0; i < rows; i++) {
            start = i * cols;
            end = start + cols;
            currRow = cells.slice(start, end);

            if (i > 0) {
                currRow = await DemoMazeGenerateAlgorithmService.winderGroup(currRow, map);
                Object.keys(map).forEach(key => map[key].length = 0);
                map = {};
            }

            for (let j = 0; j < cols; j++) {
                if (i === 0) {
                    if (j + 1 < cols) {
                        callback({currCell: currRow[j], nextCell: currRow[j + 1]});
                    }
                } else {
                    if (j + 1 < cols && currRow[j].weight === currRow[j + 1].weight) {
                        callback({currCell: currRow[j], nextCell: currRow[j + 1]});
                    }

                    if (currRow[j].connected) {
                        callback({currCell: currRow[j], nextCell: prevRow[j]});
                    }
                }

                callback({currCell: currRow[j]});
                await sleep(speed);
            }

            prevRow = currRow;
        }

        await callback({});
    }

    /**
     *
     * @param row
     * @param map
     * @private
     */
    private static async winderGroup(row: MazeCellType[], map: MazeSetType): Promise<MazeCellType[]> {
        let index: number, weight: number = 1, idx: number = 0;

        for (let i = 0; i < row.length; i++) {
            row[i].weight = weight;

            if (!map[weight]) {
                map[weight] = [row[i]];
            } else {
                map[weight].push(row[i]);
            }

            if (Math.random() <= 0.5) {
                weight++;
            }
        }

        for (let key of Object.keys(map)) {
            if (map[key].length > 0) {
                index = Math.floor(Math.random() * map[key].length);
                map[key][index].connected = true;

                for (let i = 0; i < map[key].length; i++) {
                    row[idx++] = map[key][i];
                }
            }
        }

        return row;
    }

    /**
     *
     * @param cells
     * @param cols
     * @param rows
     * @param speed
     * @param callback
     */
    public async mazeWalson(cells: MazeCellType[], cols: number, rows: number, speed: number,
                            callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let unvisited: MazeCellType[] = cells.filter(cell => !cell.visited);
        let startCell: MazeCellType, finalCell: MazeCellType, count: number = cols * rows;

        startCell = unvisited[Math.floor(Math.random() * unvisited.length)];
        unvisited = cells.filter(cell => cell.grid.x !== startCell.grid.y && cell.grid.y !== startCell.grid.y);
        finalCell = unvisited[Math.floor(Math.random() * unvisited.length)];
        finalCell.visited = true;
        callback({startCell, finalCell});

        while (count > 0) {
            finalCell = await DemoMazeGenerateAlgorithmService.walsonSeek(cells, startCell, finalCell, cols, rows,
                cols * rows - count, speed, callback);
            await DemoMazeGenerateAlgorithmService.walsonMove(cells, startCell, finalCell, cols, rows, speed, callback);

            unvisited = cells.filter(cell => !cell.visited);
            count = unvisited.length;
            startCell = unvisited[Math.floor(Math.random() * unvisited.length)];
            await sleep(speed);
        }

        await callback({});
    }

    /**
     *
     * @param cells
     * @param startCell
     * @param finalCell
     * @param cols
     * @param rows
     * @param count
     * @param speed
     * @param callback
     * @private
     */
    private static async walsonSeek(cells: MazeCellType[], startCell: MazeCellType, finalCell: MazeCellType,
                                    cols: number, rows: number, count: number, speed: number,
                                    callback: (__value: MazeReturnMeta) => void): Promise<MazeCellType> {
        let neighbors: MazeCellType[], currCell: MazeCellType = startCell, nextCell: MazeCellType;

        if (count === 0) {
            callback({startCell, finalCell});
        } else {
            callback({startCell});
        }

        while (!currCell.visited) {
            neighbors = DemoMazeGenerateAlgorithmService.neighbors(cells, currCell, cols, rows);
            nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
            currCell.goto = DemoMazeGenerateAlgorithmService.matchNEWS(currCell, nextCell);

            if (count === 0) {
                callback({currCell, startCell, finalCell});
            } else {
                callback({currCell, startCell});
            }

            currCell = nextCell;
            await sleep(speed);
        }

        return currCell;
    }

    /**
     *
     * @param cells
     * @param startCell
     * @param finalCell
     * @param cols
     * @param rows
     * @param speed
     * @param callback
     * @private
     */
    private static async walsonMove(cells: MazeCellType[], startCell: MazeCellType, finalCell: MazeCellType,
                                    cols: number, rows: number, speed: number,
                                    callback: (__value: MazeReturnMeta) => void): Promise<void> {
        let currCell: MazeCellType = startCell, nextCell: MazeCellType | undefined;

        while (!(currCell.grid.x === finalCell.grid.x && currCell.grid.y === finalCell.grid.y)) {
            currCell.visited = true;
            nextCell = DemoMazeGenerateAlgorithmService.seekNEWS(cells, currCell, cols, rows);

            if (nextCell) {
                nextCell.visited = true;
                callback({currCell, nextCell});
                currCell = nextCell;
                await sleep(speed);
            }
        }

        await callback({currCell});
    }

    /**
     *
     * @param currCell
     * @param nextCell
     * @private
     */
    private static matchNEWS(currCell: MazeCellType, nextCell: MazeCellType): WalsonMoveDirection {
        if (currCell.grid.x === nextCell.grid.x && currCell.grid.y + 1 === nextCell.grid.y) {
            return 's';
        }

        if (currCell.grid.x === nextCell.grid.x && currCell.grid.y - 1 === nextCell.grid.y) {
            return 'n';
        }

        if (currCell.grid.x + 1 === nextCell.grid.x && currCell.grid.y === nextCell.grid.y) {
            return 'e';
        }

        if (currCell.grid.x - 1 === nextCell.grid.x && currCell.grid.y === nextCell.grid.y) {
            return 'w';
        }

        return '';
    }

    /**
     *
     * @param cells
     * @param cell
     * @param cols
     * @param rows
     * @private
     */
    private static seekNEWS(cells: MazeCellType[], cell: MazeCellType,
                            cols: number, rows: number): MazeCellType | undefined {
        let index: number = -1;

        switch (cell.goto) {
            case 'n':
                index = indexOfCell(cell.grid.x, cell.grid.y - 1, cols, rows);
                break;
            case 's':
                index = indexOfCell(cell.grid.x, cell.grid.y + 1, cols, rows);
                break;
            case 'w':
                index = indexOfCell(cell.grid.x - 1, cell.grid.y, cols, rows);
                break;
            case 'e':
                index = indexOfCell(cell.grid.x + 1, cell.grid.y, cols, rows);
                break;
        }

        return cells[index];
    }

    /**
     *
     * @param currCell
     * @param nextCell
     */
    public mergeCells(currCell: MazeCellType, nextCell: MazeCellType): void {
        if (currCell.grid.y + 1 === nextCell.grid.y) {
            currCell.grid.bb = false;
            nextCell.grid.bt = false;
        }

        if (currCell.grid.y - 1 === nextCell.grid.y) {
            currCell.grid.bt = false;
            nextCell.grid.bb = false;
        }

        if (currCell.grid.x + 1 === nextCell.grid.x) {
            currCell.grid.br = false;
            nextCell.grid.bl = false;
        }

        if (currCell.grid.x - 1 === nextCell.grid.x) {
            currCell.grid.bl = false;
            nextCell.grid.br = false;
        }
    }

    /**
     *
     * @param cells
     * @param cell
     * @param cols
     * @param rows
     * @private
     */
    private static neighbors(cells: MazeCellType[], cell: MazeCellType, cols: number, rows: number): MazeCellType[] {
        let array: MazeCellType[] = [];
        let up: number = indexOfCell(cell.grid.x, cell.grid.y - 1, cols, rows);
        let down: number = indexOfCell(cell.grid.x, cell.grid.y + 1, cols, rows);
        let left: number = indexOfCell(cell.grid.x - 1, cell.grid.y, cols, rows);
        let right: number = indexOfCell(cell.grid.x + 1, cell.grid.y, cols, rows);

        if (up !== -1) {
            array.push(cells[up]);
        }

        if (down !== -1) {
            array.push(cells[down]);
        }

        if (left !== -1) {
            array.push(cells[left]);
        }

        if (right !== -1) {
            array.push(cells[right]);
        }

        return array;
    }

}

@Injectable()
export class DemoMazeSolveAlgorithmService {

    /**
     *
     * @param cells
     * @param startX
     * @param startY
     * @param finalX
     * @param finalY
     * @param cols
     * @param rows
     * @param speed
     * @param callback
     */
    public async mazeAStar(cells: MazePathType[], startX: number, startY: number, finalX: number, finalY: number,
                           cols: number, rows: number, speed: SpeedType,
                           callback: (_value?: MazePathType) => void): Promise<void> {
        let startCell: MazePathType = cells.filter(cell => cell.grid.x === startX && cell.grid.y === startY)[0];
        let finalCell: MazePathType = cells.filter(cell => cell.grid.x === finalX && cell.grid.y === finalY)[0];
        let queue: MazePathType[] = [], neighbors: MazePathType[], cell: MazePathType | undefined, dist: number;

        cells.forEach(cell => cell.weight = Number.POSITIVE_INFINITY);

        startCell.weight = 0;
        queue.push(startCell);

        while (!(cell && cell.grid.x === finalX && cell.grid.y === finalY)) {
            cell = queue.shift();

            if (cell) {
                cell.visited = true;
                callback(cell);

                neighbors = DemoMazeSolveAlgorithmService.neighbors(cells, cell, cols, rows)
                    .filter(neighbor => !neighbor.visited);
                neighbors.forEach(neighbor => {
                    dist = cell?.weight as number + 1 +
                        DemoMazeSolveAlgorithmService.heuristic(neighbor.grid, finalCell.grid);

                    if (dist < (neighbor.weight as number)) {
                        neighbor.weight = dist;
                        neighbor.root = cell as MazePathType;
                        queue.push(neighbor);
                        queue = queue.sort((a, b) =>
                            (a.weight as number) - (b.weight as number));
                    }
                });
            }

            await sleep(speed);
        }

        await DemoMazeSolveAlgorithmService.markPath(cell, startX, startY, speed, callback);
    }

    /**
     *
     * @param cells
     * @param startX
     * @param startY
     * @param finalX
     * @param finalY
     * @param cols
     * @param rows
     * @param speed
     * @param callback
     */
    public async mazeBackTracker(cells: MazePathType[], startX: number, startY: number, finalX: number, finalY: number,
                                 cols: number, rows: number, speed: SpeedType,
                                 callback: (_value?: MazePathType) => void): Promise<void> {
        let stack: MazePathType[] = [], neighbors: MazePathType[];
        let currCell: MazePathType | undefined = cells.filter(cell =>
            cell.grid.x === startX && cell.grid.y === startY)[0], nextCell: MazePathType;

        cells.forEach(cell => cell.weight = -1);
        currCell.weight = 0;
        stack.push(currCell);

        while (!(currCell && currCell.grid.x === finalX && currCell.grid.y === finalY)) {
            currCell = stack.pop();

            if (currCell) {
                currCell.visited = true;

                neighbors = DemoMazeSolveAlgorithmService.neighbors(cells, currCell, cols, rows)
                    .filter(neighbor => !neighbor.visited);

                if (neighbors.length === 0) {
                    currCell.weight = -1;
                } else {
                    stack.push(currCell);

                    nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
                    nextCell.weight = currCell.weight as number + 1;
                    stack.push(nextCell);
                }

                currCell.marked = currCell.weight !== -1;
            }

            callback(currCell);
            await sleep(speed);
        }
    }

    /**
     *
     * @param cells
     * @param startX
     * @param startY
     * @param finalX
     * @param finalY
     * @param cols
     * @param rows
     * @param speed
     * @param callback
     */
    public async mazeBFS(cells: MazePathType[], startX: number, startY: number, finalX: number, finalY: number,
                         cols: number, rows: number, speed: SpeedType,
                         callback: (_value?: MazePathType) => void): Promise<void> {
        let node: MazePathType = cells.filter(cell => cell.grid.x === startX && cell.grid.y === startY)[0];
        let queue: MazePathType[] = [node], neighbors: MazePathType[], cell: MazePathType | undefined;

        while (!(cell && cell.grid.x === finalX && cell.grid.y === finalY)) {
            cell = queue.shift();

            if (cell) {
                cell.visited = true;
                callback(cell);

                neighbors = DemoMazeSolveAlgorithmService.neighbors(cells, cell, cols, rows)
                    .filter(neighbor => !neighbor.visited);

                for (let i = 0; i < neighbors.length; i++) {
                    neighbors[i].root = cell;
                    queue.push(neighbors[i]);
                    await sleep(speed);
                }
            }
        }

        await DemoMazeSolveAlgorithmService.markPath(cell, startX, startY, speed, callback);
    }

    /**
     *
     * @param cells
     * @param startX
     * @param startY
     * @param finalX
     * @param finalY
     * @param cols
     * @param rows
     * @param speed
     * @param callback
     */
    public async mazeDFS(cells: MazePathType[], startX: number, startY: number, finalX: number, finalY: number,
                         cols: number, rows: number, speed: SpeedType,
                         callback: (_value?: MazePathType) => void): Promise<void> {
        let node: MazePathType = cells.filter(cell => cell.grid.x === startX && cell.grid.y === startY)[0];
        let stack: MazePathType[] = [node], neighbors: MazePathType[], cell: MazePathType | undefined;

        while (!(cell && cell.grid.x === finalX && cell.grid.y === finalY)) {
            cell = stack.pop();

            if (cell) {
                cell.visited = true;
                callback(cell);

                neighbors = DemoMazeSolveAlgorithmService.neighbors(cells, cell, cols, rows)
                    .filter(neighbor => !neighbor.visited);

                for (let i = 0; i < neighbors.length; i++) {
                    neighbors[i].root = cell;
                    stack.push(neighbors[i]);
                    await sleep(speed);
                }
            }
        }

        await DemoMazeSolveAlgorithmService.markPath(cell, startX, startY, speed, callback);
    }

    /**
     *
     * @param cells
     * @param startX
     * @param startY
     * @param finalX
     * @param finalY
     * @param cols
     * @param rows
     * @param speed
     * @param callback
     */
    public async mazeDijkstra(cells: MazePathType[], startX: number, startY: number, finalX: number, finalY: number,
                              cols: number, rows: number, speed: SpeedType,
                              callback: (_value?: MazePathType) => void): Promise<void> {
        let node: MazePathType = cells.filter(cell => cell.grid.x === startX && cell.grid.y === startY)[0];
        let queue: MazePathType[] = [], neighbors: MazePathType[], cell: MazePathType | undefined, dist: number;

        cells.forEach(cell => cell.weight = Number.POSITIVE_INFINITY);

        node.weight = 0;
        queue.push(node);

        while (!(cell && cell.grid.x === finalX && cell.grid.y === finalY)) {
            cell = queue.shift();

            if (cell) {
                cell.visited = true;
                callback(cell);

                neighbors = DemoMazeSolveAlgorithmService.neighbors(cells, cell, cols, rows)
                    .filter(neighbor => !neighbor.visited);
                neighbors.forEach(neighbor => {
                    dist = cell?.weight as number + 1;

                    if (dist < (neighbor.weight as number)) {
                        neighbor.weight = dist;
                        neighbor.root = cell as MazePathType;

                        queue.push(neighbor);
                        queue = queue.sort((a, b) =>
                            (a.weight as number) - (b.weight as number));
                    }
                });
            }

            await sleep(speed);
        }

        await DemoMazeSolveAlgorithmService.markPath(cell, startX, startY, speed, callback);
    }

    /**
     *
     * @param cells
     * @param startX
     * @param startY
     * @param finalX
     * @param finalY
     * @param cols
     * @param rows
     * @param speed
     * @param callback
     */
    public async mazeFloodFill(cells: MazePathType[], startX: number, startY: number, finalX: number, finalY: number,
                               cols: number, rows: number, speed: SpeedType,
                               callback: (_value?: MazePathType) => void): Promise<void> {
        let startCell: MazePathType = cells.filter(cell => cell.grid.x === startX && cell.grid.y === startY)[0];
        let finalCell: MazePathType = cells.filter(cell => cell.grid.x === finalX && cell.grid.y === finalY)[0];
        let queue: MazePathType[] = [], neighbors: MazePathType[], cell: MazePathType | undefined, weight: number;

        finalCell.weight = 0;
        queue.push(finalCell);

        while (!(cell && cell.grid.x === startX && cell.grid.y === startY)) {
            cell = queue.shift();

            if (cell) {
                cell.visited = true;
                callback(cell);

                weight = cell.weight as number;
                neighbors = DemoMazeSolveAlgorithmService.neighbors(cells, cell, cols, rows)
                    .filter(neighbor => !neighbor.visited);
                neighbors.forEach(neighbor => neighbor.weight = weight + 1);
                queue.push(...neighbors);
            }

            await sleep(speed);
        }

        await DemoMazeSolveAlgorithmService.moveBack(cells, startCell, cols, rows, speed, callback);
    }

    /**
     *
     * @param cells
     * @param startX
     * @param startY
     * @param finalX
     * @param finalY
     * @param cols
     * @param rows
     * @param speed
     * @param callback
     */
    public async mazeGBFS(cells: MazePathType[], startX: number, startY: number, finalX: number, finalY: number,
                          cols: number, rows: number, speed: SpeedType,
                          callback: (_value?: MazePathType) => void): Promise<void> {
        let startCell: MazePathType = cells.filter(cell => cell.grid.x === startX && cell.grid.y === startY)[0];
        let finalCell: MazePathType = cells.filter(cell => cell.grid.x === finalX && cell.grid.y === finalY)[0];
        let queue: MazePathType[] = [], neighbors: MazePathType[], cell: MazePathType | undefined;

        startCell.weight = 0;
        startCell.visited = true;
        queue.push(startCell);

        while (!(cell && cell.grid.x === finalX && cell.grid.y === finalY)) {
            cell = queue.shift();

            if (cell) {
                cell.visited = true;
                callback(cell);

                neighbors = DemoMazeSolveAlgorithmService.neighbors(cells, cell, cols, rows)
                    .filter(neighbor => !neighbor.visited);
                neighbors.forEach(neighbor => {
                    neighbor.weight = DemoMazeSolveAlgorithmService.heuristic(neighbor.grid, finalCell.grid);
                    neighbor.root = cell as MazePathType;
                    queue.push(neighbor);
                });

                queue = queue.sort((a, b) =>
                    (a.weight as number) - (b.weight as number));
            }

            await sleep(speed);
        }

        await DemoMazeSolveAlgorithmService.markPath(finalCell, startX, startY, speed, callback);
    }

    /**
     *
     * @param startCell
     * @param finalCell
     * @param scale
     * @private
     */
    private static heuristic(startCell: MazeGridType, finalCell: MazeGridType, scale: number = 10): number {
        let deltaX: number = Math.abs(startCell.x - finalCell.x);
        let deltaY: number = Math.abs(startCell.y - finalCell.y);
        // return scale * (deltaX + deltaY);
        // return scale * (deltaX + deltaY) + scale * (Math.sqrt(2) - 2) * Math.min(deltaX, deltaY);
        return scale * Math.sqrt(deltaX ** 2 + deltaY ** 2);
    }

    /**
     *
     * @param cell
     * @param x
     * @param y
     * @param speed
     * @param callback
     * @private
     */
    private static async markPath(cell: MazePathType, x: number, y: number, speed: SpeedType,
                                  callback: (_value?: MazePathType) => void): Promise<void> {
        while (cell && cell.root !== null && !(cell.root.grid.x === x && cell.root.grid.y === y)) {
            cell = cell.root;
            cell.marked = true;
            callback(cell);
            await sleep(speed);
        }

        callback();
    }

    /**
     *
     * @param cells
     * @param cell
     * @param cols
     * @param rows
     * @param speed
     * @param callback
     * @private
     */
    private static async moveBack(cells: MazePathType[], cell: MazePathType, cols: number, rows: number,
                                  speed: SpeedType, callback: (_value?: MazePathType) => void): Promise<void> {
        let neighbors: MazePathType[], weight: number = cell.weight as number;

        while (weight > 0) {
            neighbors = DemoMazeSolveAlgorithmService.neighbors(cells, cell, cols, rows)
                .filter(neighbor => neighbor.weight === weight - 1);
            cell = neighbors[Math.floor(Math.random() * neighbors.length)];
            cell.marked = true;
            callback(cell);

            weight = cell.weight as number;
            await sleep(speed);
        }

        callback();
    }

    /**
     *
     * @param cells
     * @param cell
     * @param cols
     * @param rows
     * @private
     */
    private static neighbors(cells: MazePathType[], cell: MazePathType, cols: number, rows: number): MazePathType[] {
        let neighbors: MazePathType[] = [], index: number;

        if (!cell.grid.bt) {
            index = indexOfCell(cell.grid.x, cell.grid.y - 1, cols, rows);

            if (index !== -1) {
                neighbors.push(cells[index]);
            }
        }

        if (!cell.grid.bb) {
            index = indexOfCell(cell.grid.x, cell.grid.y + 1, cols, rows);

            if (index !== -1) {
                neighbors.push(cells[index]);
            }
        }

        if (!cell.grid.bl) {
            index = indexOfCell(cell.grid.x - 1, cell.grid.y, cols, rows);

            if (index !== -1) {
                neighbors.push(cells[index]);
            }
        }

        if (!cell.grid.br) {
            index = indexOfCell(cell.grid.x + 1, cell.grid.y, cols, rows);

            if (index !== -1) {
                neighbors.push(cells[index]);
            }
        }

        return neighbors;
    }

}
