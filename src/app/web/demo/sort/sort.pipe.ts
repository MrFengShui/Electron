import {Pipe, PipeTransform} from "@angular/core";

import {OrderType} from "./sort.service";

import {ThreeStateType} from "../../../global/utils/global.utils";

@Pipe({
    name: 'ssp'
})
export class SortStatusPipe implements PipeTransform {

    transform(value: ThreeStateType | null): string {
        switch (value) {
            case -1: return 'DEMO.SORT.STATUS.DONE';
            case 0: return 'DEMO.SORT.STATUS.SHUFFLE';
            case 1: return 'DEMO.SORT.STATUS.SORT';
            default: return '';
        }
    }

}

@Pipe({
    name: 'sop'
})
export class SortOrderPipe implements PipeTransform {

    transform(value: OrderType | null): string {
        switch (value) {
            case 'ascent': return 'DEMO.SORT.ORDER.ASCENT';
            case 'descent': return 'DEMO.SORT.ORDER.DESCENT';
            default: return '';
        }
    }

}
