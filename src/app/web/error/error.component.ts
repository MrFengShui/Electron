import {ChangeDetectionStrategy, Component, HostBinding} from "@angular/core";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'demo-error-view',
    templateUrl: './error.component.html'
})
export class DemoErrorView {

    @HostBinding('class') class: string = 'demo-error-view';

}
