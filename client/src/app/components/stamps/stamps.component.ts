import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';

import { finalize, takeWhile } from 'rxjs';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { StampListDetails } from '@models/stamp.model';

import { StampService } from '@services/stamp.service';
import { ToastService } from '@services/toast.service';
import { DaterangepickerDirective, NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { FormsModule } from "@angular/forms";
import { NgHeroiconsModule } from "@dimaslz/ng-heroicons";

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
        NgHeroiconsModule,
        MatDatepickerModule,
        NgxDaterangepickerMd,
    ]
})
export class StampsComponent implements OnInit {
    public isLoading = true;
    public displayedColumns = ["attlog_terminal_sn", "attlog_user_id", "attlog_date", "attlog_time", "attlog_access_type", "attlog_reason_code"];
    public dataSource!: MatTableDataSource<StampListDetails>;

    @ViewChild('f_terminalSN') f_terminalSN!: ElementRef<HTMLInputElement>;
    @ViewChild('f_userId') f_userId!: ElementRef<HTMLInputElement>;
    @ViewChild(DaterangepickerDirective, { static: false }) pickerDirective: DaterangepickerDirective;
    public f_date;

    constructor(
        private _stampService: StampService,
        private _toastService: ToastService,
        private _router: Router,
    ) { }

    public ngOnInit(): void {
        this._getData();
    }

    private _getData(sn?: string, userId?: string, startDate?: string, endDate?: string): void {
        this.isLoading = true;
        let take = true;

        this._stampService.getStampList(sn, userId, startDate, endDate).pipe(
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
        const _ = new DatePipe('it-IT');
        return _.transform(date, 'shortDate');
    }

    public onDateKeypressed(event): void {
        event.preventDefault();
        event.stopPropagation();
    }

    public onFilterApplyClicked(): void {
        const _ = new DatePipe('it-IT');

        let startDate = this.f_date?.startDate?.$d;
        let endDate = this.f_date?.endDate?.$d;

        if (startDate && endDate) {
            startDate = _.transform(startDate, "yyyy/MM/dd");
            endDate = _.transform(endDate, "yyyy/MM/dd");
        }

        if (this.f_terminalSN.nativeElement.value || this.f_userId.nativeElement.value || startDate || endDate) {
            this._getData(this.f_terminalSN.nativeElement.value, this.f_userId.nativeElement.value, startDate, endDate);
        }
    }

    public onFilterResetClicked(): void {
        this.f_userId.nativeElement.value = '';
        this.f_terminalSN.nativeElement.value = '';
        this.pickerDirective.clear();

        this._getData();
    }
}

