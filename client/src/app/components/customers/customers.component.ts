import { CommonModule } from '@angular/common';
import { Component, OnInit } from "@angular/core";
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { NgHeroiconsModule } from '@dimaslz/ng-heroicons';
import { AddCustomerModalComponent } from './add-customer/add-customer-modal.component';
import { MODAL_SIZE } from '@enum/modal.enum';
import { CustomerService } from '@services/customer.service';
import { ToastService } from '@services/toast.service';
import { CustomerListDetails } from '@models/customer.model';

@Component({
    selector: 'app-customers',
    templateUrl: './customers.component.html',
    styleUrls: ['./customers.component.scss'],
    standalone: true,
    imports: [
        RouterModule,
        CommonModule,
        MatTableModule,
        MatDialogModule,
        NgHeroiconsModule,
    ]
})
export class CustomersComponent implements OnInit {
    public isLoading = true;
    public displayedColumns = ["_actions", "name", "email", "total_clocks"];
    public dataSource!: MatTableDataSource<CustomerListDetails>;

    constructor(
        private _router: Router,
        private _toastService: ToastService,
        private _service: CustomerService,
        private _dialog: MatDialog
    ) { }

    public ngOnInit(): void {
        this._upsertTableData();
    }

    private _upsertTableData(): void {
        this._service.getCustomerList().subscribe({
            next: (data) => {
                this.dataSource = new MatTableDataSource(data.data);
                this.isLoading = false;
            }, error: (err) => {
                this.isLoading = false;
                this._toastService.errorGeneric(err.error.title, err.error.message)
            }
        });
    }

    public onAddTerminal(): void {
        this._dialog.open(AddCustomerModalComponent, {
            height: MODAL_SIZE.SMALL,
            width: MODAL_SIZE.HALF,
        }).afterClosed().subscribe({
            next: () => {
                this._upsertTableData();
            }
        });
    }
}

