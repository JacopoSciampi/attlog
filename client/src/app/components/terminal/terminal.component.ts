import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';

import { NgHeroiconsModule } from "@dimaslz/ng-heroicons";
import { AddTerminalModalComponent } from './add-terminal/add-terminal.component';
import { MODAL_SIZE } from '../../enum/modal.enum';
import { TerminalService } from '@services/terminal.service';
import { TerminalListDetails } from '@models/terminal.model';
import { finalize, takeWhile } from 'rxjs';
import { ToastService } from '@services/toast.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DeleteTerminal } from './delete-terminal/delete-terminal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomerListDetails } from '@models/customer.model';
import { CustomerService } from '@services/customer.service';

@Component({
    selector: 'app-terminal',
    templateUrl: './terminal.component.html',
    styleUrls: ['./terminal.component.scss'],
    standalone: true,
    imports: [
        RouterModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatTableModule,
        MatSelectModule,
        MatDialogModule,
        MatTooltipModule,
        NgHeroiconsModule,
    ]
})
export class TerminalComponent implements OnInit, OnDestroy {
    public isInError = false;
    public isLoading = true;
    public displayedColumns = ["_actions", "c_sn", "c_name", "c_model", "c_note", "c_desc", "c_location", "customer_name", "c_local_ip", "status"];
    public dataSource!: MatTableDataSource<TerminalListDetails>;
    public f_customer_name!: string;
    public f_status = "Tutti";
    public statusList = ["Online", "Offline", "Tutti"];
    public customerList: CustomerListDetails[] = [];
    public _initCustomerList: CustomerListDetails[] = [];

    private _int;

    constructor(
        private _router: Router,
        private _toastService: ToastService,
        private _c: CustomerService,
        private _ar: ActivatedRoute,
        private _terminalService: TerminalService,
        private _dialog: MatDialog
    ) { }

    public ngOnInit(): void {
        if (this._ar.snapshot.params.name !== "all") {
            this.f_customer_name = this._ar.snapshot.params.name;
        }
        this.isLoading = true;
        let take = true;
        this._c.getCustomerList(this.f_customer_name).pipe(
            takeWhile(() => take),
            finalize(() => take = false)
        ).subscribe({
            next: (data) => {
                this.customerList = data.data;
                this._initCustomerList = JSON.parse(JSON.stringify(data.data));

                this._getData();

                this._int = setInterval(() => {
                    this._getData();
                }, 60000);
            }, error: (err) => {
                this.isInError = true;
                this.isLoading = false;
                this._toastService.errorGeneric(err.error.title, err.error.message)
            }
        });
    }

    public ngOnDestroy(): void {
        clearInterval(this._int);
    }

    public onNavigate(route: string): void {
        this._router.navigate([route]);
    }

    public onCustomerListFilter(value: any): void {
        this.customerList = this._initCustomerList.filter(i => i.customer_name.indexOf(value.value) !== -1);
    }

    public onFilterApplyClicked(): void {
        this._getData();
    }

    public onFilterResetClicked(): void {
        this.f_status = "Tutti";
        this.f_customer_name = "";

        this._getData();
    }

    private _getData(): void {
        this.isLoading = true;
        let take = true;
        const _ = new DatePipe('it-IT');

        this._terminalService.getTerminalList(this.f_customer_name, this.f_status).pipe(
            takeWhile(() => take),
            finalize(() => take = false)
        )
            .subscribe({
                next: (data) => {
                    data?.data?.forEach(item => {
                        item.tooltip = item.c_last_timestamp === "-1" ? 'Connessione mai stabilita' : `Ultimo check: ${_.transform(new Date(+item.c_last_timestamp), "short")}`
                    });

                    this.dataSource = new MatTableDataSource(data.data);
                    this.isLoading = false;
                }, error: (err) => {
                    this.isLoading = false;
                    this._toastService.errorGeneric(err.error.title, err.error.message)
                }
            });
    }

    public onDeleteTerminal(clock: TerminalListDetails): void {
        this._dialog.open(DeleteTerminal, {
            height: MODAL_SIZE.HALFER,
            width: MODAL_SIZE.HALF,
            data: {
                c_sn: clock.c_sn,
                c_name: clock.customer_name
            }
        }).afterClosed().subscribe({
            next: (update) => {
                update && this._getData();
            }
        });
    }

    public onEditClock(clock: TerminalListDetails): void {
        this._dialog.open(AddTerminalModalComponent, {
            height: MODAL_SIZE.HALFER,
            width: MODAL_SIZE.HALF,
            data: {
                c_sn: clock.c_sn,
                c_name: clock.c_name,
                c_model: clock.c_model,
                c_note: clock.c_note,
                c_desc: clock.c_desc,
                c_location: clock.c_location,
                fk_customer_name: clock.customer_name,
                fk_cm_name: clock.c_model
            }
        }).afterClosed().subscribe({
            next: (update) => {
                update && this._getData();
            }
        });
    }

    public onAddTerminal(): void {
        this._dialog.open(AddTerminalModalComponent, {
            height: MODAL_SIZE.HALFER,
            width: MODAL_SIZE.HALF,
        }).afterClosed().subscribe({
            next: (update) => {
                update && this._getData();
            }
        });
    }
}

