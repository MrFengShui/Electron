import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree} from "@angular/router";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {Observable} from "rxjs";

import {DemoMazeGenerateView} from "../../web/demo/maze/generate.component";
import {WidgetConfirmOverlay} from "../../widget/confirm.component";

@Injectable()
export class MazeListUnsavedCanDeactivate implements CanDeactivate<DemoMazeGenerateView> {

    constructor(private _dialog: MatDialog) {
    }

    canDeactivate(
        component: DemoMazeGenerateView,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState?: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return new Observable<boolean | UrlTree>(subscriber => {
            if (component.source.data.length > 0) {
                let ref: MatDialogRef<WidgetConfirmOverlay, boolean> = this._dialog.open(WidgetConfirmOverlay, {
                    data: 'DEMO.MAZE.UNSAVE', hasBackdrop: true, panelClass: ['widget-overlay'], role: 'alertdialog'
                });
                let subscription = ref.afterClosed().subscribe(value => {
                    subscriber.next(value);
                    subscription.unsubscribe();
                });
            } else {
                subscriber.next(false);
            }
        });
    }

}
