import {coerceNumberProperty} from "@angular/cdk/coercion";
import {SelectionModel} from "@angular/cdk/collections";
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    NgZone,
    OnDestroy,
    OnInit, Renderer2, TemplateRef, ViewChild
} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {MatTableDataSource} from "@angular/material/table";
import {BehaviorSubject, Subject, Subscription, timer} from "rxjs";

import {
    BinaryTreeDirection,
    DemoMazeGenerateAlgorithmService,
    MazeCellFullType,
    MazeCellLessType,
    SpeedType
} from "./maze.service";

import {ToggleModel} from "../../global/model/global.model";

interface MazeGenerationMeta {

    flag: boolean;
    code: number;
    name: string;
    cols: number;
    rows: number;
    time: number;
    data: MazeCellLessType[];

}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'demo-maze-generate-view',
    templateUrl: './generate.component.html',
    providers: [DemoMazeGenerateAlgorithmService]
})
export class DemoMazeGenerateView implements OnInit, OnDestroy {

    @ViewChild('view', {read: TemplateRef})
    private view!: TemplateRef<any>;

    @HostBinding('class') class: string = 'demo-maze-view';

    cells$: Subject<MazeCellFullType[]> = new BehaviorSubject<MazeCellFullType[]>([]);
    grids$: Subject<MazeCellLessType[]> = new BehaviorSubject<MazeCellLessType[]>([]);
    marker$: Subject<MazeCellFullType | undefined> = new BehaviorSubject<MazeCellFullType | undefined>(undefined);
    currMarker$: Subject<MazeCellFullType | undefined> = new BehaviorSubject<MazeCellFullType | undefined>(undefined);
    nextMarker$: Subject<MazeCellFullType | undefined> = new BehaviorSubject<MazeCellFullType | undefined>(undefined);
    startMarker$: Subject<MazeCellFullType | undefined> = new BehaviorSubject<MazeCellFullType | undefined>(undefined);
    finalMarker$: Subject<MazeCellFullType | undefined> = new BehaviorSubject<MazeCellFullType | undefined>(undefined);
    scanner$: Subject<number | undefined> = new BehaviorSubject<number | undefined>(undefined);
    columns$: Subject<number> = new BehaviorSubject<number>(0);
    shuffle$: Subject<boolean> = new BehaviorSubject<boolean>(false);
    usable$: Subject<boolean> = new BehaviorSubject<boolean>(true);
    timer$: Subject<number> = new BehaviorSubject<number>(0);
    shown$: Subject<boolean> = new BehaviorSubject<boolean>(false);
    phase$: Subject<0 | 1 | 2> = new BehaviorSubject<0 | 1 | 2>(0);
    select$: Subject<string> = new BehaviorSubject<string>('');

    readonly nameToggles: ToggleModel<string>[] = [
        {code: 'none', text: '--- Select One ---'},
        {code: 'ab', text: 'Aldous Broder'},
        {code: 'btnw', text: 'Binary Tree By NW'},
        {code: 'btne', text: 'Binary Tree By NE'},
        {code: 'btsw', text: 'Binary Tree By SW'},
        {code: 'btse', text: 'Binary Tree By SE'},
        {code: 'eller', text: 'Eller'},
        {code: 'grow', text: 'Grow Tree'},
        {code: 'hunt', text: 'Hunt Kill'},
        {code: 'kruskal', text: 'Kruskal'},
        {code: 'prim', text: 'Prim'},
        {code: 'rbt', text: 'Random Back Tracker'},
        {code: 'rdbt', text: 'Random Double Back Tracker'},
        {code: 'rd', text: 'Random Divider'},
        {code: 'sw', text: 'Side Winder'},
        {code: 'walson', text: 'Walson'}
    ];
    readonly speedToggles: ToggleModel<SpeedType | 'none'>[] = [
        {code: 'none', text: '--- Select One ---'},
        {code: 500, text: 'Extra Slow'},
        {code: 250, text: 'Slow'},
        {code: 100, text: 'Normal'},
        {code: 10, text: 'Fast'},
        {code: 1, text: 'Extra Fast'},
    ];
    readonly headers: string[] = ['flag', 'code', 'name', 'cols', 'rows', 'time', 'data'];

    group!: FormGroup;
    source!: MatTableDataSource<MazeGenerationMeta>;
    select!: SelectionModel<MazeGenerationMeta>;

    private anchor: HTMLAnchorElement | null = null;
    private cells: MazeCellFullType[] = [];
    private time: number = 0;

