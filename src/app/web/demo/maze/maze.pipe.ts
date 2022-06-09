import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: 'mss'
})
export class MazeStatusPipe implements PipeTransform {

    transform(value: 0 | 1 | 2 | null): string {
        switch (value) {
            case 0: return 'DEMO.MAZE.STATUS.MOUNT';
            case 1: return 'DEMO.MAZE.STATUS.GEN';
            case 2: return 'DEMO.MAZE.STATUS.SOL';
            default: return '';
        }
    }

}
