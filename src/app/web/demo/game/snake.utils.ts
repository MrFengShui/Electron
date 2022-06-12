import * as p5js from "p5";

export type SnakeGameRate = 4 | 8 | 16;
export type SnakeMoveDirs = 'n' | 's' | 'w' | 'e';
export type Coordinate = {x: number, y: number};

export class SnakeFood {

    private x: number = -1;
    private y: number = -1;

    constructor(
        private _bodies: SnakeBody[],
        private _cols: number,
        private _rows: number
    ) {
        this.selectXY(this._bodies, this._cols, this._rows);
    }

    public draw(p5: p5js, width: number, height: number, corner: number = 2): void {
        p5.fill(p5.color('#FFA500'));
        p5.rect(this.x * width, this.y * height, width, height, corner, corner, corner, corner);
        p5.noStroke();
    }

    public eaten(head: SnakeBody): boolean {
        return this.x === head.coordinate().x && this.y === head.coordinate().y;
    }

    public selectXY(bodies: SnakeBody[], cols: number, rows: number): void {
        this.x = Math.floor(Math.random() * cols);
        this.y = Math.floor(Math.random() * rows);

        while (bodies.filter(body => body.coordinate().x === this.x && body.coordinate().y === this.y).length === 1) {
            this.x = Math.floor(Math.random() * cols);
            this.y = Math.floor(Math.random() * rows);
        }
    }

}

export class SnakeBody {

    private readonly x: number;
    private readonly y: number;

    constructor(
        private _x: number,
        private _y: number
    ) {
        this.x = this._x;
        this.y = this._y;
    }

    public coordinate(): Coordinate {
        return {x: this.x, y: this.y};
    }

    public draw(p5: p5js, width: number, height: number, corner: number, color: string = 'purple'): void {
        p5.fill(p5.color(color));
        p5.rect(this.x * width, this.y * height, width, height, corner, corner, corner, corner);
        p5.noStroke();
    }

}

export class Snake {

    private readonly dirs: SnakeMoveDirs[] = ['n', 's', 'w', 'e'];
    private readonly cols: number;
    private readonly rows: number;

    private length: number = 1;
    private alignDir: 'h' | 'v' = 'h';
    private moveDir: SnakeMoveDirs = this.dirs[Math.floor(Math.random() * this.dirs.length)];
    private offsetX: number = Snake.initOffsetX(this.moveDir);
    private offsetY: number = Snake.initOffsetY(this.moveDir);
    private head: SnakeBody | undefined;
    private bodies: SnakeBody[] = [];

    constructor(
        private _cols: number,
        private _rows: number
    ) {
        this.cols = this._cols;
        this.rows = this._rows;
    }

    public init(flag: boolean): void {
        let x: number = flag ? Math.floor(Math.random() * this.cols) : Math.floor(this.cols * 0.5);
        let y: number = flag ? Math.floor(Math.random() * this.rows) : Math.floor(this.rows * 0.5);
        this.head = new SnakeBody(x, y);
        this.bodies.push(this.head);
    }

    public draw(p5: p5js, width: number, height: number, corner: number = 2): void {
        this.bodies.forEach((body, index) =>
            body.draw(p5, width, height, corner, index === 0 ? '#9400D3' : '#EE82EE'));
    }

    public dead(): boolean {
        let coordinate: Coordinate = this.bodies[0].coordinate();
        return coordinate.x < 0 || coordinate.x >= this.cols || coordinate.y < 0 || coordinate.y >= this.rows
            || this.bodies.slice(1).filter(body =>
                body.coordinate().x === coordinate.x && body.coordinate().y === coordinate.y).length === 1;
    }

    public move(p5: p5js, food: SnakeFood, width: number, height: number): void {
        let coordinate: Coordinate = this.bodies[0].coordinate();
        this.head = new SnakeBody(coordinate.x + this.offsetX, coordinate.y + this.offsetY);
        this.bodies.unshift(this.head);

        if (food.eaten(this.bodies[0]) && this.length < Math.floor(this.cols * this.rows * 0.5)) {
            this.length += 1;
            food.selectXY(this.bodies, this.cols, this.rows);
        } else {
            this.bodies.pop();
        }

        this.draw(p5, width, height);
    }

    public moveTo(p5: p5js): SnakeMoveDirs {
        if (p5.keyCode === p5.UP_ARROW && this.alignDir === 'h') {
            this.offsetX = 0;
            this.offsetY = -1;
            this.alignDir = 'v';
            this.moveDir = 'n';
        }

        if (p5.keyCode === p5.DOWN_ARROW && this.alignDir === 'h') {
            this.offsetX = 0;
            this.offsetY = 1;
            this.alignDir = 'v';
            this.moveDir = 's';
        }

        if (p5.keyCode === p5.LEFT_ARROW && this.alignDir === 'v') {
            this.offsetX = -1;
            this.offsetY = 0;
            this.alignDir = 'h';
            this.moveDir = 'w';
        }

        if (p5.keyCode === p5.RIGHT_ARROW && this.alignDir === 'v') {
            this.offsetX = 1;
            this.offsetY = 0;
            this.alignDir = 'h';
            this.moveDir = 'e';
        }

        return this.moveDir;
    }

    public list(): SnakeBody[] {
        return this.bodies;
    }

    private static initOffsetX(dir: SnakeMoveDirs): number {
        switch (dir) {
            case 'e': return 1;
            case 'w': return -1;
            default: return 0;
        }
    }

    private static initOffsetY(dir: SnakeMoveDirs): number {
        switch (dir) {
            case 's': return 1;
            case 'n': return -1;
            default: return 0;
        }
    }

}
