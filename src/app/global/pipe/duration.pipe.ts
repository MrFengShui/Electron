import { Pipe, PipeTransform } from "@angular/core";
import {DecimalPipe} from "@angular/common";

@Pipe({
    name: 'duration'
})
export class DurationPipe implements PipeTransform {

    private pipe: DecimalPipe = new DecimalPipe('en_US');

    transform(value: number | null, formatter: 'long' | 'short' = 'long'): string {
        if (value === 0 || value === null) {
            return formatter === 'short' ? '00 : 00 : 000' : '00 : 00 : 00 : 000';
        } else {
            let hour: number = 0, minute: number = 0, second: number = 0, millisecond: number;
            let temp: number = value, text: string;

            if (temp >= 360000) {
                hour = Math.floor(temp / 360000);
                temp = temp % 360000;
            }

            if (temp >= 6000) {
                minute = Math.floor(temp / 6000);
                temp = temp % 6000;
            }

            if (temp >= 100) {
                second = Math.floor(temp / 100);
                temp = temp % 100;
            }

            millisecond = Math.floor(temp);
            text = `${this.pipe.transform(minute, '2.0-1')}` + ' : '
                + `${this.pipe.transform(second, '2.0-1')}` + ' : '
                + `${this.pipe.transform(millisecond, '3.0-1')}`;

            switch (formatter) {
                case 'long':
                    return `${this.pipe.transform(hour, '2.0-1')} : ${text}`;
                case 'short':
                    return text;
            }
        }
    }

    private static format(value: number): string {
        return (value < 10 ? '0' : '') + value;
    }

}
