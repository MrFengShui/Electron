import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: 'mss'
})
export class MazeStatusPipe implements PipeTransform {

    transform(value: 0 | 1 | 2 | null): string {
        switch (value) {
            case 0: return 'Mounting';
            case 1: return 'Generating';
            case 2: return 'Solving';
            default: return '';
        }
    }

}
