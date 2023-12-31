import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from "@angular/common";

import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { NgHeroiconsModule } from "@dimaslz/ng-heroicons";

import { TerminalService } from "@services/terminal.service";
import { finalize, takeWhile, zip } from "rxjs";
import { ToastService } from "@services/toast.service";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { CustomerService } from '@services/customer.service';
import { CustomerList, CustomerListDetails } from '@models/customer.model';
import { ClockModelListDetails } from '@models/clock-model.model';

@Component({
    selector: 'app-add-terminal',
    templateUrl: './add-terminal.component.html',
    styleUrls: ['./add-terminal.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatSelectModule,
        NgHeroiconsModule,
    ],
    providers: [TerminalService]
})
export class AddTerminalModalComponent implements OnInit {
    public form!: FormGroup;
    public isLoading!: boolean;
    public isInError = false;

    public customerList: CustomerListDetails[] = [];
    private _initCustomerList: CustomerListDetails[] = [];
    public clockModelList: ClockModelListDetails[] = [];
    private _initClockModelList: ClockModelListDetails[] = [];

    public selectedModel!: string;
    public selectedCustomer!: string;
    public canSendRequest = false;

    constructor(
        public dialogRef: MatDialogRef<AddTerminalModalComponent>,
        private _service: TerminalService,
        private _c: CustomerService,
        private _fb: FormBuilder,
        private _toastService: ToastService,
        @Inject(MAT_DIALOG_DATA) public data: {
            c_sn: string;
            c_name: string;
            c_model: string;
            fk_customer_name: string;
            c_note: string;
            c_desc: string;
            c_location: string;
            fk_cm_name: string;
            c_custom_id: string;
        }
    ) { }

    public ngOnInit(): void {
        this.isLoading = true;
        let take = true;
        zip(
            this._c.getCustomerList(),
            this._service.getClockModelList()
        ).pipe(
            takeWhile(() => take),
            finalize(() => take = false)
        ).subscribe({
            next: (data) => {
                this.customerList = data[0].data;
                this._initCustomerList = JSON.parse(JSON.stringify(data[0].data));

                this.clockModelList = data[1].data;
                this._initClockModelList = JSON.parse(JSON.stringify(data[1].data));

                this.form = this._fb.group({
                    'c_custom_id': [{ value: this.data?.c_custom_id || '', disabled: this.data }, Validators.required],
                    'c_sn': [{ value: this.data?.c_sn || '', disabled: this.data }, Validators.required],
                    'c_name': [this.data?.c_name || '', Validators.required],
                    'c_model': [this.data?.c_model || '', Validators.required],
                    'c_note': [this.data?.c_note || '', Validators.required],
                    'c_desc': [this.data?.c_desc || '', Validators.required],
                    'c_location': [this.data?.c_location || '', Validators.required],
                    'c_fk_cst': ['_']
                });

                Object.keys(this.form.controls).forEach(key => {
                    this.form.controls[key].valueChanges.subscribe(() => {
                        this._validateButton();
                    });
                });

                this.selectedCustomer = this.data?.fk_customer_name || "";
                this.selectedModel = this.data?.fk_cm_name || "";
                this.isLoading = false;
            }, error: (err) => {
                this.isInError = true;
                this.isLoading = false;
                this._toastService.errorGeneric(err.error.title, err.error.message)
            }
        });
    }

    public onCustomerSelectionChanged(): void {
        this._validateButton();
    }

    private _validateButton(): void {
        this.canSendRequest = Object.keys(this.form.controls).every(k => this.form.controls[k].value) && !!this.selectedCustomer && !!this.selectedModel;
    }

    public onUpdateTerminal(): void {
        let take = true;
        this._service.updateTerminal(
            this.form.controls['c_sn'].value,
            this.form.controls['c_name'].value,
            this.selectedModel,
            this.selectedCustomer,
            this.form.controls['c_note'].value,
            this.form.controls['c_desc'].value,
            this.form.controls['c_location'].value,
        ).pipe(
            takeWhile(() => take),
            finalize(() => take = false)
        ).subscribe({
            next: (() => {
                this._toastService.generic("Operazione completata", "Terminale aggiornato");
                this.closeMe(true);
            }),
            error: (err) => {
                this._toastService.errorGeneric(err.error.title, err.error.message)
            }
        });
    }

    public onCustomerListFilter(value: any): void {
        this.customerList = this._initCustomerList.filter(i => i.customer_name.indexOf(value.value) !== -1);
    }

    public onModelListFilter(value: any): void {
        this.clockModelList = this._initClockModelList.filter(i => i.cm_name.indexOf(value.value) !== -1);
    }

    public onCreateTerminal(): void {
        let take = true;
        this._service.addTerminal(
            this.form.controls['c_sn'].value,
            this.form.controls['c_name'].value,
            this.selectedModel,
            this.selectedCustomer,
            this.form.controls['c_note'].value,
            this.form.controls['c_desc'].value,
            this.form.controls['c_location'].value,
            this.form.controls['c_custom_id'].value,
        ).pipe(
            takeWhile(() => take),
            finalize(() => take = false)
        ).subscribe({
            next: (() => {
                this.closeMe(true);
            }),
            error: (err) => {
                this._toastService.errorGeneric(err.error.title, err.error.message)
            }
        });
    }

    public closeMe(update?: boolean): void {
        this.dialogRef.close(update);
    }
}
