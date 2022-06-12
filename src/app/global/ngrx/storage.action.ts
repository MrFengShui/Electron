import {createAction, props} from "@ngrx/store";

import {ColorType, LocaleType} from "../utils/global.utils";

export const STORAGE_LOCALE_SAVE_ACTION = createAction(
    '[Storage Locale] Save Action',
    props<{payload: LocaleType | null}>()
);

export const STORAGE_COLOR_SAVE_ACTION = createAction(
    '[Storage Color] Save Action',
    props<{payload: ColorType | null}>()
);

export const STORAGE_THEME_SAVE_ACTION = createAction(
    '[Storage Theme] Save Action',
    props<{payload: boolean | null}>()
);

export const STORAGE_INIT_ACTION = createAction('[Storage] Init Action');

export const STORAGE_LOCALE_LOAD_ACTION = createAction('[Storage Locale] Load Action');

export const STORAGE_COLOR_LOAD_ACTION = createAction('[Storage Color] Load Action');

export const STORAGE_THEME_LOAD_ACTION = createAction('[Storage Theme] Load Action');
