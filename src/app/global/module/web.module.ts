import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {GlobalMaterialModule} from "./material.module";

import {DemoErrorView} from "../../web/error/error.component";
import {DemoIconView} from "../../web/icon/icon.component";
import {DemoMazeGenerateView} from "../../web/maze/generate.component";
import {DemoSortView} from "../../web/sort/sort.component";

import {DurationPipe} from "../pipe/duration.pipe";
import {MazeStatusPipe} from "../../web/maze/maze.pipe";
import {SortStatusPipe} from "../../web/sort/sort.pipe";

@NgModule({
    declarations: [
        DemoErrorView,
        DemoIconView,
        DemoMazeGenerateView,
        DemoSortView,
        DurationPipe,
        MazeStatusPipe,
        SortStatusPipe
    ],
    imports: [
        CommonModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        GlobalMaterialModule
    ],
    exports: [
        DemoErrorView,
        DemoIconView,
        DemoMazeGenerateView,
        DemoSortView,
        DurationPipe,
        MazeStatusPipe,
        SortStatusPipe
    ]
})
export class GlobalWebModule {}
