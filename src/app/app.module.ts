import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

import {GlobalMaterialModule} from "./global/module/material.module";
import {GlobalRouteModule} from './global/module/route.module';


import {AppComponent} from './app.component';

import {GlobalWebModule} from "./global/module/web.module";

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        GlobalMaterialModule,
        GlobalRouteModule,
        GlobalWebModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
