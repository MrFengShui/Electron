import {MazeViewType} from "../../web/demo/maze/maze.service";

export interface RouteLinkModel {

    icon: string;
    link: string[];
    text: string;

}

export interface ToggleModel<T = any> {

    code: T;
    icon?: string;
    text: string;

}

export interface MazeGenerationMeta {

    flag?: boolean;
    code: number;
    name: string;
    cols: number;
    rows: number;
    time: number;
    data: MazeViewType[];

}

export interface MazeSaveMeta {

    name: string;
    cols: number;
    rows: number;
    data: string;

}