    constructor(
        private _builder: FormBuilder,
        private _cdr: ChangeDetectorRef,
        private _render: Renderer2,
        private _zone: NgZone,
        private _dialog: MatDialog,
        private _service: DemoMazeGenerateAlgorithmService
    ) {
    }

    ngOnInit() {
        this.group = this._builder.group({
            nameCtrl: new FormControl({value: 'none', disabled: false}, [Validators.required]),
            speedCtrl: new FormControl({value: 'none', disabled: false}, [Validators.required]),
            colsCtrl: new FormControl({value: 60, disabled: false},
                [Validators.required, Validators.pattern(/[0-9]+/),
                    Validators.min(10), Validators.max(120)]),
            rowsCtrl: new FormControl({value: 30, disabled: false},
                [Validators.required, Validators.pattern(/[0-9]+/),
                    Validators.min(5), Validators.max(60)])
        });
        this.source = new MatTableDataSource<MazeGenerationMeta>([]);
        // this.source = new MatTableDataSource<MazeGenerationMeta>(Array.from({length: 128})
        //     .map((_, index) =>
        //         ({
        //             flag: Math.random() <= 0.5, code: index + 1, name: `Algorithm ${index + 1}`,
        //             cols: 60, rows: 30, time: 0, data: []
        //         })
        //     ));
        this.select = new SelectionModel<MazeGenerationMeta>(true, []);
    }

    ngOnDestroy() {
        this.cells$.complete();
        this.marker$.complete();
        this.currMarker$.complete();
        this.nextMarker$.complete();
        this.startMarker$.complete();
        this.finalMarker$.complete();
        this.scanner$.complete();
        this.columns$.complete();
        this.shuffle$.complete();
        this.usable$.complete();
        this.timer$.complete();
    }

    handleToggleRunAction(): void {
        this.formEnableDisable(false);
        this.select$.next(this.fetch(this.group.value['nameCtrl']));
        this.shown$.next(true);
        this.timer$.next(0);
        this._zone.runTask(() => {
            this.cells$.next(this.cells);
            this.phase$.next(1);
            let subscription = timer(0, 1000).subscribe(value => {
                this.time = value;
                this.timer$.next(value);
            });
            let name: string = this.group.value['nameCtrl'];
            let cols: number = coerceNumberProperty(this.group.value['colsCtrl']);
            let rows: number = coerceNumberProperty(this.group.value['rowsCtrl']);
            let speed: SpeedType = this.group.value['speedCtrl'];
            this.selectTask(name, cols, rows, speed, subscription);
        });
    }

    handleToggleResetAction(): void {
        if (this.group.valid) {
            let cols: number = coerceNumberProperty(this.group.value['colsCtrl']);
            let rows: number = coerceNumberProperty(this.group.value['rowsCtrl']);
            this.columns$.next(cols);
            this.usable$.next(false);
            this.formEnableDisable(true);
            this.build(cols, rows);
        }
    }

    handleToggleCloseAction(): void {
        let cols: number = coerceNumberProperty(this.group.value['colsCtrl']);
        let rows: number = coerceNumberProperty(this.group.value['rowsCtrl']);
        let array: MazeGenerationMeta[] = this.source.data;
        array.push({
            flag: false, code: this.source.data.length + 1, name: this.fetch(this.group.value['nameCtrl']), cols, rows,
            time: this.time, data: this.cells.map<MazeCellLessType>(cell =>
                ({x: cell.grid.x, y: cell.grid.y, bt: cell.grid.bt, bb: cell.grid.bb, bl: cell.grid.bl, br: cell.grid.br}))
        });
        this.source.data = array;
        this.shown$.next(false);
        this.build(cols, rows);
    }

