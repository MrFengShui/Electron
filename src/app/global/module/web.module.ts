import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {StoreModule} from "@ngrx/store";

import {GlobalMaterialModule} from "./material.module";
import {GlobalTranslateModule} from "./translate.module";
import {WebDemoModule} from "../../web/demo/demo.module";

import {DemoErrorView} from "../../web/error/error.component";

import {STORAGE_FEATURE_KEY} from "../ngrx/storage.selector";
import {STORAGE_REDUCER} from "../ngrx/storage.reducer";

@NgModule({
    declarations: [
        DemoErrorView
    ],
    imports: [
        CommonModule,
        StoreModule.forFeature(STORAGE_FEATURE_KEY, STORAGE_REDUCER),
        WebDemoModule,
        GlobalMaterialModule,
        GlobalTranslateModule
    ],
    exports: [
        DemoErrorView
    ]
})
export class GlobalWebModule {}
