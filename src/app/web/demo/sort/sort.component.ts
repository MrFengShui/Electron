import {coerceBooleanProperty, coerceNumberProperty} from "@angular/cdk/coercion";
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    NgZone, OnDestroy,
    OnInit
} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";
import {BehaviorSubject, Subject, Subscription, timer} from "rxjs";

import {
    DataType, OrderType, SpeedType,
    DemoComparisonSortService, DemoDistributionSortService, DemoOtherSortService, DemoSortUtilityService, BaseType,
} from "./sort.service";

import {ToggleModel} from "../../../global/model/global.model";
import {ThreeStateType} from "../../../global/utils/global.utils";

interface SortMeta {

    code: number;
    name: string;
    swap: number;
    auxc: number;
    size: number;
    time: number;
    delay: SpeedType;
    order: OrderType;

}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'demo-sort-view',
    templateUrl: 'sort.component.html',
    providers: [DemoSortUtilityService, DemoOtherSortService, DemoComparisonSortService, DemoDistributionSortService]
})
export class DemoSortView implements OnInit, OnDestroy {

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
    phase$: Subject<ThreeStateType> = new BehaviorSubject<ThreeStateType>(0);
    select$: Subject<string> = new BehaviorSubject<string>('');

    readonly nameGroups: Array<{ label: string, toggles: ToggleModel<string>[] }> = [
        {
            label: 'DEMO.SORT.TYPE.COMPARE',
            toggles: [
                {code: 'bubble', text: 'DEMO.SORT.NAME.BUBBLE'},
                {code: 'bubble-opt', text: 'DEMO.SORT.NAME.BUBBLE.OPT'},
                {code: 'cocktail', text: 'DEMO.SORT.NAME.COCKTAIL'},
                {code: 'cocktail-opt', text: 'DEMO.SORT.NAME.COCKTAIL.OPT'},
                {code: 'combo', text: 'DEMO.SORT.NAME.COMBO'},
                {code: 'cycle', text: 'DEMO.SORT.NAME.CYCLE'},
                {code: 'exchange', text: 'DEMO.SORT.NAME.EXCHANGE'},
                {code: 'heap', text: 'DEMO.SORT.NAME.HEAP'},
                {code: 'insert', text: 'DEMO.SORT.NAME.INSERT'},
                {code: 'insert-bi', text: 'DEMO.SORT.NAME.INSERT.BST'},
                {code: 'intro', text: 'DEMO.SORT.NAME.INTRO'},
                {code: 'merge-bu', text: 'DEMO.SORT.NAME.MERGE.BU'},
                {code: 'merge-td', text: 'DEMO.SORT.NAME.MERGE.TD'},
                {code: 'merge-way', text: 'DEMO.SORT.NAME.MERGE.WAY'},
                {code: 'merge-ip', text: 'DEMO.SORT.NAME.MERGE.IP'},
                {code: 'odd-even', text: 'DEMO.SORT.NAME.ODD-EVEN'},
                {code: 'quick', text: 'DEMO.SORT.NAME.QUICK'},
                {code: 'quick-2way', text: 'DEMO.SORT.NAME.QUICK.2WAY'},
                {code: 'quick-3way', text: 'DEMO.SORT.NAME.QUICK.3WAY'},
                {code: 'quick-dp', text: 'DEMO.SORT.NAME.QUICK.DP'},
                {code: 'select', text: 'DEMO.SORT.NAME.SELECT'},
                {code: 'select-db', text: 'DEMO.SORT.NAME.SELECT.DOUBLE'},
                {code: 'shell', text: 'DEMO.SORT.NAME.SHELL'},
                {code: 'strand', text: 'DEMO.SORT.NAME.STRAND'},
                {code: 'tim-bu', text: 'DEMO.SORT.NAME.TIMSORT.BU'},
                {code: 'tim-td', text: 'DEMO.SORT.NAME.TIMSORT.TD'},
                {code: 'tour', text: 'DEMO.SORT.NAME.TOUR'}
            ]
        },
        {
            label: 'DEMO.SORT.TYPE.DISTRIBUTE',
            toggles: [
                {code: 'bst', text: 'DEMO.SORT.NAME.BST'},
                {code: 'bucket-2', text: 'DEMO.SORT.NAME.BUCKET.BIN'},
                {code: 'bucket-8', text: 'DEMO.SORT.NAME.BUCKET.OCT'},
                {code: 'bucket-10', text: 'DEMO.SORT.NAME.BUCKET.DEC'},
                {code: 'bucket-16', text: 'DEMO.SORT.NAME.BUCKET.HEX'},
                {code: 'count', text: 'DEMO.SORT.NAME.COUNT'},
                {code: 'flash', text: 'DEMO.SORT.NAME.FLASH'},
                {code: 'pigeon', text: 'DEMO.SORT.NAME.PIGEON'},
                {code: 'patience', text: 'DEMO.SORT.NAME.PATIENT'},
                {code: 'radix-lsd-2', text: 'DEMO.SORT.NAME.RADIX.LSD.BIN'},
                {code: 'radix-lsd-8', text: 'DEMO.SORT.NAME.RADIX.LSD.OCT'},
                {code: 'radix-lsd-10', text: 'DEMO.SORT.NAME.RADIX.LSD.DEC'},
                {code: 'radix-lsd-16', text: 'DEMO.SORT.NAME.RADIX.LSD.HEX'},
                {code: 'radix-msd-2', text: 'DEMO.SORT.NAME.RADIX.MSD.BIN'},
                {code: 'radix-msd-8', text: 'DEMO.SORT.NAME.RADIX.MSD.OCT'},
                {code: 'radix-msd-10', text: 'DEMO.SORT.NAME.RADIX.MSD.DEC'},
                {code: 'radix-msd-16', text: 'DEMO.SORT.NAME.RADIX.MSD.HEX'}
            ]
        },
        {
            label: 'DEMO.SORT.TYPE.OTHER',
            toggles: [
                {code: 'bitonic-bu', text: 'DEMO.SORT.NAME.BITONIC.BU'},
                {code: 'bitonic-td', text: 'DEMO.SORT.NAME.BITONIC.TD'},
                {code: 'bogo', text: 'DEMO.SORT.NAME.BOGO'},
                {code: 'bogo-bubble', text: 'DEMO.SORT.NAME.BOGO.BUBLE'},
                {code: 'bogo-ct', text: 'DEMO.SORT.NAME.BOGO.COCKTAIL'},
                {code: 'bozo', text: 'DEMO.SORT.NAME.BOZO'},
                {code: 'bozo-less', text: 'DEMO.SORT.NAME.BOZO.LESS'},
                {code: 'circle', text: 'DEMO.SORT.NAME.CIRCLE'},
                {code: 'gnome', text: 'DEMO.SORT.NAME.GNOME'},
                {code: 'gnome-opt', text: 'DEMO.SORT.NAME.GNOME.OPT'},
                {code: 'gravity', text: 'DEMO.SORT.NAME.GRAVITY'},
                {code: 'library', text: 'DEMO.SORT.NAME.LIBRARY'},
                {code: 'oem-bu', text: 'DEMO.SORT.NAME.ODD-EVEN.MERGE.BU'},
                {code: 'oem-td', text: 'DEMO.SORT.NAME.ODD-EVEN.MERGE.TD'},
                {code: 'pairwise', text: 'DEMO.SORT.NAME.PAIRWISE'},
                {code: 'pancake', text: 'DEMO.SORT.NAME.PANCAKE'},
                {code: 'slow', text: 'DEMO.SORT.NAME.SLOW'},
                {code: 'stooge', text: 'DEMO.SORT.NAME.STOOGE'}
            ]
        }
    ];
    readonly speedToggles: ToggleModel<SpeedType>[] = [
        {code: 500, text: 'DEMO.PUBLIC.DELAY.EXTRA.SLOW'},
        {code: 250, text: 'DEMO.PUBLIC.DELAY.SLOW'},
        {code: 100, text: 'DEMO.PUBLIC.DELAY.NORMAL'},
        {code: 10, text: 'DEMO.PUBLIC.DELAY.FAST'},
        {code: 1, text: 'DEMO.PUBLIC.DELAY.EXTRA.FAST'}
    ];
    readonly orderToggles: ToggleModel<OrderType>[] = [
        {code: 'ascent', text: 'DEMO.SORT.ORDER.ASCENT'},
        {code: 'descent', text: 'DEMO.SORT.ORDER.DESCENT'}
    ];
    readonly headers: string[] = ['code', 'name', 'swap', 'auxc', 'delay', 'order', 'size', 'time'];

