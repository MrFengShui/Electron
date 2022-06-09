import {coerceBooleanProperty} from "@angular/cdk/coercion";
import {Renderer2} from "@angular/core";
import {TranslocoService} from "@ngneat/transloco";

import {ColorType, LocaleType, register} from "./global.utils";

export class StorageUtils {

    private storage: Storage = window.sessionStorage;
    private color: ColorType | null = null;
    private locale: LocaleType | null = null;
    private theme: boolean | null = null;

    constructor(
        private _document: Document,
        private _render: Renderer2,
        private _service: TranslocoService
    ) {}

    public async setLocale(locale: LocaleType): Promise<void> {
        this.locale = locale;
        this.storage.setItem('locale', locale);
        this._service.setActiveLang(locale);
        register(locale);
    }

    public async getLocale(): Promise<LocaleType | null> {
        let value: string | null = this.storage.getItem('locale');
        return value === null ? null : value as LocaleType;
    }

    public async setColor(color: ColorType): Promise<void> {
        this.color = color;
        this.storage.setItem('color', color);
        this._render.setAttribute(this._document.documentElement, 'class',
            `global-theme theme-${color} ${this.theme ? 'active' : ''}`);
    }

    public async getColor(): Promise<ColorType | null> {
        let value: string | null = this.storage.getItem('color');
        return value === null ? null : value as ColorType;
    }

    public async setTheme(theme: boolean): Promise<void> {
        this.theme = theme;
        this.storage.setItem('theme', `${theme}`);
        this._render.setAttribute(this._document.documentElement, 'class',
            `global-theme theme-${this.color} ${theme ? 'active' : ''}`);
    }

    public async getTheme(): Promise<boolean | null> {
        let value: string | null = this.storage.getItem('theme');
        return value === null ? null : coerceBooleanProperty(value);
    }

}
