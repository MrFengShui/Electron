import {createFeatureSelector, createSelector} from "@ngrx/store";

import {StorageSaveLoadState} from "./storage.reducer";

export const STORAGE_FEATURE_KEY: string = window.btoa('STORAGE_FEATURE_KEY');

export const STORAGE_SELECTOR = createSelector(createFeatureSelector(STORAGE_FEATURE_KEY),
    (state: StorageSaveLoadState) => state);
