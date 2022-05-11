import {coerceBooleanProperty, coerceNumberProperty} from "@angular/cdk/coercion";
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    NgZone, OnDestroy,
    OnInit
} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {BehaviorSubject, Subject, Subscription, timer} from "rxjs";

import {
    DataType, OrderType, SpeedType,
    DemoStableSortService, DemoUnstableSortService, DemoOtherSortService, DemoSortUtilityService,
} from "./sort.service";

import {ToggleModel} from "../../global/model/global.model";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-demo-sort-view',
    templateUrl: './sort.component.html',
    providers: [DemoSortUtilityService, DemoOtherSortService, DemoStableSortService, DemoUnstableSortService]
})
export class DemoSortView implements OnInit, OnDestroy, AfterViewInit {

    @HostBinding('class') class: string = 'demo-sort-view';

    dataset$: Subject<DataType[]> = new BehaviorSubject<DataType[]>([]);
    pivotIndex$: Subject<number | undefined> = new BehaviorSubject<number | undefined>(undefined);
    currIndex$: Subject<number | undefined> = new BehaviorSubject<number | undefined>(undefined);
    nextIndex$: Subject<number | undefined> = new BehaviorSubject<number | undefined>(undefined);
    lhsPivotIndex$: Subject<number | undefined> = new BehaviorSubject<number | undefined>(undefined);
    rhsPivotIndex$: Subject<number | undefined> = new BehaviorSubject<number | undefined>(undefined);
    lhsCurrIndex$: Subject<number | undefined> = new BehaviorSubject<number | undefined>(undefined);
    lhsNextIndex$: Subject<number | undefined> = new BehaviorSubject<number | undefined>(undefined);
    rhsCurrIndex$: Subject<number | undefined> = new BehaviorSubject<number | undefined>(undefined);
    rhsNextIndex$: Subject<number | undefined> = new BehaviorSubject<number | undefined>(undefined);
    swapCount$: Subject<number | undefined> = new BehaviorSubject<number | undefined>(undefined);
    auxCount$: Subject<number | undefined> = new BehaviorSubject<number | undefined>(undefined);
    timer$: Subject<number> = new BehaviorSubject<number>(0);
    columns$: Subject<number> = new BehaviorSubject<number>(0);
    shown$: Subject<boolean> = new BehaviorSubject<boolean>(false);
    phase$: Subject<0 | 1 | 2> = new BehaviorSubject<0 | 1 | 2>(0);
    select$: Subject<string> = new BehaviorSubject<string>('');

