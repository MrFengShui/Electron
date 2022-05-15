import {coerceNumberProperty} from "@angular/cdk/coercion";
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    NgZone,
    OnDestroy,
    OnInit,
    QueryList,
    Renderer2,
    ViewChildren
} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {BehaviorSubject, Subject, Subscription, timer} from "rxjs";

import {BinaryTreeDirection, DemoMazeGenerateAlgorithmService, MazeCellType, SpeedType} from "./maze.service";

import {ToggleModel} from "../../global/model/global.model";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'demo-maze-generate-view',
    templateUrl: './generate.component.html',
    providers: [DemoMazeGenerateAlgorithmService]
})
export class DemoMazeGenerateView implements OnInit, OnDestroy {

    @ViewChildren('tile', {read: ElementRef})
    private tiles!: QueryList<ElementRef>;

    @HostBinding('class') class: string = 'demo-maze-view';

    cells$: Subject<MazeCellType[]> = new BehaviorSubject<MazeCellType[]>([]);
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
    phase$: Subject<0 | 1 | 2> = new BehaviorSubject<0 | 1 | 2>(0);
    select$: Subject<string> = new BehaviorSubject<string>('');

    nameToggles: ToggleModel<string>[] = [
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
        {code: 'rd', text: 'Random Divider'},
        {code: 'sw', text: 'Side Winder'},
        {code: 'walson', text: 'Walson'}
    ];
    speedToggles: ToggleModel<SpeedType | 'none'>[] = [
        {code: 'none', text: '--- Select One ---'},
        {code: 500, text: 'Extra Slow'},
        {code: 250, text: 'Slow'},
        {code: 100, text: 'Normal'},
        {code: 10, text: 'Fast'},
        {code: 5, text: 'Extra Fast'},
    ];

    group!: FormGroup;

    private cells: MazeCellType[] = [];

    constructor(
        private _builder: FormBuilder,
        private _cdr: ChangeDetectorRef,
        private _render: Renderer2,
        private _zone: NgZone,
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
            this.cells.map((cell, index) => cell.cell = this.tiles.get(index)?.nativeElement);
            this.cells$.next(this.cells);
            this.phase$.next(1);
            let subscription = timer(0, 1000).subscribe(value => this.timer$.next(value));
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
            this.buildMazeGrid(cols, rows);
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
                this.execBinaryTree(name.slice(2) as BinaryTreeDirection, subscription);
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
                this.removeWall(value.currCell, value.nextCell);
            }
        }).then(() => {
            this.phase$.next(0);
            this.formEnableDisable(true);
            subscription.unsubscribe();
        });
    }

    private execBinaryTree(direct: BinaryTreeDirection, subscription: Subscription): void {
        this._service.mazeBinaryTree(this.cells, coerceNumberProperty(this.group.value['colsCtrl']),
            coerceNumberProperty(this.group.value['rowsCtrl']), direct, this.group.value['speedCtrl'],
            (currCell, nextCell) => {
                this.marker$.next(currCell);

                if (currCell && nextCell) {
                    this.removeWall(currCell, nextCell);
                }
            })
            .then(() => {
                this.formEnableDisable(false);
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
                this.removeWall(value.currCell, value.nextCell);
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
                this.removeWall(value.currCell, value.nextCell);
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
                this.removeWall(value.currCell, value.nextCell);
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
                this.removeWall(value.currCell, value.nextCell);
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
                this.removeWall(value.currCell, value.nextCell);
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
                this.removeWall(value.currCell, value.nextCell);
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
                    this.removeWall(value.currCell, value.nextCell);
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
                this.removeWall(value.currCell, value.nextCell);
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
                this.removeWall(value.currCell, value.nextCell);
            }
        }).then(() => {
            this.phase$.next(0);
            this.formEnableDisable(true);
            subscription.unsubscribe();
        });
    }

    private buildMazeGrid(cols: number, rows: number): void {
        this.cells.length = 0;

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                this.cells.push({cell: undefined, x, y, visited: false});
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

    private removeWall(currCell: MazeCellType, nextCell: MazeCellType): void {
        if (currCell.y + 1 === nextCell.y) {
            this._render.removeClass(currCell.cell, 'bb-1');
            this._render.removeClass(nextCell.cell, 'bt-1');
        }

        if (currCell.y - 1 === nextCell.y) {
            this._render.removeClass(currCell.cell, 'bt-1');
            this._render.removeClass(nextCell.cell, 'bb-1');
        }

        if (currCell.x + 1 === nextCell.x) {
            this._render.removeClass(currCell.cell, 'br-1');
            this._render.removeClass(nextCell.cell, 'bl-1');
        }

        if (currCell.x - 1 === nextCell.x) {
            this._render.removeClass(currCell.cell, 'bl-1');
            this._render.removeClass(nextCell.cell, 'br-1');
        }
    }

}
