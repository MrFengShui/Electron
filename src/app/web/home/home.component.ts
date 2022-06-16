import {ChangeDetectionStrategy, Component, HostBinding} from "@angular/core";

import {RouteLinkModel} from "../../global/model/global.model";

import {NAV_LINKS} from "../../global/utils/global.utils";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'demo-home-view',
    templateUrl: 'home.component.html'
})
export class DemoHomeView {

    @HostBinding('class') class: string = 'demo-home-view';

    readonly links: RouteLinkModel[] = NAV_LINKS;

}
