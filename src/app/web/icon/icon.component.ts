import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    NgZone,
    OnDestroy
} from "@angular/core";
import {Observable, of} from "rxjs";

import {DemoIconSVGService} from "./icon.service";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'demo-icon-view',
    templateUrl: './icon.component.html'
})
export class DemoIconView implements OnDestroy, AfterViewInit {

    @HostBinding('class') class: string = 'demo-icon-view';

    icons$: Observable<string[]> | null = null;

    constructor(
        private _cdr: ChangeDetectorRef,
        private _zone: NgZone,
        private _service: DemoIconSVGService
    ) {}

    ngOnDestroy() {
        this.icons$ = null;
    }

    ngAfterViewInit() {
        this._zone.runOutsideAngular(() => {
            if (this.icons$ === null) {
                this.icons$ = of(this._service.icons);
            }

            this._zone.run(() => this._cdr.detectChanges());
        });
    }

}
