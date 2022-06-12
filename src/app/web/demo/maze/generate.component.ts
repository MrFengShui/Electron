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
    MazeCellType, MazeGridType,
    MazeViewType,
    SpeedType
} from "./maze.service";

import {MazeGenerationMeta, MazeSaveMeta, ToggleModel} from "../../../global/model/global.model";
import {ThreeStateType} from "../../../global/utils/global.utils";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'demo-maze-generate-view',
    templateUrl: 'generate.component.html',
    providers: [DemoMazeGenerateAlgorithmService]
})
export class DemoMazeGenerateView implements OnInit, OnDestroy {

    @ViewChild('view', {read: TemplateRef})
    private view!: TemplateRef<any>;

    @HostBinding('class') class: string = 'demo-maze-view';

    cells$: Subject<MazeCellType[]> = new BehaviorSubject<MazeCellType[]>([]);
    grids$: Subject<MazeViewType[]> = new BehaviorSubject<MazeViewType[]>([]);
    marker$: Subject<MazeCellType | undefined> = new BehaviorSubject<MazeCellType | undefined>(undefined);
    currMarker$: Subject<MazeCellType | undefined> = new BehaviorSubject<MazeCellType | undefined>(undefined);
    nextMarker$: Subject<MazeCellType | undefined> = new BehaviorSubject<MazeCellType | undefined>(undefined);
    startMarker$: Subject<MazeCellType | undefined> = new BehaviorSubject<MazeCellType | undefined>(undefined);
    finalMarker$: Subject<MazeCellType | undefined> = new BehaviorSubject<MazeCellType | undefined>(undefined);
    scanner$: Subject<number | undefined> = new BehaviorSubject<number | undefined>(undefined);
    columns$: Subject<number> = new BehaviorSubject<number>(0);
    shuffle$: Subject<boolean> = new BehaviorSubject<boolean>(false);
    usable$: Subject<boolean> = new BehaviorSubject<boolean>(true);
    timer$: Subject<number> = new BehaviorSubject<number>(0);
    shown$: Subject<boolean> = new BehaviorSubject<boolean>(false);
    phase$: Subject<ThreeStateType> = new BehaviorSubject<ThreeStateType>(0);
    select$: Subject<string> = new BehaviorSubject<string>('');

    readonly nameToggles: ToggleModel<string>[] = [
        {code: 'ab', text: 'DEMO.MAZEG.NAME.AB'},
        {code: 'btnw', text: 'DEMO.MAZEG.NAME.BTNW'},
        {code: 'btne', text: 'DEMO.MAZEG.NAME.BTSW'},
        {code: 'btsw', text: 'DEMO.MAZEG.NAME.BTNE'},
        {code: 'btse', text: 'DEMO.MAZEG.NAME.BTSE'},
        {code: 'eller', text: 'DEMO.MAZEG.NAME.ELLER'},
        {code: 'grow', text: 'DEMO.MAZEG.NAME.GT'},
        {code: 'hunt', text: 'DEMO.MAZEG.NAME.HK'},
        {code: 'kruskal', text: 'DEMO.MAZEG.NAME.KRUSKAL'},
        {code: 'prim', text: 'DEMO.MAZEG.NAME.PRIM'},
        {code: 'rbt', text: 'DEMO.MAZEG.NAME.RBT'},
        {code: 'rdbt', text: 'DEMO.MAZEG.NAME.RDBT'},
        {code: 'rd', text: 'DEMO.MAZEG.NAME.RD'},
        {code: 'sw', text: 'DEMO.MAZEG.NAME.SW'},
        {code: 'walson', text: 'DEMO.MAZEG.NAME.WALSON'}
    ];
    readonly speedToggles: ToggleModel<SpeedType>[] = [
        {code: 500, text: 'DEMO.PUBLIC.DELAY.EXTRA.SLOW'},
        {code: 250, text: 'DEMO.PUBLIC.DELAY.SLOW'},
        {code: 100, text: 'DEMO.PUBLIC.DELAY.NORMAL'},
        {code: 10, text: 'DEMO.PUBLIC.DELAY.FAST'},
        {code: 1, text: 'DEMO.PUBLIC.DELAY.EXTRA.FAST'},
    ];
    readonly headers: string[] = ['flag', 'code', 'name', 'cols', 'rows', 'time', 'data'];

    group!: FormGroup;
    source!: MatTableDataSource<MazeGenerationMeta>;
    select!: SelectionModel<MazeGenerationMeta>;

