import {Pipe, PipeTransform} from "@angular/core";

import {ThreeStateType} from "../../../global/utils/global.utils";

@Pipe({
    name: 'gsp'
})
export class GameStatusPipe implements PipeTransform {

    transform(value: ThreeStateType| null): string {
        switch (value) {
            case -1: return 'DEMO.GAME.STATE.OVER';
            case 0: return 'DEMO.GAME.STATE.READY';
            case 1: return 'DEMO.GAME.STATE.START';
            default: return '';
        }
    }

}
