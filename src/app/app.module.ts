import {NgModule} from '@angular/core';
import {HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

import {GlobalMaterialModule} from "./global/module/material.module";
import {GlobalRouteModule} from './global/module/route.module';
import {GlobalWebModule} from "./global/module/web.module";

import {AppComponent} from './app.component';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        GlobalMaterialModule,
        GlobalRouteModule,
        GlobalWebModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
