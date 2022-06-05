import {MazeGridType} from "../../web/maze/maze.service";

export const drawBorderLine = (context: CanvasRenderingContext2D | null, grid: MazeGridType,
                               offsetX: number, offsetY: number, size: number = 2): void => {
    if (context !== null) {
        let x: number = grid.x * offsetX + size * 0.5, y: number = grid.y * offsetY + size * 0.5;
        context.clearRect(x, y, x + offsetX, y + offsetY);
        context.beginPath();

        if (grid.bt) {
            context.moveTo(x, y);
            context.lineTo(x + offsetX, y);
        }

        if (grid.bb) {
            context.moveTo(x, y + offsetY);
            context.lineTo(x + offsetX, y + offsetY);
        }

        if (grid.bl) {
            context.moveTo(x, y);
            context.lineTo(x, y + offsetY);
        }

        if (grid.br) {
            context.moveTo(x + offsetX, y);
            context.lineTo(x + offsetX, y + offsetY);
        }

        context.closePath();
        context.stroke();
    }
}

export const fillGridColor = (context: CanvasRenderingContext2D | null, grid: MazeGridType,
                              offsetX: number, offsetY: number, size: number = 2): void => {
    if (context !== null) {
        let w: number = offsetX - size, h: number = offsetY - size;
        let x: number = grid.x * offsetX + size, y: number = grid.y * offsetY + size;
        context.fillRect(x, y, w, h);
    }
}
