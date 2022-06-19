import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from "@angular/router";
import {map, Observable} from "rxjs";

import {LoginInfoCryptoService} from "./crypto.service";
import {storage} from "../ngrx/storage.reducer";

@Injectable({
    providedIn: 'root'
})
export class AuthorizeCanActive implements CanActivate {

    constructor(
        private _router: Router,
        private _service: LoginInfoCryptoService
    ) {
    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this._service.decrypt().pipe(map(value => {
            if (value) {
                let info: {account: string, start: number, final: number} = JSON.parse(value);
                let flag: boolean = info.account === 'Angular2009'
                    && Math.abs(info.start - info.final) === 1000 * 3600 * 24 * 7;

                if (flag) {
                    return true;
                } else {
                    storage.removeItem('token');
                    return this._router.parseUrl('/login');
                }
            }

            return this._router.parseUrl('/login');
        }));
    }

}
