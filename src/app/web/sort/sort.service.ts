import {Injectable} from "@angular/core";

import {sleep} from "../../global/utils/global.utils";

export interface SortReturnMeta {

    dataset: DataType[];
    pivotIndex?: number;
    currIndex?: number;
    nextIndex?: number;
    lhsPivotIndex?: number;
    rhsPivotIndex?: number;
    lhsCurrIndex?: number;
    lhsNextIndex?: number;
    rhsCurrIndex?: number;
    rhsNextIndex?: number;
    swapCount?: number;
    auxCount?: number;

}

export interface BSTNode {

    mid: DataType;
    lhs: BSTNode | null;
    rhs: BSTNode | null;

}

export type DualPivotType = { fst: number, snd: number };
export type DataType = { value: number, ratio: number, digit?: number, exist?: boolean };
export type RangeType = { lhs: number, rhs: number };
export type OrderType = 'ascent' | 'descent';
export type SpeedType = 1 | 10 | 100 | 250 | 500;
export type BaseType = 2 | 8 | 10 | 16;

@Injectable()
export class DemoSortUtilityService {

    public PROTOTYPE_DATASET: number[] = Array.from({length: 1024}).map((_, index) => index + 1);

    public binarySearch(dataset: DataType[], lhs: number, rhs: number, data: DataType, order: OrderType): number {
        let mid: number;

        while (lhs <= rhs) {
            mid = Math.floor((rhs - lhs) * 0.5 + lhs);

            if (order === 'ascent' && dataset[mid].value < data.value) {
                lhs = mid + 1;
            } else if (order === 'ascent' && dataset[mid].value > data.value) {
                rhs = mid - 1;
            } else if (order === 'descent' && dataset[mid].value > data.value) {
                lhs = mid + 1;
            } else if (order === 'descent' && dataset[mid].value < data.value) {
                rhs = mid - 1;
            } else {
                return mid;
            }
        }

        return lhs;
    }

    public calcDigits(data: DataType): number {
        let digits: number = 1, value: number = Math.floor(data.value * 0.1);

        while (value !== 0) {
            digits += 1;
            value = Math.floor(value * 0.1);
        }

        return digits;
    }

    public calcDigit(data: DataType, digit: number): number {
        if (digit === 1) {
            return data.value % 10;
        } else {
            let value: number = data.value % (10 ** digit);
            return Math.floor(value / (10 ** (digit - 1)));
        }
    }

    public async complete(length: number, speed: SpeedType, callback: (_value: SortReturnMeta) => void): Promise<void> {
        for (let i = 0; i < length; i++) {
            await callback({dataset: [], currIndex: i})
            await sleep(speed);
        }

        await callback({dataset: []});
    }

    public async merge(dataset: DataType[], lhs: number, mid: number, rhs: number, count: number,
                       speed: SpeedType, order: OrderType,
                       callback: (_value: SortReturnMeta) => void): Promise<void> {
        let i: number = 0, j: number = 0, k: number = lhs;
        let lhsArray: DataType[] = new Array(mid - lhs + 1);
        let rhsArray: DataType[] = new Array(rhs - mid);

        for (let x = 0; x < lhsArray.length; x++) {
            lhsArray[x] = dataset[lhs + x];
            count += 1;
            callback({dataset, currIndex: x + lhs, auxCount: count});
            await sleep(speed);
        }

        for (let x = 0; x < rhsArray.length; x++) {
            rhsArray[x] = dataset[mid + 1 + x];
            count += 1;
            callback({dataset, currIndex: x + mid + 1, auxCount: count});
            await sleep(speed);
        }

        while (i < lhsArray.length && j < rhsArray.length) {
            if (order === 'ascent' && lhsArray[i].value <= rhsArray[j].value) {
                dataset[k] = lhsArray[i++];
            } else if (order === 'descent' && lhsArray[i].value >= rhsArray[j].value) {
                dataset[k] = lhsArray[i++];
            } else {
                dataset[k] = rhsArray[j++];
            }

            count += 1;
            await callback({dataset, pivotIndex: k++, currIndex: i + lhs, nextIndex: j + mid, auxCount: count});
            await sleep(speed);
        }

        while (i < lhsArray.length) {
            count += 1;
            dataset[k++] = lhsArray[i++];
            await callback({dataset, pivotIndex: k, currIndex: i + lhs, nextIndex: j + mid, auxCount: count});
            await sleep(speed);
        }

        while (j < rhsArray.length) {
            count += 1;
            dataset[k++] = rhsArray[j++];
            await callback({dataset, pivotIndex: k, currIndex: i + lhs, nextIndex: j + mid, auxCount: count});
            await sleep(speed);
        }

        lhsArray.length = 0;
        rhsArray.length = 0;
        await callback({dataset, auxCount: count});
    }

    public min(dataset: DataType[], lhs: number, rhs: number): number {
        if (lhs < rhs) {
            let mid: number = Math.floor((rhs - lhs) * 0.5 + lhs);
            let fst: number = this.min(dataset, lhs, mid);
            let snd: number = this.min(dataset, mid + 1, rhs);
            return dataset[fst].value <= dataset[snd].value ? dataset[fst].value <= dataset[mid].value ? fst : mid : snd;
        }

        return dataset[lhs].value <= dataset[rhs].value ? lhs : rhs;
    }

    public max(dataset: DataType[], lhs: number, rhs: number): number {
        if (lhs < rhs) {
            let mid: number = Math.floor((rhs - lhs) * 0.5 + lhs);
            let fst: number = this.max(dataset, lhs, mid);
            let snd: number = this.max(dataset, mid + 1, rhs);
            return dataset[fst].value >= dataset[snd].value ? dataset[fst].value >= dataset[mid].value ? fst : mid : snd;
        }

        return dataset[lhs].value >= dataset[rhs].value ? lhs : rhs;
    }

    public ordered(dataset: DataType[], order: OrderType): boolean {
        for (let i = 0; i + 1 < dataset.length; i++) {
            if (order === 'ascent' && dataset[i].value > dataset[i + 1].value) {
                return false;
            }

            if (order === 'descent' && dataset[i].value < dataset[i + 1].value) {
                return false;
            }
        }

        return true;
    }

    public async shuffle(dataset: DataType[], callback: (_value: SortReturnMeta) => void): Promise<void> {
        let i: number = 0, j: number = dataset.length - 1, k: number;

        while (i < j) {
            k = Math.floor(Math.random() * dataset.length);

            if (i !== k) {
                await this.swap(dataset, i, k);
            }

            k = Math.floor(Math.random() * dataset.length);

            if (j !== k) {
                await this.swap(dataset, j, k);
            }

            await callback({dataset, lhsPivotIndex: i, rhsPivotIndex: k});
            i++;
            j--;
            await sleep(10);
        }

        await callback({dataset});
    }

    public swap(dataset: DataType[], i: number, j: number): void {
        let temp: DataType = dataset[i];
        dataset[i] = dataset[j];
        dataset[j] = temp;
    }

    public test(dataset: DataType[], lhs: number, rhs: number): number {
        if (lhs < rhs) {
            let mid: number = Math.floor((rhs - lhs) * 0.5 + lhs);
            let fst: number = this.test(dataset, lhs, mid - 1);
            let snd: number = this.test(dataset, mid + 1, rhs);
            return dataset[fst].value <= dataset[snd].value ? dataset[fst].value <= dataset[mid].value ? fst : mid : snd;
        }

        return dataset[lhs].value <= dataset[rhs].value ? lhs : rhs;
    }

}

@Injectable()
export class DemoOtherSortService {

