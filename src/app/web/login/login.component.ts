import {ChangeDetectionStrategy, Component, HostBinding, NgZone, OnInit} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";

import {LoginInfoCryptoService} from "../../global/auth/crypto.service";

import {storage} from "../../global/ngrx/storage.reducer";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'demo-login-view',
    templateUrl: 'login.component.html'
})
export class DemoLoginView implements OnInit {

    @HostBinding('class') class: string = 'demo-login-view';

    group!: FormGroup;
    visible: boolean = false;

    constructor(
        private _builder: FormBuilder,
        private _router: Router,
        private _zone: NgZone,
        private _service: LoginInfoCryptoService
    ) {
    }

    ngOnInit() {
        this.group = this._builder.group({
            usrCtrl: new FormControl('',
                [Validators.minLength(8), Validators.maxLength(32)]),
            pwdCtrl: new FormControl('',
                [Validators.minLength(8), Validators.maxLength(32)])
        });
    }

    handleToggleLoginAction(): void {
        let username: string = this.group.value['usrCtrl'];
        let password: string = this.group.value['pwdCtrl'];

        if (this.group.valid && username === 'Angular2009' && password === 'Electron2013') {
            let start: number = Date.now(), final: number = start + 1000 * 3600 * 24 * 7;
            let subscription = this._zone.runTask(() =>
                this._service.encrypt({account: this.group.value['usrCtrl'], start, final})
                    .subscribe(value => {
                        if (value) {
                            subscription.unsubscribe();
                            storage.setItem('token', value);
                            this._router.navigateByUrl('/').then();
                        }
                    }));
        }
    }

}
