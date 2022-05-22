import {ChangeDetectionStrategy, Component, HostBinding} from "@angular/core";

import {DemoMazeSolveAlgorithmService} from "./maze.service";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'demo-maze-solve-view',
    templateUrl: './solve.component.html',
    providers: [DemoMazeSolveAlgorithmService]
})
export class DemoMazeSolveView {

    @HostBinding('class') class: string = 'demo-maze-solve-view';

}
