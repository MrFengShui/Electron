import {Pipe, PipeTransform} from "@angular/core";
import {OrderType} from "./sort.service";

@Pipe({
    name: 'ssp'
})
export class SortStatusPipe implements PipeTransform {

    transform(value: 0 | 1 | 2 | null): string {
        switch (value) {
            case 0: return 'DEMO.SORT.STATUS.MOUNT';
            case 1: return 'DEMO.SORT.STATUS.SHUFFLE';
            case 2: return 'DEMO.SORT.STATUS.RUN';
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
