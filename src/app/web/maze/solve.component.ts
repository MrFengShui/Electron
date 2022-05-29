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
    DemoMazeSolveAlgorithmService,
    MazePathType,
    MazeGridType,
    SpeedType, AccordinateType
} from "./maze.service";

import {ToggleModel} from "../../global/model/global.model";

interface MazeGenerationMeta {

    code: number;
    name: string;
    cols: number;
    rows: number;
    time: number;
    data: MazeGridType[];

}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'demo-maze-solve-view',
    templateUrl: './solve.component.html',
    providers: [DemoMazeSolveAlgorithmService]
})
export class DemoMazeSolveView implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild('json', {read: TemplateRef})
    private json!: TemplateRef<any>;

    @HostBinding('class') class: string = 'demo-maze-view';

    cells$: Subject<MazePathType[]> = new BehaviorSubject<MazePathType[]>([]);
    marker$: Subject<MazePathType | undefined> = new BehaviorSubject<MazePathType | undefined>(undefined);
    currMarker$: Subject<MazePathType | undefined> = new BehaviorSubject<MazePathType | undefined>(undefined);
    nextMarker$: Subject<MazePathType | undefined> = new BehaviorSubject<MazePathType | undefined>(undefined);
    mazes$: Subject<any[]> = new BehaviorSubject<any[]>([]);
    columns$: Subject<number> = new BehaviorSubject<number>(0);
    shuffle$: Subject<boolean> = new BehaviorSubject<boolean>(false);
    usable$: Subject<boolean> = new BehaviorSubject<boolean>(true);
    timer$: Subject<number> = new BehaviorSubject<number>(0);
    shown$: Subject<boolean> = new BehaviorSubject<boolean>(false);
    phase$: Subject<0 | 1 | 2> = new BehaviorSubject<0 | 1 | 2>(0);
    select$: Subject<string> = new BehaviorSubject<string>('');

    readonly nameToggles: ToggleModel<string>[] = [
        {code: 'bfs', text: 'DEMO.MAZES.NAME.BFS'},
        {code: 'dfs', text: 'DEMO.MAZES.NAME.DFS'},
    ];
    readonly speedToggles: ToggleModel<SpeedType>[] = [
        {code: 500, text: 'DEMO.PUBLIC.DELAY.EXTRA.SLOW'},
        {code: 250, text: 'DEMO.PUBLIC.DELAY.SLOW'},
        {code: 100, text: 'DEMO.PUBLIC.DELAY.NORMAL'},
        {code: 10, text: 'DEMO.PUBLIC.DELAY.FAST'},
        {code: 1, text: 'DEMO.PUBLIC.DELAY.EXTRA.FAST'},
    ];
    readonly diagonalToggles: ToggleModel<'tlbr' | 'bltr'>[] = [
        {code: 'tlbr', text: 'DEMO.MAZE.DIAGONAL.TLBR'},
        {code: 'bltr', text: 'DEMO.MAZE.DIAGONAL.BLTR'},
    ];
    readonly headers: string[] = ['code', 'name', 'cols', 'rows', 'time', 'data'];

    group!: FormGroup;
    source!: MatTableDataSource<MazeGenerationMeta>;
    bsref!: MatBottomSheetRef<any>;
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
            nameCtrl: new FormControl({value: 'none', disabled: false}, [Validators.required]),
            speedCtrl: new FormControl({value: 'none', disabled: false}, [Validators.required]),
            diagonalCtrl: new FormControl({value: 'none', disabled: true}, [Validators.required]),
            startXCtrl: new FormControl({value: 0, disabled: false},
                [Validators.required, Validators.pattern(/[0-9]+/)]),
            startYCtrl: new FormControl({value: 0, disabled: false},
                [Validators.required, Validators.pattern(/[0-9]+/)]),
            finalXCtrl: new FormControl({value: 0, disabled: false},
                [Validators.required, Validators.pattern(/[0-9]+/)]),
            finalYCtrl: new FormControl({value: 0, disabled: false},
                [Validators.required, Validators.pattern(/[0-9]+/)]),
        });
        this.source = new MatTableDataSource<MazeGenerationMeta>([]);
        this.select = new SelectionModel<MazeGenerationMeta>(true, []);
    }

    ngAfterViewInit() {
        this.subscription = this._zone.runOutsideAngular(() =>
            this.mazes$.asObservable().subscribe(value => {
                if (value.length > 0) {
                    this.bsref = this._sheet.open(this.json, {hasBackdrop: true, panelClass: ['demo-sheet']});
                    let subscription = this.bsref.afterDismissed().subscribe(value => {
                        this.cols = value.cols;
                        this.rows = value.rows;
                        this.group.controls['startXCtrl'].setValue(Math.floor(Math.random() * this.cols));
                        this.group.controls['startYCtrl'].setValue(Math.floor(Math.random() * this.rows));
                        this.group.controls['finalXCtrl'].setValue(Math.floor(Math.random() * this.cols));
                        this.group.controls['finalYCtrl'].setValue(Math.floor(Math.random() * this.rows));
                        this.group.controls['diagonalCtrl'].enable();
                        this.cells = Array.from(JSON.parse(window.atob(value.data))).map<MazePathType>((item: any) =>
                            ({grid: item, marked: false, visited: false, weight: 0}));
                        this.cells$.next(this.cells);
                        this.columns$.next(this.cols);
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

    listenJSONSelectChange(element: HTMLInputElement): void {
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
            case 'bltr':
                this.group.controls['startXCtrl'].setValue(0);
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
                cell.marked = false;
                cell.visited = false;
                cell.weight = 0;
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
        let cols: number = coerceNumberProperty(this.group.value['colsCtrl']);
        let rows: number = coerceNumberProperty(this.group.value['rowsCtrl']);
        let array: MazeGenerationMeta[] = this.source.data;
        array.push({
            code: this.source.data.length + 1, name: this.fetch(this.group.value['nameCtrl']), cols, rows,
            time: this.time, data: this.cells.map<MazeGridType>(cell =>
                ({
                    x: cell.grid.x,
                    y: cell.grid.y,
                    bt: cell.grid.bt,
                    bb: cell.grid.bb,
                    bl: cell.grid.bl,
                    br: cell.grid.br
                }))
        });
        this.source.data = array;
        this.shown$.next(false);
    }

    handleToggleOneDelAction(row: MazeGenerationMeta): void {
        let array: MazeGenerationMeta[] = this.source.data;
        array.splice(array.indexOf(row), 1);
        this.source.data = array;

        if (this.select.selected.includes(row)) {
            this.select.deselect(row);
        }
    }

    handleToggleMultiDelAction(): void {
        if (this.select.selected.length > 0) {
            this.select.selected.forEach(item => this.handleToggleOneDelAction(item));
        }
    }

    handleToggleClearAction(): void {
        let array: MazeGenerationMeta[] = this.source.data;
        array.splice(0);
        this.source.data = array;
        this.select.clear();
    }

    handleToggleAnyPlaceAction(event: MouseEvent, name: string, flag: boolean): void {
        event.stopPropagation();
        this.group.controls[name]
            .setValue(flag ? Math.floor(Math.random() * this.cols) : Math.floor(Math.random() * this.rows));
    }

    toggleAll(): void {
        this.checkAllSelected() ? this.select.clear() : this.select.select(...this.source.data);
    }

    checkAllSelected(): boolean {
        return this.select.selected.length === this.source.data.length;
    }

    private fetch(code: string): string {
        let toggle: ToggleModel<string> | undefined = this.nameToggles.find(toggle => toggle.code === code);
        return toggle ? toggle.text : '';
    }

    private selectTask(name: string, startX: number, startY: number, finalX: number, finalY: number,
                       speed: SpeedType, subscription: Subscription): void {
        switch (name) {
            case 'bfs':
                this.execBFS(startX, startY, finalX, finalY, speed, subscription);
                break;
            case 'dfs':
                this.execDFS(startX, startY, finalX, finalY, speed, subscription);
                break;
        }
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
