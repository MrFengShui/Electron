import {createReducer, on} from "@ngrx/store";

import {
    STORAGE_COLOR_LOAD_ACTION,
    STORAGE_COLOR_SAVE_ACTION, STORAGE_INIT_ACTION, STORAGE_LOCALE_LOAD_ACTION,
    STORAGE_LOCALE_SAVE_ACTION, STORAGE_THEME_LOAD_ACTION,
    STORAGE_THEME_SAVE_ACTION
} from "./storage.action";

import {ColorType, LocaleType} from "../utils/global.utils";
import {coerceBooleanProperty} from "@angular/cdk/coercion";

let storage: Storage = window.sessionStorage;

export interface StorageSaveLoadState {

    locale: LocaleType | null;
    color: ColorType | null;
    theme: boolean | null;

}

export const STORAGE_REDUCER = createReducer<StorageSaveLoadState>(
    {locale: null, color: null, theme: null},
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
    on(STORAGE_INIT_ACTION, () => {
        storage.setItem('locale', 'en');
        storage.setItem('color', 'default');
        storage.setItem('theme', `${true}`);
        return {locale: 'en' as LocaleType, color: 'default' as ColorType, theme: true};
    }),
    on(STORAGE_LOCALE_LOAD_ACTION, state =>
        ({...state, locale: storage.getItem('locale') as (LocaleType | null)})),
    on(STORAGE_COLOR_LOAD_ACTION, state =>
        ({...state, color: storage.getItem('color') as (ColorType | null)})),
    on(STORAGE_THEME_LOAD_ACTION, state =>
        ({...state, theme: coerceBooleanProperty(storage.getItem('theme'))}))
);
