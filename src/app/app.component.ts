import {animate, state, style, transition, trigger} from "@angular/animations";
import {
    AfterViewInit, ApplicationRef, ChangeDetectorRef,
    Component,
    HostBinding,
    HostListener,
    Inject, NgZone, OnDestroy, OnInit,
    Renderer2,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {APP_BASE_HREF, DOCUMENT} from "@angular/common";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {TranslocoService} from "@ngneat/transloco";
import {Store} from "@ngrx/store";
import {BehaviorSubject, interval, Subject, Subscription} from "rxjs";

import {LocaleType, register} from "./global/utils/global.utils";

import {StorageSaveLoadState} from "./global/ngrx/storage.reducer";
import {STORAGE_SELECTOR} from "./global/ngrx/storage.selector";
import {
    STORAGE_COLOR_LOAD_ACTION,
    STORAGE_INIT_ACTION, STORAGE_LOCALE_LOAD_ACTION,
    STORAGE_THEME_LOAD_ACTION
} from "./global/ngrx/storage.action";

@Component({
    animations: [
        trigger('BRIGHT_MORE_LESS', [
            state('more', style({filter: 'brightness(2.0)'})),
            state('less', style({filter: 'brightness(1.0)'})),
            transition('more <=> less', animate('1000ms 0ms linear'))
        ])
    ],
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [{provide: APP_BASE_HREF, useValue: '.'}]
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild('splash', {read: TemplateRef})
    private splash!: TemplateRef<any>;

    @HostBinding('class') class: string = 'demo-root';

    @HostListener('window:load')
    private listenWindowOnload(): void {
        let subscription = this._zone.runTask(() =>
            this.progress$.subscribe(value => {
                if (value === 100) {
                    subscription.unsubscribe();

                    let task = setTimeout(() => {
                        clearTimeout(task);
                        this.hideSplashScreen();
                    }, 1000);
                }
            }));
    }

    bright$: Subject<boolean> = new BehaviorSubject<boolean>(false);
    progress$: Subject<number> = new BehaviorSubject<number>(0);

    readonly tags: { title: string, subtitle: string } = {
        title: 'DEMO.PUBLIC.DECLAIM',
        subtitle: 'DEMO.PUBLIC.COPYRIGHT'
    };

    private subscriptions: Subscription[] = [];
    private dialogRef: MatDialogRef<any> | null = null;
    private progress: number = 0;
    private first!: boolean;

    constructor(
        private _ref: ApplicationRef,
        @Inject(DOCUMENT)
        private _document: Document,
        private _cdr: ChangeDetectorRef,
        private _render: Renderer2,
        private _zone: NgZone,
        private _store: Store<StorageSaveLoadState>,
        private _service: TranslocoService,
        private _dialog: MatDialog
    ) {
        let subscription = this._zone.runTask(() =>
            interval(10).subscribe(() =>
                this._zone.run(() => this._ref.tick())));
        this.subscriptions.push(subscription);
    }

    ngOnInit() {
        this.initStorageProperties();
    }

    ngAfterViewInit() {
        // this.showSplashScreen();
        this.listenStoragePropertiesChange();
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            if (!subscription.closed) {
                subscription.unsubscribe();
            }
        });
    }

    private initStorageProperties(): void {
        this.first = window.sessionStorage.getItem('locale') === null
            && window.sessionStorage.getItem('color') === null
            && window.sessionStorage.getItem('theme') === null

        if (this.first) {
            this._store.dispatch(STORAGE_INIT_ACTION());
        } else {
            this._store.dispatch(STORAGE_LOCALE_LOAD_ACTION());
            this._store.dispatch(STORAGE_COLOR_LOAD_ACTION());
            this._store.dispatch(STORAGE_THEME_LOAD_ACTION());
        }
    }

    private listenStoragePropertiesChange(): void {
        let subscription = this._zone.runOutsideAngular(() =>
            this._store.select(STORAGE_SELECTOR)
                .subscribe(value => {
                    if (value.locale !== null) {
                        this._service.setActiveLang(value.locale as LocaleType);
                        register(value.locale as LocaleType);
                    }

                    if (value.color !== null && value.theme !== null) {
                        this._render.setAttribute(this._document.documentElement, 'class',
                            `global-theme theme-${value.color} ${value.theme ? 'active' : ''}`);
                    }
                }));
        this.subscriptions.push(subscription);
    }

    private execLoadingProgress(): void {
        let subscription = this._zone.runTask(() => interval(1000)
            .subscribe(value => {
                this.bright$.next(value % 2 === 0);
                this.progress += Math.random() * 5;
                this.progress$.next(Math.min(this.progress, 100));
            }));
        this.subscriptions.push(subscription);
    }

    private showSplashScreen(): void {
        if (this.dialogRef === null) {
            this.dialogRef = this._dialog.open(this.splash, {
                minWidth: '100vw', minHeight: '100vh', maxWidth: '100vw', maxHeight: '100vh',
                panelClass: ['demo-splash-screen']
            });
        }

        let subscription = this.dialogRef.afterOpened().subscribe(() => {
            this.execLoadingProgress();
            subscription.unsubscribe();
        });
    }

    private hideSplashScreen(): void {
        if (this.dialogRef !== null) {
            this.dialogRef.close();
            this.dialogRef = null;
        }
    }

}
