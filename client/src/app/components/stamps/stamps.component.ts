import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';

import { finalize, takeWhile, zip } from 'rxjs';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { StampListDetails } from '@models/stamp.model';

import saveAs from 'save-as';

import { StampService } from '@services/stamp.service';
import { ToastService } from '@services/toast.service';
import { DaterangepickerDirective, NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { FormsModule } from "@angular/forms";
import { NgHeroiconsModule } from "@dimaslz/ng-heroicons";
import { MatTooltipModule } from "@angular/material/tooltip";
import { CustomerListDetails } from "@models/customer.model";
import { CustomerService } from "@services/customer.service";
import { MatSelectModule } from "@angular/material/select";
import { ClockModelListDetails } from "@models/clock-model.model";
import { TerminalService } from "@services/terminal.service";

@Component({
    selector: 'app-stamps',
    templateUrl: './stamps.component.html',
    styleUrls: ['./stamps.component.scss'],
    standalone: true,
    imports: [
        RouterModule,
        CommonModule,
        FormsModule,
        MatTableModule,
        MatTooltipModule,
        NgHeroiconsModule,
        MatSelectModule,
        MatDatepickerModule,
        NgxDaterangepickerMd,
    ]
})
export class StampsComponent implements OnInit {
    public isLoading = true;
    public displayedColumns = ["attlog_terminal_sn", "attlog_user_id", "customer_name", "attlog_date", "clock_location", "attlog_time", "attlog_access_type", "attlog_reason_code", "attlog_work_code", "attlog_sent_timestamp", "_actions"];
    public dataSource!: MatTableDataSource<StampListDetails>;
    public f_customer_name!: string;
    public f_terminalSN!: string;
    public f_clock_location!: string;
    public f_c_model!: string;
    public f_date;
    public customerList: CustomerListDetails[] = [];
    public _initCustomerList: CustomerListDetails[] = [];
    public clockModelList!: ClockModelListDetails[];

    @ViewChild('f_userId') f_userId!: ElementRef<HTMLInputElement>;
    @ViewChild(DaterangepickerDirective, { static: false }) pickerDirective: DaterangepickerDirective;

    constructor(
        private _stampService: StampService,
        private _toastService: ToastService,
        private _c: CustomerService,
        private _ar: ActivatedRoute,
        private _t: TerminalService,
        private _router: Router,
    ) { }

    public ngOnInit(): void {
        this.isLoading = true;
        let take = true;

        zip(
            this._c.getCustomerList(this.f_customer_name),
            this._t.getClockModelList()
        )
            .pipe(
                takeWhile(() => take),
                finalize(() => take = false)
            ).subscribe({
                next: (data) => {
                    this.customerList = data[0].data;
                    this._initCustomerList = JSON.parse(JSON.stringify(data[0].data));
                    this.clockModelList = data[1].data;

                    if (this._ar.snapshot.params.clockSn !== "all") {
                        this.f_terminalSN = this._ar.snapshot.params.clockSn;
                        this._getData();
                    }
                }, error: (err) => {
                    this.isLoading = false;
                    this._toastService.errorGeneric(err.error.title, err.error.message)
                }
            });
    }

    private _getData(sn?: string, userId?: string, startDate?: string, endDate?: string, f_customer_name?: string, f_clock_location?: string, c_model?: string): void {
        this.isLoading = true;
        let take = true;

        this._stampService.getStampList(sn, userId, startDate, endDate, f_customer_name, f_clock_location, c_model).pipe(
            takeWhile(() => take),
            finalize(() => take = false)
        ).subscribe({
            next: (data) => {
                this.dataSource = new MatTableDataSource(data.data);
                this.isLoading = false;
            }, error: (err) => {
                this.isLoading = false;
                this._toastService.errorGeneric(err.error.title, err.error.message)
            }
        });
    }

    public formatDate(date: string): string {
        if (!date) {
            return '-';
        }

        const _ = new DatePipe('it-IT');
        return _.transform(date, 'shortDate');
    }

    public onCustomerListFilter(value: any): void {
        this.customerList = this._initCustomerList.filter(i => i.customer_name.indexOf(value.value) !== -1);
    }

    public onDateKeypressed(event): void {
        event.preventDefault();
        event.stopPropagation();
    }

    public MarkAllAttlogToBeSent(): void {
        const _ = new DatePipe('it-IT');

        let startDate = this.f_date?.startDate?.$d;
        let endDate = `${this.f_date?.endDate?.$M + 1}/${this.f_date?.endDate?.$D}/${this.f_date?.endDate?.$y}`

        if (startDate && endDate) {
            startDate = _.transform(startDate, "yyyy/MM/dd");
            endDate = _.transform(new Date(endDate), "yyyy/MM/dd");
        }

        let take = true;
        this._stampService.setAllStampsToBeSentToFtp(this.f_terminalSN, this.f_userId?.nativeElement?.value, startDate, endDate, this.f_customer_name, this.f_clock_location).pipe(
            takeWhile(() => take),
            finalize(() => take = false)
        ).subscribe({
            next: () => {
                this._toastService.generic("Aggiornamento effettuato", "Operazione avvenuta con successo");
                this.onFilterApplyClicked();
            }, error: (err) => {
                this._toastService.errorGeneric(err.error.title, err.error.message)
            }
        });

    }

    public markAttlogAsToBeSent(item: StampListDetails): void {
        let take = true;
        this._stampService.setStampToBeSentToFtp(item.attlog_id).pipe(
            takeWhile(() => take),
            finalize(() => take = false)
        ).subscribe({
            next: () => {
                this._toastService.generic("Aggiornamento effettuato", "Operazione avvenuta con successo");
                this._getData();
            }, error: (err) => {
                this._toastService.errorGeneric(err.error.title, err.error.message)
            }
        })
    }

    public onFilterApplyClicked(): void {
        const _ = new DatePipe('it-IT');

        let startDate = this.f_date?.startDate?.$d;
        let endDate = `${this.f_date?.endDate?.$M + 1}/${this.f_date?.endDate?.$D}/${this.f_date?.endDate?.$y}`

        if (startDate && endDate) {
            startDate = _.transform(startDate, "yyyy/MM/dd");
            endDate = _.transform(new Date(endDate), "yyyy/MM/dd");
        }

        if (this.f_terminalSN || this.f_userId.nativeElement.value || startDate || endDate || this.f_customer_name || this.f_clock_location || this.f_c_model) {
            this._getData(this.f_terminalSN, this.f_userId?.nativeElement?.value, startDate, endDate, this.f_customer_name, this.f_clock_location, this.f_c_model);
        }
    }

    public onDownloadStamps(): void {
        let take = true;
        const _ = new DatePipe('it-IT');

        let startDate = this.f_date?.startDate?.$d;
        let endDate = `${this.f_date?.endDate?.$M + 1}/${this.f_date?.endDate?.$D}/${this.f_date?.endDate?.$y}`

        if (startDate && endDate) {
            startDate = _.transform(startDate, "yyyy/MM/dd");
            endDate = _.transform(new Date(endDate), "yyyy/MM/dd");
        }

        this._stampService.downloadStamps(this.f_terminalSN, this.f_userId.nativeElement.value, startDate, endDate, this.f_customer_name).pipe(
            takeWhile(() => take),
            finalize(() => take = false)
        ).subscribe({
            next: (data: any) => {
                saveAs(new Blob([String(data.body.data)], { type: 'text/plain;charset=utf-8' }), data.body.fileName);
                this.onFilterApplyClicked();
            }, error: (err) => {
                this._toastService.errorGeneric(err.error.title, err.error.message)
            }
        });
    }

    public onFilterResetClicked(): void {
        this.f_userId.nativeElement.value = '';
        this.f_terminalSN = '';
        this.f_customer_name = '';
        this.f_clock_location = '';
        this.f_c_model = '';
        this.pickerDirective.clear();

        this.dataSource = new MatTableDataSource([]);
    }
}

