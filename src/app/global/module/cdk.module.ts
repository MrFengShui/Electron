import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ClipboardModule} from "@angular/cdk/clipboard";

@NgModule({
    imports: [
        CommonModule,
        ClipboardModule
    ],
    exports: [
        ClipboardModule
    ]
})
export class GlobalCDKModule {}
