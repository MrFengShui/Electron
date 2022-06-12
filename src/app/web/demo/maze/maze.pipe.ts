import {Pipe, PipeTransform} from "@angular/core";

import {ThreeStateType} from "../../../global/utils/global.utils";

@Pipe({
    name: 'mcsp'
})
export class MazeCreateStatusPipe implements PipeTransform {

    transform(value: ThreeStateType | null): string {
        switch (value) {
            case -1: return 'DEMO.MAZE.STATUS.DONE';
            case 0: return 'DEMO.MAZE.STATUS.READY';
            case 1: return 'DEMO.MAZE.STATUS.CREATE';
            default: return '';
        }
    }

}

@Pipe({
    name: 'mssp'
})
export class MazeSolveStatusPipe implements PipeTransform {

    transform(value: ThreeStateType | null): string {
        switch (value) {
            case -1: return 'DEMO.MAZE.STATUS.DONE';
            case 0: return 'DEMO.MAZE.STATUS.READY';
            case 1: return 'DEMO.MAZE.STATUS.SOLVE';
            default: return '';
        }
    }

}
