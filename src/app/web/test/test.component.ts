import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild} from "@angular/core";
import * as p5js from 'p5';

import {DemoMazeGenerateAlgorithmService, MazeCellType, MazeGridType} from "../demo/maze/maze.service";
import {coerceBooleanProperty} from "@angular/cdk/coercion";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'demo-test-view',
    templateUrl: 'test.component.html',
    providers: [DemoMazeGenerateAlgorithmService]
})
export class DemoTestView implements AfterViewInit {

    @ViewChild('container', {read: ElementRef})
    private container!: ElementRef<HTMLElement>;

    private cols: number = 80;
    private rows: number = 40;

    constructor(private _service: DemoMazeGenerateAlgorithmService) {}

    ngAfterViewInit() {
        if (this.container) {
            let cells: MazeCellType[] = DemoTestView.createCells(this.cols, this.rows);
            let p5: p5js = DemoTestView.createCanvas(this.container.nativeElement, cells, this.cols, this.rows,
                this._service);
        }
    }

    private static createCells(cols: number, rows: number): MazeCellType[] {
        let cells: MazeCellType[] = [];

        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                cells.push({
                    grid: {x: i, y: j, bt: true, br: true, bb: true, bl: true},
                    visited: false
                });
            }
        }

        return cells;
    }

    private static createCanvas(element: HTMLElement, cells: MazeCellType[], cols: number, rows: number,
                                service: DemoMazeGenerateAlgorithmService): p5js {
        const sketch = (p5: p5js) => {
            let weight: number = 1, width: number = 1280 / cols, height: number = 640 / rows;

            p5.setup = (): void => {
                let renderer = p5.createCanvas(1280, 640, p5.P2D);
                renderer.style('border: #ffffff 1px solid;box-sizing: border-box;');
                renderer.parent(element);

                p5.background(p5.color('black'));
                p5.stroke(p5.color('white'));
                p5.strokeWeight(weight);
                p5.noLoop();

                drawGrid(cells);
            };

            p5.draw = (): void => {
                service.mazeBackTracker(cells, cols, rows,1, value => {
                    p5.background(p5.color('black'));

                    if (value.nextCell) {
                        drawMark(value.nextCell.grid);

                        if (value.currCell) {
                            service.mergeCells(value.currCell, value.nextCell);
                        }
                    }

                    drawGrid(cells);
                }).then();
            }

            let drawGrid = (cells: MazeCellType[]) => {
                cells.forEach(cell => drawCell(cell.grid));
            }

            let drawCell = (grid: MazeGridType): void => {
                p5.noFill();
                p5.stroke(p5.color('white'));

                if (grid.bt) {
                    p5.line(grid.x * width, grid.y * height, grid.x * width + width, grid.y * height);
                }

                if (grid.br) {
                    p5.line(grid.x * width + width, grid.y * height, grid.x * width + width, grid.y * height + height);
                }

                if (grid.bb) {
                    p5.line(grid.x * width, grid.y * height + height, grid.x * width + width, grid.y * height + height);
                }

                if (grid.bl) {
                    p5.line(grid.x * width, grid.y * height, grid.x * width, grid.y * height + height);
                }
            }

            let drawMark = (grid: MazeGridType): void => {
                p5.fill(p5.color('purple'));
                p5.noStroke();
                p5.rect(grid.x * width + weight, grid.y * height + weight, width - weight * 2, height - weight * 2);
            }
        }
        return new p5js(sketch);
    }

}
