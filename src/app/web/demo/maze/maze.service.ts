import {Injectable} from "@angular/core";

import {sleep} from "../../../global/utils/global.utils";
import {drawBorderLine, fillGridColor} from "../../../global/utils/canvas.utils";

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

@Injectable()
export class DemoMazeGenerateAlgorithmService {

    /**
     *
     * @param cells
     * @param speed
     * @param callback
     */
    public async mazeAldousBroder(cells: MazeCellType[], speed: number = 250,
                                  callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let array: MazeCellType[] = Array.from(cells);
        let currCell: MazeCellType = await array[Math.floor(Math.random() * array.length)], nextCell: MazeCellType;

        while (!array.every(item => item.visited)) {
            currCell.visited = true;
            await callback({currCell});

            let neighbors: MazeCellType[] = DemoMazeGenerateAlgorithmService.neighbors(array, currCell)
                .filter(neighbor => !neighbor.visited);

            if (neighbors.length > 0) {
                nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
                nextCell.visited = true;
                await callback({currCell, nextCell});

                currCell = nextCell;
            } else {
                let visited: MazeCellType[] = array.filter(item => item.visited);

                while (neighbors.every(neighbor => neighbor.visited)) {
                    currCell = visited[Math.floor(Math.random() * visited.length)];
                    await callback({currCell});

                    neighbors = DemoMazeGenerateAlgorithmService.neighbors(array, currCell);
                    await sleep(speed);
                }
            }

            await sleep(speed);
        }

        await callback({});
    }

