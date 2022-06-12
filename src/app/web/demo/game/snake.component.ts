import {coerceBooleanProperty, coerceNumberProperty} from "@angular/cdk/coercion";
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostBinding,
    Inject, NgZone, OnDestroy, OnInit, Renderer2,
    ViewChild
} from "@angular/core";
import {DOCUMENT} from "@angular/common";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import * as p5js from 'p5';

import {Snake, SnakeFood, SnakeGameRate, SnakeMoveDirs} from './snake.utils';
import {ToggleModel} from "../../../global/model/global.model";
import {BehaviorSubject, Subject, Subscription} from "rxjs";
import {ThreeStateType} from "../../../global/utils/global.utils";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'demo-snake-view',
    templateUrl: 'snake.component.html'
})
export class DemoSnakeView implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild('container', {read: ElementRef})
    private container!: ElementRef<HTMLElement>;

    @HostBinding('class') class: string = 'demo-snake-view';

    status$: Subject<ThreeStateType> = new BehaviorSubject<ThreeStateType>(0);
    up$: Subject<boolean> = new BehaviorSubject<boolean>(false);
    down$: Subject<boolean> = new BehaviorSubject<boolean>(false);
    left$: Subject<boolean> = new BehaviorSubject<boolean>(false);
    right$: Subject<boolean> = new BehaviorSubject<boolean>(false);

    group!: FormGroup;

    readonly toggles: ToggleModel<SnakeGameRate>[] = [
        {code: 4, text: 'DEMO.PUBLIC.DELAY.SLOW'},
        {code: 8, text: 'DEMO.PUBLIC.DELAY.NORMAL'},
        {code: 16, text: 'DEMO.PUBLIC.DELAY.FAST'}
    ];

    private p5!: p5js;
    private subscription!: Subscription;

    constructor(
        private _builder: FormBuilder,
        @Inject(DOCUMENT)
        private _document: Document,
        private _render: Renderer2,
        private _zone: NgZone
    ) {}

    ngOnInit() {
        this.group = this._builder.group({
            flagCtrl: new FormControl({value: true, disabled: false},[]),
            rateCtrl: new FormControl({value: 8, disabled: false},[]),
            colsCtrl: new FormControl({value: 80, disabled: false},
                [Validators.min(40), Validators.max(120), Validators.pattern(/[0-9]+/)]),
            rowsCtrl: new FormControl({value: 60, disabled: false},
                [Validators.min(30), Validators.max(90), Validators.pattern(/[0-9]+/)]),
        });
    }

    ngAfterViewInit() {
        this.initialize();
        this.subscription = this._zone.runOutsideAngular(() =>
            this.status$.asObservable().subscribe(value =>
                this.changeFormControlState(value !== 1)));
    }

    ngOnDestroy() {
        this.status$.complete();
        this.up$.complete();
        this.down$.complete();
        this.left$.complete();
        this.right$.complete();

        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    handleToggleStartAction(): void {
        this.status$.next(1);
        this.p5.loop();
    }

    handleToggleResetAction(): void {
        this.initialize();
        this.status$.next(0);
    }

    handleToggleAction(dir: SnakeMoveDirs): void {
        switch (dir) {
            case 'n': this.p5.keyCode = this.p5.UP_ARROW; break;
            case 's': this.p5.keyCode = this.p5.DOWN_ARROW; break;
            case 'w': this.p5.keyCode = this.p5.LEFT_ARROW; break;
            case 'e': this.p5.keyCode = this.p5.RIGHT_ARROW; break;
        }

        this.p5.keyPressed();
        this.p5.keyReleased();
    }

    private changeFormControlState(flag: boolean): void {
        if (flag) {
            this.group.controls['flagCtrl'].enable();
            this.group.controls['rateCtrl'].enable();
            this.group.controls['colsCtrl'].enable();
            this.group.controls['rowsCtrl'].enable();
        } else {
            this.group.controls['flagCtrl'].disable();
            this.group.controls['rateCtrl'].disable();
            this.group.controls['colsCtrl'].disable();
            this.group.controls['rowsCtrl'].disable();
        }
    }

    private initialize(): void {
        if (this.container) {
            if (this.container.nativeElement.hasChildNodes()) {
                this._render.removeChild(this.container.nativeElement, this.container.nativeElement.firstChild);
            }

            let task = setTimeout(() => {
                clearTimeout(task);
                this.p5 = DemoSnakeView.createCanvas(
                    this.container.nativeElement,
                    coerceBooleanProperty(this.group.value['flagCtrl']),
                    coerceNumberProperty(this.group.value['rateCtrl']),
                    coerceNumberProperty(this.group.value['colsCtrl']),
                    coerceNumberProperty(this.group.value['rowsCtrl']),
                    this.status$, this.up$, this.down$, this.left$, this.right$
                );
            }, 1000);
        }
    }

    private static createCanvas(element: HTMLElement, flag: boolean, rate: number, cols: number, rows: number,
                                status$: Subject<ThreeStateType>, up$: Subject<boolean>, down$: Subject<boolean>,
                                left$: Subject<boolean>, right$: Subject<boolean>): p5js {
        const sketch = (p5: p5js) => {
            let snake: Snake, food: SnakeFood;
            let gridWidth: number, gridHeight: number, cellWidth: number, cellHeight: number;

            p5.setup = (): void => {
                initialize();
                p5.createCanvas(gridWidth, gridHeight, p5.P2D).parent(element);
                p5.background(p5.color('black'));
                p5.frameRate(rate);
                p5.noLoop();

                snake = new Snake(cols, rows);
                snake.init(flag);
                snake.draw(p5, cellWidth, cellHeight);

                food = new SnakeFood(snake.list(), cols, rows);
                food.draw(p5, cellWidth, cellHeight);
            }

            p5.draw = (): void => {
                p5.background(p5.color('black'));

                food.draw(p5, cellWidth, cellHeight);
                snake.move(p5, food, cellWidth, cellHeight);

                if (snake.dead()) {
                    p5.noLoop();
                    status$.next(-1);
                }
            }

            p5.keyPressed = () => {
                switch (p5.keyCode) {
                    case p5.UP_ARROW: up$.next(true); break;
                    case p5.DOWN_ARROW: down$.next(true); break;
                    case p5.LEFT_ARROW: left$.next(true); break;
                    case p5.RIGHT_ARROW: right$.next(true); break;
                }
            }

            p5.keyReleased = () => {
                snake.moveTo(p5);

                switch (p5.keyCode) {
                    case p5.UP_ARROW: up$.next(false); break;
                    case p5.DOWN_ARROW: down$.next(false); break;
                    case p5.LEFT_ARROW: left$.next(false); break;
                    case p5.RIGHT_ARROW: right$.next(false); break;
                }
            }

            let initialize = (): void => {
                gridWidth = element.clientWidth;
                gridHeight = element.clientHeight;
                cellWidth = gridWidth / cols;
                cellHeight = gridHeight / rows;
            }
        }
        return new p5js(sketch);
    }

}
