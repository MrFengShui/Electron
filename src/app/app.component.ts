import {animate, state, style, transition, trigger} from "@angular/animations";
import {
    AfterViewInit,
    Component,
    HostBinding,
    HostListener,
    Inject, NgZone,
    Renderer2,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {DOCUMENT} from "@angular/common";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {BehaviorSubject, interval, Subject, Subscription} from "rxjs";

type ColorType = 'spring' | 'summer' | 'autumn' | 'winter' | 'default';

interface PaletteToggleModel {

    color: ColorType;
    label: string;
    style: string;

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
export class AppComponent implements AfterViewInit {

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

    theme: boolean | null = null;
    color: ColorType | null = null;

    readonly tags: { title: string, subtitle: string } = {
        title: 'Demospace Developed with Electron and Angular',
        subtitle: 'Copyright © 2022 MrFengShui All Copyrights Reserved'
    };
    readonly toggles: PaletteToggleModel[] = [
        {color: 'default', label: 'Default Theme', style: '#673AB7'},
        {color: 'spring', label: 'Spring Theme', style: '#4CAF50'},
        {color: 'summer', label: 'Summer Theme', style: '#F44336'},
        {color: 'autumn', label: 'Autumn Theme', style: '#FFC107'},
        {color: 'winter', label: 'Winter Theme', style: '#3F51B5'}
    ];
    readonly links: RouteLinkModel[] = [
        {icon: 'image_search', link: ['/demo', 'icon'], text: 'SVG Icons'},
        {icon: 'route', link: ['/demo', 'maze', 'generate'], text: 'Maze-G Algorithms'},
        {icon: 'route', link: ['/demo', 'maze', 'solve'], text: 'Maze-S Algorithms'},
        {icon: 'sort_by_alpha', link: ['/demo', 'sort'], text: 'Sorting Algorithms'}
    ];

    private subscription: Subscription | null = null;
    private dialogRef: MatDialogRef<any> | null = null;
    private progress: number = 0;

    constructor(
        @Inject(DOCUMENT)
        private _document: Document,
        private _render: Renderer2,
        private _zone: NgZone,
        private _dialog: MatDialog
    ) {
    }

    ngAfterViewInit() {
        AppComponent.loadStorage().then(value => {
            // this.showSplashScreen();

            if (value) {
                this.renderColorTheme(value.color, value.theme);
            } else {
                AppComponent.storeStorage('default', true).then(() =>
                    this.renderColorTheme('default', true));
            }
        });
    }

    listenThemeChange(change: boolean): void {
        AppComponent.storeStorage(this.color, change).then(() => this.renderColorTheme(this.color, change));
    }

    handleColorAction(event: MouseEvent, color: ColorType | null): void {
        event.stopPropagation();
        AppComponent.storeStorage(color, this.theme).then(() => this.renderColorTheme(color, this.theme));
    }

    findToggle(color: ColorType | null): string {
        return color ? this.toggles.find(toggle => toggle.color === color)?.label as string : '';
    }

    private renderColorTheme(color: ColorType | null, theme: boolean | null): void {
        let task = setTimeout(() => {
            clearTimeout(task);
            this.color = color;
            this.theme = theme;
            this._render.setAttribute(this._document.documentElement, 'class',
                `global-theme theme-${color} ${theme ? 'active' : ''}`);
        });
    }

    private static async storeStorage(color: ColorType | null, theme: boolean | null): Promise<void> {
        window.sessionStorage.setItem('demo-mode', JSON.stringify({color, theme}));
    }

    private static async loadStorage(): Promise<{ color: ColorType, theme: boolean } | null> {
        let value: string | null = window.sessionStorage.getItem('demo-mode');
        return value ? JSON.parse(value) : null;
    }

    private execLoadingProgress(): void {
        this.subscription = this._zone.runTask(() => interval(1000)
            .subscribe(value => {
                this.bright$.next(value % 2 === 0);
                this.progress += Math.random() * 5;
                this.progress$.next(Math.min(this.progress, 100));
            }));
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
