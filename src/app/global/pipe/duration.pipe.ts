import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'duration'
})
export class DurationPipe implements PipeTransform {

    transform(value: number | null, formatter: 'long' | 'short' = 'long'): string {
        if (value) {
            let hour: number = 0;
            let minute: number = 0;
            let second: number;
            let temp: number = value;

            if (temp >= 3600) {
                hour = Math.floor(temp / 3600);
                temp = temp % 3600;
            }

            if (temp >= 60) {
                minute = Math.floor(temp / 60);
                temp = temp % 60;
            }

            second = Math.floor(temp);

            switch (formatter) {
                case 'long': return `${DurationPipe.format(hour)}:${DurationPipe.format(minute)}:${DurationPipe.format(second)}`;
                case 'short': return `${DurationPipe.format(minute)}:${DurationPipe.format(second)}`;
            }
        } else {
            return formatter === 'short' ? '00:00' : '00:00:00';
        }
    }

    private static format(value: number): string {
        return (value < 10 ? '0' : '') + value;
    }

}
