import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";

import { MatDialogRef } from "@angular/material/dialog";
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
        private _toastService: ToastService
    ) {
        this.form = this._fb.group({
            "name": ['', Validators.required],
            "mail": ['', Validators.email],
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
                this._service.createCustomer(this.form.controls["name"].value, this.form.controls["mail"].value).pipe(
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
