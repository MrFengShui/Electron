import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    TemplateRef,
    ViewChild
} from "@angular/core";
import {Observable} from "rxjs";

import {NAV_LINKS} from "../../global/utils/global.utils";

import {RouteLinkModel} from "../../global/model/global.model";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'demo-outlet-view',
    templateUrl: 'demo.component.html'
})
export class DemoOutletView {

    @ViewChild('splash', {read: TemplateRef})
    private splash!: TemplateRef<any>;

    @HostBinding('class') class: string = 'demo-outlet-view';

    readonly links: RouteLinkModel[] = NAV_LINKS;

}
