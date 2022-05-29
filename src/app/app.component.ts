import {animate, state, style, transition, trigger} from "@angular/animations";
import {
    AfterViewInit, ApplicationRef, ChangeDetectorRef,
    Component,
    HostBinding,
    HostListener,
    Inject, NgZone, OnDestroy,
    Renderer2,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {DOCUMENT} from "@angular/common";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MatRadioChange} from "@angular/material/radio";
import {TranslocoService} from "@ngneat/transloco";
import {BehaviorSubject, interval, Observable, of, Subject, Subscription} from "rxjs";

import {ColorType, LocaleType, register} from "./global/utils/global.utils";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {coerceBooleanProperty} from "@angular/cdk/coercion";

interface PaletteToggleModel {

    color: ColorType;
    label: string;
    style: string;

}

interface LocaleToggleModel {

    code: LocaleType;
    name: string;

}

interface RouteLinkModel {

    icon: string;
    link: string[];
    text: string;

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
export class AppComponent implements OnDestroy, AfterViewInit {

    @ViewChild('splash', {read: TemplateRef})
    private splash!: TemplateRef<any>;

    @HostBinding('class') class: string = 'demo-root';

    @HostListener('window:load')
    private listenWindowOnload(): void {
        // let subscription = this._zone.runTask(() =>
        //     this.progress$.subscribe(value => {
        //         if (value === 100) {
        //             this.subscription?.unsubscribe();
        //             subscription.unsubscribe();
        //
        //             let task = setTimeout(() => {
        //                 clearTimeout(task);
        //                 this.hideSplashScreen();
        //             }, 1000);
        //         }
        //     }));
    }

    bright$: Subject<boolean> = new BehaviorSubject<boolean>(false);
    progress$: Subject<number> = new BehaviorSubject<number>(0);

    locale: LocaleType | null = null;
    color: ColorType | null = null;
    theme: boolean | null = null;

    readonly tags: { title: string, subtitle: string } = {
        title: 'DEMO.PUBLIC.DECLAIM',
        subtitle: 'DEMO.PUBLIC.COPYRIGHT'
    };
    readonly paletteToggles: PaletteToggleModel[] = [
        {color: 'default', label: 'DEMO.TUNE.THEME.DEFAULT', style: '#673AB7'},
        {color: 'spring', label: 'DEMO.TUNE.THEME.SPRING', style: '#4CAF50'},
        {color: 'summer', label: 'DEMO.TUNE.THEME.SUMMER', style: '#F44336'},
        {color: 'autumn', label: 'DEMO.TUNE.THEME.AUTUMN', style: '#FFC107'},
        {color: 'winter', label: 'DEMO.TUNE.THEME.WINTER', style: '#3F51B5'}
    ];
    readonly localeToggles: LocaleToggleModel[] = [
        {code: 'en', name: 'DEMO.TUNE.LOCALE.EN'},
        {code: 'zhs', name: 'DEMO.TUNE.LOCALE.ZHS'},
        {code: 'zht', name: 'DEMO.TUNE.LOCALE.ZHT'}
    ];
    readonly links: RouteLinkModel[] = [
        {icon: 'image_search', link: ['/demo', 'icon'], text: 'DEMO.LIST.ICON'},
        {icon: 'route', link: ['/demo', 'maze', 'generate'], text: 'DEMO.LIST.MAZEG'},
        {icon: 'route', link: ['/demo', 'maze', 'solve'], text: 'DEMO.LIST.MAZES'},
        {icon: 'sort_by_alpha', link: ['/demo', 'sort'], text: 'DEMO.LIST.SORT'}
    ];

    private subscriptions: Subscription[] = [];
    private dialogRef: MatDialogRef<any> | null = null;
    private storage: Storage = window.sessionStorage;
    private progress: number = 0;

    constructor(
        private _ref: ApplicationRef,
        @Inject(DOCUMENT)
        private _document: Document,
        private _cdr: ChangeDetectorRef,
        private _render: Renderer2,
        private _zone: NgZone,
        private _service: TranslocoService,
        private _dialog: MatDialog
    ) {
        let subscription = this._zone.runTask(() =>
            interval(10).subscribe(() =>
                this._zone.run(() => this._ref.tick())));
        this.subscriptions.push(subscription);
    }

    ngAfterViewInit() {
        this.initialize();
        // this.showSplashScreen();
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            if (!subscription.closed) {
                subscription.unsubscribe();
            }
        });
    }

    listenLocaleChange(change: MatRadioChange): void {
        this.setLocale(change.value);
    }

    listenColorChange(change: MatRadioChange): void {
        console.log(change);
        this.storeColor(change.value);
    }

    listenThemeChange(change: MatSlideToggleChange): void {
        this.storeTheme(change.checked);
    }

    handleColorAction(event: MouseEvent, color: ColorType): void {
        event.stopPropagation();
        this.color = color;
        this._cdr.detectChanges();
    }

    private initialize(): void {
        this.locale = this.getLocale();
        this.color = this.getColor();
        this.theme = this.getTheme();

        if (this.locale === null) {
            this.setLocale('en');
        } else {
            this._service.setActiveLang(this.locale);
            register(this.locale);
        }

        if (this.color === null) {
            this.storeColor('default');
        } else {
            this.renderColorTheme(this.color, this.theme);
        }

        if (this.theme === null) {
            this.storeTheme(true);
        } else {
            this.renderColorTheme(this.color, this.theme);
        }
    }

    private renderColorTheme(color: ColorType | null, theme: boolean | null): void {
        let task = setTimeout(() => {
            clearTimeout(task);
            this._render.setAttribute(this._document.documentElement, 'class',
                `global-theme theme-${color} ${theme ? 'active' : ''}`);
        });
    }

    private setLocale(locale: LocaleType): void {
        this.locale = locale;
        this.storage.setItem('locale', locale);
        this._service.setActiveLang(locale);
        register(locale);
    }

    private getLocale(): LocaleType | null {
        let value: string | null = this.storage.getItem('locale');
        return value === null ? null : value as LocaleType;
    }

    private storeColor(color: ColorType): void {
        this.color = color;
        this.storage.setItem('color', color);
        this.renderColorTheme(color, this.theme);
    }

    private getColor(): ColorType | null {
        let value: string | null = this.storage.getItem('color');
        return value === null ? null : value as ColorType;
    }

    private storeTheme(theme: boolean): void {
        this.theme = theme;
        this.storage.setItem('theme', `${theme}`);
        this.renderColorTheme(this.color, theme);
    }

    private getTheme(): boolean | null {
        let value: string | null = this.storage.getItem('theme');
        return value === null ? null : coerceBooleanProperty(value);
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
