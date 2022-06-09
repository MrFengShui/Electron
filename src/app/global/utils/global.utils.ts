import {formatDate, formatNumber, registerLocaleData} from "@angular/common";
import zhs from '@angular/common/locales/zh-Hans';
import zht from '@angular/common/locales/zh-Hant';

import {RouteLinkModel} from "../model/global.model";

export type ColorType = 'spring' | 'summer' | 'autumn' | 'winter' | 'default';
export type LocaleType = 'en' | 'zhs' | 'zht';

export const NAV_LINKS: RouteLinkModel[] = [
    {icon: 'image_search', link: ['/demo', 'icon'], text: 'DEMO.LIST.ICON'},
    {icon: 'route', link: ['/demo', 'maze', 'generate'], text: 'DEMO.LIST.MAZEG'},
    {icon: 'route', link: ['/demo', 'maze', 'solve'], text: 'DEMO.LIST.MAZES'},
    {icon: 'sort_by_alpha', link: ['/demo', 'sort'], text: 'DEMO.LIST.SORT'}
]

export const formatDateTime = (value: number | undefined, format: string, type: LocaleType): string => {
    if (value) {
        switch (type) {
            case 'zhs': return formatDate(value, format, 'zh-CN');
            case 'zht': return formatDate(value, format, 'zh-TW');
            default: return formatDate(value, format, 'en-US');
        }
    }

    return '';
}

export const formatDecimal = (value: number | undefined, type: LocaleType, digits?: string): string => {
    if (value) {
        switch (type) {
            case 'zhs': return formatNumber(value, 'zh-Hans', digits);
            case 'zht': return formatNumber(value, 'zh-Hant', digits);
            default: return formatNumber(value, 'en-US', digits);
        }
    }

    return '';
}

export const register = (type: LocaleType): void => {
    switch (type) {
        case 'zhs': registerLocaleData(zhs, 'zh-Hans'); break;
        case 'zht': registerLocaleData(zht, 'zh-Hant'); break;
    }
}

export const sleep = (time: number = 0): Promise<void> => {
    return new Promise(resolve => {
        let task = setTimeout(() => {
            clearTimeout(task);
            resolve();
        }, time);
    });
}
