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

interface PaletteToggleModel {

    color: 'spring' | 'summer' | 'autumn' | 'winter' | 'default';
    theme: 'dark' | 'light';
    label: string;
    style: string;
    value: string;

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
    toggle$: Subject<string> = new BehaviorSubject<string>('');

    readonly tags: { title: string, subtitle: string } = {
        title: 'Demospace Developed with Electron and Angular',
        subtitle: 'Copyright © 2022 MrFengShui All Copyrights Reserved'
    };
    readonly toggles: PaletteToggleModel[] = [
        {color: 'default', theme: 'dark', label: 'Default Dark Theme', style: '#673AB7', value: 'fd'},
        {color: 'default', theme: 'light', label: 'Default Light Theme', style: '#673AB7', value: 'fl'},
        {color: 'spring', theme: 'dark', label: 'Spring Dark Theme', style: '#4CAF50', value: 'rd'},
        {color: 'spring', theme: 'light', label: 'Spring Light Theme', style: '#4CAF50', value: 'rl'},
        {color: 'summer', theme: 'dark', label: 'Summer Dark Theme', style: '#F44336', value: 'md'},
        {color: 'summer', theme: 'light', label: 'Summer Light Theme', style: '#F44336', value: 'ml'},
        {color: 'autumn', theme: 'dark', label: 'Autumn Dark Theme', style: '#FFC107', value: 'td'},
        {color: 'autumn', theme: 'light', label: 'Autumn Light Theme', style: '#FFC107', value: 'tl'},
        {color: 'winter', theme: 'dark', label: 'Winter Dark Theme', style: '#3F51B5', value: 'nd'},
        {color: 'winter', theme: 'light', label: 'Winter Light Theme', style: '#3F51B5', value: 'nl'}
    ];
    readonly links: RouteLinkModel[] = [
        {icon: 'face', link: ['/demo', 'icon'], text: 'SVG Icons'},
        {icon: 'route', link: ['/demo', 'maze', 'generate'], text: 'Maze Generation Algorithms'},
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
                this.toggle$.next(`${value.color[2]}${value.theme[0]}`);
                this.renderColorTheme(value.color, value.theme);
            } else {
                AppComponent.storeStorage('default', 'dark').then(() => {
                    this.toggle$.next('fd');
                    this.renderColorTheme('default', 'dark');
                });
            }
        });
    }

    handleToggleThemeAction(toggle: PaletteToggleModel): void {
        AppComponent.storeStorage(toggle.color, toggle.theme).then(() => {
            this.toggle$.next(toggle.value);
            this.renderColorTheme(toggle.color, toggle.theme);
        });
    }

    findToggle(value: string | null): string {
        return value ? this.toggles.find(toggle => toggle.value === value)?.label as string : '';
    }

    private renderColorTheme(color: any, theme: any): void {
        let task = setTimeout(() => {
            clearTimeout(task);
            this._render.setAttribute(this._document.documentElement, 'class',
                `global-theme theme-${color} ${theme === 'dark' ? 'active' : ''}`);
        });
    }

    private static async storeStorage(color: any, theme: any): Promise<void> {
        window.sessionStorage.setItem('demo-mode', JSON.stringify({color, theme}));
    }

    private static async loadStorage(): Promise<{ color: any, theme: any } | null> {
        let value: string | null = window.sessionStorage.getItem('demo-mode');

        if (value) {
            return JSON.parse(value);
        }

        return null;
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
