import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslocoModule} from "@ngneat/transloco";

import {GlobalMaterialModule} from "./material.module";

import {DemoErrorView} from "../../web/error/error.component";
import {DemoIconView} from "../../web/icon/icon.component";
import {DemoMazeGenerateView} from "../../web/maze/generate.component";
import {DemoMazeSolveView} from "../../web/maze/solve.component";
import {DemoSortView} from "../../web/sort/sort.component";

import {DurationPipe} from "../pipe/duration.pipe";
import {MazeStatusPipe} from "../../web/maze/maze.pipe";
import {SortOrderPipe, SortStatusPipe} from "../../web/sort/sort.pipe";

@NgModule({
    declarations: [
        DemoErrorView,
        DemoIconView,
        DemoMazeGenerateView,
        DemoMazeSolveView,
        DemoSortView,
        DurationPipe,
        MazeStatusPipe,
        SortOrderPipe,
        SortStatusPipe
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslocoModule,
        GlobalMaterialModule
    ],
    exports: [
        DemoErrorView,
        DemoIconView,
        DemoMazeGenerateView,
        DemoMazeSolveView,
        DemoSortView,
        DurationPipe,
        MazeStatusPipe,
        SortOrderPipe,
        SortStatusPipe
    ]
})
export class GlobalWebModule {}
