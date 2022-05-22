import {Injectable} from "@angular/core";

import {sleep} from "../../global/utils/global.utils";

export interface MazeCellLessType {

    x: number;
    y: number;
    bt: boolean;
    bb: boolean;
    bl: boolean;
    br: boolean;

}

export interface MazeCellFullType {

    grid: MazeCellLessType;
    visited?: boolean;
    connected?: boolean;
    weight?: number;
    goto?: WalsonMoveDirection;

}

export interface MazeReturnMeta {

    scanner?: number;
    currCell?: MazeCellFullType;
    nextCell?: MazeCellFullType;
    startCell?: MazeCellFullType;
    finalCell?: MazeCellFullType;

}

export type MazeSetType = { [key: string | number]: MazeCellFullType[] };
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
    public async mazeAldousBroder(cells: MazeCellFullType[], speed: number = 250,
                                  callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let array: MazeCellFullType[] = Array.from(cells);
        let currCell: MazeCellFullType = await array[Math.floor(Math.random() * array.length)], nextCell: MazeCellFullType;

        while (!array.every(item => item.visited)) {
            currCell.visited = true;
            await callback({currCell});

            let neighbors: MazeCellFullType[] = DemoMazeGenerateAlgorithmService.neighbors(array, currCell)
                .filter(neighbor => !neighbor.visited);

            if (neighbors.length > 0) {
                nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
                nextCell.visited = true;
                await callback({currCell, nextCell});

                currCell = nextCell;
            } else {
                let visited: MazeCellFullType[] = array.filter(item => item.visited);

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
     * @param list
     * @param cols
     * @param rows
     * @param dir
     * @param speed
     * @param callback
     */
    public async mazeBinaryTree(list: MazeCellFullType[], cols: number, rows: number, dir: BinaryTreeDirection,
                                speed: number = 250,
                                callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let array: MazeCellFullType[] = Array.from(list);

        for (let i = 0; i < array.length; i++) {
            let currCell: MazeCellFullType = array[i];
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
    private static async binaryTreeNW(array: MazeCellFullType[], currCell: MazeCellFullType, cols: number, rows: number,
                                      index: number,
                                      callback: (_value: MazeReturnMeta) => void): Promise<void> {
        if (currCell.grid.x >= 0 && currCell.grid.x <= cols - 2 && currCell.grid.y === 0) {
            let nextCell: MazeCellFullType = array[index + 1];
            nextCell.visited = true;
            await callback({currCell, nextCell});
        }

        if (currCell.grid.x === 0 && currCell.grid.y >= 1 && currCell.grid.y <= rows - 1) {
            let nextCell: MazeCellFullType = array[index - cols];
            nextCell.visited = true;
            await callback({currCell, nextCell});
        }

        if (currCell.grid.x >= 1 && currCell.grid.x <= cols - 1 && currCell.grid.y >= 1 && currCell.grid.y <= rows - 1) {
            let nextCell: MazeCellFullType = array[Math.random() <= 0.5 ? index - 1 : index - cols];
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
    private static async binaryTreeNE(array: MazeCellFullType[], currCell: MazeCellFullType, cols: number, rows: number, index: number,
                                      callback: (_value: MazeReturnMeta) => void): Promise<void> {
        if (currCell.grid.x >= 1 && currCell.grid.x <= cols - 1 && currCell.grid.y === 0) {
            let nextCell: MazeCellFullType = array[index - 1];
            nextCell.visited = true;
            await callback({currCell, nextCell});
        }

        if (currCell.grid.x === cols - 1 && currCell.grid.y >= 1 && currCell.grid.y <= rows - 1) {
            let nextCell: MazeCellFullType = array[index - cols];
            nextCell.visited = true;
            await callback({currCell, nextCell});
        }

        if (currCell.grid.x >= 0 && currCell.grid.x <= cols - 2 && currCell.grid.y >= 1 && currCell.grid.y <= rows - 1) {
            let nextCell: MazeCellFullType = array[Math.random() <= 0.5 ? index + 1 : index - cols];
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
    private static async binaryTreeSW(array: MazeCellFullType[], currCell: MazeCellFullType, cols: number, rows: number, index: number,
                                      callback: (_value: MazeReturnMeta) => void): Promise<void> {
        if (currCell.grid.x === 0 && currCell.grid.y >= 0 && currCell.grid.y <= rows - 2) {
            let nextCell: MazeCellFullType = array[index + cols];
            nextCell.visited = true;
            await callback({currCell, nextCell});
        }

        if (currCell.grid.x >= 1 && currCell.grid.x <= cols - 1 && currCell.grid.y === rows - 1) {
            let nextCell: MazeCellFullType = array[index - 1];
            nextCell.visited = true;
            await callback({currCell, nextCell});
        }

        if (currCell.grid.x >= 1 && currCell.grid.x <= cols - 1 && currCell.grid.y >= 0 && currCell.grid.y <= rows - 2) {
            let nextCell: MazeCellFullType = array[Math.random() <= 0.5 ? index - 1 : index + cols];
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
    private static async binaryTreeSE(array: MazeCellFullType[], currCell: MazeCellFullType, cols: number, rows: number, index: number,
                                      callback: (_value: MazeReturnMeta) => void): Promise<void> {
        if (currCell.grid.x === cols - 1 && currCell.grid.y >= 1 && currCell.grid.y <= rows - 1) {
            let nextCell: MazeCellFullType = array[index - cols];
            nextCell.visited = true;
            await callback({currCell, nextCell});
        }

        if (currCell.grid.x >= 0 && currCell.grid.x <= cols - 2 && currCell.grid.y === rows - 1) {
            let nextCell: MazeCellFullType = array[index + 1];
            nextCell.visited = true;
            await callback({currCell, nextCell});
        }

        if (currCell.grid.x >= 0 && currCell.grid.x <= cols - 2 && currCell.grid.y >= 0 && currCell.grid.y <= rows - 2) {
            let nextCell: MazeCellFullType = array[Math.random() <= 0.5 ? index + 1 : index + cols];
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
    public async mazeEller(cells: MazeCellFullType[], cols: number, rows: number, speed: number = 250,
                           callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let array: MazeCellFullType[] = Array.from(cells);
        let currRow: MazeCellFullType[], nextRow: MazeCellFullType[] = [];
        let sets: {[key: number | string]: number}, start: number, end: number;

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
    private static ellerBuild(currRow: MazeCellFullType[], start: number): {[key: string | number]: number} {
        let sets: {[key: string | number]: number} = {}, weight: number;

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
    private static async ellerROW(row: MazeCellFullType[], sets: {[key: string | number]: number},
                                  last: boolean, speed: number,
                                  callback: (_value: MazeReturnMeta) => void): Promise<{[key: string | number]: number}> {
        let currSet: number, nextSet: number;

        for (let i = 0; i < row.length; i ++) {
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
    private static async ellerCOL(currRow: MazeCellFullType[], nextRow: MazeCellFullType[],
                                  sets: {[key: string | number]: number}, speed: number,
                                  callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let weight: number;

        for (let i = currRow.length - 1; i >= 0; i --) {
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
    public async mazeGrowTree(cells: MazeCellFullType[], speed: SpeedType,
                              callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let array: MazeCellFullType[] = Array.from(cells), stack: MazeCellFullType[] = [];
        let random: number = Math.floor(Math.random() * array.length);
        let currCell: MazeCellFullType = array[random], nextCell: MazeCellFullType;
        stack.push(currCell);

        while (stack.length > 0) {
            random = Math.floor(Math.random() * stack.length);
            currCell = stack[random];
            await callback({currCell});

            let neighbors: MazeCellFullType[] = DemoMazeGenerateAlgorithmService.neighbors(cells, currCell)
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
    public async mazeHuntKill(cells: MazeCellFullType[], cols: number, rows: number, speed: number,
                              callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let array: MazeCellFullType[] = Array.from(cells);
        let currCell: MazeCellFullType = array[Math.floor(Math.random() * array.length)], nextCell: MazeCellFullType;
        currCell.visited = true;

        while (!array.every(item => item.visited)) {
            let neighbors: MazeCellFullType[] = DemoMazeGenerateAlgorithmService.neighbors(array, currCell)
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
    private static async hunterSeek(array: MazeCellFullType[], cols: number, rows: number, speed: number,
                                    callback: (_value: MazeReturnMeta) => void): Promise<MazeCellFullType> {
        let currCell: MazeCellFullType | undefined = undefined, nextCell: MazeCellFullType | undefined = undefined;

        for (let i = 0; i < rows; i++) {
            let start: number = i * cols, end: number = start + cols - 1;
            let rows: MazeCellFullType[] = array.slice(start, end + 1);
            await callback({scanner: i});

            for (let j = 0; j < rows.length; j++) {
                currCell = await rows[j];

                if (!currCell.visited) {
                    let neighbors: MazeCellFullType[] = DemoMazeGenerateAlgorithmService.neighbors(array, currCell)
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

        return currCell as MazeCellFullType;
    }

    /**
     *
     * @param cells
     * @param speed
     * @param callback
     */
    public async mazeKruskal(cells: MazeCellFullType[], speed: SpeedType,
                             callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let array: MazeCellFullType[] = Array.from(cells), neighbors: MazeCellFullType[] = [];
        let currCell: MazeCellFullType, nextCell: MazeCellFullType, random: number = -1, weight: number = 0;

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
    private static async kruskalCheck(array: MazeCellFullType[], currCell: MazeCellFullType, nextCell: MazeCellFullType,
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
    public async mazePrim(cells: MazeCellFullType[], speed: SpeedType,
                          callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let array: MazeCellFullType[] = Array.from(cells), stack: MazeCellFullType[] = [];
        stack.push(array[Math.floor(Math.random() * array.length)]);

        while (stack.length > 0) {
            stack = await DemoMazeGenerateAlgorithmService.primStep(array, stack, stack.length === 1, callback);
            await sleep(speed);
        }

        await callback({});
    }

    /**
     *
     * @param array
     * @param stack
     * @param init
     * @param callback
     * @private
     */
    private static async primStep(array: MazeCellFullType[], stack: MazeCellFullType[], init: boolean,
                                  callback: (_value: MazeReturnMeta) => void): Promise<MazeCellFullType[]> {
        let random: number = Math.floor(Math.random() * stack.length);
        let currCell: MazeCellFullType = stack.splice(random, 1)[0];
        currCell.visited = true;
        callback({currCell});

        let neighbors: MazeCellFullType[] = DemoMazeGenerateAlgorithmService.neighbors(array, currCell);
        let adjacents: MazeCellFullType[] = init ? neighbors.filter(neighbor => !neighbor.visited)
            : neighbors.filter(neighbor => neighbor.visited);

        stack.push(...neighbors);

        if (adjacents.length > 0) {
            random = Math.floor(Math.random() * adjacents.length);
            let nextCell: MazeCellFullType = await adjacents[random];
            nextCell.visited = true;

            await callback({currCell, nextCell});

            neighbors = DemoMazeGenerateAlgorithmService.neighbors(array, nextCell);
            stack.push(...neighbors);
        }

        return stack.filter(item => !item.visited);
    }

    /**
     *
     * @param cells
     * @param speed
     * @param callback
     */
    public async mazeRandomBackTracker(cells: MazeCellFullType[], speed: SpeedType,
                                       callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let array: MazeCellFullType[] = Array.from(cells);
        let currCell: MazeCellFullType | undefined = array[Math.floor(Math.random() * array.length)];
        let stack: MazeCellFullType[] = [currCell];

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
    public async mazeRandomDoubleBackTracker(cells: MazeCellFullType[], cols: number, rows: number, speed: SpeedType,
                                             callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let half: number = (cols - 1) >> 1, point: number = Math.floor(Math.random() * rows);
        let lhsArray: MazeCellFullType[] = Array.from(cells).filter(item => item.grid.x >= 0 && item.grid.x <= half)
            .filter(item => item.grid.y >= 0 && item.grid.y <= rows - 1);
        let rhsArray: MazeCellFullType[] = Array.from(cells).filter(item => item.grid.x >= half + 1 && item.grid.x <= cols - 1)
            .filter(item => item.grid.y >= 0 && item.grid.y <= rows - 1);
        let lhsHalf: MazeCellFullType[] = Array.from(cells).filter(item => item.grid.x === half)
            .filter(item => item.grid.y >= 0 && item.grid.y <= rows - 1);
        let rhsHalf: MazeCellFullType[] = Array.from(cells).filter(item => item.grid.x === half + 1)
            .filter(item => item.grid.y >= 0 && item.grid.y <= rows - 1);
        let lhsCurrCell: MazeCellFullType | undefined = lhsArray[Math.floor(Math.random() * lhsArray.length)];
        let rhsCurrCell: MazeCellFullType | undefined = rhsArray[Math.floor(Math.random() * rhsArray.length)];
        let lhsStack: MazeCellFullType[] = [lhsCurrCell], rhsStack: MazeCellFullType[] = [rhsCurrCell];

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
    private static rbtMerge(array: MazeCellFullType[], stack: MazeCellFullType[], currCell: MazeCellFullType | undefined,
                            callback: (_value: MazeReturnMeta) => void): void {
        if (currCell) {
            currCell.visited = true;
            callback({currCell});

            let neighbors: MazeCellFullType[] = DemoMazeGenerateAlgorithmService.neighbors(array, currCell)
                .filter(neighbor => !neighbor.visited);

            if (neighbors.length > 0) {
                stack.push(currCell);

                let nextCell: MazeCellFullType = neighbors[Math.floor(Math.random() * neighbors.length)];
                nextCell.visited = true;
                stack.push(nextCell);
                callback({currCell, nextCell});
            }
        }
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
    public async mazeRandomDivider(cells: MazeCellFullType[], minCol: number, maxCol: number, minRow: number, maxRow: number,
                                   speed: SpeedType, callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let width: number = maxCol - minCol + 1, height: number = maxRow - minRow + 1;
        let direction: number = DemoMazeGenerateAlgorithmService.divideDirection(width, height);
        let neighbors: MazeCellFullType[];
        let currCell: MazeCellFullType, nextCell: MazeCellFullType;

        currCell = cells[Math.floor(Math.random() * cells.length)];
        currCell.visited = true;
        await callback({currCell});

        neighbors = DemoMazeGenerateAlgorithmService.neighbors(cells, currCell)
            .filter(neighbor => {
                if (direction === 0) {
                    return neighbor.grid.x === currCell.grid.x + 1 || neighbor.grid.x === currCell.grid.x - 1;
                } else {
                    return neighbor.grid.y === currCell.grid.y + 1 || neighbor.grid.y === currCell.grid.y - 1;
                }
            });

        if (neighbors.length > 0) {
            nextCell = neighbors[0];
            nextCell.visited = true;
            await callback({currCell, nextCell})

            if (cells.length > 2) {
                if (direction === 0) {
                    let lhs: MazeCellFullType[] = cells.filter(item =>
                        item.grid.x >= minCol && item.grid.x <= Math.min(currCell.grid.x, nextCell.grid.x));
                    let rhs: MazeCellFullType[] = cells.filter(item =>
                        item.grid.x >= Math.max(currCell.grid.x, nextCell.grid.x) && item.grid.x <= maxCol);
                    await this.mazeRandomDivider(lhs, minCol, Math.min(currCell.grid.x, nextCell.grid.x), minRow, maxRow,
                        speed, callback);
                    await this.mazeRandomDivider(rhs, Math.max(currCell.grid.x, nextCell.grid.x), maxCol, minRow, maxRow,
                        speed, callback);
                } else {
                    let lhs: MazeCellFullType[] = cells.filter(item =>
                        item.grid.y >= minRow && item.grid.y <= Math.min(currCell.grid.y, nextCell.grid.y));
                    let rhs: MazeCellFullType[] = cells.filter(item =>
                        item.grid.y >= Math.max(currCell.grid.y, nextCell.grid.y) && item.grid.y <= maxRow);
                    await this.mazeRandomDivider(lhs, minCol, maxCol, minRow, Math.min(currCell.grid.y, nextCell.grid.y),
                        speed, callback);
                    await this.mazeRandomDivider(rhs, minCol, maxCol, Math.max(currCell.grid.y, nextCell.grid.y), maxRow,
                        speed, callback);
                }
            }
        }

        await sleep(speed);
    }

    /**
     *
     * @param width
     * @param height
     * @private
     */
    private static divideDirection(width: number, height: number): number {
        if (width < height) {
            return 1;
        } else if (width > height) {
            return 0;
        } else {
            return Math.floor(Math.random() * 2);
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
    public async mazeSideWinder(cells: MazeCellFullType[], cols: number, rows: number, speed: number,
                                callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let array: MazeCellFullType[] = Array.from(cells), currRow: MazeCellFullType[], prevRow: MazeCellFullType[] = [];
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
    private static async winderGroup(row: MazeCellFullType[], map: MazeSetType): Promise<MazeCellFullType[]> {
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
    public async mazeWalson(cells: MazeCellFullType[], speed: number,
                            callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let array: MazeCellFullType[] = Array.from(cells), unvisited: MazeCellFullType[] = array.filter(item => !item.visited);
        let startCell: MazeCellFullType, finalCell: MazeCellFullType;

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
    private static async walsonSeek(array: MazeCellFullType[], startCell: MazeCellFullType, finalCell: MazeCellFullType, speed: number,
                                    callback: (__value: MazeReturnMeta) => void): Promise<MazeCellFullType> {
        let neighbors: MazeCellFullType[];
        let currCell: MazeCellFullType = startCell, nextCell: MazeCellFullType;

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
    private static async walsonMove(array: MazeCellFullType[], startCell: MazeCellFullType, finalCell: MazeCellFullType, speed: number,
                                    callback: (__value: MazeReturnMeta) => void): Promise<void> {
        let currCell: MazeCellFullType = startCell, nextCell: MazeCellFullType | undefined;

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
    private static matchNEWS(currCell: MazeCellFullType, nextCell: MazeCellFullType): WalsonMoveDirection {
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
    private static seekNEWS(cells: MazeCellFullType[], cell: MazeCellFullType): MazeCellFullType | undefined {
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
    private static neighbors(cells: MazeCellFullType[], cell: MazeCellFullType): MazeCellFullType[] {
        let array: MazeCellFullType[] = [];
        let upCell: MazeCellFullType | undefined = cells.find(item => item.grid.x === cell.grid.x && item.grid.y === cell.grid.y - 1);
        let downCell: MazeCellFullType | undefined = cells.find(item => item.grid.x === cell.grid.x && item.grid.y === cell.grid.y + 1);
        let leftCell: MazeCellFullType | undefined = cells.find(item => item.grid.x === cell.grid.x + 1 && item.grid.y === cell.grid.y);
        let rightCell: MazeCellFullType | undefined = cells.find(item => item.grid.x === cell.grid.x - 1 && item.grid.y === cell.grid.y);

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

}
