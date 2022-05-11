import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: 'dss'
})
export class SortStatusPipe implements PipeTransform {

    transform(value: 0 | 1 | 2 | null): string {
        switch (value) {
            case 0: return 'Mounting';
            case 1: return 'Shuffling';
            case 2: return 'Sorting';
            default: return '';
        }
    }

}
