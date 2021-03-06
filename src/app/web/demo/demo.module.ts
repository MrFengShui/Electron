import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule, Routes} from "@angular/router";
import {TranslocoModule} from "@ngneat/transloco";

import {GlobalCDKModule} from "../../global/module/cdk.module";
import {GlobalMaterialModule} from "../../global/module/material.module";

import {MazeListUnsavedCanDeactivate} from "../../global/auth/deactive.service";

import {DurationPipe} from "../../global/pipe/duration.pipe";
import {GameStatusPipe} from "./game/game.pipe";
import {MazeCreateStatusPipe, MazeSolveStatusPipe} from "./maze/maze.pipe";
import {SortOrderPipe, SortStatusPipe} from "./sort/sort.pipe";

import {DemoOutletView} from "./demo.component";
import {DemoIconView} from "./icon/icon.component";
import {DemoMazeGenerateView} from "./maze/generate.component";
import {DemoMazePathfindView} from "./maze/pathfind.component";
import {DemoSortView} from "./sort/sort.component";
import {DemoSnakeView} from "./game/snake.component";

const routes: Routes = [
    {path: '', redirectTo: 'navigation', pathMatch: 'full'},
    {path: 'icon', component: DemoIconView},
    {path: 'maze/generate', component: DemoMazeGenerateView, canDeactivate: [MazeListUnsavedCanDeactivate]},
    {path: 'maze/solve', component: DemoMazePathfindView},
    {path: 'game/snake', component: DemoSnakeView},
    {path: 'sort', component: DemoSortView}
];

@NgModule({
    declarations: [
        DemoOutletView,
        DemoIconView,
        DemoMazeGenerateView,
        DemoMazePathfindView,
        DemoSnakeView,
        DemoSortView,
        DurationPipe,
        GameStatusPipe,
        MazeCreateStatusPipe,
        MazeSolveStatusPipe,
        SortOrderPipe,
        SortStatusPipe
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),
        TranslocoModule,
        GlobalCDKModule,
        GlobalMaterialModule
    ],
    exports: [
        DemoOutletView,
        DemoIconView,
        DemoMazeGenerateView,
        DemoMazePathfindView,
        DemoSnakeView,
        DemoSortView,
        DurationPipe,
        GameStatusPipe,
        MazeCreateStatusPipe,
        MazeSolveStatusPipe,
        SortOrderPipe,
        SortStatusPipe
    ],
    providers: [
        MazeListUnsavedCanDeactivate
    ]
})
export class WebDemoModule {}
