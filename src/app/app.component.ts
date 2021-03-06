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
import {DOCUMENT} from "@angular/common";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {TranslocoService} from "@ngneat/transloco";
import {Store} from "@ngrx/store";
import {BehaviorSubject, filter, interval, map, Observable, of, Subject, Subscription} from "rxjs";

import {ColorType, LocaleType, register} from "./global/utils/global.utils";

import {storage, StorageSaveLoadState} from "./global/ngrx/storage.reducer";
import {STORAGE_SELECTOR} from "./global/ngrx/storage.selector";
import {
    STORAGE_COLOR_LOAD_ACTION, STORAGE_COLOR_SAVE_ACTION,
    STORAGE_INIT_ACTION, STORAGE_LOCALE_LOAD_ACTION, STORAGE_LOCALE_SAVE_ACTION,
    STORAGE_THEME_LOAD_ACTION, STORAGE_THEME_SAVE_ACTION
} from "./global/ngrx/storage.action";
import {MatRadioChange} from "@angular/material/radio";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";

interface PaletteToggleModel {

    color: ColorType;
    label: string;
    style: string;

}

interface LocaleToggleModel {

    code: LocaleType;
    name: string;

}

@Component({
    animations: [
        trigger('BRIGHT_MORE_LESS', [
            state('more', style({filter: 'brightness(2.0)'})),
            state('less', style({filter: 'brightness(1.0)'})),
            transition('more <=> less', animate('1000ms 0ms linear'))
        ])
    ],
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild('splash', {read: TemplateRef})
    private splash!: TemplateRef<any>;

    @HostBinding('class') class: string = 'demo-root';

    @HostListener('window:load')
    private listenWindowOnload(): void {
        this.execLoadingProgress();
    }

    bright$: Subject<boolean> = new BehaviorSubject<boolean>(false);
    progress$: Subject<number> = new BehaviorSubject<number>(0);
    path$!: Observable<boolean>;

    locale: LocaleType | null = null;
    color: ColorType | null = null;
    theme: boolean | null = null;

    readonly paletteToggles: PaletteToggleModel[] = [
        {color: 'default', label: 'DEMO.TUNE.THEME.DEFAULT', style: '#9C27B0'},
        {color: 'spring', label: 'DEMO.TUNE.THEME.SPRING', style: '#4CAF50'},
        {color: 'summer', label: 'DEMO.TUNE.THEME.SUMMER', style: '#F44336'},
        {color: 'autumn', label: 'DEMO.TUNE.THEME.AUTUMN', style: '#FF5722'},
        {color: 'winter', label: 'DEMO.TUNE.THEME.WINTER', style: '#3F51B5'}
    ];
    readonly localeToggles: LocaleToggleModel[] = [
        {code: 'en', name: 'DEMO.TUNE.LOCALE.EN'},
        {code: 'zhs', name: 'DEMO.TUNE.LOCALE.ZHS'},
        {code: 'zht', name: 'DEMO.TUNE.LOCALE.ZHT'}
    ];
    readonly tags: { title: string, subtitle: string } = {
        title: 'DEMO.PUBLIC.DECLAIM',
        subtitle: 'DEMO.PUBLIC.COPYRIGHT'
    };

    private subscriptions: Subscription[] = [];
    private dialogRef: MatDialogRef<any> | null = null;
    private first!: boolean;

    constructor(
        private _ref: ApplicationRef,
        private _route: ActivatedRoute,
        @Inject(DOCUMENT)
        private _document: Document,
        private _cdr: ChangeDetectorRef,
        private _render: Renderer2,
        private _router: Router,
        private _zone: NgZone,
        private _store: Store<StorageSaveLoadState>,
        private _service: TranslocoService,
        private _dialog: MatDialog
    ) {
        this.autoTopDownRefresh();
        this.listenRouterChange();
    }

    ngOnInit() {
        this.initStorageProperties();
    }

    ngAfterViewInit() {
        this.showSplashScreen();
        this.listenStoragePropertiesChange();
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            if (!subscription.closed) {
                subscription.unsubscribe();
            }
        });
    }

    listenLocaleChange(change: MatRadioChange): void {
        this._store.dispatch(STORAGE_LOCALE_SAVE_ACTION({payload: change.value}));
    }

    listenColorChange(change: MatRadioChange): void {
        this._store.dispatch(STORAGE_COLOR_SAVE_ACTION({payload: change.value}));
    }

    listenThemeChange(change: MatSlideToggleChange): void {
        this._store.dispatch(STORAGE_THEME_SAVE_ACTION({payload: change.checked}));
    }

    private autoTopDownRefresh(): void {
        let subscription = this._zone.runTask(() =>
            interval(10).subscribe(() =>
                this._zone.run(() => this._ref.tick())));
        this.subscriptions.push(subscription);
    }

    private listenRouterChange(): void {
        let subscription = this._zone.runTask(() => this._router.events
            .pipe(
                filter(value => value instanceof NavigationEnd),
                map(() => this._route.snapshot.firstChild?.url)
            )
            .subscribe(value =>
                this.path$ = of(value !== undefined && value[0].path !== 'error' && value[0].path !== 'login')));
        this.subscriptions.push(subscription);
    }

    private initStorageProperties(): void {
        this.first = storage.getItem('locale') === null && storage.getItem('color') === null
            && storage.getItem('theme') === null;

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
                    this.locale = value.locale;
                    this.color = value.color;
                    this.theme = value.theme;

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
        let progress: number = 0;
        let subscription = this._zone.runTask(() => interval(1000)
            .subscribe(value => {
                this.bright$.next(value % 2 === 0);
                progress += Math.random() * 5;
                progress = Math.min(progress, 100);
                this.progress$.next(progress);

                if (progress === 100) {
                    this.hideSplashScreen();
                    subscription.unsubscribe();
                }
            }));
    }

    private showSplashScreen(): void {
        if (this.dialogRef === null) {
            this.dialogRef = this._dialog.open(this.splash, {
                minWidth: '100vw', minHeight: '100vh', maxWidth: '100vw', maxHeight: '100vh',
                panelClass: ['demo-splash-screen']
            });
        }
    }

    private hideSplashScreen(): void {
        if (this.dialogRef !== null) {
            this.dialogRef.close();
            this.dialogRef = null;
        }
    }

}
