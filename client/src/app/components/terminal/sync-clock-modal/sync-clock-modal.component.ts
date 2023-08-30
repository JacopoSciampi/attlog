import { CommonModule } from "@angular/common";
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { NgHeroiconsModule } from "@dimaslz/ng-heroicons";
import { TerminalService } from "@services/terminal.service";
import { ToastService } from "@services/toast.service";
import { takeWhile, finalize } from 'rxjs';

@Component({
    selector: 'app-sync-clock-modal',
    templateUrl: './sync-clock-modal.component.html',
    styleUrls: ['./sync-clock-modal.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        NgHeroiconsModule,
    ],
    providers: [TerminalService]
})
export class SyncClockModal {

    constructor(
        public dialogRef: MatDialogRef<SyncClockModal>,
        private _service: TerminalService,
        private _toastService: ToastService,
        @Inject(MAT_DIALOG_DATA) public data: {
            f_customer_name: string
            f_status: string
        }
    ) { }

    public onConfirm(): void {
        let take = true;
        this._service.syncTerminal(this.data?.f_customer_name, this.data?.f_status).pipe(
            takeWhile(() => take),
            finalize(() => take = false)
        ).subscribe({
            next: () => {
                this._toastService.generic("Sincronizzazione OK", "Operazione avvenuta con successo");
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
