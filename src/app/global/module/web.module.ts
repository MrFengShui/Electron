import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {StoreModule} from "@ngrx/store";

import {GlobalMaterialModule} from "./material.module";
import {GlobalTranslateModule} from "./translate.module";
import {WebDemoModule} from "../../web/demo/demo.module";

import {DemoErrorView} from "../../web/error/error.component";
import {DemoHomeView} from "../../web/home/home.component";
import {DemoLoginView} from "../../web/login/login.component";
import {DemoTestView} from "../../web/test/test.component";
import {WidgetConfirmOverlay} from "../../widget/confirm.component";

import {STORAGE_FEATURE_KEY} from "../ngrx/storage.selector";
import {STORAGE_REDUCER} from "../ngrx/storage.reducer";

@NgModule({
    declarations: [
        DemoErrorView,
        DemoHomeView,
        DemoLoginView,
        DemoTestView,
        WidgetConfirmOverlay
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        StoreModule.forFeature(STORAGE_FEATURE_KEY, STORAGE_REDUCER),
        WebDemoModule,
        GlobalMaterialModule,
        GlobalTranslateModule,
        ReactiveFormsModule
    ],
    exports: [
        DemoErrorView,
        DemoHomeView,
        DemoLoginView,
        DemoTestView,
        WidgetConfirmOverlay
    ]
})
export class GlobalWebModule {}