    nameGroups: Array<{ label: string, toggles: ToggleModel<string>[] }> = [
        {
            label: 'Stable Sort',
            toggles: [
                {code: 'bst', text: 'BST Sort'},
                {code: 'bubble', text: 'Bubble Sort'},
                {code: 'bubble-opt', text: 'Optimized Bubble Sort'},
                {code: 'bucket', text: 'Bucket Sort'},
                {code: 'cocktail', text: 'Cock Tail Sort'},
                {code: 'count', text: 'Counting Sort'},
                {code: 'exchange', text: 'Exchange Sort'},
                {code: 'insert', text: 'Insertion Sort'},
                {code: 'insert-bi', text: 'Binary Insertion Sort'},
                {code: 'library', text: 'Library Sort'},
                {code: 'merge-bu', text: 'Merge Sort By Bottom-Up'},
                {code: 'merge-td', text: 'Merge Sort By Top-Down'},
                {code: 'merge-4way', text: 'Merge Sort By 4-Way'},
                {code: 'merge-ip', text: 'Merge Sort By In-Place'},
                {code: 'odd-even', text: 'Odd-Even Sort'},
                {code: 'pigeon', text: 'Pigeon Hole Sort'},
                {code: 'radix-lsd', text: 'Radix Sort By LSD'},
                {code: 'radix-lsd-2', text: 'Radix Sort By LSD-Base 2'},
                {code: 'radix-lsd-4', text: 'Radix Sort By LSD-Base 4'},
                {code: 'radix-lsd-8', text: 'Radix Sort By LSD-Base 8'},
                {code: 'radix-lsd-16', text: 'Radix Sort By LSD-Base 16'},
                {code: 'radix-msd', text: 'Radix Sort By MSD'},
                {code: 'slow', text: 'Slow Sort'},
                {code: 'strand', text: 'Strand Sort'},
                {code: 'tim-bu', text: 'Tim Sort By Bottom-Up'},
                {code: 'tim-td', text: 'Tim Sort By Top-Down'}
            ]
        },
        {
            label: 'Unstable Sort',
            toggles: [
                {code: 'combo', text: 'Combo Sort'},
                {code: 'cycle', text: 'Cycle Sort'},
                {code: 'flash', text: 'Flash Sort'},
                {code: 'heap', text: 'Heap Sort'},
                {code: 'intro', text: 'Introspective Sort'},
                {code: 'patience', text: 'Patience Sort'},
                {code: 'quick', text: 'Quick Sort'},
                // {code: 'quick-part', text: 'Partial Quick Sort'},
                {code: 'quick-2way', text: 'Quick Sort By 2-Way'},
                {code: 'quick-3way', text: 'Quick Sort By 3-Way'},
                {code: 'quick-dp', text: 'Quick Sort By Dual Pivot'},
                {code: 'select', text: 'Selection Sort'},
                {code: 'select-db', text: 'Double Selection Sort'},
                {code: 'shell', text: 'Shell Sort'},
                {code: 'tour', text: 'Tournament Sort'},
            ]
        },
        {
            label: 'Other Sort',
            toggles: [
                {code: 'bitonic-bu', text: 'Bitonic Sort By Bottom-Up'},
                {code: 'bitonic-td', text: 'Bitonic Sort By Top-Down'},
                {code: 'bogo', text: 'Bogo Sort'},
                {code: 'bogo-bubble', text: 'Bubble Bogo Sort'},
                {code: 'bogo-ct', text: 'Cock Tail Bogo Sort'},
                {code: 'bozo', text: 'Bozo Sort'},
                {code: 'bozo-less', text: 'Less Bozo Sort'},
                {code: 'gnome', text: 'Gnome Sort'},
                {code: 'gnome-opt', text: 'Optimized Gnome Sort'},
                {code: 'gravity', text: 'Gravity Sort'},
                {code: 'oem-bu', text: 'OE Merge Sort By Bottom-Up'},
                {code: 'oem-td', text: 'OE Merge Sort By Top-Down'},
                {code: 'pairwise-bu', text: 'Pairwise Sort By Bottom-Up'},
                {code: 'pancake', text: 'Pancake Sort'},
                {code: 'slow', text: 'Slow Sort'},
                {code: 'stooge', text: 'Stooge Sort'}
            ]
        }
    ];
    speedToggles: ToggleModel<SpeedType | 'none'>[] = [
        {code: 'none', text: '--- Select One ---'},
        {code: 500, text: 'Extra Slow'},
        {code: 250, text: 'Slow'},
        {code: 100, text: 'Normal'},
        {code: 10, text: 'Fast'},
        {code: 5, text: 'Extra Fast'}
    ];
    orderToggles: ToggleModel<OrderType | 'none'>[] = [
        {code: 'none', text: '--- Select One ---'},
        {code: 'ascent', text: 'Ascent'},
        {code: 'descent', text: 'Descent'}
    ];

    group!: FormGroup;

    private dataset: DataType[] = [];

    constructor(
        private _builder: FormBuilder,
        private _cdr: ChangeDetectorRef,
        private _zone: NgZone,
        private _dsus: DemoSortUtilityService,
        private _dsss: DemoStableSortService,
        private _duss: DemoUnstableSortService,
        private _doss: DemoOtherSortService
    ) {
    }

