import {coerceNumberProperty} from "@angular/cdk/coercion";
import {SelectionModel} from "@angular/cdk/collections";
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding, NgZone, OnDestroy, OnInit, Renderer2,
    TemplateRef,
    ViewChild
} from "@angular/core";

import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatBottomSheet, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {MatDialog} from "@angular/material/dialog";
import {MatSelectChange} from "@angular/material/select";
import {MatTableDataSource} from "@angular/material/table";
import {BehaviorSubject, Subject, Subscription, timer} from "rxjs";

import {
    DemoMazeSolveAlgorithmService, MazeGridType,
    MazePathType,
    MazeViewType,
    SpeedType
} from "./maze.service";

import {MazeGenerationMeta, MazeSaveMeta, ToggleModel} from "../../global/model/global.model";

type MazeStartFinal = 'tlbr' | 'brtl' | 'bltr' | 'trbl' | 'tltr' | 'trtl' | 'blbr' | 'brbl' | 'tlbl' | 'bltl'
    | 'trbr' | 'brtr';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'demo-maze-solve-view',
    templateUrl: './solve.component.html',
    providers: [DemoMazeSolveAlgorithmService]
})
export class DemoMazeSolveView implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild('json', {read: TemplateRef})
    private json!: TemplateRef<any>;

    @ViewChild('view', {read: TemplateRef})
    private view!: TemplateRef<any>;

    @HostBinding('class') class: string = 'demo-maze-view';

    cells$: Subject<MazePathType[]> = new BehaviorSubject<MazePathType[]>([]);
    grids$: Subject<MazeViewType[]> = new BehaviorSubject<MazeViewType[]>([]);
    marker$: Subject<MazePathType | undefined> = new BehaviorSubject<MazePathType | undefined>(undefined);
    currMarker$: Subject<MazePathType | undefined> = new BehaviorSubject<MazePathType | undefined>(undefined);
    nextMarker$: Subject<MazePathType | undefined> = new BehaviorSubject<MazePathType | undefined>(undefined);
    mazes$: Subject<MazeSaveMeta[]> = new BehaviorSubject<MazeSaveMeta[]>([]);
    columns$: Subject<number> = new BehaviorSubject<number>(0);
    rows$: Subject<number> = new BehaviorSubject<number>(0);
    shuffle$: Subject<boolean> = new BehaviorSubject<boolean>(false);
    usable$: Subject<boolean> = new BehaviorSubject<boolean>(true);
    timer$: Subject<number> = new BehaviorSubject<number>(0);
    shown$: Subject<boolean> = new BehaviorSubject<boolean>(false);
    phase$: Subject<0 | 1 | 2> = new BehaviorSubject<0 | 1 | 2>(0);
    select$: Subject<string> = new BehaviorSubject<string>('');

    readonly nameToggles: ToggleModel<string>[] = [
        {code: 'astar', text: 'DEMO.MAZES.NAME.ASTAR'},
        {code: 'rbt', text: 'DEMO.MAZES.NAME.BACK'},
        {code: 'gbfs', text: 'DEMO.MAZES.NAME.GBFS'},
        {code: 'bfs', text: 'DEMO.MAZES.NAME.BFS'},
        {code: 'dfs', text: 'DEMO.MAZES.NAME.DFS'},
        {code: 'dijk', text: 'DEMO.MAZES.NAME.DIJK'},
        {code: 'flood', text: 'DEMO.MAZES.NAME.FLOOD'}
    ];
    readonly speedToggles: ToggleModel<SpeedType>[] = [
        {code: 500, text: 'DEMO.PUBLIC.DELAY.EXTRA.SLOW'},
        {code: 250, text: 'DEMO.PUBLIC.DELAY.SLOW'},
        {code: 100, text: 'DEMO.PUBLIC.DELAY.NORMAL'},
        {code: 10, text: 'DEMO.PUBLIC.DELAY.FAST'},
        {code: 1, text: 'DEMO.PUBLIC.DELAY.EXTRA.FAST'}
    ];
    readonly diagonalToggles: ToggleModel<MazeStartFinal>[] = [
        {code: 'tlbr', text: 'DEMO.MAZE.DIAGONAL.TLBR'},
        {code: 'brtl', text: 'DEMO.MAZE.DIAGONAL.BRTL'},
        {code: 'bltr', text: 'DEMO.MAZE.DIAGONAL.BLTR'},
        {code: 'trbl', text: 'DEMO.MAZE.DIAGONAL.TRBL'},
        {code: 'tltr', text: 'DEMO.MAZE.DIAGONAL.TLTR'},
        {code: 'trtl', text: 'DEMO.MAZE.DIAGONAL.TRTL'},
        {code: 'blbr', text: 'DEMO.MAZE.DIAGONAL.BLBR'},
        {code: 'brbl', text: 'DEMO.MAZE.DIAGONAL.BRBL'},
        {code: 'tlbl', text: 'DEMO.MAZE.DIAGONAL.TLBL'},
        {code: 'bltl', text: 'DEMO.MAZE.DIAGONAL.BLTL'},
        {code: 'trbr', text: 'DEMO.MAZE.DIAGONAL.TRBR'},
        {code: 'brtr', text: 'DEMO.MAZE.DIAGONAL.BRTR'}
    ];
    readonly headers: string[] = ['code', 'name', 'cols', 'rows', 'time', 'data'];

    group!: FormGroup;
    source!: MatTableDataSource<MazeGenerationMeta>;
    bsref!: MatBottomSheetRef<any, MazeSaveMeta>;
    select!: SelectionModel<MazeGenerationMeta>;

    private subscription!: Subscription;
    private reader: FileReader = new FileReader();
    private cells: MazePathType[] = [];
    private time: number = 0;
    private cols: number = -1;
    private rows: number = -1;

    constructor(
        private _builder: FormBuilder,
        private _cdr: ChangeDetectorRef,
        private _render: Renderer2,
        private _zone: NgZone,
        private _dialog: MatDialog,
        private _sheet: MatBottomSheet,
        private _service: DemoMazeSolveAlgorithmService
    ) {
    }

    ngOnInit() {
        this.group = this._builder.group({
            nameCtrl: new FormControl({value: 'none', disabled: true}, [Validators.required]),
            speedCtrl: new FormControl({value: 'none', disabled: true}, [Validators.required]),
            diagonalCtrl: new FormControl({value: 'none', disabled: true}, [Validators.required]),
            startXCtrl: new FormControl({value: 0, disabled: true},
                [Validators.required, Validators.pattern(/[0-9]+/)]),
            startYCtrl: new FormControl({value: 0, disabled: true},
                [Validators.required, Validators.pattern(/[0-9]+/)]),
            finalXCtrl: new FormControl({value: 0, disabled: true},
                [Validators.required, Validators.pattern(/[0-9]+/)]),
            finalYCtrl: new FormControl({value: 0, disabled: true},
                [Validators.required, Validators.pattern(/[0-9]+/)]),
        });
        this.source = new MatTableDataSource<MazeGenerationMeta>([]);
        this.select = new SelectionModel<MazeGenerationMeta>(true, []);
    }

    ngAfterViewInit() {
        this.subscription = this._zone.runOutsideAngular(() =>
            this.mazes$.asObservable().subscribe(value => {
                if (value.length > 0) {
                    this.bsref = this._sheet.open<any, MazeSaveMeta[], MazeSaveMeta>(this.json,
                        {hasBackdrop: true, panelClass: ['demo-sheet']});
                    let subscription = this.bsref.afterDismissed().subscribe(value => {
                        if (value) {
                            this.cols = value.cols;
                            this.rows = value.rows;
                            this.group.controls['startXCtrl'].setValue(Math.floor(Math.random() * this.cols));
                            this.group.controls['startYCtrl'].setValue(Math.floor(Math.random() * this.rows));
                            this.group.controls['finalXCtrl'].setValue(Math.floor(Math.random() * this.cols));
                            this.group.controls['finalYCtrl'].setValue(Math.floor(Math.random() * this.rows));
                            this.formEnableDisable(true);
                            this.cells = Array.from<MazeGridType>(JSON.parse(window.atob(value.data))).map(item =>
                                    ({grid: item, root: null, marked: false, visited: false}));
                        }

                        this.cells$.next(this.cells);
                        this.columns$.next(this.cols);
                        this.rows$.next(this.rows);
                        subscription.unsubscribe();
                    });
                }
            }));
    }

    ngOnDestroy() {
        this.cells$.complete();
        this.marker$.complete();
        this.currMarker$.complete();
        this.nextMarker$.complete();
        this.columns$.complete();
        this.shuffle$.complete();
        this.usable$.complete();
        this.timer$.complete();

        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    listenMazeSelectChange(element: HTMLInputElement): void {
        let files: FileList | null = element.files;

        if (files !== null) {
            let file: File | null = files.item(0);

            if (file !== null) {
                this.reader.onloadend = (event) => {
                    this.mazes$.next(JSON.parse(event.target?.result as string));
                    element.value = '';
                }
                this.reader.readAsText(file);
            }
        }
    }

    listenDiagonalSelectChange(change: MatSelectChange): void {
        switch (change.value) {
            case 'tlbr':
                this.group.controls['startXCtrl'].setValue(0);
                this.group.controls['startYCtrl'].setValue(0);
                this.group.controls['finalXCtrl'].setValue(this.cols - 1);
                this.group.controls['finalYCtrl'].setValue(this.rows - 1);
                break;
            case 'brtl':
                this.group.controls['startXCtrl'].setValue(this.cols - 1);
                this.group.controls['startYCtrl'].setValue(this.rows - 1);
                this.group.controls['finalXCtrl'].setValue(0);
                this.group.controls['finalYCtrl'].setValue(0);
                break;
            case 'bltr':
                this.group.controls['startXCtrl'].setValue(0);
                this.group.controls['startYCtrl'].setValue(this.rows - 1);
                this.group.controls['finalXCtrl'].setValue(this.cols - 1);
                this.group.controls['finalYCtrl'].setValue(0);
                break;
            case 'trbl':
                this.group.controls['startXCtrl'].setValue(this.cols - 1);
                this.group.controls['startYCtrl'].setValue(0);
                this.group.controls['finalXCtrl'].setValue(0);
                this.group.controls['finalYCtrl'].setValue(this.rows - 1);
                break;
            case 'tltr':
                this.group.controls['startXCtrl'].setValue(0);
                this.group.controls['startYCtrl'].setValue(0);
                this.group.controls['finalXCtrl'].setValue(this.cols - 1);
                this.group.controls['finalYCtrl'].setValue(0);
                break;
            case 'trtl':
                this.group.controls['startXCtrl'].setValue(this.cols - 1);
                this.group.controls['startYCtrl'].setValue(0);
                this.group.controls['finalXCtrl'].setValue(0);
                this.group.controls['finalYCtrl'].setValue(0);
                break;
            case 'blbr':
                this.group.controls['startXCtrl'].setValue(0);
                this.group.controls['startYCtrl'].setValue(this.rows - 1);
                this.group.controls['finalXCtrl'].setValue(this.cols - 1);
                this.group.controls['finalYCtrl'].setValue(this.rows - 1);
                break;
            case 'brbl':
                this.group.controls['startXCtrl'].setValue(this.cols - 1);
                this.group.controls['startYCtrl'].setValue(this.rows - 1);
                this.group.controls['finalXCtrl'].setValue(0);
                this.group.controls['finalYCtrl'].setValue(this.rows - 1);
                break;
            case 'tlbl':
                this.group.controls['startXCtrl'].setValue(0);
                this.group.controls['startYCtrl'].setValue(0);
                this.group.controls['finalXCtrl'].setValue(0);
                this.group.controls['finalYCtrl'].setValue(this.rows - 1);
                break;
            case 'bltl':
                this.group.controls['startXCtrl'].setValue(0);
                this.group.controls['startYCtrl'].setValue(this.rows - 1);
                this.group.controls['finalXCtrl'].setValue(0);
                this.group.controls['finalYCtrl'].setValue(0);
                break;
            case 'trbr':
                this.group.controls['startXCtrl'].setValue(this.cols - 1);
                this.group.controls['startYCtrl'].setValue(0);
                this.group.controls['finalXCtrl'].setValue(this.cols - 1);
                this.group.controls['finalYCtrl'].setValue(this.rows - 1);
                break;
            case 'brtr':
                this.group.controls['startXCtrl'].setValue(this.cols - 1);
                this.group.controls['startYCtrl'].setValue(this.rows - 1);
                this.group.controls['finalXCtrl'].setValue(this.cols - 1);
                this.group.controls['finalYCtrl'].setValue(0);
                break;
            default:
                this.group.controls['startXCtrl'].setValue(Math.floor(Math.random() * this.cols));
                this.group.controls['startYCtrl'].setValue(Math.floor(Math.random() * this.rows));
                this.group.controls['finalXCtrl'].setValue(Math.floor(Math.random() * this.cols));
                this.group.controls['finalYCtrl'].setValue(Math.floor(Math.random() * this.rows));
                break;
        }
    }

    handleToggleRunAction(): void {
        this.formEnableDisable(false);
        this.select$.next(this.fetch(this.group.value['nameCtrl']));
        this.shown$.next(true);
        this.timer$.next(0);
        this._zone.runTask(() => {
            this.cells.forEach(cell => {
                cell.root = null;
                cell.marked = false;
                cell.visited = false;
            });
            this.cells$.next(this.cells);
            this.phase$.next(2);
            let subscription = timer(0, 1000).subscribe(value => {
                this.time = value;
                this.timer$.next(value);
            });
            let name: string = this.group.value['nameCtrl'];
            let startX: number = coerceNumberProperty(this.group.value['startXCtrl']);
            let startY: number = coerceNumberProperty(this.group.value['startYCtrl']);
            let finalX: number = coerceNumberProperty(this.group.value['finalXCtrl']);
            let finalY: number = coerceNumberProperty(this.group.value['finalYCtrl']);
            let speed: SpeedType = this.group.value['speedCtrl'];
            this.selectTask(name, startX, startY, finalX, finalY, speed, subscription);
        });
    }

    handleToggleCloseAction(): void {
        let startX: number = coerceNumberProperty(this.group.value['startXCtrl']);
        let startY: number = coerceNumberProperty(this.group.value['startYCtrl']);
        let finalX: number = coerceNumberProperty(this.group.value['finalXCtrl']);
        let finalY: number = coerceNumberProperty(this.group.value['finalYCtrl']);
        let array: MazeGenerationMeta[] = this.source.data;
        array.push({
            code: this.source.data.length + 1, name: this.fetch(this.group.value['nameCtrl']),
            cols: this.cols, rows: this.rows, time: this.time,
            data: this.cells.map<MazeViewType>(cell => ({
                grid: {
                    x: cell.grid.x, y: cell.grid.y,
                    bt: cell.grid.bt, bb: cell.grid.bb, bl: cell.grid.bl, br: cell.grid.br
                },
                marked: cell.marked, visited: cell.visited,
                start: cell.grid.x === startX && cell.grid.y === startY,
                final: cell.grid.x === finalX && cell.grid.y === finalY
            }))
        });
        this.source.data = array;
        this.shown$.next(false);
    }

    handleToggleViewAction(item: MazeGenerationMeta): void {
        if (this.view) {
            this.columns$.next(item.cols);
            this.grids$.next(item.data);
            this._dialog.open<TemplateRef<any>>(this.view, {
                panelClass: ['maze-view-overlay'],
                minWidth: '100vw', maxWidth: '100vw', minHeight: '100vh', maxHeight: '100vh'
            });
        }
    }

    handleToggleAnyPlaceAction(event: MouseEvent, name: string, flag: boolean): void {
        event.stopPropagation();
        this.group.controls[name]
            .setValue(flag ? Math.floor(Math.random() * this.cols) : Math.floor(Math.random() * this.rows));
    }

    private fetch(code: string): string {
        let toggle: ToggleModel<string> | undefined = this.nameToggles.find(toggle => toggle.code === code);
        return toggle ? toggle.text : '';
    }

    private selectTask(name: string, startX: number, startY: number, finalX: number, finalY: number,
                       speed: SpeedType, subscription: Subscription): void {
        switch (name) {
            case 'astar':
                this.execAStar(startX, startY, finalX, finalY, speed, subscription);
                break;
            case 'rbt':
                this.execBackTracker(startX, startY, finalX, finalY, speed, subscription);
                break;
            case 'bfs':
                this.execBFS(startX, startY, finalX, finalY, speed, subscription);
                break;
            case 'dfs':
                this.execDFS(startX, startY, finalX, finalY, speed, subscription);
                break;
            case 'dijk':
                this.execDijkstra(startX, startY, finalX, finalY, speed, subscription);
                break;
            case 'flood':
                this.execFloodFill(startX, startY, finalX, finalY, speed, subscription);
                break;
            case 'gbfs':
                this.execGBFS(startX, startY, finalX, finalY, speed, subscription);
                break;
        }
    }

    private execAStar(startX: number, startY: number, finalX: number, finalY: number,
                      speed: SpeedType, subscription: Subscription): void {
        this._service.mazeAStar(this.cells, startX, startY, finalX, finalY, speed,
            value => this.marker$.next(value))
            .then(() => {
                this.phase$.next(0);
                this.formEnableDisable(true);
                subscription.unsubscribe();
            });
    }

    private execBackTracker(startX: number, startY: number, finalX: number, finalY: number,
                          speed: SpeedType, subscription: Subscription): void {
        this._service.mazeBackTracker(this.cells, startX, startY, finalX, finalY, speed,
            value => this.marker$.next(value))
            .then(() => {
                this.phase$.next(0);
                this.formEnableDisable(true);
                subscription.unsubscribe();
            });
    }

    private execBFS(startX: number, startY: number, finalX: number, finalY: number,
                    speed: SpeedType, subscription: Subscription): void {
        this._service.mazeBFS(this.cells, startX, startY, finalX, finalY, speed,
            value => this.marker$.next(value))
            .then(() => {
                this.phase$.next(0);
                this.formEnableDisable(true);
                subscription.unsubscribe();
            });
    }

    private execDFS(startX: number, startY: number, finalX: number, finalY: number,
                    speed: SpeedType, subscription: Subscription): void {
        this._service.mazeDFS(this.cells, startX, startY, finalX, finalY, speed,
            value => this.marker$.next(value))
            .then(() => {
                this.phase$.next(0);
                this.formEnableDisable(true);
                subscription.unsubscribe();
            });
    }

    private execDijkstra(startX: number, startY: number, finalX: number, finalY: number,
                         speed: SpeedType, subscription: Subscription): void {
        this._service.mazeDijkstra(this.cells, startX, startY, finalX, finalY, speed,
            value => this.marker$.next(value))
            .then(() => {
                this.phase$.next(0);
                this.formEnableDisable(true);
                subscription.unsubscribe();
            });
    }

    private execFloodFill(startX: number, startY: number, finalX: number, finalY: number,
                          speed: SpeedType, subscription: Subscription): void {
        this._service.mazeFloodFill(this.cells, startX, startY, finalX, finalY, speed,
            value => this.marker$.next(value))
            .then(() => {
                this.phase$.next(0);
                this.formEnableDisable(true);
                subscription.unsubscribe();
            });
    }

    private execGBFS(startX: number, startY: number, finalX: number, finalY: number,
                          speed: SpeedType, subscription: Subscription): void {
        this._service.mazeGBFS(this.cells, startX, startY, finalX, finalY, speed,
            value => this.marker$.next(value))
            .then(() => {
                this.phase$.next(0);
                this.formEnableDisable(true);
                subscription.unsubscribe();
            });
    }

    private formEnableDisable(flag: boolean): void {
        if (flag) {
            this.group.controls['nameCtrl'].enable();
            this.group.controls['speedCtrl'].enable();
            this.group.controls['diagonalCtrl'].enable();
            this.group.controls['startXCtrl'].enable();
            this.group.controls['startYCtrl'].enable();
            this.group.controls['finalXCtrl'].enable();
            this.group.controls['finalYCtrl'].enable();
        } else {
            this.group.controls['nameCtrl'].disable();
            this.group.controls['speedCtrl'].disable();
            this.group.controls['diagonalCtrl'].disable();
            this.group.controls['startXCtrl'].disable();
            this.group.controls['startYCtrl'].disable();
            this.group.controls['finalXCtrl'].disable();
            this.group.controls['finalYCtrl'].disable();
        }
    }

}
