import {NgModule} from '@angular/core';
import {HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {StoreModule} from "@ngrx/store";
import {StoreDevtoolsModule} from "@ngrx/store-devtools";

import {environment} from "../environments/environment";

import {GlobalMaterialModule} from "./global/module/material.module";
import {GlobalRouteModule} from './global/module/route.module';
import {GlobalTranslateModule} from "./global/module/translate.module";
import {GlobalWebModule} from "./global/module/web.module";

import {AppComponent} from './app.component';
import {APP_BASE_HREF} from "@angular/common";

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
        StoreDevtoolsModule.instrument({
            autoPause: true,
            logOnly: environment.production,
            maxAge: 8,
            name: 'electron-ngxr-store-dev-tool'
        }),
        GlobalMaterialModule,
        GlobalRouteModule,
        GlobalTranslateModule,
        GlobalWebModule
    ],
    providers: [
        // {provide: APP_BASE_HREF, useValue: '/electron'}
    ],
    exports: [
        AppComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
