import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    HostBinding,
    Inject, NgZone, OnDestroy, Renderer2,
    TemplateRef,
    ViewChild
} from "@angular/core";
import {DOCUMENT} from "@angular/common";
import {MatRadioChange} from "@angular/material/radio";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {Store} from "@ngrx/store";
import {TranslocoService} from "@ngneat/transloco";
import {filter, map, Observable, of, Subscription} from "rxjs";

import {ColorType, LocaleType, NAV_LINKS} from "../../global/utils/global.utils";

import {RouteLinkModel} from "../../global/model/global.model";

import {StorageSaveLoadState} from "../../global/ngrx/storage.reducer";
import {
    STORAGE_COLOR_SAVE_ACTION,
    STORAGE_LOCALE_SAVE_ACTION,
    STORAGE_THEME_SAVE_ACTION
} from "../../global/ngrx/storage.action";
import {STORAGE_SELECTOR} from "../../global/ngrx/storage.selector";

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
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'demo-outlet-view',
    templateUrl: 'demo.component.html'
})
export class DemoOutletView implements OnDestroy, AfterViewInit {

    @ViewChild('splash', {read: TemplateRef})
    private splash!: TemplateRef<any>;

    @HostBinding('class') class: string = 'demo-outlet-view';

    flag$!: Observable<boolean>;

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
    readonly links: RouteLinkModel[] = NAV_LINKS;

    private subscriptions: Subscription[] = [];

    constructor(
        @Inject(DOCUMENT)
        private _document: Document,
        private _cdr: ChangeDetectorRef,
        private _render: Renderer2,
        private _route: ActivatedRoute,
        private _router: Router,
        private _zone: NgZone,
        private _store: Store<StorageSaveLoadState>,
        private _service: TranslocoService
    ) {
        let subscription = this._zone.runTask(() => this._router.events
            .pipe(
                filter(value => value instanceof NavigationEnd),
                map(() => this._route.snapshot.firstChild?.routeConfig?.path)
            ).subscribe(value => this.flag$ = of(value !== 'navigation')));
        this.subscriptions.push(subscription);
    }

    ngAfterViewInit() {
        let subscription = this._zone.runOutsideAngular(() =>
            this._store.select(STORAGE_SELECTOR)
                .subscribe(value => {
                    this.locale = value.locale;
                    this.color = value.color;
                    this.theme = value.theme;
                }));
        this.subscriptions.push(subscription);
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            if (subscription) {
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

}