    handleToggleSaveAction(): void {
        let array: any[] = Array.from(this.select.selected).map(item =>
            ({cols: item.cols, rows: item.rows, data: window.btoa(JSON.stringify(item.data))}));
        this.download(array);
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

    toggleAll(): void {
        this.checkAllSelected() ? this.select.clear() : this.select.select(...this.source.data);
    }

    checkAllSelected(): boolean {
        return this.select.selected.length === this.source.data.length;
    }

    private download(data: any): void {
        if (this.anchor === null) {
            this.anchor = this._render.createElement('a');
        }

        if (this.anchor !== null) {
            this.anchor.href = `data:application/json;charset=utf-8,${JSON.stringify(data)}`;
            this.anchor.download = 'maze-list.json';
            this.anchor.click();
        }
    }

    private fetch(code: string): string {
        let toggle: ToggleModel<string> | undefined = this.nameToggles.find(toggle => toggle.code === code);
        return toggle ? toggle.text : '';
    }

    private selectTask(name: string, cols: number, rows: number, speed: SpeedType, subscription: Subscription): void {
        switch (name) {
            case 'ab':
                this.execAldousBroder(speed, subscription);
                break;
            case 'btnw':
            case 'btne':
            case 'btsw':
            case 'btse':
                this.execBinaryTree(name.slice(2) as BinaryTreeDirection, cols, rows, speed, subscription);
                break;
            case 'eller':
                this.execEller(cols, rows, speed, subscription);
                break;
            case 'grow':
                this.execGrowTree(speed, subscription);
                break;
            case 'hunt':
                this.execHuntKill(cols, rows, speed, subscription);
                break;
            case 'kruskal':
                this.execKruskal(speed, subscription);
                break;
            case 'prim':
                this.execPrim(speed, subscription);
                break;
            case 'rbt':
                this.execRandomBackTracker(speed, subscription);
                break;
            case 'rdbt':
                this.execRandomDoubledBackTracker(cols, rows, speed, subscription);
                break;
            case 'rd':
                this.execRandomDivider(cols, rows, speed, subscription);
                break;
            case 'sw':
                this.execSideWinder(cols, rows, speed, subscription);
                break;
            case 'walson':
                this.execWalson(speed, subscription);
                break;
        }
    }

    private execAldousBroder(speed: SpeedType, subscription: Subscription): void {
        this._service.mazeAldousBroder(this.cells, speed, value => {
            this.marker$.next(value.currCell);

            if (value.currCell && value.nextCell) {
                DemoMazeGenerateView.merge(value.currCell, value.nextCell);
            }
        }).then(() => {
            this.phase$.next(0);
            this.formEnableDisable(true);
            subscription.unsubscribe();
        });
    }

    private execBinaryTree(direct: BinaryTreeDirection, cols: number, rows: number, speed: SpeedType,
                           subscription: Subscription): void {
        this._service.mazeBinaryTree(this.cells, cols, rows, direct, speed, value => {
            this.marker$.next(value.currCell);

            if (value.currCell && value.nextCell) {
                DemoMazeGenerateView.merge(value.currCell, value.nextCell);
            }
        }).then(() => {
            this.phase$.next(0);
            this.formEnableDisable(true);
            subscription.unsubscribe();
        });
    }

    private execEller(cols: number, rows: number, speed: SpeedType, subscription: Subscription): void {
        this.cells.forEach(cell => {
            cell.weight = -1;
            cell.connected = false;
        });
        this._service.mazeEller(this.cells, cols, rows, speed, value => {
            this.marker$.next(value.currCell);

            if (value.currCell && value.nextCell) {
                DemoMazeGenerateView.merge(value.currCell, value.nextCell);
            }
        }).then(() => {
            this.phase$.next(0);
            this.formEnableDisable(true);
            subscription.unsubscribe();
        });
    }

    private execGrowTree(speed: SpeedType, subscription: Subscription): void {
        this._service.mazeGrowTree(this.cells, speed, value => {
            this.marker$.next(value.currCell);

            if (value.currCell && value.nextCell) {
                DemoMazeGenerateView.merge(value.currCell, value.nextCell);
            }
        }).then(() => {
            this.phase$.next(0);
            this.formEnableDisable(true);
            subscription.unsubscribe();
        });
    }

    private execHuntKill(cols: number, rows: number, speed: SpeedType, subscription: Subscription): void {
        this._service.mazeHuntKill(this.cells, cols, rows, speed, value => {
            this.marker$.next(value.currCell);
            this.scanner$.next(value.scanner);

            if (value.currCell && value.nextCell) {
                DemoMazeGenerateView.merge(value.currCell, value.nextCell);
            }
        }).then(() => {
            this.phase$.next(0);
            this.formEnableDisable(true);
            subscription.unsubscribe();
        });
    }

    private execKruskal(speed: SpeedType, subscription: Subscription): void {
        this.cells.forEach(cell => cell.weight = 0);
        this._service.mazeKruskal(this.cells, speed, value => {
            this.currMarker$.next(value.currCell);
            this.nextMarker$.next(value.nextCell);

            if (value.currCell && value.nextCell) {
                DemoMazeGenerateView.merge(value.currCell, value.nextCell);
            }
        }).then(() => {
            this.phase$.next(0);
            this.formEnableDisable(true);
            subscription.unsubscribe();
        });
    }

    private execPrim(speed: SpeedType, subscription: Subscription): void {
        this.cells.forEach(cell => cell.weight = 0);
        this._service.mazePrim(this.cells, speed, value => {
            this.marker$.next(value.currCell);

            if (value.currCell && value.nextCell) {
                DemoMazeGenerateView.merge(value.currCell, value.nextCell);
            }
        }).then(() => {
            this.phase$.next(0);
            this.formEnableDisable(true);
            subscription.unsubscribe();
        });
    }

    private execRandomBackTracker(speed: SpeedType, subscription: Subscription): void {
        this._service.mazeRandomBackTracker(this.cells, speed, value => {
            this.marker$.next(value.currCell);

            if (value.currCell && value.nextCell) {
                DemoMazeGenerateView.merge(value.currCell, value.nextCell);
            }
        }).then(() => {
            this.phase$.next(0);
            this.formEnableDisable(true);
            subscription.unsubscribe();
        });
    }

    private execRandomDoubledBackTracker(cols: number, rows: number, speed: SpeedType, subscription: Subscription): void {
        this._service.mazeRandomDoubleBackTracker(this.cells, cols, rows, speed, value => {
            this.marker$.next(value.currCell);

            if (value.currCell && value.nextCell) {
                DemoMazeGenerateView.merge(value.currCell, value.nextCell);
            }
        }).then(() => {
            this.phase$.next(0);
            this.formEnableDisable(true);
            subscription.unsubscribe();
        });
    }

    private execRandomDivider(cols: number, rows: number, speed: SpeedType, subscription: Subscription): void {
        this._service.mazeRandomDivider(Array.from(this.cells), 0, cols - 1, 0,
            rows - 1, speed, value => {
                this.marker$.next(value.currCell);

                if (value.currCell && value.nextCell) {
                    DemoMazeGenerateView.merge(value.currCell, value.nextCell);
                }
            }).then(() => {
            this.phase$.next(0);
            this.formEnableDisable(true);
            subscription.unsubscribe();
        });
    }

    private execSideWinder(cols: number, rows: number, speed: number, subscription: Subscription): void {
        this._service.mazeSideWinder(this.cells, cols, rows, speed, value => {
            this.marker$.next(value.currCell);

            if (value.currCell && value.nextCell) {
                DemoMazeGenerateView.merge(value.currCell, value.nextCell);
            }
        }).then(() => {
            this.phase$.next(0);
            this.formEnableDisable(true);
            subscription.unsubscribe();
        });
    }

    private execWalson(speed: SpeedType, subscription: Subscription): void {
        this._service.mazeWalson(this.cells, speed, value => {
            this.marker$.next(value.currCell);
            this.startMarker$.next(value.startCell);
            this.finalMarker$.next(value.finalCell);

            if (value.currCell && value.nextCell) {
                DemoMazeGenerateView.merge(value.currCell, value.nextCell);
            }
        }).then(() => {
            this.phase$.next(0);
            this.formEnableDisable(true);
            subscription.unsubscribe();
        });
    }

    private build(cols: number, rows: number): void {
        this.cells.length = 0;

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                this.cells.push({grid: {x, y, bt: true, bb: true, bl: true, br: true}, visited: false});
            }
        }

        this.cells$.next(this.cells);
    }

    private formEnableDisable(flag: boolean): void {
        if (flag) {
            this.group.controls['nameCtrl'].enable();
            this.group.controls['speedCtrl'].enable();
            this.group.controls['colsCtrl'].enable();
            this.group.controls['rowsCtrl'].enable();
        } else {
            this.group.controls['nameCtrl'].disable();
            this.group.controls['speedCtrl'].disable();
            this.group.controls['colsCtrl'].disable();
            this.group.controls['rowsCtrl'].disable();
        }
    }

    private static merge(currCell: MazeCellFullType, nextCell: MazeCellFullType): void {
        if (currCell.grid.y + 1 === nextCell.grid.y) {
            currCell.grid.bb = false;
            nextCell.grid.bt = false;
        }

        if (currCell.grid.y - 1 === nextCell.grid.y) {
            currCell.grid.bt = false;
            nextCell.grid.bb = false;
        }

        if (currCell.grid.x + 1 === nextCell.grid.x) {
            currCell.grid.br = false;
            nextCell.grid.bl = false;
        }

        if (currCell.grid.x - 1 === nextCell.grid.x) {
            currCell.grid.bl = false;
            nextCell.grid.br = false;
        }
    }

}