    ngOnInit() {
        this.group = this._builder.group({
            flagCtrl: new FormControl(false, []),
            nameCtrl: new FormControl('none', [Validators.required]),
            speedCtrl: new FormControl('none', [Validators.required]),
            orderCtrl: new FormControl('none', [Validators.required]),
            sizeCtrl: new FormControl(64, [Validators.required])
        });
    }

    ngAfterViewInit() {
        // let dataset: DataType[] = [
        //     {value: 8, ratio: 0.1}, {value: 5, ratio: 0.2}, {value: 7, ratio: 0.3}, {value: 3, ratio: 0.4},
        //     {value: 0, ratio: 0.5}, {value: 9, ratio: 0.6}, {value: 6, ratio: 0.7}, {value: 2, ratio: 0.8},
        //     {value: 4, ratio: 0.9}, {value: 1, ratio: 1.0}
        // ];
        // let dataset: DataType[] = Array.from({length: 8})
        //     .map(() => ({value: Math.floor(Math.random() * 20 + 1), ratio: 0}));
        // this._doss.sortByPairwise(dataset, 10, 'ascent', value => console.log(value)).then();
        // console.log(dataset);
        // let data: DataType = {value: 128, ratio: 0};
        // console.log(data, this._dsus.calcDigit(data, 3));
    }

    ngOnDestroy() {
        this.dataset$.complete();
        this.pivotIndex$.complete();
        this.lhsPivotIndex$.complete();
        this.rhsPivotIndex$.complete();
        this.currIndex$.complete();
        this.lhsCurrIndex$.complete();
        this.rhsCurrIndex$.complete();
        this.nextIndex$.complete();
        this.lhsNextIndex$.complete();
        this.rhsPivotIndex$.complete();
        this.timer$.complete();
    }

    handleToggleRunAction(): void {
        this.formEnableDisable(false);
        this.select$.next(this.fetch(this.group.value['nameCtrl']));
        this.shown$.next(true);
        this.timer$.next(0);
        let task = this._zone.run(() =>
            setTimeout(() => {
                clearTimeout(task);
                this.swapCount$.next(0);
                this.auxCount$.next(0);
                this._dsus.shuffle(this.dataset, value => {
                    this.phase$.next(1);
                    this.currIndex$.next(value.currIndex);
                    this.nextIndex$.next(value.nextIndex);
                }).then(() => {
                    this.phase$.next(2);
                    let subscription = timer(0, 1000)
                        .subscribe(value => this.timer$.next(value));
                    let name: string = this.group.value['nameCtrl'];
                    let speed: SpeedType = this.group.value['speedCtrl'];
                    let order: OrderType = this.group.value['orderCtrl'];
                    this.selectTask(name, speed, order, subscription);
                });
            }), 100);

    }

    handleToggleResetAction(): void {
        if (this.group.valid) {
            let length: number = coerceNumberProperty(this.group.value['sizeCtrl']);
            this.columns$.next(length);
            this.dataset = coerceBooleanProperty(this.group.value['flagCtrl'])
                ? Array.from({length})
                    .map(() => {
                        let value: number = Math.floor(Math.random() * length + 1);
                        return {value, ratio: value / length};
                    })
                : Array.from(this._dsus.PROTOTYPE_DATASET).slice(0, length)
                    .map<DataType>(item => ({value: item, ratio: item / length}));
            this.dataset$.next(this.dataset);
            this.formEnableDisable(true);
        }
    }

    private fetch(code: string): string {
        let toggle: ToggleModel<string> | undefined;

        for (let group of this.nameGroups) {
            toggle = group.toggles.find(toggle => toggle.code === code);
            if (toggle) break;
        }

        return toggle ? toggle.text : '';
    }

