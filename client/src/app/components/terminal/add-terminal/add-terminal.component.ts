import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from "@angular/common";

import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatButtonModule } from '@angular/material/button';

import { NgHeroiconsModule } from "@dimaslz/ng-heroicons";

import { TerminalService } from "@services/terminal.service";
import { finalize, takeWhile } from "rxjs";
import { ToastService } from "@services/toast.service";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";

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
        NgHeroiconsModule,
    ],
    providers: [TerminalService]
})
export class AddTerminalModalComponent implements OnInit {
    public form!: FormGroup;

    constructor(
        public dialogRef: MatDialogRef<AddTerminalModalComponent>,
        private _service: TerminalService,
        private _fb: FormBuilder,
        private _toastService: ToastService,
        @Inject(MAT_DIALOG_DATA) public data: {
            c_sn: string;
            c_name: string;
            c_model: string;
            fk_customer_name: string;
        }
    ) { }

    public ngOnInit(): void {
        this.form = this._fb.group({
            'c_sn': [this.data?.c_sn || '', Validators.required],
            'c_name': [this.data?.c_name || '', Validators.required],
            'c_model': [this.data?.c_model || '', Validators.required],
            'fk_customer_name': [this.data?.fk_customer_name || '', Validators.required],
        });
    }

    public onCreateTerminal(): void {
        let take = true;
        this._service.addTerminal(
            this.form.controls['c_sn'].value,
            this.form.controls['c_name'].value,
            this.form.controls['c_model'].value,
            this.form.controls['fk_customer_name'].value,
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
