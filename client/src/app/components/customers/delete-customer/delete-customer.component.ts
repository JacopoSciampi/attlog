import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { NgHeroiconsModule } from "@dimaslz/ng-heroicons";
import { CustomerService } from "@services/customer.service";
import { ToastService } from "@services/toast.service";
import { takeWhile, finalize } from 'rxjs';

@Component({
    selector: 'app-delete-customer',
    templateUrl: './delete-customer.component.html',
    styleUrls: ['./delete-customer.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        NgHeroiconsModule,
    ],
    providers: [CustomerService]
})
export class DeleteCustomer {
    public showConfirm = false;
    public canDelete = true;

    constructor(
        public dialogRef: MatDialogRef<DeleteCustomer>,
        private _service: CustomerService,
        private _toastService: ToastService,
        @Inject(MAT_DIALOG_DATA) public data: {
            customer_id: string;
            cu_code: string;
        }
    ) { }

    public onDeleteCustomer(): void {
        if (!this.showConfirm) {
            this.showConfirm = true;
            this.canDelete = false;

            setTimeout(() => {
                this.canDelete = true;
            }, 2500)
            return;
        }

        let take = true;
        this._service.deleteCustomer(this.data.customer_id, this.data.cu_code).pipe(
            takeWhile(() => take),
            finalize(() => take = false)
        ).subscribe({
            next: () => {
                this._toastService.generic("Cliente eliminato", "Operazione avvenuta con successo");
                this.closeMe(true);
            }, error: (err) => {
                this._toastService.errorGeneric(err.error.title, err.error.message)
            }
        })
    }

    public closeMe(update?: boolean): void {
        this.dialogRef.close(update);
    }
}
