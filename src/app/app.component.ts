import {AfterViewInit, Component, HostBinding, Inject, Renderer2} from '@angular/core';
import {BehaviorSubject, Subject} from "rxjs";
import {DOCUMENT} from "@angular/common";

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
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements AfterViewInit {

    @HostBinding('class') class: string = 'demo-root';

    toggle$: Subject<string> = new BehaviorSubject<string>('');

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
        {icon: 'sort_by_alpha', link: ['/demo', 'sort'], text: 'Sort Algorithms'}
    ];

    constructor(
        @Inject(DOCUMENT)
        private _document: Document,
        private _render: Renderer2
    ) {
    }

    ngAfterViewInit() {
        AppComponent.loadStorage().then(value => {
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

}
