import {Injectable} from "@angular/core";

import {sleep} from "../../global/utils/global.utils";

export interface MazeCellType {

    cell: HTMLElement | undefined;
    x: number;
    y: number;
    visited?: boolean;
    connected?: boolean;
    weight?: number;
    goto?: WalsonMoveDirection;

}

export interface MazeReturnMeta {

    scanner?: number;
    currCell?: MazeCellType;
    nextCell?: MazeCellType;
    startCell?: MazeCellType;
    finalCell?: MazeCellType;

}

export type MazeSetType = {[key: string | number]: MazeCellType[]};
export type BinaryTreeDirection = 'nw' | 'ne' | 'sw' | 'se';
export type WalsonMoveDirection = 'n' | 's' | 'e' | 'w' | '';
export type SpeedType = 5 | 10 | 100 | 250 | 500;

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

    public async mazeBinaryTree(list: MazeCellType[], cols: number, rows: number, direct: BinaryTreeDirection,
                                speed: number = 250,
                                callback: (_currCell?: MazeCellType, _nextCell?: MazeCellType) => void): Promise<void> {
        let array: MazeCellType[] = Array.from(list);

        for (let i = 0; i < array.length; i++) {
            let currCell: MazeCellType = array[i];
            currCell.visited = true;
            callback(currCell)

            switch (direct) {
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

        await callback();
    }

    private static async binaryTreeNW(array: MazeCellType[], currCell: MazeCellType, cols: number, rows: number, index: number,
                                      callback: (_currCell?: MazeCellType, _nextCell?: MazeCellType) => void): Promise<void> {
        if (currCell.x >= 0 && currCell.x <= cols - 2 && currCell.y === 0) {
            let nextCell: MazeCellType = array[index + 1];
            nextCell.visited = true;
            await callback(currCell, nextCell);
        }

        if (currCell.x === 0 && currCell.y >= 1 && currCell.y <= rows - 1) {
            let nextCell: MazeCellType = array[index - cols];
            nextCell.visited = true;
            await callback(currCell, nextCell);
        }

        if (currCell.x >= 1 && currCell.x <= cols - 1 && currCell.y >= 1 && currCell.y <= rows - 1) {
            let nextCell: MazeCellType = array[Math.random() <= 0.5 ? index - 1 : index - cols];
            nextCell.visited = true;
            await callback(currCell, nextCell);
        }
    }

    private static async binaryTreeNE(array: MazeCellType[], currCell: MazeCellType, cols: number, rows: number, index: number,
                                      callback: (_currCell?: MazeCellType, _nextCell?: MazeCellType) => void): Promise<void> {
        if (currCell.x >= 1 && currCell.x <= cols - 1 && currCell.y === 0) {
            let nextCell: MazeCellType = array[index - 1];
            nextCell.visited = true;
            await callback(currCell, nextCell);
        }

        if (currCell.x === cols - 1 && currCell.y >= 1 && currCell.y <= rows - 1) {
            let nextCell: MazeCellType = array[index - cols];
            nextCell.visited = true;
            await callback(currCell, nextCell);
        }

        if (currCell.x >= 0 && currCell.x <= cols - 2 && currCell.y >= 1 && currCell.y <= rows - 1) {
            let nextCell: MazeCellType = array[Math.random() <= 0.5 ? index + 1 : index - cols];
            nextCell.visited = true;
            await callback(currCell, nextCell);
        }
    }

    private static async binaryTreeSW(array: MazeCellType[], currCell: MazeCellType, cols: number, rows: number, index: number,
                                      callback: (_currCell?: MazeCellType, _nextCell?: MazeCellType) => void): Promise<void> {
        if (currCell.x === 0 && currCell.y >= 0 && currCell.y <= rows - 2) {
            let nextCell: MazeCellType = array[index + cols];
            nextCell.visited = true;
            await callback(currCell, nextCell);
        }

        if (currCell.x >= 1 && currCell.x <= cols - 1 && currCell.y === rows - 1) {
            let nextCell: MazeCellType = array[index - 1];
            nextCell.visited = true;
            await callback(currCell, nextCell);
        }

        if (currCell.x >= 1 && currCell.x <= cols - 1 && currCell.y >= 0 && currCell.y <= rows - 2) {
            let nextCell: MazeCellType = array[Math.random() <= 0.5 ? index - 1 : index + cols];
            nextCell.visited = true;
            await callback(currCell, nextCell);
        }
    }

    private static async binaryTreeSE(array: MazeCellType[], currCell: MazeCellType, cols: number, rows: number, index: number,
                                      callback: (_currCell?: MazeCellType, _nextCell?: MazeCellType) => void): Promise<void> {
        if (currCell.x === cols - 1 && currCell.y >= 1 && currCell.y <= rows - 1) {
            let nextCell: MazeCellType = array[index - cols];
            nextCell.visited = true;
            await callback(currCell, nextCell);
        }

        if (currCell.x >= 0 && currCell.x <= cols - 2 && currCell.y === rows - 1) {
            let nextCell: MazeCellType = array[index + 1];
            nextCell.visited = true;
            await callback(currCell, nextCell);
        }

        if (currCell.x >= 0 && currCell.x <= cols - 2 && currCell.y >= 0 && currCell.y <= rows - 2) {
            let nextCell: MazeCellType = array[Math.random() <= 0.5 ? index + 1 : index + cols];
            nextCell.visited = true;
            await callback(currCell, nextCell);
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
        let array: MazeCellType[] = Array.from(cells), currRow: MazeCellType[], nextRow: MazeCellType[];
        let start: number = -1, end: number = -1;

        for (let i = 0; i < rows; i++) {
            start = i * cols;
            end = start + cols - 1;
            currRow = array.slice(start, end + 1);

            if (i === rows - 1) {
                await DemoMazeGenerateAlgorithmService.ellerLast(currRow, speed, callback);
            } else {
                nextRow = array.slice(end + 1, end + 1 + cols);
                await DemoMazeGenerateAlgorithmService.ellerLR(currRow, speed, callback);
                await DemoMazeGenerateAlgorithmService.ellerTD(currRow, nextRow, speed, callback);
            }

            await sleep(speed);
        }

        callback({});
    }

    /**
     *
     * @param row
     * @param speed
     * @param callback
     * @private
     */
    private static async ellerLast(row: MazeCellType[], speed: number,
                                   callback: (_value: MazeReturnMeta) => void): Promise<void> {
        for (let i = 0; i < row.length; i++) {
            if (i + 1 < row.length) {
                callback({currCell: row[i], nextCell: row[i + 1]});
            } else {
                callback({currCell: row[i]});
            }
            await sleep(speed);
        }
    }

    /**
     *
     * @param row
     * @param speed
     * @param callback
     * @private
     */
    private static async ellerLR(row: MazeCellType[], speed: number,
                                 callback: (_value: MazeReturnMeta) => void): Promise<void> {
        row[0].weight = row[0].weight === -1 ? 1 : row[0].weight;

        for (let i = 0; i < row.length; i++) {
            if (row[i].weight === -1 && i - 1 >= 0) {
                row[i].weight = row[i - 1].weight as number + 1;
            }
        }

        for (let i = 0; i < row.length; i++) {
            if (i + 1 < row.length) {
                if (row[i].weight === row[i + 1].weight) {
                    row[i + 1].weight = row[i].weight;
                    callback({currCell: row[i], nextCell: row[i + 1]});
                } else {
                    if (Math.random() <= 0.5) {
                        row[i + 1].weight = row[i].weight;
                        callback({currCell: row[i], nextCell: row[i + 1]});
                    }
                }
            } else {
                callback({currCell: row[i]});
            }

            await sleep(speed);
        }
    }

    /**
     *
     * @param currRow
     * @param nextRow
     * @param speed
     * @param callback
     * @private
     */
    private static async ellerTD(currRow: MazeCellType[], nextRow: MazeCellType[], speed: number,
                                 callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let map: {[key: number | string]: MazeCellType[]} = {};
        let values: MazeCellType[], keys: string[], key: number, index: number, idx: number = currRow.length - 1;

        for (let i = 0; i < currRow.length; i++) {
            key = currRow[i].weight as number;

            if (!map[key]) {
                map[key] = [currRow[i]];
            } else {
                map[key].push(currRow[i]);
            }
        }

        keys = Object.keys(map);

        for (let i = keys.length - 1; i >= 0; i--) {
            values = map[keys[i]];
            index = Math.floor(Math.random() * values.length);
            values[index].connected = true;

            for (let j = values.length - 1; j >= 0; j--) {
                if (values[j].connected) {
                    callback({currCell: currRow[idx], nextCell: nextRow[idx]});
                } else {
                    callback({currCell: currRow[idx]});
                }

                idx--;
                await sleep(speed);
            }
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
        let array: MazeCellType[] = Array.from(cells), stack: MazeCellType[] = [];
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
    private static async primStep(array: MazeCellType[], stack: MazeCellType[], init: boolean,
                                  callback: (_value: MazeReturnMeta) => void): Promise<MazeCellType[]> {
        let random: number = Math.floor(Math.random() * stack.length);
        let currCell: MazeCellType = stack.splice(random, 1)[0];
        currCell.visited = true;
        callback({currCell});

        let neighbors: MazeCellType[] = DemoMazeGenerateAlgorithmService.neighbors(array, currCell);
        let adjacents: MazeCellType[] = init ? neighbors.filter(neighbor => !neighbor.visited)
            : neighbors.filter(neighbor => neighbor.visited);

        stack.push(...neighbors);

        if (adjacents.length > 0) {
            random = Math.floor(Math.random() * adjacents.length);
            let nextCell: MazeCellType = await adjacents[random];
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
    public async mazeRandomBackTracker(cells: MazeCellType[], speed: SpeedType,
                                       callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let array: MazeCellType[] = Array.from(cells), stack: MazeCellType[] = [], neighbors: MazeCellType[];
        let random: number = Math.floor(Math.random() * array.length);
        let currCell: MazeCellType | undefined = array[random], nextCell: MazeCellType;
        stack.push(currCell);

        while (!array.every(item => item.visited)) {
            currCell = await stack.pop();

            if (currCell !== undefined) {
                currCell.visited = true;
                await callback({currCell});

                neighbors = DemoMazeGenerateAlgorithmService.neighbors(array, currCell)
                    .filter(neighbor => !neighbor.visited);

                if (neighbors.length > 0) {
                    stack.push(currCell);
                    random = Math.floor(Math.random() * neighbors.length);
                    nextCell = await neighbors[random];
                    nextCell.visited = true;
                    stack.push(nextCell);
                    await callback({currCell, nextCell});
                }
            }

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
        let direction: number = DemoMazeGenerateAlgorithmService.divideDirection(width, height);
        let neighbors: MazeCellType[];
        let currCell: MazeCellType, nextCell: MazeCellType;

        currCell = cells[Math.floor(Math.random() * cells.length)];
        currCell.visited = true;
        await callback({currCell});

        neighbors = DemoMazeGenerateAlgorithmService.neighbors(cells, currCell)
            .filter(neighbor => {
                if (direction === 0) {
                    return neighbor.x === currCell.x + 1 || neighbor.x === currCell.x - 1;
                } else {
                    return neighbor.y === currCell.y + 1 || neighbor.y === currCell.y - 1;
                }
            });

        if (neighbors.length > 0) {
            nextCell = neighbors[0];
            nextCell.visited = true;
            await callback({currCell, nextCell})

            if (cells.length > 2) {
                if (direction === 0) {
                    let lhs: MazeCellType[] = cells.filter(item =>
                        item.x >= minCol && item.x <= Math.min(currCell.x, nextCell.x));
                    let rhs: MazeCellType[] = cells.filter(item =>
                        item.x >= Math.max(currCell.x, nextCell.x) && item.x <= maxCol);
                    await this.mazeRandomDivider(lhs, minCol, Math.min(currCell.x, nextCell.x), minRow, maxRow,
                        speed, callback);
                    await this.mazeRandomDivider(rhs, Math.max(currCell.x, nextCell.x), maxCol, minRow, maxRow,
                        speed, callback);
                } else {
                    let lhs: MazeCellType[] = cells.filter(item =>
                        item.y >= minRow && item.y <= Math.min(currCell.y, nextCell.y));
                    let rhs: MazeCellType[] = cells.filter(item =>
                        item.y >= Math.max(currCell.y, nextCell.y) && item.y <= maxRow);
                    await this.mazeRandomDivider(lhs, minCol, maxCol, minRow, Math.min(currCell.y, nextCell.y),
                        speed, callback);
                    await this.mazeRandomDivider(rhs, minCol, maxCol, Math.max(currCell.y, nextCell.y), maxRow,
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
    public async mazeWalson(cells: MazeCellType[], speed: number, callback: (_value: MazeReturnMeta) => void): Promise<void> {
        let array: MazeCellType[] = Array.from(cells), unvisited: MazeCellType[] = array.filter(item => !item.visited);
        let startCell: MazeCellType, finalCell: MazeCellType;

        startCell = unvisited[Math.floor(Math.random() * unvisited.length)];
        unvisited = array.filter(item => item.x !== startCell.y && item.y !== startCell.y);
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

        while (!(currCell.x === finalCell.x && currCell.y === finalCell.y)) {
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

    private static matchNEWS(currCell: MazeCellType, nextCell: MazeCellType): WalsonMoveDirection {
        if (currCell.x === nextCell.x && currCell.y + 1 === nextCell.y) {
            return 's';
        }

        if (currCell.x === nextCell.x && currCell.y - 1 === nextCell.y) {
            return 'n';
        }

        if (currCell.x + 1 === nextCell.x && currCell.y === nextCell.y) {
            return 'e';
        }

        if (currCell.x - 1 === nextCell.x && currCell.y === nextCell.y) {
            return 'w';
        }

        return '';
    }

    private static seekNEWS(cells: MazeCellType[], cell: MazeCellType): MazeCellType | undefined {
        return cells.find(item => {
            switch (cell.goto) {
                case 'n':
                    return item.x === cell.x && item.y === cell.y - 1;
                case 's':
                    return item.x === cell.x && item.y === cell.y + 1;
                case 'e':
                    return item.x === cell.x + 1 && item.y === cell.y;
                case 'w':
                    return item.x === cell.x - 1 && item.y === cell.y;
                default:
                    return false;
            }
        });
    }

    private static neighbors(cells: MazeCellType[], cell: MazeCellType): MazeCellType[] {
        let array: MazeCellType[] = [];
        let upCell: MazeCellType | undefined = cells.find(item => item.x === cell.x && item.y === cell.y - 1);
        let downCell: MazeCellType | undefined = cells.find(item => item.x === cell.x && item.y === cell.y + 1);
        let leftCell: MazeCellType | undefined = cells.find(item => item.x === cell.x + 1 && item.y === cell.y);
        let rightCell: MazeCellType | undefined = cells.find(item => item.x === cell.x - 1 && item.y === cell.y);

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
