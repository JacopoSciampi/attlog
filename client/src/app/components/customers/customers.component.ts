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
import { DeleteCustomer } from './delete-customer/delete-customer.component';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-customers',
    templateUrl: './customers.component.html',
    styleUrls: ['./customers.component.scss'],
    standalone: true,
    imports: [
        RouterModule,
        CommonModule,
        FormsModule,
        MatTableModule,
        MatTooltipModule,
        MatDialogModule,
        NgHeroiconsModule,
    ]
})
export class CustomersComponent implements OnInit {
    public isLoading = true;
    public displayedColumns = ["_actions", "name", "email", "cu_code", "cu_note", "total_clocks"];
    public dataSource!: MatTableDataSource<CustomerListDetails>;
    public f_name!: string;
    public f_email!: string;

    constructor(
        private _router: Router,
        private _toastService: ToastService,
        private _service: CustomerService,
        private _dialog: MatDialog
    ) { }

    public ngOnInit(): void {
        this._upsertTableData();
    }

    public onNavigate(route: string): void {
        this._router.navigate([route]);
    }

    private _upsertTableData(): void {
        this._service.getCustomerList(this.f_name, this.f_email).subscribe({
            next: (data) => {
                this.dataSource = new MatTableDataSource(data.data);
                this.isLoading = false;
            }, error: (err) => {
                this.isLoading = false;
                this._toastService.errorGeneric(err.error.title, err.error.message)
            }
        });
    }

    public onEditCustomer(item: CustomerListDetails): void {
        this._dialog.open(AddCustomerModalComponent, {
            height: MODAL_SIZE.SMALL,
            width: MODAL_SIZE.HALF,
            data: {
                customer_id: item.customer_id,
                customer_name: item.customer_name,
                customer_email: item.customer_email,
                customer_code: item.cu_code,
                customer_note: item.cu_note
            }
        }).afterClosed().subscribe({
            next: () => {
                this._upsertTableData();
            }
        });
    }

    public onAddCustomer(): void {
        this._dialog.open(AddCustomerModalComponent, {
            height: MODAL_SIZE.SMALL,
            width: MODAL_SIZE.HALF,
        }).afterClosed().subscribe({
            next: () => {
                this._upsertTableData();
            }
        });
    }

    public onDeleteCustomer(item: CustomerListDetails): void {
        this._dialog.open(DeleteCustomer, {
            height: MODAL_SIZE.HALFER,
            width: MODAL_SIZE.HALF,
            data: {
                customer_id: item.customer_id,
                customer_name: item.customer_name,
                cu_code: item.cu_code
            }
        }).afterClosed().subscribe({
            next: (update) => {
                update && this._upsertTableData();
            }
        });
    }

    public onFilterApplyClicked(): void {
        this._upsertTableData();
    }

    public onFilterResetClicked(): void {
        this.f_email = '';
        this.f_name = '';

        this._upsertTableData();
    }
}