    group!: FormGroup;
    source!: MatTableDataSource<SortMeta>;

    // private metas: SortMeta[] = Array.from({length: 16}).map((_, index) =>
    //     ({code: index + 1, name: `Algorithm ${index + 1}`,
    //         swap: Math.floor(Math.random() * 1234567890), auxc: Math.floor(Math.random() * 1234567890),
    //         size: Math.floor(Math.random() * 2048), time: 0, delay: 1, order: 'ascent'}));
    private metas: SortMeta[] = [];
    private dataset: DataType[] = [];
    private swap!: number;
    private auxc!: number;
    private time!: number;

    constructor(
        private _builder: FormBuilder,
        private _cdr: ChangeDetectorRef,
        private _zone: NgZone,
        private _dsus: DemoSortUtilityService,
        private _dcss: DemoComparisonSortService,
        private _ddss: DemoDistributionSortService,
        private _doss: DemoOtherSortService
    ) {
    }

    ngOnInit() {
        this.group = this._builder.group({
            flagCtrl: new FormControl(false, []),
            nameCtrl: new FormControl('none', [Validators.required]),
            speedCtrl: new FormControl('none', [Validators.required]),
            orderCtrl: new FormControl('none', [Validators.required]),
            sizeCtrl: new FormControl(64,
                [Validators.required, Validators.min(8), Validators.max(2048)])
        });
        this.source = new MatTableDataSource<SortMeta>(this.metas);
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
        this.swapCount$.complete();
        this.auxCount$.complete();
        this.timer$.complete();
        this.columns$.complete();
        this.shown$.complete();
        this.phase$.complete();
        this.select$.complete();
    }

