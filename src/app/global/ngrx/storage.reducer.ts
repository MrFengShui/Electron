import {createReducer, on} from "@ngrx/store";

import {
    STORAGE_COLOR_LOAD_ACTION,
    STORAGE_COLOR_SAVE_ACTION, STORAGE_LOCALE_LOAD_ACTION,
    STORAGE_LOCALE_SAVE_ACTION, STORAGE_THEME_LOAD_ACTION,
    STORAGE_THEME_SAVE_ACTION
} from "./storage.action";

import {ColorType, LocaleType} from "../utils/global.utils";
import {coerceBooleanProperty} from "@angular/cdk/coercion";

let storage: Storage = window.sessionStorage;

export interface StorageSaveLoadState {

    locale: LocaleType;
    color: ColorType;
    theme: boolean;

}

export const STORAGE_REDUCER = createReducer<StorageSaveLoadState>(
    {locale: 'en', color: 'default', theme: true},
    on(STORAGE_LOCALE_SAVE_ACTION, (state, props) => {
        storage.setItem('locale', `${props.payload}`);
        return {...state, locale: props.payload};
    }),
    on(STORAGE_COLOR_SAVE_ACTION, (state, props) => {
        storage.setItem('color', `${props.payload}`);
        return {...state, color: props.payload};
    }),
    on(STORAGE_THEME_SAVE_ACTION, (state, props) => {
        storage.setItem('theme', `${props.payload}`);
        return {...state, theme: props.payload};
    }),
    on(STORAGE_LOCALE_LOAD_ACTION, state => {
        let value: string | null = storage.getItem('locale');
        return {...state, locale: value === null ? 'en' : (value as LocaleType)};
    }),
    on(STORAGE_COLOR_LOAD_ACTION, state => {
        let value: string | null = storage.getItem('color');
        return {...state, color: value === null ? 'default' : (value as ColorType)};
    }),
    on(STORAGE_THEME_LOAD_ACTION, state => {
        let value: string | null = storage.getItem('theme');
        return {...state, theme: value === null ? true : coerceBooleanProperty(value)};
    })
);