    /**
     *
     * @param cells
     * @param speed
     * @param callback
     */
    public async mazeBackTracker(cells: MazeCellType[], speed: SpeedType,
                                 callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let array: MazeCellType[] = Array.from(cells);
        let currCell: MazeCellType | undefined = array[Math.floor(Math.random() * array.length)];
        let stack: MazeCellType[] = [currCell];

        while (!array.every(item => item.visited)) {
            currCell = stack.pop();
            DemoMazeGenerateAlgorithmService.rbtMerge(array, stack, currCell, callback);
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
    public async mazeDoubleBackTracker(cells: MazeCellType[], cols: number, rows: number, speed: SpeedType,
                                       callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let half: number = (cols - 1) >> 1, point: number = Math.floor(Math.random() * rows);
        let lhsArray: MazeCellType[] = Array.from(cells).filter(item => item.grid.x >= 0 && item.grid.x <= half)
            .filter(item => item.grid.y >= 0 && item.grid.y <= rows - 1);
        let rhsArray: MazeCellType[] = Array.from(cells).filter(item => item.grid.x >= half + 1 && item.grid.x <= cols - 1)
            .filter(item => item.grid.y >= 0 && item.grid.y <= rows - 1);
        let lhsHalf: MazeCellType[] = Array.from(cells).filter(item => item.grid.x === half)
            .filter(item => item.grid.y >= 0 && item.grid.y <= rows - 1);
        let rhsHalf: MazeCellType[] = Array.from(cells).filter(item => item.grid.x === half + 1)
            .filter(item => item.grid.y >= 0 && item.grid.y <= rows - 1);
        let lhsCurrCell: MazeCellType | undefined = lhsArray[Math.floor(Math.random() * lhsArray.length)];
        let rhsCurrCell: MazeCellType | undefined = rhsArray[Math.floor(Math.random() * rhsArray.length)];
        let lhsStack: MazeCellType[] = [lhsCurrCell], rhsStack: MazeCellType[] = [rhsCurrCell];

        while (!lhsArray.every(item => item.visited) || !rhsArray.every(item => item.visited)) {
            lhsCurrCell = lhsStack.pop();
            DemoMazeGenerateAlgorithmService.rbtMerge(lhsArray, lhsStack, lhsCurrCell, callback);
            await sleep(speed);

            rhsCurrCell = rhsStack.pop();
            DemoMazeGenerateAlgorithmService.rbtMerge(rhsArray, rhsStack, rhsCurrCell, callback);
            await sleep(speed);
        }

        callback({currCell: lhsHalf[point], nextCell: rhsHalf[point]});
        await sleep(speed);
        callback({});
    }

    /**
     *
     * @param array
     * @param stack
     * @param currCell
     * @param callback
     * @private
     */
    private static rbtMerge(array: MazeCellType[], stack: MazeCellType[], currCell: MazeCellType | undefined,
                            callback: (_value: MazeReturnMeta) => void): void {
        if (currCell) {
            currCell.visited = true;
            callback({currCell});

            let neighbors: MazeCellType[] = DemoMazeGenerateAlgorithmService.neighbors(array, currCell)
                .filter(neighbor => !neighbor.visited);

            if (neighbors.length > 0) {
                stack.push(currCell);

                let nextCell: MazeCellType = neighbors[Math.floor(Math.random() * neighbors.length)];
                nextCell.visited = true;
                stack.push(nextCell);
                callback({currCell, nextCell});
            }
        }
    }

    /**
     *
     * @param list
     * @param cols
     * @param rows
     * @param dir
     * @param speed
     * @param callback
     */
    public async mazeBinaryTree(list: MazeCellType[], cols: number, rows: number, dir: BinaryTreeDirection,
                                speed: number = 250,
                                callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let array: MazeCellType[] = Array.from(list);

        for (let i = 0; i < array.length; i++) {
            let currCell: MazeCellType = array[i];
            currCell.visited = true;
            callback({currCell})

            switch (dir) {
                case 'nw':
                    await DemoMazeGenerateAlgorithmService.binaryTreeNW(array, currCell, cols, rows, i, callback);
                    break;
                case 'ne':
                    await DemoMazeGenerateAlgorithmService.binaryTreeNE(array, currCell, cols, rows, i, callback);
                    break;
                case 'sw':
                    await DemoMazeGenerateAlgorithmService.binaryTreeSW(array, currCell, cols, rows, i, callback);
                    break;
                case 'se':
                    await DemoMazeGenerateAlgorithmService.binaryTreeSE(array, currCell, cols, rows, i, callback);
                    break;
            }

            await sleep(speed);
        }

        await callback({});
    }

    /**
     *
     * @param array
     * @param currCell
     * @param cols
     * @param rows
     * @param index
     * @param callback
     * @private
     */
    private static async binaryTreeNW(array: MazeCellType[], currCell: MazeCellType, cols: number, rows: number,
                                      index: number,
                                      callback: (_value: MazeReturnMeta) => void): Promise<void> {
        if (currCell.grid.x >= 0 && currCell.grid.x <= cols - 2 && currCell.grid.y === 0) {
            let nextCell: MazeCellType = array[index + 1];
            nextCell.visited = true;
            await callback({currCell, nextCell});
        }

        if (currCell.grid.x === 0 && currCell.grid.y >= 1 && currCell.grid.y <= rows - 1) {
            let nextCell: MazeCellType = array[index - cols];
            nextCell.visited = true;
            await callback({currCell, nextCell});
        }

        if (currCell.grid.x >= 1 && currCell.grid.x <= cols - 1 && currCell.grid.y >= 1 && currCell.grid.y <= rows - 1) {
            let nextCell: MazeCellType = array[Math.random() <= 0.5 ? index - 1 : index - cols];
            nextCell.visited = true;
            await callback({currCell, nextCell});
        }
    }

    /**
     *
     * @param array
     * @param currCell
     * @param cols
     * @param rows
     * @param index
     * @param callback
     * @private
     */
    private static async binaryTreeNE(array: MazeCellType[], currCell: MazeCellType, cols: number, rows: number, index: number,
                                      callback: (_value: MazeReturnMeta) => void): Promise<void> {
        if (currCell.grid.x >= 1 && currCell.grid.x <= cols - 1 && currCell.grid.y === 0) {
            let nextCell: MazeCellType = array[index - 1];
            nextCell.visited = true;
            await callback({currCell, nextCell});
        }

        if (currCell.grid.x === cols - 1 && currCell.grid.y >= 1 && currCell.grid.y <= rows - 1) {
            let nextCell: MazeCellType = array[index - cols];
            nextCell.visited = true;
            await callback({currCell, nextCell});
        }

        if (currCell.grid.x >= 0 && currCell.grid.x <= cols - 2 && currCell.grid.y >= 1 && currCell.grid.y <= rows - 1) {
            let nextCell: MazeCellType = array[Math.random() <= 0.5 ? index + 1 : index - cols];
            nextCell.visited = true;
            await callback({currCell, nextCell});
        }
    }

    /**
     *
     * @param array
     * @param currCell
     * @param cols
     * @param rows
     * @param index
     * @param callback
     * @private
     */
    private static async binaryTreeSW(array: MazeCellType[], currCell: MazeCellType, cols: number, rows: number, index: number,
                                      callback: (_value: MazeReturnMeta) => void): Promise<void> {
        if (currCell.grid.x === 0 && currCell.grid.y >= 0 && currCell.grid.y <= rows - 2) {
            let nextCell: MazeCellType = array[index + cols];
            nextCell.visited = true;
            await callback({currCell, nextCell});
        }

        if (currCell.grid.x >= 1 && currCell.grid.x <= cols - 1 && currCell.grid.y === rows - 1) {
            let nextCell: MazeCellType = array[index - 1];
            nextCell.visited = true;
            await callback({currCell, nextCell});
        }

        if (currCell.grid.x >= 1 && currCell.grid.x <= cols - 1 && currCell.grid.y >= 0 && currCell.grid.y <= rows - 2) {
            let nextCell: MazeCellType = array[Math.random() <= 0.5 ? index - 1 : index + cols];
            nextCell.visited = true;
            await callback({currCell, nextCell});
        }
    }

    /**
     *
     * @param array
     * @param currCell
     * @param cols
     * @param rows
     * @param index
     * @param callback
     * @private
     */
    private static async binaryTreeSE(array: MazeCellType[], currCell: MazeCellType, cols: number, rows: number, index: number,
                                      callback: (_value: MazeReturnMeta) => void): Promise<void> {
        if (currCell.grid.x === cols - 1 && currCell.grid.y >= 1 && currCell.grid.y <= rows - 1) {
            let nextCell: MazeCellType = array[index - cols];
            nextCell.visited = true;
            await callback({currCell, nextCell});
        }

        if (currCell.grid.x >= 0 && currCell.grid.x <= cols - 2 && currCell.grid.y === rows - 1) {
            let nextCell: MazeCellType = array[index + 1];
            nextCell.visited = true;
            await callback({currCell, nextCell});
        }

        if (currCell.grid.x >= 0 && currCell.grid.x <= cols - 2 && currCell.grid.y >= 0 && currCell.grid.y <= rows - 2) {
            let nextCell: MazeCellType = array[Math.random() <= 0.5 ? index + 1 : index + cols];
            nextCell.visited = true;
            await callback({currCell, nextCell});
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
     * @param speed
     * @param callback
     */
    public async mazeGrowTree(cells: MazeCellType[], speed: SpeedType,
                              callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let array: MazeCellType[] = Array.from(cells), stack: MazeCellType[] = [];
        let random: number = Math.floor(Math.random() * array.length);
        let currCell: MazeCellType = array[random], nextCell: MazeCellType;
        stack.push(currCell);

        while (stack.length > 0) {
            random = Math.floor(Math.random() * stack.length);
            currCell = stack[random];
            await callback({currCell});

            let neighbors: MazeCellType[] = DemoMazeGenerateAlgorithmService.neighbors(cells, currCell)
                .filter(neighbor => !neighbor.visited);

            if (neighbors.length > 0) {
                random = Math.floor(Math.random() * neighbors.length);
                nextCell = await neighbors[random];
                nextCell.visited = true;
                currCell.visited = true;
                stack.push(nextCell);
                await callback({currCell, nextCell});
            } else {
                stack.splice(random, 1);
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
        let array: MazeCellType[] = Array.from(cells);
        let currCell: MazeCellType = array[Math.floor(Math.random() * array.length)], nextCell: MazeCellType;
        currCell.visited = true;

        while (!array.every(item => item.visited)) {
            let neighbors: MazeCellType[] = DemoMazeGenerateAlgorithmService.neighbors(array, currCell)
                .filter(neighbor => !neighbor.visited);

            if (neighbors.length > 0) {
                nextCell = await neighbors[Math.floor(Math.random() * neighbors.length)];
                nextCell.visited = true;

                await callback({currCell, nextCell});
                currCell = await nextCell;
            } else {
                currCell = await DemoMazeGenerateAlgorithmService.hunterSeek(array, cols, rows, speed, callback);
            }

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
        let currCell: MazeCellType | undefined = undefined, nextCell: MazeCellType | undefined = undefined;

        for (let i = 0; i < rows; i++) {
            let start: number = i * cols, end: number = start + cols - 1;
            let rows: MazeCellType[] = array.slice(start, end + 1);
            await callback({scanner: i});

            for (let j = 0; j < rows.length; j++) {
                currCell = await rows[j];

                if (!currCell.visited) {
                    let neighbors: MazeCellType[] = DemoMazeGenerateAlgorithmService.neighbors(array, currCell)
                        .filter(neighbor => neighbor.visited);

                    if (neighbors.length > 0) {
                        nextCell = await neighbors[Math.floor(Math.random() * neighbors.length)];
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
     * @param speed
     * @param callback
     */
    public async mazeKruskal(cells: MazeCellType[], speed: SpeedType,
                             callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let array: MazeCellType[] = Array.from(cells), neighbors: MazeCellType[] = [];
        let currCell: MazeCellType, nextCell: MazeCellType, random: number = -1, weight: number = 0;

        while (!array.every(item => item.visited)) {
            random = Math.floor(Math.random() * array.length);
            currCell = await array[random];

            neighbors = DemoMazeGenerateAlgorithmService.neighbors(array, currCell);
            random = Math.floor(Math.random() * neighbors.length);
            nextCell = await neighbors[random];

            weight = await DemoMazeGenerateAlgorithmService.kruskalCheck(array, currCell, nextCell, weight, callback);
            await sleep(speed);
        }

        await callback({});
    }

    /**
     *
     * @param array
     * @param currCell
     * @param nextCell
     * @param weight
     * @param callback
     * @private
     */
    private static async kruskalCheck(array: MazeCellType[], currCell: MazeCellType, nextCell: MazeCellType,
                                      weight: number,
                                      callback: (_value: MazeReturnMeta) => void): Promise<number> {
        if (currCell.weight === 0 && nextCell.weight === 0) {
            weight += 1;

            currCell.weight = weight;
            currCell.visited = true;

            nextCell.weight = weight;
            nextCell.visited = true;

            await callback({currCell, nextCell});
        } else if (currCell.weight === 0 && nextCell.weight !== 0) {
            weight += 1;

            currCell.weight = weight;
            currCell.visited = true;

            await callback({currCell, nextCell});

            let maxWeight: number = Math.max(currCell.weight, nextCell.weight as number);
            await array.filter(item => item.weight === maxWeight).forEach(item =>
                item.weight = Math.min(currCell?.weight as number, nextCell.weight as number));
        } else if (currCell.weight !== 0 && nextCell.weight === 0) {
            nextCell.weight = currCell.weight;
            nextCell.visited = true;

            await callback({currCell, nextCell});
        } else {
            if (currCell.weight !== nextCell.weight) {
                await callback({currCell, nextCell});

                let maxWeight: number = Math.max(currCell.weight as number, nextCell.weight as number);
                await array.filter(item => item.weight === maxWeight).forEach(item =>
                    item.weight = Math.min(currCell.weight as number, nextCell.weight as number));
            }
        }

        return weight;
    }

    /**
     *
     * @param cells
     * @param speed
     * @param callback
     */
    public async mazePrim(cells: MazeCellType[], speed: SpeedType,
                          callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let array: MazeCellType[] = Array.from(cells), neighbors: MazeCellType[];
        let adjacents: MazeCellType[] = [array[Math.floor(Math.random() * array.length)]];
        let currCell: MazeCellType, nextCell: MazeCellType;

        while (!array.every(item => item.visited)) {
            currCell = adjacents.splice(Math.floor(Math.random() * adjacents.length), 1)[0];
            currCell.visited = true;

            neighbors = DemoMazeGenerateAlgorithmService.neighbors(array, currCell)
                .filter(neighbor => neighbor.visited);

            if (neighbors.length > 0) {
                nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
                callback({currCell, nextCell});
            }

            neighbors = DemoMazeGenerateAlgorithmService.neighbors(array, currCell)
                .filter(neighbor => !neighbor.visited);
            neighbors.forEach(neighbor => {
                if (adjacents.filter(adjacent =>
                    adjacent.grid.x === neighbor.grid.x && adjacent.grid.y === neighbor.grid.y).length === 0) {
                    adjacents.push(neighbor);
                }
            });
            await sleep(speed);
        }

        await callback({});
    }

    /**
     *
     * @param cells
     * @param minCol
     * @param maxCol
     * @param minRow
     * @param maxRow
     * @param speed
     * @param callback
     */
    public async mazeRandomDivider(cells: MazeCellType[], minCol: number, maxCol: number, minRow: number, maxRow: number,
                                   speed: SpeedType, callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let width: number = maxCol - minCol + 1, height: number = maxRow - minRow + 1;
        let direction: boolean = DemoMazeGenerateAlgorithmService.divideDirection(width, height);
        let neighbors: MazeCellType[], fstCells: MazeCellType[], sndCells: MazeCellType[];
        let currCell: MazeCellType = cells[Math.floor(Math.random() * cells.length)], nextCell: MazeCellType;

        neighbors = DemoMazeGenerateAlgorithmService.neighbors(cells, currCell)
            .filter(neighbor => {
                if (direction) {
                    return neighbor.grid.x === currCell.grid.x + 1 || neighbor.grid.x === currCell.grid.x - 1;
                } else {
                    return neighbor.grid.y === currCell.grid.y + 1 || neighbor.grid.y === currCell.grid.y - 1;
                }
            });

        if (neighbors.length > 0) {
            nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
            callback({currCell, nextCell});
            await sleep(speed);

            if (cells.length > 2) {
                if (direction) {
                    fstCells = cells.filter(item =>
                        item.grid.x >= minCol && item.grid.x <= Math.min(currCell.grid.x, nextCell.grid.x));
                    sndCells = cells.filter(item =>
                        item.grid.x >= Math.max(currCell.grid.x, nextCell.grid.x) && item.grid.x <= maxCol);
                    await this.mazeRandomDivider(fstCells, minCol, Math.min(currCell.grid.x, nextCell.grid.x),
                        minRow, maxRow, speed, callback);
                    await this.mazeRandomDivider(sndCells, Math.max(currCell.grid.x, nextCell.grid.x), maxCol,
                        minRow, maxRow, speed, callback);
                } else {
                    fstCells = cells.filter(item =>
                        item.grid.y >= minRow && item.grid.y <= Math.min(currCell.grid.y, nextCell.grid.y));
                    sndCells = cells.filter(item =>
                        item.grid.y >= Math.max(currCell.grid.y, nextCell.grid.y) && item.grid.y <= maxRow);
                    await this.mazeRandomDivider(fstCells, minCol, maxCol,
                        minRow, Math.min(currCell.grid.y, nextCell.grid.y), speed, callback);
                    await this.mazeRandomDivider(sndCells, minCol, maxCol,
                        Math.max(currCell.grid.y, nextCell.grid.y), maxRow, speed, callback);
                }
            }
        }

        callback({});
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
        let array: MazeCellType[] = Array.from(cells), currRow: MazeCellType[], prevRow: MazeCellType[] = [];
        let map: MazeSetType = {}, start: number, end: number;

        for (let i = 0; i < rows; i++) {
            start = i * cols;
            end = start + cols;
            currRow = array.slice(start, end);

            if (i > 0) {
                currRow = await DemoMazeGenerateAlgorithmService.winderGroup(currRow, map);
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

        Object.keys(map).forEach(key => map[key].length = 0);
        map = {};
        return row;
    }

    /**
     *
     * @param cells
     * @param speed
     * @param callback
     */
    public async mazeWalson(cells: MazeCellType[], speed: number,
                            callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let array: MazeCellType[] = Array.from(cells), unvisited: MazeCellType[] = array.filter(item => !item.visited);
        let startCell: MazeCellType, finalCell: MazeCellType;

        startCell = unvisited[Math.floor(Math.random() * unvisited.length)];
        unvisited = array.filter(item => item.grid.x !== startCell.grid.y && item.grid.y !== startCell.grid.y);
        finalCell = unvisited[Math.floor(Math.random() * unvisited.length)];
        finalCell.visited = true;

        await callback({startCell, finalCell});

        while (!array.every(item => item.visited)) {
            finalCell = await DemoMazeGenerateAlgorithmService.walsonSeek(array, startCell, finalCell, speed, callback);

            await callback({startCell, finalCell});
            await DemoMazeGenerateAlgorithmService.walsonMove(array, startCell, finalCell, speed, callback);

            unvisited = array.filter(item => !item.visited);
            startCell = unvisited[Math.floor(Math.random() * unvisited.length)];
            await sleep(speed);
        }

        await callback({});
    }

    /**
     *
     * @param array
     * @param startCell
     * @param finalCell
     * @param speed
     * @param callback
     * @private
     */
    private static async walsonSeek(array: MazeCellType[], startCell: MazeCellType, finalCell: MazeCellType, speed: number,
                                    callback: (__value: MazeReturnMeta) => void): Promise<MazeCellType> {
        let neighbors: MazeCellType[];
        let currCell: MazeCellType = startCell, nextCell: MazeCellType;

        while (!currCell.visited) {
            neighbors = DemoMazeGenerateAlgorithmService.neighbors(array, currCell);
            nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
            currCell.goto = DemoMazeGenerateAlgorithmService.matchNEWS(currCell, nextCell);

            await callback({currCell, startCell, finalCell});
            await sleep(speed);

            currCell = nextCell;
        }

        return currCell;
    }

    /**
     *
     * @param array
     * @param startCell
     * @param finalCell
     * @param speed
     * @param callback
     * @private
     */
    private static async walsonMove(array: MazeCellType[], startCell: MazeCellType, finalCell: MazeCellType, speed: number,
                                    callback: (__value: MazeReturnMeta) => void): Promise<void> {
        let currCell: MazeCellType = startCell, nextCell: MazeCellType | undefined;

        while (!(currCell.grid.x === finalCell.grid.x && currCell.grid.y === finalCell.grid.y)) {
            currCell.visited = true;
            nextCell = DemoMazeGenerateAlgorithmService.seekNEWS(array, currCell);

            if (nextCell) {
                nextCell.visited = true;
                await callback({currCell, nextCell});
                await sleep(speed);
                currCell = nextCell;
            }
        }

        await callback({currCell, finalCell});
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
     * @private
     */
    private static seekNEWS(cells: MazeCellType[], cell: MazeCellType): MazeCellType | undefined {
        return cells.find(item => {
            switch (cell.goto) {
                case 'n':
                    return item.grid.x === cell.grid.x && item.grid.y === cell.grid.y - 1;
                case 's':
                    return item.grid.x === cell.grid.x && item.grid.y === cell.grid.y + 1;
                case 'e':
                    return item.grid.x === cell.grid.x + 1 && item.grid.y === cell.grid.y;
                case 'w':
                    return item.grid.x === cell.grid.x - 1 && item.grid.y === cell.grid.y;
                default:
                    return false;
            }
        });
    }

    /**
     *
     * @param cells
     * @param cell
     * @private
     */
    private static neighbors(cells: MazeCellType[], cell: MazeCellType): MazeCellType[] {
        let array: MazeCellType[] = [];
        let upCell: MazeCellType | undefined = cells.find(item => item.grid.x === cell.grid.x && item.grid.y === cell.grid.y - 1);
        let downCell: MazeCellType | undefined = cells.find(item => item.grid.x === cell.grid.x && item.grid.y === cell.grid.y + 1);
        let leftCell: MazeCellType | undefined = cells.find(item => item.grid.x === cell.grid.x + 1 && item.grid.y === cell.grid.y);
        let rightCell: MazeCellType | undefined = cells.find(item => item.grid.x === cell.grid.x - 1 && item.grid.y === cell.grid.y);

        if (upCell) {
            array.push(upCell);
        }

        if (downCell) {
            array.push(downCell);
        }

        if (leftCell) {
            array.push(leftCell);
        }

        if (rightCell !== undefined) {
            array.push(rightCell);
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
     * @param speed
     * @param callback
     */
    public async mazeAStar(cells: MazePathType[], startX: number, startY: number, finalX: number, finalY: number,
                           speed: SpeedType, callback: (_value?: MazePathType) => void): Promise<void> {
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

                neighbors = DemoMazeSolveAlgorithmService.neighbors(cells, cell).filter(neighbor => !neighbor.visited);
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
     * @param speed
     * @param callback
     */
    public async mazeBackTracker(cells: MazePathType[], startX: number, startY: number, finalX: number, finalY: number,
                                 speed: SpeedType, callback: (_value?: MazePathType) => void): Promise<void> {
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

                neighbors = DemoMazeSolveAlgorithmService.neighbors(cells, currCell)
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
     * @param speed
     * @param callback
     */
    public async mazeBFS(cells: MazePathType[], startX: number, startY: number, finalX: number, finalY: number,
                         speed: SpeedType, callback: (_value?: MazePathType) => void): Promise<void> {
        let node: MazePathType = cells.filter(cell => cell.grid.x === startX && cell.grid.y === startY)[0];
        let queue: MazePathType[] = [node], neighbors: MazePathType[], cell: MazePathType | undefined;

        while (!(cell && cell.grid.x === finalX && cell.grid.y === finalY)) {
            cell = queue.shift();

            if (cell) {
                cell.visited = true;
                callback(cell);

                neighbors = DemoMazeSolveAlgorithmService.neighbors(cells, cell)
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
     * @param speed
     * @param callback
     */
    public async mazeDFS(cells: MazePathType[], startX: number, startY: number, finalX: number, finalY: number,
                         speed: SpeedType, callback: (_value?: MazePathType) => void): Promise<void> {
        let node: MazePathType = cells.filter(cell => cell.grid.x === startX && cell.grid.y === startY)[0];
        let stack: MazePathType[] = [node], neighbors: MazePathType[], cell: MazePathType | undefined;

        while (!(cell && cell.grid.x === finalX && cell.grid.y === finalY)) {
            cell = stack.pop();

            if (cell) {
                cell.visited = true;
                callback(cell);

                neighbors = DemoMazeSolveAlgorithmService.neighbors(cells, cell)
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
     * @param speed
     * @param callback
     */
    public async mazeDijkstra(cells: MazePathType[], startX: number, startY: number, finalX: number, finalY: number,
                              speed: SpeedType, callback: (_value?: MazePathType) => void): Promise<void> {
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

                neighbors = DemoMazeSolveAlgorithmService.neighbors(cells, cell).filter(neighbor => !neighbor.visited);
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
     * @param speed
     * @param callback
     */
    public async mazeFloodFill(cells: MazePathType[], startX: number, startY: number, finalX: number, finalY: number,
                               speed: SpeedType, callback: (_value?: MazePathType) => void): Promise<void> {
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
                neighbors = DemoMazeSolveAlgorithmService.neighbors(cells, cell).filter(neighbor => !neighbor.visited);
                neighbors.forEach(neighbor => neighbor.weight = weight + 1);
                queue.push(...neighbors);
            }

            await sleep(speed);
        }

        await DemoMazeSolveAlgorithmService.moveBack(cells, startCell, speed, callback);
    }

    /**
     *
     * @param cells
     * @param startX
     * @param startY
     * @param finalX
     * @param finalY
     * @param speed
     * @param callback
     */
    public async mazeGBFS(cells: MazePathType[], startX: number, startY: number, finalX: number, finalY: number,
                          speed: SpeedType, callback: (_value?: MazePathType) => void): Promise<void> {
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

                neighbors = DemoMazeSolveAlgorithmService.neighbors(cells, cell).filter(neighbor => !neighbor.visited);
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
     * @param speed
     * @param callback
     * @private
     */
    private static async moveBack(cells: MazePathType[], cell: MazePathType, speed: SpeedType,
                                  callback: (_value?: MazePathType) => void): Promise<void> {
        let neighbors: MazePathType[], weight: number = cell.weight as number;

        while (weight > 0) {
            neighbors = DemoMazeSolveAlgorithmService.neighbors(cells, cell)
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
     * @private
     */
    private static neighbors(cells: MazePathType[], cell: MazePathType): MazePathType[] {
        let neighbors: MazePathType[] = [], neighbor: MazePathType;

        if (!cell.grid.bt) {
            neighbor = cells.filter(item =>
                item.grid.x === cell.grid.x && item.grid.y === cell.grid.y - 1 && !item.grid.bb)[0];
            neighbors.push(neighbor);
        }

        if (!cell.grid.bb) {
            neighbor = cells.filter(item =>
                item.grid.x === cell.grid.x && item.grid.y === cell.grid.y + 1 && !item.grid.bt)[0];
            neighbors.push(neighbor);
        }

        if (!cell.grid.bl) {
            neighbor = cells.filter(item =>
                item.grid.x === cell.grid.x - 1 && item.grid.y === cell.grid.y && !item.grid.br)[0];
            neighbors.push(neighbor);
        }

        if (!cell.grid.br) {
            neighbor = cells.filter(item =>
                item.grid.x === cell.grid.x + 1 && item.grid.y === cell.grid.y && !item.grid.bl)[0];
            neighbors.push(neighbor);
        }

        return neighbors;
    }

}
