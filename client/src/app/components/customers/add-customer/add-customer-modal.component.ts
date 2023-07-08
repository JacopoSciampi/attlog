import { Component, Inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";

import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatButtonModule } from '@angular/material/button';

import { finalize, takeWhile } from "rxjs";

import { NgHeroiconsModule } from "@dimaslz/ng-heroicons";

import { ToastService } from "@services/toast.service";
import { TerminalService } from "@services/terminal.service";
import { CustomerService } from "@services/customer.service";

@Component({
    selector: 'app-add-customer-modal',
    templateUrl: './add-customer-modal.component.html',
    styleUrls: ['./add-customer-modal.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        FormsModule,
        ReactiveFormsModule,
        NgHeroiconsModule,
    ],
    providers: [TerminalService]
})
export class AddCustomerModalComponent {
    public form!: FormGroup;
    public canSendRequest = false;

    constructor(
        private _fb: FormBuilder,
        public dialogRef: MatDialogRef<AddCustomerModalComponent>,
        private _service: CustomerService,
        private _toastService: ToastService,
        @Inject(MAT_DIALOG_DATA) public data: {
            customer_id: string;
            customer_name: string;
            customer_email: string;
            customer_code: string;
            customer_note: string;
        }
    ) {
        this.form = this._fb.group({
            "name": [this.data?.customer_name || '', Validators.required],
            "mail": [this.data?.customer_email || '', Validators.email],
            "cu_code": [this.data?.customer_code || '', Validators.required],
            "cu_note": [this.data?.customer_note || '', Validators.required],
        });

        Object.keys(this.form.controls).forEach(key => {
            this.form.controls[key].valueChanges.subscribe(() => { this._onFieldValueChanged(); });
        });
    }

    private _onFieldValueChanged(): void {
        this.canSendRequest = this.form.controls["name"].value && this.form.controls["mail"].value;
    }

    public onSaveCustomer(): void {
        if (this.canSendRequest) {
            if (this.form.controls["mail"].valid) {
                let take = true;
                this._service[!!this.data ? 'updateCustomer' : 'createCustomer'](
                    this.data.customer_id,
                    this.form.controls["name"].value,
                    this.form.controls["mail"].value,
                    this.form.controls["cu_code"].value,
                    this.form.controls["cu_note"].value
                ).pipe(
                    takeWhile(() => take),
                    finalize(() => take = false)
                ).subscribe({
                    next: (res) => {
                        this._toastService.generic(res.title, res.message);
                        this.closeMe(true);
                    }, error: (err) => {
                        this._toastService.errorGeneric(err.error.title, err.error.message)
                    }
                })
            } else {
                this._toastService.infoGeneric("Attenzione", "Formato mail non valido");
            }
        }
    }

    public closeMe(update?: boolean): void {
        this.dialogRef.close(update);
    }
}
