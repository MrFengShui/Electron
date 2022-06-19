import {Component, HostBinding, Inject} from "@angular/core";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
    selector: 'widget-confirm-overlay',
    template: `
        <div mat-dialog-title class="d-flex align-items-center sx-50">
            <mat-icon>warning</mat-icon>
            <span class="mat-title my-0">Confirm</span>
        </div>
        <div mat-dialog-content class="d-flex align-items-center sx-50">
            <span class="flex-fill">{{_data | transloco}}</span>
        </div>
        <mat-divider style="margin: 1.5rem -1.5rem 0"></mat-divider>
        <div mat-dialog-actions class="justify-content-end sx-50">
            <button mat-button [mat-dialog-close]="true">
                {{'DEMO.PUBLIC.RESULT.YES' | transloco}}
            </button>
            <button mat-button [mat-dialog-close]="false">
                {{'DEMO.PUBLIC.RESULT.NO' | transloco}}
            </button>
        </div>
    `
})
export class WidgetConfirmOverlay {

    @HostBinding('class') class: string = 'widget-confirm-overlay';

    constructor(
        @Inject(MAT_DIALOG_DATA)
        public _data: string
    ) {
    }

}
