import {NgModule} from '@angular/core';
import {HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {StoreModule} from "@ngrx/store";

import {GlobalMaterialModule} from "./global/module/material.module";
import {GlobalRouteModule} from './global/module/route.module';
import {GlobalTranslateModule} from "./global/module/translate.module";
import {GlobalWebModule} from "./global/module/web.module";

import {AppComponent} from './app.component';

import {STORAGE_FEATURE_KEY} from "./global/ngrx/storage.selector";
import {STORAGE_REDUCER} from "./global/ngrx/storage.reducer";

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        StoreModule.forRoot([]),
        GlobalMaterialModule,
        GlobalRouteModule,
        GlobalTranslateModule,
        GlobalWebModule
    ],
    providers: [],
    exports: [
        AppComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
