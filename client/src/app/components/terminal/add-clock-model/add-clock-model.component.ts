import { Component, Inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";

import { NgHeroiconsModule } from '@dimaslz/ng-heroicons';

import { TerminalService } from "@services/terminal.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ClockModelListDetails } from "@models/clock-model.model";
import { takeWhile, finalize } from 'rxjs';
import { ToastService } from "@services/toast.service";

@Component({
    selector: 'app-add-clock-model',
    templateUrl: './add-clock-model.component.html',
    styleUrls: ['./add-clock-model.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgHeroiconsModule,
    ],
    providers: [TerminalService]
})
export class AddClockModelComponent implements OnInit {
    public form!: FormGroup;
    public canSendRequest!: boolean;

    constructor(
        private _: TerminalService,
        private _fb: FormBuilder,
        private _toastService: ToastService,
        public dialogRef: MatDialogRef<AddClockModelComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ClockModelListDetails
    ) { }

    public ngOnInit(): void {
        this.form = this._fb.group({
            'cm_name': [{ value: this.data?.cm_name || '', disabled: this.data?.cm_name }, Validators.required],
            'cm_desc': [this.data?.cm_desc || ''],
        });

        Object.keys(this.form.controls).forEach(key => {
            this.form.controls[key].valueChanges.subscribe(() => {
                this._validateButton();
            });
        });
    }

    private _validateButton(): void {
        this.canSendRequest = this.form.valid;
    }

    public onAddClockModel(): void {
        let take = true;

        this._.addClockModel(this.form.controls['cm_name'].value, this.form.controls['cm_desc'].value).pipe(
            takeWhile(() => take),
            finalize(() => take = false)
        ).subscribe({
            next: () => {
                this.closeMe(true);
            }, error: (err) => {
                this._toastService.errorGeneric(err.error.title, err.error.message)
            }
        })
    }

    public onUpdateClockModel(): void {
        let take = true;

        this._.updateClockModel(this.form.controls['cm_name'].value, this.form.controls['cm_desc'].value, this.data.cm_id).pipe(
            takeWhile(() => take),
            finalize(() => take = false)
        ).subscribe({
            next: () => {
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