    private anchor: HTMLAnchorElement | null = null;
    private cells: MazeCellType[] = [];
    private cols: number = 0;
    private rows: number = 0;
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
            nameCtrl: new FormControl('none', [Validators.required]),
            speedCtrl: new FormControl('none', [Validators.required]),
            colsCtrl: new FormControl(60, [Validators.required, Validators.pattern(/[0-9]+/),
                Validators.min(10), Validators.max(200)]),
            rowsCtrl: new FormControl(30, [Validators.required, Validators.pattern(/[0-9]+/),
                Validators.min(5), Validators.max(100)])
        });
        this.source = new MatTableDataSource<MazeGenerationMeta>([]);
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
        this.select$.next(this.fetch(this.group.value['nameCtrl']));
        this.shown$.next(true);
        this.timer$.next(0);
        this._zone.runTask(() => {
            this.phase$.next(1);
            let subscription = timer(0, 10).subscribe(value => {
                this.time = value;
                this.timer$.next(value);
            });
            let name: string = this.group.value['nameCtrl'];
            let speed: SpeedType = this.group.value['speedCtrl'];
            this.selectTask(name, this.cols, this.rows, speed, subscription);
        });
    }

    handleToggleResetAction(): void {
        if (this.group.valid) {
            this.cols = coerceNumberProperty(this.group.value['colsCtrl']);
            this.rows = coerceNumberProperty(this.group.value['rowsCtrl']);
            this.columns$.next(this.cols);
            this.usable$.next(false);
            this.buildMazeGrid(this.cols, this.rows);
        }
    }

    handleToggleCloseAction(): void {
        let cols: number = coerceNumberProperty(this.group.value['colsCtrl']);
        let rows: number = coerceNumberProperty(this.group.value['rowsCtrl']);
        let array: MazeGenerationMeta[] = this.source.data;
        array.push({
            flag: false, code: this.source.data.length + 1, name: this.fetch(this.group.value['nameCtrl']), cols, rows,
            time: this.time, data: this.cells.map<MazeViewType>(cell =>
                ({
                    grid: {
                        x: cell.grid.x, y: cell.grid.y,
                        bt: cell.grid.bt, bb: cell.grid.bb, bl: cell.grid.bl, br: cell.grid.br
                    },
                    marked: false, visited: false, start: false, final: false
                }))
        });
        this.source.data = array;
        this.shown$.next(false);
        this.cells.length = 0;
    }

    handleToggleSaveAction(): void {
        let data: MazeGridType[];
        let array: MazeSaveMeta[] = Array.from(this.select.selected).map<MazeSaveMeta>(item => {
            data = Array.from(item.data).map(element => element.grid);
            return {
                name: `${DemoMazeGenerateView.match(item.name).toLowerCase()}_${item.cols}_${item.rows}`,
                cols: item.cols, rows: item.rows, data: window.btoa(JSON.stringify(data))
            }
        });

        if (this.anchor === null) {
            this.anchor = this._render.createElement('a');
        }

        if (this.anchor !== null) {
            this.anchor.href = `data:application/json;charset=utf-8,${JSON.stringify(array)}`;
            this.anchor.download = 'maze-list.json';
            this.anchor.click();
        }
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
                this.execBackTracker(speed, subscription);
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
        }).then(() => this.complete(subscription));
    }

    private execBackTracker(speed: SpeedType, subscription: Subscription): void {
        this._service.mazeBackTracker(this.cells, speed, value => {
            this.marker$.next(value.currCell);

            if (value.currCell && value.nextCell) {
                DemoMazeGenerateView.merge(value.currCell, value.nextCell);
            }
        }).then(() => this.complete(subscription));
    }

    private execBinaryTree(direct: BinaryTreeDirection, cols: number, rows: number, speed: SpeedType,
                           subscription: Subscription): void {
        this._service.mazeBinaryTree(this.cells, cols, rows, direct, speed, value => {
            this.marker$.next(value.currCell);

            if (value.currCell && value.nextCell) {
                DemoMazeGenerateView.merge(value.currCell, value.nextCell);
            }
        }).then(() => this.complete(subscription));
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
        }).then(() => this.complete(subscription));
    }

    private execGrowTree(speed: SpeedType, subscription: Subscription): void {
        this._service.mazeGrowTree(this.cells, speed, value => {
            this.marker$.next(value.currCell);

            if (value.currCell && value.nextCell) {
                DemoMazeGenerateView.merge(value.currCell, value.nextCell);
            }
        }).then(() => this.complete(subscription));
    }

    private execHuntKill(cols: number, rows: number, speed: SpeedType, subscription: Subscription): void {
        this._service.mazeHuntKill(this.cells, cols, rows, speed, value => {
            this.marker$.next(value.currCell);
            this.scanner$.next(value.scanner);

            if (value.currCell && value.nextCell) {
                DemoMazeGenerateView.merge(value.currCell, value.nextCell);
            }
        }).then(() => this.complete(subscription));
    }

    private execKruskal(speed: SpeedType, subscription: Subscription): void {
        this.cells.forEach(cell => cell.weight = 0);
        this._service.mazeKruskal(this.cells, speed, value => {
            this.currMarker$.next(value.currCell);
            this.nextMarker$.next(value.nextCell);

            if (value.currCell && value.nextCell) {
                DemoMazeGenerateView.merge(value.currCell, value.nextCell);
            }
        }).then(() => this.complete(subscription));
    }

    private execPrim(speed: SpeedType, subscription: Subscription): void {
        this.cells.forEach(cell => cell.weight = 0);
        this._service.mazePrim(this.cells, speed, value => {
            this.marker$.next(value.currCell);

            if (value.currCell && value.nextCell) {
                DemoMazeGenerateView.merge(value.currCell, value.nextCell);
            }
        }).then(() => this.complete(subscription));
    }

    private execRandomDoubledBackTracker(cols: number, rows: number, speed: SpeedType, subscription: Subscription): void {
        this._service.mazeDoubleBackTracker(this.cells, cols, rows, speed, value => {
            this.marker$.next(value.currCell);

            if (value.currCell && value.nextCell) {
                DemoMazeGenerateView.merge(value.currCell, value.nextCell);
            }
        }).then(() => this.complete(subscription));
    }

    private execRandomDivider(cols: number, rows: number, speed: SpeedType, subscription: Subscription): void {
        this._service.mazeRandomDivider(Array.from(this.cells), 0, cols - 1, 0,
            rows - 1, speed, value => {
                this.marker$.next(value.currCell);

                if (value.currCell && value.nextCell) {
                    DemoMazeGenerateView.merge(value.currCell, value.nextCell);
                }
            }).then(() => this.complete(subscription));
    }

    private execSideWinder(cols: number, rows: number, speed: number, subscription: Subscription): void {
        this._service.mazeSideWinder(this.cells, cols, rows, speed, value => {
            this.marker$.next(value.currCell);

            if (value.currCell && value.nextCell) {
                DemoMazeGenerateView.merge(value.currCell, value.nextCell);
            }
        }).then(() => this.complete(subscription));
    }

    private execWalson(speed: SpeedType, subscription: Subscription): void {
        this._service.mazeWalson(this.cells, speed, value => {
            this.marker$.next(value.currCell);
            this.startMarker$.next(value.startCell);
            this.finalMarker$.next(value.finalCell);

            if (value.currCell && value.nextCell) {
                DemoMazeGenerateView.merge(value.currCell, value.nextCell);
            }
        }).then(() => this.complete(subscription));
    }

    private complete(subscription: Subscription): void {
        this.phase$.next(-1);
        subscription.unsubscribe();
    }

    private buildMazeGrid(cols: number, rows: number): void {
        this.cells.length = 0;

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                this.cells.push({grid: {x, y, bt: true, bb: true, bl: true, br: true}, visited: false});
            }
        }

        this.cells$.next(this.cells);
    }

    private static merge(currCell: MazeCellType, nextCell: MazeCellType): void {
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

    private static match(name: string): string {
        switch (name) {
            case 'DEMO.MAZEG.NAME.AB':
                return 'Aldous_Broder';
            case 'DEMO.MAZEG.NAME.BTNW':
                return 'Binary_Tree_NW';
            case 'DEMO.MAZEG.NAME.BTSW':
                return 'Binary_Tree_SW';
            case 'DEMO.MAZEG.NAME.BTNE':
                return 'Binary Tree_NE';
            case 'DEMO.MAZEG.NAME.BTSE':
                return 'Binary_Tree_SE';
            case 'DEMO.MAZEG.NAME.ELLER':
                return 'Eller';
            case 'DEMO.MAZEG.NAME.GT':
                return 'Grow_Tree';
            case 'DEMO.MAZEG.NAME.HK':
                return 'Hunt_Kill';
            case 'DEMO.MAZEG.NAME.KRUSKAL':
                return 'Random_Kruskal';
            case 'DEMO.MAZEG.NAME.PRIM':
                return 'Random_Prim';
            case 'DEMO.MAZEG.NAME.RBT':
                return 'Random_Back_Tracker';
            case 'DEMO.MAZEG.NAME.RDBT':
                return 'Random_Double_Back_Tracker';
            case 'DEMO.MAZEG.NAME.RD':
                return 'Random_Divider';
            case 'DEMO.MAZEG.NAME.SW':
                return 'Side_Winder';
            case 'DEMO.MAZEG.NAME.WALSON':
                return 'Walson';
            default:
                return '';
        }
    }

}
