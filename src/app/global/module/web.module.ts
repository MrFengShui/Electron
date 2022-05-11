import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {GlobalMaterialModule} from "./material.module";

import {DemoErrorView} from "../../web/error/error.component";
import {DemoSortView} from "../../web/sort/sort.component";

import {SortStatusPipe} from "../../web/sort/sort.pipe";
import {DurationPipe} from "../pipe/duration.pipe";

@NgModule({
    declarations: [
        DemoErrorView,
        DemoSortView,
        DurationPipe,
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
        DemoSortView,
        DurationPipe,
        SortStatusPipe
    ]
})
export class GlobalWebModule {}
