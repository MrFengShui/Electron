import {ChangeDetectionStrategy, Component, HostBinding} from "@angular/core";

import {RouteLinkModel} from "../../../global/model/global.model";

import {NAV_LINKS} from "../../../global/utils/global.utils";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'demo-navigation-view',
    templateUrl: 'navigation.component.html'
})
export class DemoNavigationView {

    @HostBinding('class') class: string = 'demo-navigation-view';

    readonly links: RouteLinkModel[] = NAV_LINKS;

}