    private selectTask(name: string, speed: SpeedType, order: OrderType, subscription: Subscription): void {
        switch (name) {
            case 'bitonic-bu':
                this.execBitonicBUSort(speed, order, subscription);
                break;
            case 'bitonic-td':
                this.execBitonicTDSort(speed, order, subscription);
                break;
            case 'bogo':
                this.execBogoSort(speed, order, subscription);
                break;
            case 'bogo-bubble':
                this.execBogoBubbleSort(speed, order, subscription);
                break;
            case 'bogo-ct':
                this.execBogoCockTailSort(speed, order, subscription);
                break;
            case 'bozo':
                this.execBozoSort(speed, order, subscription);
                break;
            case 'bozo-less':
                this.execBozoLessSort(speed, order, subscription);
                break;
            case 'bst':
                this.execBSTSort(speed, order, subscription);
                break;
            case 'bubble':
                this.execBubbleSort(speed, order, subscription);
                break;
            case 'bubble-opt':
                this.execBubbleOptimalSort(speed, order, subscription);
                break;
            case 'bucket':
                this.execBucketSort(speed, order, subscription);
                break;
            case 'cocktail':
                this.execCockTailSort(speed, order, subscription);
                break;
            case 'combo':
                this.execComboSort(speed, order, subscription);
                break;
            case 'count':
                this.execCountSort(speed, order, subscription);
                break;
            case 'cycle':
                this.execCycleSort(speed, order, subscription);
                break;
            case 'exchange':
                this.execExchangeSort(speed, order, subscription);
                break;
            case 'flash':
                this.execFlashSort(speed, order, subscription);
                break;
            case 'gnome':
                this.execGnomeSort(speed, order, subscription);
                break;
            case 'gnome-opt':
                this.execGnomeOptimalSort(speed, order, subscription);
                break;
            case 'gravity':
                this.execGravitySort(speed, order, subscription);
                break;
            case 'heap':
                this.execHeapSort(speed, order, subscription);
                break;
            case 'insert':
                this.execInsertionSort(speed, order, subscription);
                break;
            case 'insert-bi':
                this.execInsertionBinarySort(speed, order, subscription);
                break;
            case 'intro':
                this.execIntroSort(speed, order, subscription);
                break;
            case 'library':
                this.execLibrarySort(speed, order, subscription);
                break;
            case 'merge-bu':
                this.execMergeBUSort(speed, order, subscription);
                break;
            case 'merge-td':
                this.execMergeTDSort(speed, order, subscription);
                break;
            case 'merge-4way':
                this.execMerge4WaySort(speed, order, subscription);
                break;
            case 'merge-ip':
                this.execMergeInPlaceSort(speed, order, subscription);
                break;
            case 'patience':
                this.execPatienceSort(speed, order, subscription);
                break;
            case 'quick':
                this.execQuickSort(speed, order, subscription);
                break;
            case 'quick-2way':
                this.execQuick2WaySort(speed, order, subscription);
                break;
            case 'quick-3way':
                this.execQuick3WaySort(speed, order, subscription);
                break;
            case 'quick-dp':
                this.execQuickDPSort(speed, order, subscription);
                break;
            case 'odd-even':
                this.execOddEvenSort(speed, order, subscription);
                break;
            case 'oem-td':
                this.execOEMergeTDSort(speed, order, subscription);
                break;
            case 'oem-bu':
                this.execOEMergeBUSort(speed, order, subscription);
                break;
            case 'pairwise-bu':
                this.execPairwiseBUSort(speed, order, subscription);
                break;
            case 'pancake':
                this.execPancakeSort(speed, order, subscription);
                break;
            case 'pigeon':
                this.execPigeonHoleSort(speed, order, subscription);
                break;
            case 'radix-lsd':
                this.execRadixLSDSort(speed, order, subscription);
                break;
            case 'radix-lsd-2':
                this.execRadixBaseLSDSort(2, speed, order, subscription);
                break;
            case 'radix-lsd-4':
                this.execRadixBaseLSDSort(4, speed, order, subscription);
                break;
            case 'radix-lsd-8':
                this.execRadixBaseLSDSort(8, speed, order, subscription);
                break;
            case 'radix-lsd-16':
                this.execRadixBaseLSDSort(16, speed, order, subscription);
                break;
            case 'radix-msd':
                this.execRadixMSDSort(speed, order, subscription);
                break;
            case 'select':
                this.execSelectionSort(speed, order, subscription);
                break;
            case 'select-db':
                this.execSelectionDoubleSort(speed, order, subscription);
                break;
            case 'shell':
                this.execShellSort(speed, order, subscription);
                break;
            case 'slow':
                this.execSlowSort(speed, order, subscription);
                break;
            case 'stooge':
                this.execStoogeSort(speed, order, subscription);
                break;
            case 'strand':
                this.execStrandSort(speed, order, subscription);
                break;
            case 'tim-bu':
                this.execTimBUSort(speed, order, subscription);
                break;
            case 'tim-td':
                this.execTimTDSort(speed, order, subscription);
                break;
            case 'tour':
                this.execTournament(speed, order, subscription);
                break;
        }
    }