    handleToggleRunAction(): void {
        this.select$.next(this.fetch(this.group.value['nameCtrl']));
        this.shown$.next(true);
        this.timer$.next(0);
        this.swapCount$.next(0);
        this.auxCount$.next(0);
        let task = this._zone.run(() =>
            setTimeout(() => {
                clearTimeout(task);
                this._dsus.shuffle(this.dataset, value => {
                    this.phase$.next(1);
                    this.lhsPivotIndex$.next(value.lhsPivotIndex);
                    this.rhsPivotIndex$.next(value.rhsPivotIndex);
                }).then(() => {
                    this.time = 0;
                    this.swap = 0;
                    this.auxc = 0;
                    this.phase$.next(1);
                    let subscription = timer(0, 10)
                        .subscribe(value => {
                            this.time = value;
                            this.timer$.next(value);
                        });
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
            this.phase$.next(0);
        }
    }

    handleToggleCloseAction(): void {
        let array: SortMeta[] = this.source.data;
        array.push({code: array.length + 1, name: this.fetch(this.group.value['nameCtrl']),
            swap: this.swap, auxc: this.auxc, size: coerceNumberProperty(this.group.value['sizeCtrl']),
            time: this.time, delay: this.group.value['speedCtrl'], order: this.group.value['orderCtrl']});
        this.source.data = array;
        this.shown$.next(false);
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
            case 'bucket-2':
                this.execBucketSort(2, speed, order, subscription);
                break;
            case 'bucket-8':
                this.execBucketSort(8, speed, order, subscription);
                break;
            case 'bucket-10':
                this.execBucketSort(10, speed, order, subscription);
                break;
            case 'bucket-16':
                this.execBucketSort(16, speed, order, subscription);
                break;
            case 'circle':
                this.execCircleSort(speed, order, subscription);
                break;
            case 'cocktail-opt':
                this.execCockTailOptimalSort(speed, order, subscription);
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
            case 'merge-way':
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
            case 'pairwise':
                this.execPairwiseSort(speed, order, subscription);
                break;
            case 'pancake':
                this.execPancakeSort(speed, order, subscription);
                break;
            case 'pigeon':
                this.execPigeonHoleSort(speed, order, subscription);
                break;
            case 'radix-lsd-2':
                this.execRadixLSDSort(2, speed, order, subscription);
                break;
            case 'radix-lsd-8':
                this.execRadixLSDSort(8, speed, order, subscription);
                break;
            case 'radix-lsd':
                this.execRadixLSDSort(10, speed, order, subscription);
                break;
            case 'radix-lsd-16':
                this.execRadixLSDSort(16, speed, order, subscription);
                break;
            case 'radix-msd-2':
                this.execRadixMSDSort(2, speed, order, subscription);
                break;
            case 'radix-msd-8':
                this.execRadixMSDSort(8, speed, order, subscription);
                break;
            case 'radix-msd-10':
                this.execRadixMSDSort(10, speed, order, subscription);
                break;
            case 'radix-msd-16':
                this.execRadixMSDSort(16, speed, order, subscription);
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
        this._ddss.sortByBST(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.auxCount$.next(value.auxCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execBubbleSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dcss.sortByBubble(this.dataset, speed, order, value => {
            this.swap = value.swapCount as number;
            this.dataset$.next(value.dataset);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execBubbleOptimalSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dcss.sortByBubbleOptimal(this.dataset, speed, order, value => {
            this.swap = value.swapCount as number;
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execBucketSort(base: BaseType, speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._ddss.sortByBucket(this.dataset, base, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
            this.auxCount$.next(value.auxCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execCircleSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._doss.sortByCircle(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execCockTailOptimalSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dcss.sortByCockTail(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execComboSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dcss.sortByCombo(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execCountSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._ddss.sortByCount(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.auxCount$.next(value.auxCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execCycleSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dcss.sortByCycle(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execExchangeSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dcss.sortByExchange(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execFlashSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._ddss.sortByFlash(this.dataset, speed, order, value => {
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
        this._dcss.sortByHeap(this.dataset, 0, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execInsertionSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dcss.sortByInsertion(this.dataset, 0, this.dataset.length - 1, 0, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.pivotIndex$.next(value.pivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.swapCount$.next(value.swapCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execInsertionBinarySort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dcss.sortByInsertionBinary(this.dataset, 0, this.dataset.length - 1, 0, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.pivotIndex$.next(value.pivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.swapCount$.next(value.swapCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execIntroSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dcss.sortByIntro(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execLibrarySort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._doss.sortByLibrary(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.swapCount$.next(value.swapCount);
            this.auxCount$.next(value.auxCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execMergeBUSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dcss.sortByMergeBU(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.auxCount$.next(value.auxCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execMergeTDSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dcss.sortByMergeTD(this.dataset, 0, this.dataset.length - 1, 0, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.pivotIndex$.next(value.pivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.auxCount$.next(value.auxCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execMerge4WaySort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dcss.sortByMerge4Way(this.dataset, 0, this.dataset.length - 1, 0, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.pivotIndex$.next(value.pivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.auxCount$.next(value.auxCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execMergeInPlaceSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dcss.sortByMergeInPlace(this.dataset, 0, this.dataset.length - 1, 0, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.pivotIndex$.next(value.pivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.swapCount$.next(value.swapCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execOddEvenSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dcss.sortByOddEven(this.dataset, speed, order, value => {
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

    private execPairwiseSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._doss.sortByPairwise(this.dataset, speed, order, value => {
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
        this._ddss.sortByPatience(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.auxCount$.next(value.auxCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execPigeonHoleSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._ddss.sortByPigeonHole(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.auxCount$.next(value.auxCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execQuickSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dcss.sortByQuick(this.dataset, 0, this.dataset.length - 1, 0, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.pivotIndex$.next(value.pivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.swapCount$.next(value.swapCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execQuick2WaySort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dcss.sortByQuick2Way(this.dataset, 0, this.dataset.length - 1, 0, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.pivotIndex$.next(value.pivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.swapCount$.next(value.swapCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execQuick3WaySort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dcss.sortByQuick3Way(this.dataset, 0, this.dataset.length - 1, 0, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.pivotIndex$.next(value.pivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.swapCount$.next(value.swapCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execQuickDPSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dcss.sortByQuickDualPivot(this.dataset, 0, this.dataset.length - 1, 0, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.lhsPivotIndex$.next(value.lhsPivotIndex);
                this.rhsPivotIndex$.next(value.rhsPivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.swapCount$.next(value.swapCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execRadixLSDSort(base: BaseType, speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._ddss.sortByRadixLSD(this.dataset, base, speed, order,
            value => {
                this.dataset$.next(value.dataset);
                this.pivotIndex$.next(value.pivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.auxCount$.next(value.auxCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execRadixMSDSort(base: BaseType, speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._ddss.sortByRadixMSD(this.dataset, base, speed, order, value => {
                this.dataset$.next(value.dataset);
                this.pivotIndex$.next(value.pivotIndex);
                this.currIndex$.next(value.currIndex);
                this.nextIndex$.next(value.nextIndex);
                this.swapCount$.next(value.swapCount);
                this.auxCount$.next(value.auxCount);
            }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execSelectionSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dcss.sortBySelection(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execSelectionDoubleSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dcss.sortBySelectionDouble(this.dataset, speed, order, value => {
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
        this._dcss.sortByShell(this.dataset, speed, order, value => {
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
        this._dcss.sortByStrand(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.auxCount$.next(value.auxCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execTimBUSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dcss.sortByTimBU(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.pivotIndex$.next(value.pivotIndex);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
            this.auxCount$.next(value.auxCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execTimTDSort(speed: SpeedType, order: OrderType, subscription: Subscription): void {
        this._dcss.sortByTimTD(this.dataset, 0, this.dataset.length - 1, 0, 0, 0,
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
        this._dcss.sortByTournament(this.dataset, speed, order, value => {
            this.dataset$.next(value.dataset);
            this.currIndex$.next(value.currIndex);
            this.nextIndex$.next(value.nextIndex);
            this.swapCount$.next(value.swapCount);
        }).then(() => this.execComplete(this.dataset.length, speed, subscription));
    }

    private execComplete(length: number, speed: SpeedType, subscription: Subscription): void {
        this._dsus.complete(length, speed, value => this.currIndex$.next(value.currIndex))
            .then(() => {
                this.phase$.next(-1);
                subscription.unsubscribe();
            });
    }

}