    constructor(private _service: DemoSortUtilityService) {
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByBitonicBU(dataset: DataType[], speed: SpeedType, order: OrderType,
                                 callback: (_value: SortReturnMeta) => void): Promise<void> {
        let count: number = 0, map: { [key: number | string]: boolean };

        for (let i = 2; i <= dataset.length; i *= 2) {
            map = DemoOtherSortService.bitonicDirection(dataset.length >> 1, i >> 1);

            for (let cnt = i; cnt > 1; cnt = cnt >> 1) {
                for (let low = 0; low < dataset.length; low += cnt) {
                    await this.bitonicMergeBU(dataset, low, cnt, map[low >> 1], count, speed, order, value => {
                        count = value.swapCount as number;
                        callback({...value, swapCount: count});
                    });
                }
            }
        }

        callback({dataset, swapCount: count});
    }

    /**
     *
     * @param cnt
     * @param gap
     * @private
     */
    private static bitonicDirection(cnt: number, gap: number): any {
        let map: { [key: number | string]: boolean } = {}, flag: boolean = true;

        for (let i = 0; i < cnt; i += gap) {
            for (let j = i; j < i + gap; j++) {
                map[j] = flag;
            }

            flag = !flag;
        }

        return map;
    }

    /**
     *
     * @param dataset
     * @param low
     * @param cnt
     * @param dir
     * @param count
     * @param speed
     * @param order
     * @param callback
     * @private
     */
    private async bitonicMergeBU(dataset: DataType[], low: number, cnt: number, dir: boolean, count: number,
                                 speed: SpeedType, order: OrderType,
                                 callback: (_value: SortReturnMeta) => void): Promise<number> {
        let gap: number = cnt >> 1;

        for (let i = low; i < low + gap; i++) {
            if (order === 'ascent' && dataset[i].value > dataset[i + gap].value && dir) {
                count += 1;
                this._service.swap(dataset, i, i + gap);
                callback({dataset, currIndex: i, nextIndex: i + gap, swapCount: count});
            } else if (order === 'ascent' && dataset[i].value < dataset[i + gap].value && !dir) {
                count += 1;
                this._service.swap(dataset, i, i + gap);
                callback({dataset, currIndex: i, nextIndex: i + gap, swapCount: count});
            } else if (order === 'descent' && dataset[i].value < dataset[i + gap].value && dir) {
                count += 1;
                this._service.swap(dataset, i, i + gap);
                callback({dataset, currIndex: i, nextIndex: i + gap, swapCount: count});
            } else if (order === 'descent' && dataset[i].value > dataset[i + gap].value && !dir) {
                count += 1;
                this._service.swap(dataset, i, i + gap);
                callback({dataset, currIndex: i, nextIndex: i + gap, swapCount: count});
            } else {
                callback({dataset, currIndex: i, swapCount: count});
            }

            await sleep(speed);
        }

        return gap;
    }

    /**
     *
     * @param dataset
     * @param low
     * @param cnt
     * @param dir
     * @param count
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByBitonicTD(dataset: DataType[], low: number, cnt: number, dir: boolean, count: number,
                                 speed: SpeedType, order: OrderType,
                                 callback: (_value: SortReturnMeta) => void): Promise<void> {
        if (cnt > 1) {
            let k: number = cnt >> 1;
            await this.sortByBitonicTD(dataset, low, k, true, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await this.sortByBitonicTD(dataset, low + k, k, false, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await this.bitonicMergeTD(dataset, low, cnt, dir, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
        }

        callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param low
     * @param cnt
     * @param dir
     * @param count
     * @param speed
     * @param order
     * @param callback
     * @private
     */
    private async bitonicMergeTD(dataset: DataType[], low: number, cnt: number, dir: boolean, count: number,
                                 speed: SpeedType, order: OrderType,
                                 callback: (_value: SortReturnMeta) => void): Promise<void> {
        if (cnt > 1) {
            let k: number = await this.bitonicMergeBU(dataset, low, cnt, dir, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            })
            await this.bitonicMergeTD(dataset, low, k, dir, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await this.bitonicMergeTD(dataset, low + k, k, dir, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
        }
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByBogo(dataset: DataType[], speed: SpeedType, order: OrderType,
                            callback: (_value: SortReturnMeta) => void): Promise<void> {
        let count: number = 0;

        while (!this._service.ordered(dataset, order)) {
            for (let i = 0; i < dataset.length; i++) {
                let j: number = Math.floor(Math.random() * dataset.length);

                if (i !== j) {
                    count += 1;
                    this._service.swap(dataset, i, j);
                }

                callback({dataset, currIndex: i, nextIndex: j, swapCount: count});
                await sleep(speed);
            }
        }

        await callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByBogoBubble(dataset: DataType[], speed: SpeedType, order: OrderType,
                                  callback: (_value: SortReturnMeta) => void): Promise<void> {
        let pivot: number = dataset.length - 1, index: number = -1, j: number, count: number = 0;

        while (pivot > 0) {
            for (let i = 0; i < pivot; i++) {
                j = Math.floor(Math.random() * (pivot - i + 1) + i);

                if (order === 'ascent' && dataset[i].value > dataset[j].value) {
                    count += 1;
                    this._service.swap(dataset, i, j);
                }

                if (order === 'descent' && dataset[i].value < dataset[j].value) {
                    count += 1;
                    this._service.swap(dataset, i, j);
                }

                callback({dataset, pivotIndex: pivot, currIndex: i, nextIndex: j, swapCount: count});
                await sleep(speed);
            }

            if (order === 'ascent') {
                index = this._service.max(dataset, 0, pivot - 1);
            }

            if (order === 'descent') {
                index = this._service.min(dataset, 0, pivot - 1);
            }

            if (order === 'ascent' && dataset[index].value <= dataset[pivot].value) {
                pivot--;
            } else if (order === 'descent' && dataset[index].value >= dataset[pivot].value) {
                pivot--;
            } else {
                if (order === 'ascent' && dataset[pivot - 1].value > dataset[pivot].value) {
                    count += 1;
                    this._service.swap(dataset, pivot, pivot - 1);
                    callback({dataset, currIndex: pivot, nextIndex: pivot - 1, swapCount: count});
                }

                if (order === 'descent' && dataset[pivot - 1].value < dataset[pivot].value) {
                    count += 1;
                    this._service.swap(dataset, pivot, pivot - 1);
                    callback({dataset, currIndex: pivot, nextIndex: pivot - 1, swapCount: count});
                }
            }
        }

        await callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByBogoCockTail(dataset: DataType[], speed: SpeedType, order: OrderType,
                                    callback: (_value: SortReturnMeta) => void): Promise<void> {
        let lhs: number = 0, rhs: number = dataset.length - 1, index: number = -1, j: number, count: number = 0;

        while (lhs !== rhs) {
            for (let i = lhs; i <= rhs - 1; i++) {
                j = Math.floor(Math.random() * (rhs - i + 1) + i);

                if (order === 'ascent' && dataset[i].value > dataset[j].value) {
                    count += 1;
                    this._service.swap(dataset, i, j);
                }

                if (order === 'descent' && dataset[i].value < dataset[j].value) {
                    count += 1;
                    this._service.swap(dataset, i, j);
                }

                callback({dataset, pivotIndex: rhs, currIndex: i, nextIndex: j, swapCount: count});
                await sleep(speed);
            }

            if (order === 'ascent') {
                index = this._service.max(dataset, lhs, rhs - 1);
            }

            if (order === 'descent') {
                index = this._service.min(dataset, lhs, rhs - 1);
            }

            if (order === 'ascent' && dataset[index].value <= dataset[rhs].value) {
                rhs--;
            } else if (order === 'descent' && dataset[index].value >= dataset[rhs].value) {
                rhs--;
            } else {
                if (order === 'ascent' && dataset[rhs - 1].value > dataset[rhs].value) {
                    count += 1;
                    this._service.swap(dataset, rhs, rhs - 1);
                    callback({dataset, currIndex: rhs, nextIndex: rhs - 1, swapCount: count});
                }

                if (order === 'descent' && dataset[rhs - 1].value < dataset[rhs].value) {
                    count += 1;
                    this._service.swap(dataset, rhs, rhs - 1);
                    callback({dataset, currIndex: rhs, nextIndex: rhs - 1, swapCount: count});
                }
            }

            for (let i = rhs - 1; i >= lhs; i--) {
                j = Math.floor(Math.random() * (i - lhs) + lhs);

                if (order === 'ascent' && dataset[i].value < dataset[j].value) {
                    count += 1;
                    this._service.swap(dataset, i, j);
                }

                if (order === 'descent' && dataset[i].value > dataset[j].value) {
                    count += 1;
                    this._service.swap(dataset, i, j);
                }

                callback({dataset, pivotIndex: lhs, currIndex: i, nextIndex: j, swapCount: count});
                await sleep(speed);
            }

            if (order === 'ascent') {
                index = this._service.min(dataset, lhs, rhs - 1);
            }

            if (order === 'descent') {
                index = this._service.max(dataset, lhs, rhs - 1);
            }

            if (order === 'ascent' && dataset[index].value >= dataset[lhs].value) {
                lhs++;
            } else if (order === 'descent' && dataset[index].value <= dataset[lhs].value) {
                lhs++;
            } else {
                if (order === 'ascent' && dataset[lhs + 1].value < dataset[lhs].value) {
                    count += 1;
                    this._service.swap(dataset, lhs, lhs + 1);
                    callback({dataset, currIndex: lhs, nextIndex: lhs + 1, swapCount: count});
                }

                if (order === 'descent' && dataset[lhs + 1].value > dataset[lhs].value) {
                    count += 1;
                    this._service.swap(dataset, lhs, lhs + 1);
                    callback({dataset, currIndex: lhs, nextIndex: lhs + 1, swapCount: count});
                }
            }
        }

        await callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByBozo(dataset: DataType[], speed: SpeedType, order: OrderType,
                            callback: (_value: SortReturnMeta) => void): Promise<void> {
        let count: number = 0;

        while (!this._service.ordered(dataset, order)) {
            let i: number = Math.floor(Math.random() * dataset.length);
            let j: number = Math.floor(Math.random() * dataset.length);

            if (i !== j) {
                count += 1;
                this._service.swap(dataset, i, j);
                callback({dataset, currIndex: i, nextIndex: j, swapCount: count});
            }

            await sleep(speed);
        }

        await callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByBozoLess(dataset: DataType[], speed: SpeedType, order: OrderType,
                                callback: (_value: SortReturnMeta) => void): Promise<void> {
        let count: number = 0, pivot: number = 0, index: number = -1, i: number, j: number;

        while (pivot < dataset.length - 1) {
            i = Math.floor(Math.random() * (dataset.length - pivot - 1) + pivot + 1);
            j = Math.floor(Math.random() * (dataset.length - pivot - 1) + pivot + 1);

            if (order === 'ascent' && dataset[i].value > dataset[j].value) {
                count += 1;
                this._service.swap(dataset, i, j);
            }

            if (order === 'descent' && dataset[i].value < dataset[j].value) {
                count += 1;
                this._service.swap(dataset, i, j);
            }

            callback({dataset, pivotIndex: pivot, currIndex: i, nextIndex: j, swapCount: count});
            await sleep(speed);

            if (order === 'ascent') {
                index = this._service.min(dataset, pivot + 1, dataset.length - 1);
            }

            if (order === 'descent') {
                index = this._service.max(dataset, pivot + 1, dataset.length - 1);
            }

            if (order === 'ascent' && dataset[index].value >= dataset[pivot].value) {
                pivot++;
            } else if (order === 'descent' && dataset[index].value <= dataset[pivot].value) {
                pivot++;
            } else {
                if (order === 'ascent' && dataset[pivot].value > dataset[pivot + 1].value) {
                    count += 1;
                    this._service.swap(dataset, pivot, pivot + 1);
                    callback({dataset, currIndex: pivot, nextIndex: pivot + 1, swapCount: count});
                }

                if (order === 'descent' && dataset[pivot].value < dataset[pivot + 1].value) {
                    count += 1;
                    this._service.swap(dataset, pivot, pivot + 1);
                    callback({dataset, currIndex: pivot, nextIndex: pivot + 1, swapCount: count});
                }

                await sleep(speed);
            }
        }

        callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByCircle(dataset: DataType[], speed: SpeedType, order: OrderType,
                              callback: (_value: SortReturnMeta) => void): Promise<void> {
        let count: number = 0, flag: boolean = true;

        while (flag) {
            flag = await this.circleStep(dataset, 0, dataset.length - 1, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
        }

        callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param lhs
     * @param rhs
     * @param count
     * @param speed
     * @param order
     * @param callback
     * @private
     */
    private async circleStep(dataset: DataType[], lhs: number, rhs: number, count: number,
                             speed: SpeedType, order: OrderType,
                             callback: (_value: SortReturnMeta) => void): Promise<boolean> {
        if (lhs < rhs) {
            let i: number = lhs, j: number = rhs, mid: number;
            let lhsSwap: boolean, rhsSwap: boolean, swapped: boolean = false;

            while (i < j) {
                if (order === 'ascent' && dataset[i].value > dataset[j].value) {
                    this._service.swap(dataset, i, j);
                    swapped = true;
                    count += 1;
                }

                if (order === 'descent' && dataset[i].value < dataset[j].value) {
                    this._service.swap(dataset, i, j);
                    swapped = true;
                    count += 1;
                }

                callback({dataset, currIndex: i, nextIndex: j, swapCount: count});
                i++;
                j--;
                await sleep(speed);
            }

            if (i === j) {
                if (order === 'ascent' && dataset[i].value > dataset[j + 1].value) {
                    count += 1;
                    swapped = true;
                    this._service.swap(dataset, i, j + 1);
                    callback({dataset, currIndex: i, nextIndex: j + 1, swapCount: count});
                }

                if (order === 'descent' && dataset[i].value < dataset[j + 1].value) {
                    count += 1;
                    swapped = true;
                    this._service.swap(dataset, i, j + 1);
                    callback({dataset, currIndex: i, nextIndex: j + 1, swapCount: count});
                }

                await sleep(speed);
            }

            mid = Math.floor((rhs - lhs) * 0.5 + lhs);
            lhsSwap = await this.circleStep(dataset, lhs, mid, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            rhsSwap = await this.circleStep(dataset, mid + 1, rhs, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            return swapped || lhsSwap || rhsSwap;
        }

        return false;
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByGnome(dataset: DataType[], speed: SpeedType, order: OrderType,
                             callback: (_value: SortReturnMeta) => void): Promise<void> {
        let count: number = 0, pivot: number = 0;

        while (pivot < dataset.length) {
            if (order === 'ascent') {
                if (pivot === 0 || dataset[pivot].value >= dataset[pivot - 1].value) {
                    callback({dataset, currIndex: pivot, swapCount: count});
                    pivot++;
                } else {
                    count += 1;
                    this._service.swap(dataset, pivot, pivot - 1);
                    callback({dataset, currIndex: pivot, nextIndex: pivot - 1, swapCount: count});
                    pivot--;
                }
            }

            if (order === 'descent') {
                if (pivot === 0 || dataset[pivot].value <= dataset[pivot - 1].value) {
                    callback({dataset, currIndex: pivot, swapCount: count});
                    pivot++;
                } else {
                    count += 1;
                    this._service.swap(dataset, pivot, pivot - 1);
                    callback({dataset, currIndex: pivot, nextIndex: pivot - 1, swapCount: count});
                    pivot--;
                }
            }

            await sleep(speed);
        }

        callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByGnomeOptimal(dataset: DataType[], speed: SpeedType, order: OrderType,
                                    callback: (_value: SortReturnMeta) => void): Promise<void> {
        let count: number = 0;

        for (let i = 0; i < dataset.length; i++) {
            let j: number = i;

            if (order === 'ascent') {
                while (j > 0 && dataset[j - 1].value > dataset[j].value) {
                    count += 1;
                    this._service.swap(dataset, j, j - 1);
                    callback({dataset, pivotIndex: i, currIndex: j, nextIndex: j - 1, swapCount: count});
                    j--;
                    await sleep(speed);
                }
            }

            if (order === 'descent') {
                while (j > 0 && dataset[j - 1].value < dataset[j].value) {
                    count += 1;
                    this._service.swap(dataset, j, j - 1);
                    callback({dataset, pivotIndex: i, currIndex: j, nextIndex: j - 1, swapCount: count});
                    j--;
                    await sleep(speed);
                }
            }
        }

        callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByGravity(dataset: DataType[], speed: SpeedType, order: OrderType,
                               callback: (_value: SortReturnMeta) => void): Promise<void> {
        let count: number = 0, diff: number = 0, flag: boolean = true;

        while (flag) {
            flag = false;

            if (order === 'ascent') {
                for (let i = dataset.length - 1; i > 0; i--) {
                    if (dataset[i - 1].value > dataset[i].value) {
                        count += 1;
                        diff = dataset[i - 1].value - dataset[i].value;
                        dataset[i - 1] = {
                            value: dataset[i - 1].value - diff,
                            ratio: (dataset[i - 1].value - diff) / dataset.length
                        };
                        dataset[i] = {
                            value: dataset[i].value + diff,
                            ratio: (dataset[i].value + diff) / dataset.length
                        };
                        callback({dataset, currIndex: i, nextIndex: i - 1, swapCount: count});
                        flag = true;
                    } else {
                        callback({dataset, currIndex: i, swapCount: count})
                    }

                    await sleep(speed);
                }
            }

            if (order === 'descent') {
                for (let i = 0; i < dataset.length - 1; i++) {
                    if (dataset[i + 1].value > dataset[i].value) {
                        count += 1;
                        diff = dataset[i + 1].value - dataset[i].value;
                        dataset[i + 1] = {
                            value: dataset[i + 1].value - diff,
                            ratio: (dataset[i + 1].value - diff) / dataset.length
                        };
                        dataset[i] = {
                            value: dataset[i].value + diff,
                            ratio: (dataset[i].value + diff) / dataset.length
                        };
                        callback({dataset, currIndex: i, nextIndex: i + 1, swapCount: count});
                        flag = true;
                    } else {
                        callback({dataset, currIndex: i, swapCount: count})
                    }

                    await sleep(speed);
                }
            }
        }

        callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByLibrary(dataset: DataType[], speed: SpeedType, order: OrderType,
                               callback: (_value: SortReturnMeta) => void): Promise<void> {
        let array: DataType[] = await DemoOtherSortService.libRebalance(dataset,
            Array.from({length: dataset.length * 2}), false, speed, callback);

        callback({dataset});
    }

    private static async libRebalance(dataset: DataType[], array: DataType[], init: boolean, speed: SpeedType,
                                      callback: (_value: SortReturnMeta) => void): Promise<DataType[]> {
        let index: number = 0;

        if (!init) {
            for (let i = 0; i < array.length; i++) {
                if (array[i].exist) {
                    dataset[index] = {value: array[i].value, ratio: array[i].ratio};
                    callback({dataset, pivotIndex: index});
                    index++;
                }

                await sleep(speed);
            }
        }

        for (let i = 0; i < dataset.length; i++) {
            index = i + i;
            array[index] = {value: dataset[i].value, ratio: dataset[i].ratio, exist: false};
            array[index + 1] = {value: dataset[i].value, ratio: dataset[i].ratio, exist: true};
            await sleep(speed);
        }

        return array;
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByOEMergeBU(dataset: DataType[], speed: SpeedType, order: OrderType,
                                 callback: (_value: SortReturnMeta) => void): Promise<void> {
        let count: number = 0;

        for (let cnt = 1; cnt < dataset.length; cnt *= 2) {
            for (let gap = cnt; gap >= 1; gap = gap >> 1) {
                for (let low = gap % cnt; low <= dataset.length - 1 - gap; low += 2 * gap) {
                    await this.oeMergeBU(dataset, low, cnt, gap, count, speed, order, value => {
                        count = value.swapCount as number;
                        callback({...value, swapCount: count});
                    });
                }
            }
        }

        callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param low
     * @param cnt
     * @param gap
     * @param count
     * @param speed
     * @param order
     * @param callback
     * @private
     */
    private async oeMergeBU(dataset: DataType[], low: number, cnt: number, gap: number, count: number,
                            speed: SpeedType, order: OrderType,
                            callback: (_value: SortReturnMeta) => void): Promise<void> {
        for (let i = 0; i <= Math.min(gap - 1, dataset.length - low - gap - 1); i++) {
            let lhs: number = Math.floor((i + low) / (cnt * 2));
            let rhs: number = Math.floor((i + low + gap) / (cnt * 2));

            if (lhs === rhs) {
                if (order === 'ascent' && dataset[i + low].value > dataset[i + low + gap].value) {
                    count += 1;
                    this._service.swap(dataset, i + low, i + low + gap);
                    callback({dataset, currIndex: i + low, nextIndex: i + low + gap, swapCount: count});
                }

                if (order === 'descent' && dataset[i + low].value < dataset[i + low + gap].value) {
                    count += 1;
                    this._service.swap(dataset, i + low, i + low + gap);
                    callback({dataset, currIndex: i + low, nextIndex: i + low + gap, swapCount: count});
                }
            } else {
                callback({dataset, currIndex: i + low, swapCount: count});
            }

            await sleep(speed);
        }
    }

    /**
     *
     * @param dataset
     * @param low
     * @param cnt
     * @param count
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByOEMergeTD(dataset: DataType[], low: number, cnt: number, count: number,
                                 speed: SpeedType, order: OrderType,
                                 callback: (_value: SortReturnMeta) => void): Promise<void> {
        if (cnt > 1) {
            let k: number = cnt >> 1;
            await this.sortByOEMergeTD(dataset, low, k, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await this.sortByOEMergeTD(dataset, low + k, k, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await this.oeMergeTD(dataset, low, cnt, 1, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
        }

        callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param low
     * @param cnt
     * @param gap
     * @param count
     * @param speed
     * @param order
     * @param callback
     * @private
     */
    private async oeMergeTD(dataset: DataType[], low: number, cnt: number, gap: number, count: number,
                            speed: SpeedType, order: OrderType,
                            callback: (_value: SortReturnMeta) => void): Promise<void> {
        let span: number = gap << 1;

        if (span < cnt) {
            await this.oeMergeTD(dataset, low, cnt, span, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await this.oeMergeTD(dataset, low + gap, cnt, span, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });

            for (let i = low + gap; i + gap < low + cnt; i += span) {
                if (order === 'ascent' && dataset[i].value > dataset[i + gap].value) {
                    count += 1;
                    this._service.swap(dataset, i, i + gap);
                    callback({dataset, currIndex: i, nextIndex: i + gap, swapCount: count});
                } else if (order === 'descent' && dataset[i].value < dataset[i + gap].value) {
                    count += 1;
                    this._service.swap(dataset, i, i + gap);
                    callback({dataset, currIndex: i, nextIndex: i + gap, swapCount: count});
                } else {
                    callback({dataset, currIndex: i, swapCount: count});
                }

                await sleep(speed);
            }
        } else {
            if (order === 'ascent' && dataset[low].value > dataset[low + gap].value) {
                count += 1;
                this._service.swap(dataset, low, low + gap);
                callback({dataset, currIndex: low, nextIndex: low + gap, swapCount: count});
            }

            if (order === 'descent' && dataset[low].value < dataset[low + gap].value) {
                count += 1;
                this._service.swap(dataset, low, low + gap);
                callback({dataset, currIndex: low, nextIndex: low + gap, swapCount: count});
            }
        }
    }

    public async sortByPairwiseBU(dataset: DataType[], speed: SpeedType, order: OrderType,
                                  callback: (_value: SortReturnMeta) => void): Promise<void> {
        let count: number = 0, gap: number, dist: number;

        for (gap = 1; gap < dataset.length; gap *= 2) {
            let i: number = gap, pnt: number = 0;

            while (i < dataset.length) {
                if (order === 'ascent' && dataset[i - gap].value > dataset[i].value) {
                    count += 1;
                    this._service.swap(dataset, i - gap, i);
                    callback({dataset, currIndex: i - gap, nextIndex: i, swapCount: count});
                } else if (order === 'descent' && dataset[i - gap].value < dataset[i].value) {
                    count += 1;
                    this._service.swap(dataset, i - gap, i);
                    callback({dataset, currIndex: i - gap, nextIndex: i, swapCount: count});
                } else {
                    callback({dataset, currIndex: i - gap, swapCount: count});
                }

                i++;
                pnt++;

                if (pnt >= gap) {
                    pnt = 0;
                    i += gap;
                }

                await sleep(speed);
            }
        }

        for (gap = gap >> 2, dist = 1; gap > 0; gap = gap >> 1, dist = 2 * dist + 1) {
            for (let d = dist; d > 0; d = d >> 1) {
                let i: number = (d + 1) * gap;
                let pnt: number = 0;

                while (i < dataset.length) {
                    if (order === 'ascent' && dataset[i - d * gap].value > dataset[i].value) {
                        count += 1;
                        this._service.swap(dataset, i - d * gap, i);
                        callback({dataset, currIndex: i - d * gap, nextIndex: i, swapCount: count});
                    } else if (order === 'descent' && dataset[i - d * gap].value < dataset[i].value) {
                        count += 1;
                        this._service.swap(dataset, i - d * gap, i);
                        callback({dataset, currIndex: i - d * gap, nextIndex: i, swapCount: count});
                    } else {
                        callback({dataset, currIndex: i - d * gap, swapCount: count});
                    }

                    pnt++;
                    i++;

                    if (pnt >= gap) {
                        pnt = 0;
                        i += gap;
                    }

                    await sleep(speed);
                }
            }
        }

        callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByPancake(dataset: DataType[], speed: SpeedType, order: OrderType,
                               callback: (_value: SortReturnMeta) => void): Promise<void> {
        let count: number = 0, index: number = -1;

        for (let i = dataset.length; i > 1; i--) {
            if (order === 'ascent') {
                index = this._service.max(dataset, 0, i - 1);
            }

            if (order === 'descent') {
                index = this._service.min(dataset, 0, i - 1);
            }

            await this.pancakeFlip(dataset, index, count, speed, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await this.pancakeFlip(dataset, i - 1, count, speed, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
        }

        callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param i
     * @param count
     * @param speed
     * @param callback
     * @private
     */
    private async pancakeFlip(dataset: DataType[], i: number, count: number, speed: SpeedType,
                              callback: (_value: SortReturnMeta) => void): Promise<void> {
        let j = 0;

        while (j < i) {
            count += 1;
            this._service.swap(dataset, i, j);
            callback({dataset, currIndex: i, nextIndex: j, swapCount: count});
            j++;
            i--;
            await sleep(speed);
        }
    }

    /**
     *
     * @param dataset
     * @param lhs
     * @param rhs
     * @param count
     * @param speed
     * @param order
     * @param callback
     */
    public async sortBySlow(dataset: DataType[], lhs: number, rhs: number, count: number,
                            speed: SpeedType, order: OrderType,
                            callback: (_value: SortReturnMeta) => void): Promise<void> {
        if (lhs < rhs) {
            let pivot: number = Math.floor((lhs + rhs) * 0.5);
            await this.sortBySlow(dataset, lhs, pivot, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await this.sortBySlow(dataset, pivot + 1, rhs, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });

            if (order === 'ascent' && dataset[rhs].value < dataset[pivot].value) {
                count += 1;
                this._service.swap(dataset, rhs, pivot);
                callback({dataset, pivotIndex: pivot, currIndex: rhs, nextIndex: pivot, swapCount: count});
            } else if (order === 'descent' && dataset[rhs].value > dataset[pivot].value) {
                count += 1;
                this._service.swap(dataset, rhs, pivot);
                callback({dataset, pivotIndex: pivot, currIndex: rhs, nextIndex: pivot, swapCount: count});
            } else {
                await callback({dataset, pivotIndex: pivot, currIndex: rhs, swapCount: count});
            }

            await this.sortBySlow(dataset, lhs, rhs - 1, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await sleep(speed);
        }
    }

    /**
     *
     * @param dataset
     * @param lhs
     * @param rhs
     * @param count
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByStooge(dataset: DataType[], lhs: number, rhs: number, count: number, speed: SpeedType, order: OrderType,
                              callback: (_value: SortReturnMeta) => void): Promise<void> {
        if (order === 'ascent' && dataset[lhs].value > dataset[rhs].value) {
            count += 1;
            this._service.swap(dataset, lhs, rhs);
            await callback({dataset, currIndex: lhs, nextIndex: rhs, swapCount: count});
            await sleep(speed);
        }

        if (order === 'descent' && dataset[lhs].value < dataset[rhs].value) {
            count += 1;
            this._service.swap(dataset, lhs, rhs);
            await callback({dataset, currIndex: lhs, nextIndex: rhs, swapCount: count});
            await sleep(speed);
        }

        if (lhs + 1 < rhs) {
            let pivot: number = Math.floor((rhs - lhs + 1) / 3);
            await this.sortByStooge(dataset, lhs, rhs - pivot, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await this.sortByStooge(dataset, lhs + pivot, rhs, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await this.sortByStooge(dataset, lhs, rhs - pivot, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await callback({dataset, currIndex: lhs, swapCount: count});
            await sleep(speed);
        }

        callback({dataset, swapCount: count});
    }

}

@Injectable()
export class DemoComparisonSortService {

    constructor(private _service: DemoSortUtilityService) {
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByBubble(dataset: DataType[], speed: SpeedType, order: OrderType,
                              callback: (_value: SortReturnMeta) => void): Promise<void> {
        let count: number = 0, swapped: boolean = true;

        while (swapped) {
            swapped = false;

            for (let i = 0; i + 1 < dataset.length; i++) {
                if (order === 'ascent' && dataset[i].value > dataset[i + 1].value) {
                    count += 1;
                    swapped = true;
                    this._service.swap(dataset, i, i + 1);
                    callback({dataset, currIndex: i, nextIndex: i + 1, swapCount: count});
                } else if (order === 'descent' && dataset[i].value < dataset[i + 1].value) {
                    count += 1;
                    swapped = true;
                    this._service.swap(dataset, i, i + 1);
                    callback({dataset, currIndex: i, nextIndex: i + 1, swapCount: count});
                } else {
                    callback({dataset, currIndex: i, swapCount: count});
                }

                await sleep(speed);
            }
        }

        await callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByBubbleOptimal(dataset: DataType[], speed: SpeedType, order: OrderType,
                                     callback: (_value: SortReturnMeta) => void): Promise<void> {
        let count: number = 0, i: number = 0, swapped: boolean = true;

        while (swapped) {
            swapped = false;

            for (let j = 0; j + 1 < dataset.length - i; j++) {
                if (order === 'ascent' && dataset[j].value > dataset[j + 1].value) {
                    count += 1;
                    swapped = true;
                    this._service.swap(dataset, j, j + 1);
                    callback({
                        dataset,
                        pivotIndex: dataset.length - i - 1,
                        currIndex: j,
                        nextIndex: j + 1,
                        swapCount: count
                    });
                } else if (order === 'descent' && dataset[j].value < dataset[j + 1].value) {
                    count += 1;
                    swapped = true;
                    this._service.swap(dataset, j, j + 1);
                    callback({
                        dataset,
                        pivotIndex: dataset.length - i - 1,
                        currIndex: j,
                        nextIndex: j + 1,
                        swapCount: count
                    });
                } else {
                    callback({dataset, pivotIndex: dataset.length - i - 1, currIndex: j, swapCount: count});
                }

                await sleep(speed);
            }

            i++;
        }

        await callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByCockTail(dataset: DataType[], speed: SpeedType, order: OrderType,
                                callback: (_value: SortReturnMeta) => void): Promise<void> {
        let count: number = 0, lhs: number = 0, rhs: number = dataset.length - 1, swapped: boolean = true;

        while (swapped) {
            swapped = false;

            for (let i = lhs; i + 1 <= rhs; i++) {
                if (order === 'ascent' && dataset[i].value > dataset[i + 1].value) {
                    count += 1;
                    this._service.swap(dataset, i, i + 1);
                    callback({dataset, pivotIndex: lhs, currIndex: i, nextIndex: i + 1, swapCount: count});
                    swapped = true;
                } else if (order === 'descent' && dataset[i].value < dataset[i + 1].value) {
                    count += 1;
                    this._service.swap(dataset, i, i + 1);
                    callback({dataset, pivotIndex: lhs, currIndex: i, nextIndex: i + 1, swapCount: count});
                    swapped = true;
                } else {
                    callback({dataset, pivotIndex: lhs, currIndex: i, swapCount: count});
                }

                await sleep(speed);
            }

            if (!swapped) break;

            swapped = false;
            lhs++;

            for (let i = rhs; i >= lhs; i--) {
                if (order === 'ascent' && dataset[i - 1].value > dataset[i].value) {
                    count += 1;
                    this._service.swap(dataset, i, i - 1);
                    callback({dataset, pivotIndex: rhs, currIndex: i, nextIndex: i - 1, swapCount: count});
                    swapped = true;
                } else if (order === 'descent' && dataset[i - 1].value < dataset[i].value) {
                    count += 1;
                    this._service.swap(dataset, i, i - 1);
                    callback({dataset, pivotIndex: rhs, currIndex: i, nextIndex: i - 1, swapCount: count});
                    swapped = true;
                } else {
                    callback({dataset, pivotIndex: rhs, currIndex: i, swapCount: count});
                }

                await sleep(speed);
            }

            rhs--;
        }

        callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByCombo(dataset: DataType[], speed: SpeedType, order: OrderType,
                             callback: (_value: SortReturnMeta) => void): Promise<void> {
        let count: number = 0, gap: number = dataset.length, swapped: boolean = true;

        while (gap > 1 || swapped) {
            gap = Math.floor(gap / 1.3);
            gap = gap < 1 ? 1 : gap;
            swapped = false;

            for (let i = 0; i + gap < dataset.length; i++) {
                if (order === 'ascent' && dataset[i].value > dataset[i + gap].value) {
                    count += 1;
                    this._service.swap(dataset, i, i + gap);
                    callback({dataset, currIndex: i, nextIndex: i + gap, swapCount: count});
                    swapped = true;
                } else if (order === 'descent' && dataset[i].value < dataset[i + gap].value) {
                    count += 1;
                    this._service.swap(dataset, i, i + gap);
                    callback({dataset, currIndex: i, nextIndex: i + gap, swapCount: count});
                    swapped = true;
                } else {
                    callback({dataset, currIndex: i, swapCount: count});
                }

                await sleep(speed);
            }
        }

        callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByCycle(dataset: DataType[], speed: SpeedType, order: OrderType,
                             callback: (_value: SortReturnMeta) => void): Promise<void> {
        let pivot: number, point: number, count: number = 0;

        for (let start = 0; start + 1 < dataset.length; start++) {
            pivot = start;
            point = start;

            for (let i = start + 1; i < dataset.length; i++) {
                if (order === 'ascent' && dataset[i].value < dataset[start].value) {
                    point++;
                }

                if (order === 'descent' && dataset[i].value > dataset[start].value) {
                    point++;
                }

                callback({dataset, pivotIndex: start, currIndex: i, swapCount: count});
                await sleep(speed);
            }

            if (point === start) continue;

            while (dataset[point].value === dataset[start].value) {
                pivot++;
            }

            count += 1;
            this._service.swap(dataset, point, pivot);
            callback({dataset, pivotIndex: start, currIndex: point, nextIndex: pivot, swapCount: count});
            await this.cycleSeek(dataset, start, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
        }

        callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param index
     * @param count
     * @param speed
     * @param order
     * @param callback
     * @private
     */
    private async cycleSeek(dataset: DataType[], index: number, count: number, speed: SpeedType, order: OrderType,
                            callback: (_value: SortReturnMeta) => void): Promise<void> {
        let pivot: number, point: number = -1;

        while (point !== index) {
            pivot = index;
            point = index;

            for (let i = index + 1; i < dataset.length; i++) {
                if (order === 'ascent' && dataset[i].value < dataset[index].value) {
                    point++;
                }

                if (order === 'descent' && dataset[i].value > dataset[index].value) {
                    point++;
                }

                callback({dataset, pivotIndex: index, currIndex: i, swapCount: count});
                await sleep(speed);
            }

            if (point === index) break;

            while (dataset[point].value === dataset[index].value) {
                pivot++;
            }

            count += 1;
            this._service.swap(dataset, point, pivot);
            callback({dataset, pivotIndex: index, currIndex: point, nextIndex: pivot, swapCount: count});
        }
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByExchange(dataset: DataType[], speed: SpeedType, order: OrderType,
                                callback: (_value: SortReturnMeta) => void): Promise<void> {
        let count: number = 0;

        for (let i = 0; i + 1 < dataset.length; i++) {
            for (let j = i + 1; j < dataset.length; j++) {
                if (order === 'ascent' && dataset[j].value < dataset[i].value) {
                    count += 1;
                    this._service.swap(dataset, i, j);

                }

                if (order === 'descent' && dataset[j].value > dataset[i].value) {
                    count += 1;
                    this._service.swap(dataset, i, j);
                    callback({dataset, currIndex: j, nextIndex: i, swapCount: count});
                }

                callback({dataset, currIndex: j, nextIndex: i, swapCount: count});
                await sleep(speed);
            }
        }

        callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param count
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByHeap(dataset: DataType[], count: number, speed: SpeedType, order: OrderType,
                            callback: (_value: SortReturnMeta) => void): Promise<void> {
        for (let i = Math.floor(dataset.length * 0.5 - 1); i >= 0; i--) {
            await this.heapify(dataset, i, dataset.length, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
        }

        for (let i = dataset.length - 1; i >= 0; i--) {
            count += 1;
            this._service.swap(dataset, i, 0);
            callback({dataset, currIndex: i, nextIndex: 0, swapCount: count});
            await this.heapify(dataset, 0, i, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
        }

        await callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param pivot
     * @param size
     * @param count
     * @param speed
     * @param order
     * @param callback
     * @private
     */
    private async heapify(dataset: DataType[], pivot: number, size: number, count: number,
                          speed: SpeedType, order: OrderType,
                          callback: (_value: SortReturnMeta) => void): Promise<void> {
        let lhs: number = pivot + pivot + 1;
        let rhs: number = pivot + pivot + 2;
        let point: number = pivot;

        if (order === 'ascent') {
            if (lhs < size && dataset[lhs].value > dataset[pivot].value) {
                point = lhs;
            }

            if (rhs < size && dataset[rhs].value > dataset[point].value) {
                point = rhs;
            }
        }

        if (order === 'descent') {
            if (lhs < size && dataset[lhs].value < dataset[pivot].value) {
                point = lhs;
            }

            if (rhs < size && dataset[rhs].value < dataset[point].value) {
                point = rhs;
            }
        }

        if (point !== pivot) {
            count += 1;
            this._service.swap(dataset, pivot, point);
            callback({dataset, currIndex: pivot, nextIndex: point, swapCount: count});
            await this.heapify(dataset, point, size, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await sleep(speed);
        }
    }

    /**
     *
     * @param dataset
     * @param lhs
     * @param rhs
     * @param count
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByInsertion(dataset: DataType[], lhs: number, rhs: number, count: number,
                                 speed: SpeedType, order: OrderType,
                                 callback: (_value: SortReturnMeta) => void): Promise<void> {
        for (let i = lhs; i <= rhs; i++) {
            for (let j = i; j > lhs; j--) {
                if (order === 'ascent' && dataset[j - 1].value > dataset[j].value) {
                    count += 1;
                    this._service.swap(dataset, j, j - 1);
                    callback({dataset, pivotIndex: i, currIndex: j, nextIndex: j - 1, swapCount: count});
                } else if (order === 'descent' && dataset[j - 1].value < dataset[j].value) {
                    count += 1;
                    this._service.swap(dataset, j, j - 1);
                    callback({dataset, pivotIndex: i, currIndex: j, nextIndex: j - 1, swapCount: count});
                } else {
                    await callback({dataset, pivotIndex: i, currIndex: j, swapCount: count});
                }

                await sleep(speed);
            }
        }

        await callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param lhs
     * @param rhs
     * @param count
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByInsertionBinary(dataset: DataType[], lhs: number, rhs: number, count: number,
                                       speed: SpeedType, order: OrderType,
                                       callback: (_value: SortReturnMeta) => void): Promise<void> {
        let temp: DataType, pos: number, j: number;

        for (let i = lhs; i <= rhs; i++) {
            temp = {value: dataset[i].value, ratio: dataset[i].ratio};
            pos = this._service.binarySearch(dataset, lhs, i - 1, dataset[i], order);
            count += 1;

            for (j = i - 1; j >= pos; j--) {
                dataset[j + 1].value = dataset[j].value;
                dataset[j + 1].ratio = dataset[j].ratio;
                callback({dataset, pivotIndex: i, currIndex: j, nextIndex: pos, swapCount: count});
                await sleep(speed);
            }

            dataset[j + 1].value = temp.value;
            dataset[j + 1].ratio = temp.ratio;
            callback({dataset, pivotIndex: i, swapCount: count});
        }

        await callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByIntro(dataset: DataType[], speed: SpeedType, order: OrderType,
                             callback: (_value: SortReturnMeta) => void): Promise<void> {
        let limit: number = 2 * Math.floor(Math.log2(dataset.length)), count: number = 0;
        await this.introTask(dataset, 0, dataset.length - 1, limit, count, speed, order, value => {
            count = value.swapCount as number;
            callback({...value, swapCount: count});
        });
        callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param lhs
     * @param rhs
     * @param limit
     * @param count
     * @param speed
     * @param order
     * @param callback
     * @private
     */
    private async introTask(dataset: DataType[], lhs: number, rhs: number, limit: number, count: number,
                            speed: SpeedType, order: OrderType,
                            callback: (_value: SortReturnMeta) => void): Promise<void> {
        if (rhs - lhs < 16) {
            await this.sortByInsertion(dataset, lhs, rhs, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
        } else {
            if (limit === 0) {
                await this.sortByHeap(dataset, count, speed, order, value => {
                    count = value.swapCount as number;
                    callback({...value, swapCount: count});
                });
                return;
            }

            let mid: number = await this.partition(dataset, lhs, rhs, rhs, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await this.introTask(dataset, lhs, mid - 1, limit - 1, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await this.introTask(dataset, mid + 1, rhs, limit - 1, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
        }
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByMergeBU(dataset: DataType[], speed: SpeedType, order: OrderType,
                               callback: (_value: SortReturnMeta) => void): Promise<void> {
        let length: number = dataset.length, count: number = 0;

        for (let i = 1; i < length; i = i + i) {
            for (let lhs = 0; lhs < length - i; lhs += i + i) {
                let rhs: number = Math.min(lhs + i + i - 1, dataset.length - 1);
                await this._service.merge(dataset, lhs, lhs + i - 1, rhs, count, speed, order, value => {
                    count = value.auxCount as number;
                    callback({...value, auxCount: count});
                });
                await sleep(speed);
            }
        }

        callback({dataset, auxCount: count});
    }

    /**
     *
     * @param dataset
     * @param lhs
     * @param rhs
     * @param count
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByMergeTD(dataset: DataType[], lhs: number, rhs: number, count: number,
                               speed: SpeedType, order: OrderType,
                               callback: (_value: SortReturnMeta) => void): Promise<void> {
        if (lhs < rhs) {
            let mid: number = Math.floor((rhs - lhs) * 0.5 + lhs);
            await this.sortByMergeTD(dataset, lhs, mid, count, speed, order, value => {
                count = value.auxCount as number;
                callback({...value, auxCount: count});
            });
            await this.sortByMergeTD(dataset, mid + 1, rhs, count, speed, order, value => {
                count = value.auxCount as number;
                callback({...value, auxCount: count});
            });
            await this._service.merge(dataset, lhs, mid, rhs, count, speed, order, value => {
                count = value.auxCount as number;
                callback({...value, auxCount: count});
            });
        }
    }

    /**
     *
     * @param dataset
     * @param lhs
     * @param rhs
     * @param count
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByMerge4Way(dataset: DataType[], lhs: number, rhs: number, count: number,
                                 speed: SpeedType, order: OrderType,
                                 callback: (_value: SortReturnMeta) => void): Promise<void> {
        if (lhs < rhs) {
            let mid1: number = Math.floor((rhs - lhs) * 0.25 + lhs);
            let mid2: number = Math.floor((rhs - lhs) * 0.5 + lhs);
            let mid3: number = Math.floor((rhs - lhs) * 0.75 + lhs);
            await this.sortByMerge4Way(dataset, lhs, mid1, count, speed, order, value => {
                count = value.auxCount as number;
                callback({...value, auxCount: count});
            });
            await this.sortByMerge4Way(dataset, mid1 + 1, mid2, count, speed, order, value => {
                count = value.auxCount as number;
                callback({...value, auxCount: count});
            });
            await this.sortByMerge4Way(dataset, mid2 + 1, mid3, count, speed, order, value => {
                count = value.auxCount as number;
                callback({...value, auxCount: count});
            });
            await this.sortByMerge4Way(dataset, mid3 + 1, rhs, count, speed, order, value => {
                count = value.auxCount as number;
                callback({...value, auxCount: count});
            });
            await this.mergeBy4way(dataset, [lhs, mid1, mid2, mid3, rhs], count, speed, order, value => {
                count = value.auxCount as number;
                callback({...value, auxCount: count});
            });
        }
    }

    /**
     *
     * @param dataset
     * @param points
     * @param count
     * @param speed
     * @param order
     * @param callback
     * @private
     */
    private async mergeBy4way(dataset: DataType[], points: number[], count: number, speed: SpeedType, order: OrderType,
                              callback: (_value: SortReturnMeta) => void): Promise<void> {
        await this._service.merge(dataset, points[0], points[1], points[2], count, speed, order, value => {
            count = value.auxCount as number;
            callback({...value, auxCount: count});
        });
        await this._service.merge(dataset, points[2] + 1, points[3], points[4], count, speed, order, value => {
            count = value.auxCount as number;
            callback({...value, auxCount: count});
        });
        await this._service.merge(dataset, points[0], points[2], points[4], count, speed, order, value => {
            count = value.auxCount as number;
            callback({...value, auxCount: count});
        });
    }

    /**
     *
     * @param dataset
     * @param lhs
     * @param rhs
     * @param count
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByMergeInPlace(dataset: DataType[], lhs: number, rhs: number, count: number,
                                    speed: SpeedType, order: OrderType,
                                    callback: (_value: SortReturnMeta) => void): Promise<void> {
        if (lhs < rhs) {
            let mid: number = Math.floor((rhs - lhs) * 0.5 + lhs);
            await this.sortByMergeInPlace(dataset, lhs, mid, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await this.sortByMergeInPlace(dataset, mid + 1, rhs, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await DemoComparisonSortService.mergeInPlace(dataset, lhs, mid, rhs, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
        }

        callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param lhs
     * @param mid
     * @param rhs
     * @param count
     * @param speed
     * @param order
     * @param callback
     * @private
     */
    private static async mergeInPlace(dataset: DataType[], lhs: number, mid: number, rhs: number, count: number,
                                      speed: SpeedType, order: OrderType,
                                      callback: (_value: SortReturnMeta) => void): Promise<void> {
        let temp: DataType;
        let i: number = lhs, j: number = mid + 1, index: number;

        while (i <= mid && j <= rhs) {
            callback({dataset, pivotIndex: mid, currIndex: i, nextIndex: j, swapCount: count});
            await sleep(speed);

            if (order === 'ascent' && dataset[i].value <= dataset[j].value) {
                i++;
            } else if (order === 'descent' && dataset[i].value >= dataset[j].value) {
                i++;
            } else {
                temp = dataset[j];
                index = j;

                while (index !== i) {
                    count += 1;
                    dataset[index] = dataset[index - 1];
                    callback({dataset, currIndex: index, nextIndex: index - 1, swapCount: count});
                    index--;
                    await sleep(speed);
                }

                count += 1;
                dataset[i] = temp;
                callback({dataset, currIndex: i, nextIndex: j, swapCount: count});

                i++;
                j++;
                mid++;
            }
        }
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByOddEven(dataset: DataType[], speed: SpeedType, order: OrderType,
                               callback: (_value: SortReturnMeta) => void): Promise<void> {
        let flag: boolean = false, count: number = 0;

        while (!flag) {
            flag = true;

            for (let i = 0; i < 2; i++) {
                for (let j = i; j < dataset.length - 1; j += 2) {
                    if (order === 'ascent' && dataset[j].value > dataset[j + 1].value) {
                        count += 1;
                        this._service.swap(dataset, j, j + 1);
                        callback({dataset, currIndex: j, nextIndex: j + 1, swapCount: count});
                        flag = false;
                    } else if (order === 'descent' && dataset[j].value < dataset[j + 1].value) {
                        count += 1;
                        this._service.swap(dataset, j, j + 1);
                        callback({dataset, currIndex: j, nextIndex: j + 1, swapCount: count});
                        flag = false;
                    } else {
                        await callback({dataset, currIndex: j, swapCount: count});
                    }

                    await sleep(speed);
                }
            }
        }

        await callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param lhs
     * @param rhs
     * @param count
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByQuick(dataset: DataType[], lhs: number, rhs: number, count: number,
                             speed: SpeedType, order: OrderType,
                             callback: (_value: SortReturnMeta) => void): Promise<void> {
        if (lhs < rhs) {
            let mid: number = await this.partition(dataset, lhs, rhs, rhs, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await this.sortByQuick(dataset, lhs, mid - 1, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await this.sortByQuick(dataset, mid + 1, rhs, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
        }

        await callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param lhs
     * @param rhs
     * @param pnt
     * @param count
     * @param speed
     * @param order
     * @param callback
     * @private
     */
    private async partition(dataset: DataType[], lhs: number, rhs: number, pnt: number, count: number,
                            speed: SpeedType, order: OrderType,
                            callback: (_value: SortReturnMeta) => void): Promise<number> {
        let pivot: DataType = dataset[pnt], i: number = lhs - 1;

        for (let j = lhs; j <= rhs - 1; j++) {
            if (order === 'ascent' && dataset[j].value <= pivot.value) {
                i += 1;
                count += 1;
                this._service.swap(dataset, i, j);
                callback({dataset, pivotIndex: rhs, currIndex: j, nextIndex: i, swapCount: count});
            } else if (order === 'descent' && dataset[j].value >= pivot.value) {
                i += 1;
                count += 1;
                this._service.swap(dataset, i, j);
                callback({dataset, pivotIndex: rhs, currIndex: j, nextIndex: i, swapCount: count});
            } else {
                await callback({dataset, pivotIndex: rhs, currIndex: j, swapCount: count});
            }

            await sleep(speed);
        }

        count += 1;
        this._service.swap(dataset, i + 1, rhs);
        callback({dataset, pivotIndex: rhs, currIndex: rhs, nextIndex: i + 1, swapCount: count});
        return i + 1;
    }

    /**
     *
     * @param dataset
     * @param lhs
     * @param rhs
     * @param count
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByQuick2Way(dataset: DataType[], lhs: number, rhs: number, count: number,
                                 speed: SpeedType, order: OrderType,
                                 callback: (_value: SortReturnMeta) => void): Promise<void> {
        if (lhs < rhs) {
            let mid: number = await this.partitionBy2Way(dataset, lhs, rhs, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await this.sortByQuick2Way(dataset, lhs, mid - 1, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await this.sortByQuick2Way(dataset, mid + 1, rhs, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
        }

        await callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param lhs
     * @param rhs
     * @param count
     * @param speed
     * @param order
     * @param callback
     * @private
     */
    private async partitionBy2Way(dataset: DataType[], lhs: number, rhs: number, count: number,
                                  speed: SpeedType, order: OrderType,
                                  callback: (_value: SortReturnMeta) => void): Promise<number> {
        let pivot: DataType = dataset[lhs], i: number = lhs + 1, j: number = rhs;

        while (i <= j) {
            if (order === 'ascent' && dataset[i].value < pivot.value) {
                i++;
                callback({dataset, pivotIndex: lhs, currIndex: i, swapCount: count});
            } else if (order === 'ascent' && dataset[j].value > pivot.value) {
                j--;
                callback({dataset, pivotIndex: lhs, nextIndex: j, swapCount: count});
            } else if (order === 'descent' && dataset[i].value > pivot.value) {
                i++;
                callback({dataset, pivotIndex: lhs, currIndex: i, swapCount: count});
            } else if (order === 'descent' && dataset[j].value < pivot.value) {
                j--;
                callback({dataset, pivotIndex: lhs, nextIndex: j, swapCount: count});
            } else {
                count += 1;
                this._service.swap(dataset, i, j);
                callback({dataset, pivotIndex: lhs, currIndex: i, nextIndex: j, swapCount: count});
                i++;
                j--;
            }

            await sleep(speed);
        }

        count += 1;
        this._service.swap(dataset, j, lhs);
        callback({dataset, currIndex: j, nextIndex: lhs, swapCount: count});
        return j;
    }

    /**
     *
     * @param dataset
     * @param lhs
     * @param rhs
     * @param count
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByQuick3Way(dataset: DataType[], lhs: number, rhs: number, count: number,
                                 speed: SpeedType, order: OrderType,
                                 callback: (_value: SortReturnMeta) => void): Promise<void> {
        if (lhs < rhs) {
            let pivot: DataType = dataset[lhs], lt: number = lhs, gt: number = rhs, i: number = lhs + 1;

            while (i <= gt) {
                if (order === 'ascent' && dataset[i].value < pivot.value) {
                    count += 1;
                    this._service.swap(dataset, lt, i);
                    callback({dataset, pivotIndex: lhs, currIndex: lt, nextIndex: i, swapCount: count});
                    i++;
                    lt++;
                } else if (order === 'ascent' && dataset[i].value > pivot.value) {
                    count += 1;
                    this._service.swap(dataset, gt, i);
                    callback({dataset, pivotIndex: lhs, currIndex: gt, nextIndex: i, swapCount: count});
                    gt--;
                } else if (order === 'descent' && dataset[i].value > pivot.value) {
                    count += 1;
                    this._service.swap(dataset, lt, i);
                    callback({dataset, pivotIndex: lhs, currIndex: lt, nextIndex: i, swapCount: count});
                    i++;
                    lt++;
                } else if (order === 'descent' && dataset[i].value < pivot.value) {
                    count += 1;
                    this._service.swap(dataset, gt, i);
                    callback({dataset, pivotIndex: lhs, currIndex: gt, nextIndex: i, swapCount: count});
                    gt--;
                } else {
                    i++;
                }

                await sleep(speed);
            }

            await this.sortByQuick3Way(dataset, lhs, lt - 1, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await this.sortByQuick3Way(dataset, gt + 1, rhs, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
        }

        callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param lhs
     * @param rhs
     * @param count
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByQuickDualPivot(dataset: DataType[], lhs: number, rhs: number, count: number,
                                      speed: SpeedType, order: OrderType,
                                      callback: (_value: SortReturnMeta) => void): Promise<void> {
        if (lhs < rhs) {
            let pivots: DualPivotType = await this.partitionDualPivot(dataset, lhs, rhs, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await this.sortByQuickDualPivot(dataset, lhs, pivots.fst - 1, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await this.sortByQuickDualPivot(dataset, pivots.fst + 1, pivots.snd - 1, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
            await this.sortByQuickDualPivot(dataset, pivots.snd + 1, rhs, count, speed, order, value => {
                count = value.swapCount as number;
                callback({...value, swapCount: count});
            });
        }

        callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param lhs
     * @param rhs
     * @param count
     * @param speed
     * @param order
     * @param callback
     * @private
     */
    private async partitionDualPivot(dataset: DataType[], lhs: number, rhs: number, count: number,
                                     speed: SpeedType, order: OrderType,
                                     callback: (_value: SortReturnMeta) => void): Promise<DualPivotType> {
        if (order === 'ascent' && dataset[lhs].value > dataset[rhs].value) {
            count += 1
            this._service.swap(dataset, lhs, rhs);
            callback({dataset, currIndex: lhs, nextIndex: rhs, swapCount: count});
            await sleep(speed);
        }

        if (order === 'descent' && dataset[lhs].value < dataset[rhs].value) {
            count += 1;
            this._service.swap(dataset, lhs, rhs);
            callback({dataset, currIndex: lhs, nextIndex: rhs, swapCount: count});
            await sleep(speed);
        }

        let lhsIndex: number = lhs + 1, rhsIndex: number = rhs - 1, midIndex: number = lhs + 1;
        let fst: DataType = dataset[lhs], snd: DataType = dataset[rhs];

        while (midIndex <= rhsIndex) {
            if (order === 'ascent' && dataset[midIndex].value < fst.value) {
                count += 1;
                this._service.swap(dataset, midIndex, lhsIndex);
                callback({
                    dataset, lhsPivotIndex: lhs, rhsPivotIndex: rhs, currIndex: midIndex,
                    nextIndex: lhsIndex, swapCount: count
                });
                lhsIndex++;
            }

            if (order === 'descent' && dataset[midIndex].value > fst.value) {
                count += 1;
                this._service.swap(dataset, midIndex, lhsIndex);
                callback({
                    dataset, lhsPivotIndex: lhs, rhsPivotIndex: rhs, currIndex: midIndex,
                    nextIndex: lhsIndex, swapCount: count
                });
                lhsIndex++;
            }

            if (order === 'ascent' && dataset[midIndex].value > snd.value) {
                while (midIndex < rhsIndex && dataset[rhsIndex].value > snd.value) {
                    rhsIndex--;
                }

                count += 1;
                this._service.swap(dataset, midIndex, rhsIndex);
                callback({
                    dataset, lhsPivotIndex: lhs, rhsPivotIndex: rhs, currIndex: midIndex,
                    nextIndex: rhsIndex, swapCount: count
                });
                await sleep(speed);

                if (dataset[midIndex].value < fst.value) {
                    count += 1;
                    this._service.swap(dataset, midIndex, lhsIndex);
                    callback({
                        dataset, lhsPivotIndex: lhs, rhsPivotIndex: rhs, currIndex: midIndex,
                        nextIndex: lhsIndex, swapCount: count
                    });
                    lhsIndex++;
                }

                rhsIndex--;
            }

            if (order === 'descent' && dataset[midIndex].value < snd.value) {
                while (midIndex < rhsIndex && dataset[rhsIndex].value < snd.value) {
                    rhsIndex--;
                }

                count += 1;
                this._service.swap(dataset, midIndex, rhsIndex);
                callback({
                    dataset, lhsPivotIndex: lhs, rhsPivotIndex: rhs, currIndex: midIndex,
                    nextIndex: rhsIndex, swapCount: count
                });
                await sleep(speed);

                if (dataset[midIndex].value > fst.value) {
                    count += 1;
                    this._service.swap(dataset, midIndex, lhsIndex);
                    callback({
                        dataset, lhsPivotIndex: lhs, rhsPivotIndex: rhs, currIndex: midIndex,
                        nextIndex: lhsIndex, swapCount: count
                    });
                    lhsIndex++;
                }

                rhsIndex--;
            }

            midIndex++;
            await sleep(speed);
        }

        lhsIndex--;
        rhsIndex++;

        count += 1;
        this._service.swap(dataset, lhsIndex, lhs);
        callback({
            dataset, lhsPivotIndex: lhs, rhsPivotIndex: rhs, currIndex: lhsIndex,
            nextIndex: lhs, swapCount: count
        });
        await sleep(speed);

        count += 1
        this._service.swap(dataset, rhsIndex, rhs);
        callback({
            dataset, lhsPivotIndex: lhs, rhsPivotIndex: rhs, currIndex: rhsIndex,
            nextIndex: rhs, swapCount: count
        });
        return {fst: lhsIndex, snd: rhsIndex};
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortBySelection(dataset: DataType[], speed: SpeedType, order: OrderType,
                                 callback: (_value: SortReturnMeta) => void): Promise<void> {
        let count: number = 0;

        for (let i = 0; i < dataset.length - 1; i++) {
            let k: number = i;

            for (let j = i + 1; j < dataset.length; j++) {
                if (order === 'ascent' && dataset[j].value < dataset[k].value) {
                    k = j;
                }

                if (order === 'descent' && dataset[j].value > dataset[k].value) {
                    k = j;
                }

                callback({dataset, pivotIndex: i, currIndex: j, nextIndex: k, swapCount: count});
                await sleep(speed);
            }

            count += 1;
            this._service.swap(dataset, i, k);
            await callback({dataset, pivotIndex: i, currIndex: i, nextIndex: k, swapCount: count});
            await sleep(speed);
        }

        await callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortBySelectionDouble(dataset: DataType[], speed: SpeedType, order: OrderType,
                                       callback: (_value: SortReturnMeta) => void): Promise<void> {
        let lhs: number = 0, rhs: number = dataset.length - 1, p: number, q: number, count: number = 0;

        while (lhs <= rhs) {
            p = lhs;
            q = rhs;

            if (order === 'ascent' && dataset[p].value > dataset[q].value) {
                count += 1;
                this._service.swap(dataset, p, q);
                callback({dataset, lhsPivotIndex: p, rhsPivotIndex: p, swapCount: count});
                await sleep(speed);
            }

            if (order === 'descent' && dataset[p].value < dataset[q].value) {
                count += 1;
                this._service.swap(dataset, p, q);
                callback({dataset, lhsPivotIndex: p, rhsPivotIndex: p, swapCount: count});
                await sleep(speed);
            }

            for (let i = lhs + 1, j = rhs - 1; i <= rhs && j >= lhs; i++, j--) {
                if (order === 'ascent') {
                    if (dataset[i].value < dataset[p].value) {
                        p = i;
                    }

                    if (dataset[j].value > dataset[q].value) {
                        q = j;
                    }
                }

                if (order === 'descent') {
                    if (dataset[i].value > dataset[p].value) {
                        p = i;
                    }

                    if (dataset[j].value < dataset[q].value) {
                        q = j;
                    }
                }

                callback({
                    dataset, lhsPivotIndex: lhs, rhsPivotIndex: rhs, lhsCurrIndex: i, lhsNextIndex: p,
                    rhsCurrIndex: j, rhsNextIndex: q, swapCount: count
                });
                await sleep(speed);
            }

            count += 2;
            this._service.swap(dataset, lhs, p);
            this._service.swap(dataset, rhs, q);
            callback({
                dataset, lhsCurrIndex: lhs, lhsNextIndex: p, rhsCurrIndex: rhs, rhsNextIndex: q,
                swapCount: count
            });
            lhs++;
            rhs--;
        }

        callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByShell(dataset: DataType[], speed: SpeedType, order: OrderType,
                             callback: (_value: SortReturnMeta) => void): Promise<void> {
        let count: number = 0;

        for (let gap = Math.ceil(dataset.length * 0.5); gap > 0; gap = Math.floor(gap * 0.5)) {
            for (let i = gap; i < dataset.length; i++) {
                for (let j = i; j >= gap; j -= gap) {
                    if (order === 'ascent' && dataset[j].value < dataset[j - gap].value) {
                        count += 1;
                        this._service.swap(dataset, j, j - gap);
                        callback({dataset, pivotIndex: i, currIndex: j, nextIndex: j - gap, swapCount: count});
                    } else if (order === 'descent' && dataset[j].value > dataset[j - gap].value) {
                        count += 1;
                        this._service.swap(dataset, j, j - gap);
                        callback({dataset, pivotIndex: i, currIndex: j, nextIndex: j - gap, swapCount: count});
                    } else {
                        callback({dataset, pivotIndex: i, currIndex: j, swapCount: count});
                    }

                    await sleep(speed);
                }
            }
        }

        await callback({dataset, swapCount: count});
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByStrand(dataset: DataType[], speed: SpeedType, order: OrderType,
                              callback: (_value: SortReturnMeta) => void): Promise<void> {
        let input: DataType[] = Array.from(dataset).map(item => ({value: item.value, ratio: item.ratio}));
        let output: DataType[] = [], sublist: DataType[] = [], count: number = 0;
        await this.strandStep(dataset, input, output, sublist, count, speed, order, value => {
            count = value.auxCount as number;
            callback({...value, auxCount: count});
        });
        callback({dataset, auxCount: count});
    }

    /**
     *
     * @param dataset
     * @param input
     * @param output
     * @param sublist
     * @param count
     * @param speed
     * @param order
     * @param callback
     * @private
     */
    private async strandStep(dataset: DataType[], input: DataType[], output: DataType[], sublist: DataType[],
                             count: number, speed: SpeedType, order: OrderType,
                             callback: (_value: SortReturnMeta) => void): Promise<void> {
        let data: DataType = input.shift() as DataType, index: number = 0;
        sublist.push(data);

        for (let i = 0; i < input.length; i++) {
            if (order === 'ascent' && input[i].value > data.value) {
                count += 1;
                data = input.splice(i, 1)[0];
                sublist.push(data);
                i--;
            }

            if (order === 'descent' && input[i].value < data.value) {
                count += 1;
                data = input.splice(i, 1)[0];
                sublist.push(data);
                i--;
            }
        }

        let result = this.strandMerge(sublist, output, order);
        output = result.array;
        count += result.count;

        for (let i = 0; i < input.length; i++) {
            count += 1;
            dataset[index++] = input[i];
            callback({dataset, pivotIndex: index, auxCount: count})
            await sleep(speed);
        }

        for (let i = 0; i < output.length; i++) {
            dataset[index++] = output[i];
            callback({dataset, pivotIndex: index, auxCount: count});
            await sleep(speed);
        }

        if (input.length > 0) {
            await this.strandStep(dataset, input, output, sublist, count, speed, order, value => {
                count = value.auxCount as number;
                callback({...value, auxCount: count});
            });
        }
    }

    /**
     *
     * @param sublist
     * @param output
     * @param order
     * @private
     */
    private strandMerge(sublist: DataType[], output: DataType[], order: OrderType): { array: DataType[], count: number } {
        let array: DataType[] = [], index: number = -1, count: number = 0;

        while (sublist.length > 0 && output.length > 0) {
            if (order === 'ascent') {
                count += 1;
                index = this._service.min(sublist, 0, sublist.length - 1);

                if (sublist[index].value <= output[0].value) {
                    array.push(sublist.splice(index, 1)[0]);
                } else {
                    array.push(output.splice(0, 1)[0]);
                }
            }

            if (order === 'descent') {
                count += 1;
                index = this._service.max(sublist, 0, sublist.length - 1);

                if (sublist[index].value >= output[0].value) {
                    array.push(sublist.splice(index, 1)[0]);
                } else {
                    array.push(output.splice(0, 1)[0]);
                }
            }
        }

        while (sublist.length > 0) {
            if (order === 'ascent') {
                count += 1;
                index = this._service.min(sublist, 0, sublist.length - 1);
            }

            if (order === 'descent') {
                count += 1;
                index = this._service.max(sublist, 0, sublist.length - 1);
            }

            array.push(sublist.splice(index, 1)[0]);
        }

        while (output.length > 0) {
            count += 1;
            array.push(output.splice(0, 1)[0]);
        }

        return {array, count};
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByTimBU(dataset: DataType[], speed: SpeedType, order: OrderType,
                             callback: (_value: SortReturnMeta) => void): Promise<void> {
        let minRun: number = this.timMinRunSize(dataset.length), swapCount: number = 0, auxCount: number = 0;

        for (let i = 0; i < dataset.length; i += minRun) {
            let j: number = Math.min(i + minRun - 1, dataset.length - 1);
            await this.sortByInsertionBinary(dataset, i, j, swapCount, speed, order, value => {
                swapCount = value.swapCount as number;
                callback({...value, swapCount, auxCount});
            });
        }

        for (let size = minRun; size < dataset.length; size = size + size) {
            for (let i = 0; i < dataset.length; i += size + size) {
                let j: number = Math.min(i + 2 * size - 1, dataset.length - 1);
                let k: number = Math.min(dataset.length - 1, i + size - 1);
                await this._service.merge(dataset, i, k, j, auxCount, speed, order, value => {
                    auxCount = value.auxCount as number;
                    callback({...value, swapCount, auxCount});
                });
            }
        }

        callback({dataset, swapCount, auxCount});
    }

    /**
     *
     * @param dataset
     * @param lhs
     * @param rhs
     * @param count
     * @param swapCount
     * @param auxCount
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByTimTD(dataset: DataType[], lhs: number, rhs: number, count: number,
                             swapCount: number, auxCount: number, speed: SpeedType, order: OrderType,
                             callback: (_value: SortReturnMeta) => void): Promise<void> {
        if (lhs < rhs) {
            let minRun: number = this.timMinRunSize(rhs - lhs + 1);
            await this.sortByInsertionBinary(dataset, lhs, Math.min(lhs + minRun - 1, rhs), count,
                speed, order, value => {
                    count = value.swapCount as number;
                    callback({...value, swapCount: swapCount + count, auxCount});
                });
            swapCount += count;

            let mid: number = Math.floor((rhs - lhs) * 0.5 + lhs);
            await this.sortByTimTD(dataset, lhs, mid, 0, swapCount, auxCount, speed, order,
                value => {
                    swapCount = value.swapCount as number;
                    auxCount = value.auxCount as number;
                    callback({...value, swapCount, auxCount});
                });
            await this.sortByTimTD(dataset, mid + 1, rhs, 0, swapCount, auxCount, speed, order,
                value => {
                    swapCount = value.swapCount as number;
                    auxCount = value.auxCount as number;
                    callback({...value, swapCount, auxCount});
                });
            await this._service.merge(dataset, lhs, mid, rhs, auxCount, speed, order, value => {
                auxCount = value.auxCount as number;
                callback({...value, swapCount, auxCount});
            });
        }

        callback({dataset, swapCount: swapCount + count, auxCount});
    }

    /**
     *
     * @param length
     * @param span
     */
    public timMinRunSize(length: number, span: 32 | 64 = 32): number {
        let append: number = 0;

        while (length >= span) {
            append |= (length & 1);
            length >>= 1;
        }

        return length + append;
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByTournament(dataset: DataType[], speed: SpeedType, order: OrderType,
                                  callback: (_value: SortReturnMeta) => void): Promise<void> {
        let j: number = -1, count: number = 0;

        for (let i = 0; i < dataset.length - 1; i++) {
            if (order === 'ascent') {
                j = this._service.min(dataset, i, dataset.length - 1);
            }

            if (order === 'descent') {
                j = this._service.max(dataset, i, dataset.length - 1);
            }

            count += 1;
            this._service.swap(dataset, i, j);
            callback({dataset, currIndex: i, nextIndex: j, swapCount: count});
            await sleep(speed);
        }

        await callback({dataset, swapCount: count});
    }

}

@Injectable()
export class DemoDistributionSortService {

    constructor(
        private _dsus: DemoSortUtilityService,
        private _dcss: DemoComparisonSortService
    ) {
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByBST(dataset: DataType[], speed: SpeedType, order: OrderType,
                           callback: (_value: SortReturnMeta) => void): Promise<void> {
        let list: DataType[], tree: BSTNode | null = null, count: number = 0;

        for (let i = 0; i < dataset.length; i++) {
            count += 1;
            tree = this.insertOfBST(tree, dataset[i], order);
            callback({dataset, pivotIndex: i, auxCount: count});
            await sleep(speed);
        }

        list = this.traverseOfBST(tree, []);

        for (let i = 0; i < list.length; i++) {
            count += 1;
            dataset[i] = list[i];
            callback({dataset, pivotIndex: i, auxCount: count});
            await sleep(speed);
        }

        callback({dataset, auxCount: count});
    }

    /**
     *
     * @param tree
     * @param data
     * @param order
     * @private
     */
    private insertOfBST(tree: BSTNode | null, data: DataType, order: OrderType): BSTNode {
        if (tree === null) {
            return {mid: data, lhs: null, rhs: null};
        }

        if (order === 'ascent') {
            if (data.value < tree.mid.value) {
                tree.lhs = this.insertOfBST(tree.lhs, data, order);
            }

            if (data.value > tree.mid.value) {
                tree.rhs = this.insertOfBST(tree.rhs, data, order);
            }
        }

        if (order === 'descent') {
            if (data.value > tree.mid.value) {
                tree.lhs = this.insertOfBST(tree.lhs, data, order);
            }

            if (data.value < tree.mid.value) {
                tree.rhs = this.insertOfBST(tree.rhs, data, order);
            }
        }

        return tree;
    }

    /**
     *
     * @param tree
     * @param list
     * @private
     */
    private traverseOfBST(tree: BSTNode | null, list: DataType[]): DataType[] {
        if (tree !== null) {
            list = this.traverseOfBST(tree.lhs, list);
            list.push(tree.mid);
            list = this.traverseOfBST(tree.rhs, list);
        }

        return list;
    }

    /**
     *
     * @param dataset
     * @param base
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByBucket(dataset: DataType[], base: BaseType, speed: SpeedType, order: OrderType,
                              callback: (_value: SortReturnMeta) => void): Promise<void> {
        let buckets: DataType[][] = Array.from({length: base}).map(() => []);
        let index: number = 0, span: number = Math.ceil(dataset.length / base), j: number;
        let swapCount: number = 0, auxCount: number = 0;

        for (let i = 0; i < dataset.length; i++) {
            let idx: number = Math.floor((dataset[i].value - 1) / span);

            if (order === 'ascent') {
                buckets[idx].push(dataset[i]);
            }

            if (order === 'descent') {
                buckets[base - idx - 1].push(dataset[i]);
            }

            auxCount += 1;
            callback({dataset, pivotIndex: i, auxCount});
            await sleep(speed);
        }

        for (let i = 0; i < buckets.length; i++) {
            for (let j = 0; j < buckets[i].length; j++) {
                auxCount += 1;
                dataset[index++] = buckets[i][j];
                callback({dataset, pivotIndex: index, auxCount});
                await sleep(speed);
            }
        }

        for (let i = 0; i < dataset.length; i += span) {
            j = Math.min(i + span - 1, dataset.length - 1);

            if (span <= 16) {
                await this._dcss.sortByInsertion(dataset, i, j, swapCount, speed, order, value => {
                    swapCount = value.swapCount as number;
                    callback({...value, swapCount, auxCount});
                });
            } else {
                await this._dcss.sortByQuick(dataset, i, j, swapCount, speed, order, value => {
                    swapCount = value.swapCount as number;
                    callback({...value, swapCount, auxCount});
                });
            }

            await sleep(speed);
        }

        buckets.forEach(bucket => bucket.length = 0);
        buckets.length = 0;
        callback({dataset, swapCount, auxCount});
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByCount(dataset: DataType[], speed: SpeedType, order: OrderType,
                             callback: (_value: SortReturnMeta) => void): Promise<void> {
        let min: DataType = dataset[this._dsus.min(dataset, 0, dataset.length - 1)];
        let max: DataType = dataset[this._dsus.max(dataset, 0, dataset.length - 1)];
        let buckets: number[] = Array.from({length: max.value - min.value + 1}).map(() => 0);
        let index: number = 0, count: number = 0;

        for (let i = 0; i < dataset.length; i++) {
            count += 1;
            buckets[dataset[i].value - min.value]++;
            callback({dataset, pivotIndex: i, auxCount: count});
            await sleep(speed);
        }

        if (order === 'ascent') {
            for (let i = 0; i < buckets.length; i++) {
                index = await DemoDistributionSortService.countBack(dataset, min, buckets, i, index, count, speed,
                    value => {
                        count = value.auxCount as number;
                        callback({...value, auxCount: count});
                    });
            }
        }

        if (order === 'descent') {
            for (let i = buckets.length - 1; i >= 0; i--) {
                index = await DemoDistributionSortService.countBack(dataset, min, buckets, i, index, count, speed,
                    value => {
                        count = value.auxCount as number;
                        callback({...value, auxCount: count});
                    });
            }
        }

        buckets.length = 0;
        callback({dataset, auxCount: count});
    }

    /**
     *
     * @param dataset
     * @param min
     * @param buckets
     * @param i
     * @param index
     * @param count
     * @param speed
     * @param callback
     * @private
     */
    private static async countBack(dataset: DataType[], min: DataType, buckets: number[], i: number, index: number,
                                   count: number, speed: SpeedType,
                                   callback: (_value: SortReturnMeta) => void): Promise<number> {
        while (buckets[i] > 0) {
            count += 1;
            dataset[index] = {value: i + min.value, ratio: (i + min.value) / dataset.length};
            callback({dataset, pivotIndex: index, auxCount: count});
            buckets[i]--;
            index++;
            await sleep(speed);
        }

        return index;
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByFlash(dataset: DataType[], speed: SpeedType, order: OrderType,
                             callback: (_value: SortReturnMeta) => void): Promise<void> {
        let min: number = this._dsus.min(dataset, 0, dataset.length - 1);
        let max: number = this._dsus.max(dataset, 0, dataset.length - 1);
        let minmax: number = dataset[max].value - dataset[min].value, size: number = dataset.length - 1;
        let swapCount: number = 0, auxCount: number = 0, key: number | string, index: number = 0;
        let map: { [key: number | string]: DataType[] } = {};

        for (let i = 0; i < dataset.length; i++) {
            auxCount += 1;
            key = Math.floor(size * (dataset[i].value - dataset[min].value) / minmax + 1);

            if (map[key] === undefined) {
                map[key] = [dataset[i]];
            } else {
                map[key].push(dataset[i]);
            }

            callback({dataset, pivotIndex: i, swapCount, auxCount});
            await sleep(speed);
        }

        if (order === 'ascent') {
            for (let i = 0; i < Object.keys(map).length; i++) {
                key = Object.keys(map)[i];

                for (let i = 0; i < map[key].length; i++) {
                    auxCount += 1;
                    dataset[index] = map[key][i];
                    callback({dataset, pivotIndex: index, swapCount, auxCount});
                    index++;
                    await sleep(speed);
                }
            }

            index = 0;

            for (let i = 0; i < Object.keys(map).length; i++) {
                key = Object.keys(map)[i];

                if (map[key].length > 1) {
                    await this._dcss.sortByQuick(dataset, index, index + map[key].length - 1, swapCount, speed, order,
                        value => {
                            swapCount = value.swapCount as number;
                            callback({...value, swapCount, auxCount})
                        });
                    index += map[key].length;
                }
            }
        }

        if (order === 'descent') {
            for (let i = Object.keys(map).length - 1; i >= 0; i--) {
                key = Object.keys(map)[i];

                for (let i = 0; i < map[key].length; i++) {
                    auxCount += 1;
                    dataset[index] = map[key][i];
                    callback({dataset, pivotIndex: index, swapCount, auxCount});
                    index++;
                    await sleep(speed);
                }
            }

            index = 0;

            for (let i = Object.keys(map).length - 1; i >= 0; i--) {
                key = Object.keys(map)[i];

                if (map[key].length > 1) {
                    await this._dcss.sortByQuick(dataset, index, index + map[key].length - 1, swapCount, speed, order,
                        value => {
                            swapCount = value.swapCount as number;
                            callback({...value, swapCount, auxCount})
                        });
                    index += map[key].length;
                }
            }
        }

        Object.keys(map).forEach(key => map[key].length = 0);
        callback({dataset, swapCount, auxCount});
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByPigeonHole(dataset: DataType[], speed: SpeedType, order: OrderType,
                                  callback: (_value: SortReturnMeta) => void): Promise<void> {
        let holes: number[] = Array.from({length: dataset.length}).map(() => 0);
        let count: number = 0, index: number = 0;

        for (let i = 0; i < dataset.length; i++) {
            count += 1;
            holes[dataset[i].value - 1] += 1;
            callback({dataset, pivotIndex: i, auxCount: count});
            await sleep(speed);
        }

        if (order === 'ascent') {
            for (let i = 0; i < holes.length; i++) {
                index = await DemoDistributionSortService.holeBack(dataset, holes, i, index, count, speed, value => {
                    count = value.auxCount as number;
                    callback({...value, auxCount: count});
                });
            }
        }

        if (order === 'descent') {
            for (let i = dataset.length - 1; i >= 0; i--) {
                index = await DemoDistributionSortService.holeBack(dataset, holes, i, index, count, speed, value => {
                    count = value.auxCount as number;
                    callback({...value, auxCount: count});
                });
            }
        }

        holes.length = 0;
        callback({dataset, auxCount: count});
    }

    /**
     *
     * @param dataset
     * @param holes
     * @param i
     * @param index
     * @param count
     * @param speed
     * @param callback
     * @private
     */
    private static async holeBack(dataset: DataType[], holes: number[], i: number, index: number,
                                  count: number, speed: SpeedType,
                                  callback: (_value: SortReturnMeta) => void): Promise<number> {
        if (holes[i] > 0) {
            for (let j = 0; j < holes[i]; j++) {
                count += 1;
                dataset[index] = {value: i + 1, ratio: (i + 1) / dataset.length};
                callback({dataset, pivotIndex: index, auxCount: count});
                index++;
                await sleep(speed);
            }
        }

        return index;
    }

    /**
     *
     * @param dataset
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByPatience(dataset: DataType[], speed: SpeedType, order: OrderType,
                                callback: (_value: SortReturnMeta) => void): Promise<void> {
        let piles: DataType[][] = [], count: number = 0, index: number = 0, flag: boolean;

        for (let i = 0; i < dataset.length; i++) {
            if (piles.length === 0) {
                piles.push([dataset[i]]);
            } else {
                flag = false;

                for (let j = 0; j < piles.length; j++) {
                    if (order === 'ascent' && dataset[i].value < piles[j][piles[j].length - 1].value) {
                        piles[j].push(dataset[i]);
                        flag = true;
                        break;
                    }

                    if (order === 'descent' && dataset[i].value > piles[j][piles[j].length - 1].value) {
                        piles[j].push(dataset[i]);
                        flag = true;
                        break;
                    }
                }

                if (!flag) {
                    piles.push([dataset[i]]);
                }
            }

            count += 1;
            callback({dataset, pivotIndex: i, auxCount: count});
            await sleep(speed);
        }

        for (let i = 0; i < piles.length; i++) {
            for (let j = 0; j < piles[i].length; j++) {
                count += 1;
                dataset[index] = piles[i][j];
                callback({dataset, pivotIndex: index, auxCount: count});
                index++;
                await sleep(speed);
            }
        }

        await this.patienceMerge(dataset, piles, count, speed, order, value => {
            count = value.auxCount as number;
            callback({...value, auxCount: count});
        });
        piles.forEach(pile => pile.length = 0);
        piles.length = 0;
        callback({dataset, auxCount: count});
    }

    /**
     *
     * @param dataset
     * @param buckets
     * @param count
     * @param speed
     * @param order
     * @param callback
     */
    public async patienceMerge(dataset: DataType[], buckets: DataType[][], count: number,
                               speed: SpeedType, order: OrderType,
                               callback: (_value: SortReturnMeta) => void): Promise<void> {
        let array: DataType[] = new Array(buckets.length), index: number = -1;

        for (let i = 0; i < buckets.length; i++) {
            array[i] = buckets[i].pop() as DataType;
        }

        for (let i = 0; i < dataset.length; i++) {
            if (order === 'ascent') {
                index = this._dsus.min(array, 0, array.length - 1);
            }

            if (order === 'descent') {
                index = this._dsus.max(array, 0, array.length - 1);
            }

            count += 1;
            dataset[i] = array[index];
            array[index] = buckets[index].length === 0
                ? {value: order === 'ascent' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY, ratio: 0}
                : buckets[index].pop() as DataType;
            callback({dataset, pivotIndex: i, auxCount: count});
            await sleep(speed);
        }
    }

    /**
     *
     * @param dataset
     * @param base
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByRadixLSD(dataset: DataType[], base: BaseType, speed: SpeedType, order: OrderType,
                                callback: (_value: SortReturnMeta) => void): Promise<void> {
        let index: number = this._dsus.max(dataset, 0, dataset.length - 1), count: number = 0;
        let digits: number = dataset[index].value.toString(base).length, value: string;

        for (let digit = 1; digit <= digits; digit++) {
            for (let i = 0; i < dataset.length; i++) {
                count += 1;
                value = dataset[i].value.toString(base);
                value = '0'.repeat(digits - value.length) + value;
                dataset[i].digit = Number.parseInt(value[digits - digit], base);
                callback({dataset, pivotIndex: i, auxCount: count});
                await sleep(speed);
            }

            await this.radixMergeSort(dataset, 0, dataset.length - 1, 0, count, speed, order,
                value => {
                    count = value.auxCount as number;
                    callback({...value, auxCount: count});
                });
        }

        callback({dataset, auxCount: count});
    }

    /**
     *
     * @param dataset
     * @param base
     * @param speed
     * @param order
     * @param callback
     */
    public async sortByRadixMSD(dataset: DataType[], base: BaseType, speed: SpeedType, order: OrderType,
                                callback: (_value: SortReturnMeta) => void): Promise<void> {
        let buckets: DataType[][] = Array.from({length: base}).map(() => []);
        let index: number = this._dsus.max(dataset, 0, dataset.length - 1);
        let digits: number = dataset[index].value.toString(base).length, swapCount: number = 0, auxCount: number = 0;
        await this.radixMSD(dataset, buckets, digits, 0, 0, dataset.length - 1, base,
            swapCount, auxCount, speed, order, value => {
                swapCount = value.swapCount as number;
                auxCount = value.auxCount as number;
                callback({...value, swapCount, auxCount});
            });
        buckets.forEach(bucket => bucket.length = 0);
        buckets.length = 0;
        callback({dataset, swapCount, auxCount});
    }

    /**
     *
     * @param dataset
     * @param buckets
     * @param digits
     * @param digit
     * @param lhs
     * @param rhs
     * @param base
     * @param swapCount
     * @param auxCount
     * @param speed
     * @param order
     * @param callback
     * @private
     */
    private async radixMSD(dataset: DataType[], buckets: DataType[][], digits: number, digit: number,
                           lhs: number, rhs: number, base: BaseType, swapCount: number, auxCount: number,
                           speed: SpeedType, order: OrderType,
                           callback: (_value: SortReturnMeta) => void): Promise<void> {
        let ranges: RangeType[], bit: number, value: string;

        for (let i = lhs; i <= rhs; i++) {
            value = dataset[i].value.toString(base);
            value = '0'.repeat(digits - value.length) + value;
            bit = Number.parseInt(value[digit], base);
            dataset[i].digit = bit;

            if (order === 'ascent') {
                buckets[bit].push(dataset[i]);
            }

            if (order === 'descent') {
                buckets[base - 1 - bit].push(dataset[i]);
            }
        }

        if (rhs - lhs <= 16) {
            await this.radixInsertSort(dataset, lhs, rhs, swapCount, auxCount, speed, order, value => {
                swapCount = value.swapCount as number;
                auxCount = value.auxCount as number;
                callback({...value, swapCount, auxCount});
            });
        } else {
            await this.radixMergeSort(dataset, lhs, rhs, swapCount, auxCount, speed, order, value => {
                auxCount = value.auxCount as number;
                callback({...value, auxCount});
            });
        }

        ranges = await DemoDistributionSortService.radixRange(buckets, lhs, rhs);
        buckets.forEach(bucket => bucket.length = 0);

        if (digit < digits - 1) {
            for (let i = 0; i < ranges.length; i++) {
                await this.radixMSD(dataset, buckets, digits, digit + 1, ranges[i].lhs, ranges[i].rhs,
                    base, swapCount, auxCount, speed, order, value => {
                        swapCount = value.swapCount as number;
                        auxCount = value.auxCount as number;
                        callback({...value, swapCount, auxCount});
                    });
            }
        }
    }

    /**
     *
     * @param dataset
     * @param lhs
     * @param rhs
     * @param swapCount
     * @param auxCount
     * @param speed
     * @param order
     * @param callback
     * @private
     */
    private async radixInsertSort(dataset: DataType[], lhs: number, rhs: number, swapCount: number,
                                  auxCount: number, speed: SpeedType, order: OrderType,
                                  callback: (_value: SortReturnMeta) => void): Promise<void> {
        let fst: number, snd: number;

        for (let i = lhs; i <= rhs; i++) {
            for (let j = i; j > lhs; j--) {
                fst = dataset[j - 1].digit as number;
                snd = dataset[j].digit as number;

                if (order === 'ascent' && fst > snd) {
                    swapCount += 1;
                    this._dsus.swap(dataset, j, j - 1);
                    callback({dataset, pivotIndex: i, currIndex: j, nextIndex: j - 1, swapCount, auxCount});
                } else if (order === 'descent' && fst < snd) {
                    swapCount += 1;
                    this._dsus.swap(dataset, j, j - 1);
                    callback({dataset, pivotIndex: i, currIndex: j, nextIndex: j - 1, swapCount, auxCount});
                } else {
                    await callback({dataset, pivotIndex: i, currIndex: j, swapCount, auxCount});
                }

                await sleep(speed);
            }
        }
    }

    /**
     *
     * @param dataset
     * @param lhs
     * @param rhs
     * @param swapCount
     * @param auxCount
     * @param auxCount
     * @param speed
     * @param order
     * @param callback
     * @private
     */
    private async radixMergeSort(dataset: DataType[], lhs: number, rhs: number, swapCount: number,
                                 auxCount: number, speed: SpeedType, order: OrderType,
                                 callback: (_value: SortReturnMeta) => void): Promise<void> {
        if (lhs < rhs) {
            let mid: number = Math.floor((rhs - lhs) * 0.5 + lhs);
            await this.radixMergeSort(dataset, lhs, mid, swapCount, auxCount, speed, order, value => {
                auxCount = value.auxCount as number;
                callback({...value, auxCount});
            });
            await this.radixMergeSort(dataset, mid + 1, rhs, swapCount, auxCount, speed, order, value => {
                auxCount = value.auxCount as number;
                callback({...value, auxCount});
            });
            await DemoDistributionSortService.radixMerge(dataset, lhs, mid, rhs, swapCount, auxCount, speed, order,
                value => {
                    auxCount = value.auxCount as number;
                    callback({...value, auxCount});
                });
        }
    }

    /**
     *
     * @param dataset
     * @param lhs
     * @param mid
     * @param rhs
     * @param swapCount
     * @param auxCount
     * @param auxCount
     * @param speed
     * @param order
     * @param callback
     * @private
     */
    private static async radixMerge(dataset: DataType[], lhs: number, mid: number, rhs: number,
                                    swapCount: number, auxCount: number, speed: SpeedType, order: OrderType,
                                    callback: (_value: SortReturnMeta) => void): Promise<void> {
        let i: number = 0, j: number = 0, k: number = lhs, fst: number, snd: number;
        let lhsLength: number = mid - lhs + 1, rhsLength: number = rhs - mid;
        let lhsArray: DataType[] = new Array(lhsLength), rhsArray: DataType[] = new Array(rhsLength);

        for (let x = 0; x < lhsLength; x++) {
            auxCount += 1;
            lhsArray[x] = dataset[lhs + x];
            callback({dataset, pivotIndex: x + lhs, swapCount, auxCount});
            await sleep(speed);
        }

        for (let x = 0; x < rhsLength; x++) {
            auxCount += 1;
            rhsArray[x] = dataset[mid + 1 + x];
            callback({dataset, pivotIndex: mid + 1 + x, swapCount, auxCount});
            await sleep(speed);
        }

        while (i < lhsLength && j < rhsLength) {
            fst = lhsArray[i].digit as number;
            snd = rhsArray[j].digit as number;

            if (order === 'ascent' && fst <= snd) {
                dataset[k] = lhsArray[i++];
            } else if (order === 'descent' && fst >= snd) {
                dataset[k] = lhsArray[i++];
            } else {
                dataset[k] = rhsArray[j++];
            }

            auxCount += 1;
            await callback({dataset, pivotIndex: k++, currIndex: i + lhs, nextIndex: j + mid, swapCount, auxCount});
            await sleep(speed);
        }

        while (i < lhsLength) {
            auxCount += 1;
            dataset[k++] = lhsArray[i++];
            await callback({dataset, pivotIndex: k, currIndex: i + lhs, nextIndex: j + mid, swapCount, auxCount});
            await sleep(speed);
        }

        while (j < rhsLength) {
            auxCount += 1;
            dataset[k++] = rhsArray[j++];
            await callback({dataset, pivotIndex: k, currIndex: i + lhs, nextIndex: j + mid, swapCount, auxCount});
            await sleep(speed);
        }
    }

    /**
     *
     * @param buckets
     * @param lhs
     * @param rhs
     * @private
     */
    private static async radixRange(buckets: DataType[][], lhs: number, rhs: number): Promise<RangeType[]> {
        let ranges: RangeType[] = [], start: number = lhs, end: number;

        for (let i = 0; i < buckets.length; i++) {
            if (buckets[i].length > 0) {
                end = Math.min(start + buckets[i].length - 1, rhs);
                ranges.push({lhs: start, rhs: end});
                start = end + 1;
            }
        }

        return ranges;
    }

}