    calcCount(): number {
        let count: number = 0;
        this.nameGroups.forEach(group => count += group.toggles.length);
        return count;
    }

    private execBitonicBUSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._doss.sortByBitonicBU(this.dataset, speed, order, value => {
                this.dataset$.next(value.dataset);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.swapCount$.next(value.swapCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execBitonicTDSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._doss.sortByBitonicTD(this.dataset, 0, this.dataset.length, true, 0, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.swapCount$.next(value.swapCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execBogoSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._doss.sortByBogo(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execBogoBubbleSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._doss.sortByBogoBubble(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execBogoCockTailSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._doss.sortByBogoCockTail(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execBozoSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._doss.sortByBozo(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execBozoLessSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._doss.sortByBozoLess(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execBSTSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dsss.sortByBST(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.auxCount$.next(value.auxCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execBubbleSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dsss.sortByBubble(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execBubbleOptimalSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dsss.sortByBubbleOptimal(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execBucketSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dsss.sortByBucket(this.dataset, 16, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
            this.auxCount$.next(value.auxCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execCockTailSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dsss.sortByCockTail(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execComboSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._duss.sortByCombo(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execCountSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dsss.sortByCount(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.auxCount$.next(value.auxCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execCycleSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._duss.sortByCycle(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execExchangeSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dsss.sortByExchange(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execFlashSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._duss.sortByFlash(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
            this.auxCount$.next(value.auxCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execGnomeSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._doss.sortByGnome(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execGnomeOptimalSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._doss.sortByGnomeOptimal(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execGravitySort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._doss.sortByGravity(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execHeapSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._duss.sortByHeap(this.dataset, 0, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execInsertionSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dsss.sortByInsertion(this.dataset, 0, this.dataset.length - 1, 0, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.pivotIndex$.next(value.pivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.swapCount$.next(value.swapCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execInsertionBinarySort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dsss.sortByInsertionBinary(this.dataset, 0, this.dataset.length - 1, 0, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.pivotIndex$.next(value.pivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.swapCount$.next(value.swapCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execIntroSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._duss.sortByIntro(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execLibrarySort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dsss.sortByLibrary(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execMergeBUSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dsss.sortByMergeBU(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.auxCount$.next(value.auxCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execMergeTDSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dsss.sortByMergeTD(this.dataset, 0, this.dataset.length - 1, 0, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.pivotIndex$.next(value.pivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.auxCount$.next(value.auxCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execMerge4WaySort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dsss.sortByMerge4Way(this.dataset, 0, this.dataset.length - 1, 0, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.pivotIndex$.next(value.pivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.auxCount$.next(value.auxCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execMergeInPlaceSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dsss.sortByMergeInPlace(this.dataset, 0, this.dataset.length - 1, 0, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.pivotIndex$.next(value.pivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.swapCount$.next(value.swapCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execOddEvenSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dsss.sortByOddEven(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execOEMergeBUSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._doss.sortByOEMergeBU(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execOEMergeTDSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._doss.sortByOEMergeTD(this.dataset, 0, this.dataset.length, 0, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.swapCount$.next(value.swapCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execPairwiseBUSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._doss.sortByPairwiseBU(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execPancakeSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._doss.sortByPancake(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execPatienceSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._duss.sortByPatience(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.auxCount$.next(value.auxCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execPigeonHoleSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dsss.sortByPigeonHole(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execQuickSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._duss.sortByQuick(this.dataset, 0, this.dataset.length - 1, 0, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.pivotIndex$.next(value.pivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.swapCount$.next(value.swapCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execQuick2WaySort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._duss.sortByQuick2Way(this.dataset, 0, this.dataset.length - 1, 0, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.pivotIndex$.next(value.pivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.swapCount$.next(value.swapCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execQuick3WaySort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._duss.sortByQuick3Way(this.dataset, 0, this.dataset.length - 1, 0, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.pivotIndex$.next(value.pivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.swapCount$.next(value.swapCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execQuickDPSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._duss.sortByQuickDualPivot(this.dataset, 0, this.dataset.length - 1, 0, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.lhsPivotIndex$.next(value.lhsPivotIndex);
                this.rhsPivotIndex$.next(value.rhsPivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.swapCount$.next(value.swapCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execRadixLSDSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dsss.sortByRadixLSD(this.dataset, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.pivotIndex$.next(value.pivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.auxCount$.next(value.auxCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execRadixBaseLSDSort(base: 2 | 4 | 8 | 16, speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dsss.sortByRadixBaseLSD(this.dataset, base, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.pivotIndex$.next(value.pivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.auxCount$.next(value.auxCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execRadixMSDSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dsss.sortByRadixMSD(this.dataset, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.pivotIndex$.next(value.pivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execSelectionSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._duss.sortBySelection(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execSelectionDoubleSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._duss.sortBySelectionDouble(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.lhsPivotIndex$.next(value.lhsPivotIndex);
            this.rhsPivotIndex$.next(value.rhsPivotIndex);
            this.lhsCurrIndex$.next(value.lhsCurrIndex);
            this.lhsNextIndex$.next(value.lhsNextIndex);
            this.rhsCurrIndex$.next(value.rhsCurrIndex);
            this.rhsNextIndex$.next(value.rhsNextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execShellSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._duss.sortByShell(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execSlowSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._doss.sortBySlow(this.dataset, 0, this.dataset.length - 1, 0, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.pivotIndex$.next(value.pivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.swapCount$.next(value.swapCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execStoogeSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._doss.sortByStooge(this.dataset, 0, this.dataset.length - 1, 0, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.pivotIndex$.next(value.pivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.swapCount$.next(value.swapCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execStrandSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dsss.sortByStrand(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.auxCount$.next(value.auxCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execTimBUSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dsss.sortByTimBU(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
            this.auxCount$.next(value.auxCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execTimTDSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dsss.sortByTimTD(this.dataset, 0, this.dataset.length - 1, 0, 0, 0,
            speed, order, value => {
                this.dataset$.next(value.dataset);
                this.pivotIndex$.next(value.pivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.swapCount$.next(value.swapCount);
                this.auxCount$.next(value.auxCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execTournament(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._duss.sortByTournament(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execComplete(length: number, speed: SpeedType, subscription: Subscription): void {
        this._dsus.complete(length, speed, value => this.currIndex$.next(value.currIndex))
            .then(() => {
                this.phase$.next(0);
                this.formEnableDisable(true);
                subscription.unsubscribe();
            });
    }

    private formEnableDisable(flag: boolean): void {
        if (flag) {
            this.group.controls['flagCtrl'].enable();
            this.group.controls['nameCtrl'].enable();
            this.group.controls['speedCtrl'].enable();
            this.group.controls['orderCtrl'].enable();
            this.group.controls['sizeCtrl'].enable();
        } else {
            this.group.controls['flagCtrl'].disable();
            this.group.controls['nameCtrl'].disable();
            this.group.controls['speedCtrl'].disable();
            this.group.controls['orderCtrl'].disable();
            this.group.controls['sizeCtrl'].disable();
        }
    }

}
