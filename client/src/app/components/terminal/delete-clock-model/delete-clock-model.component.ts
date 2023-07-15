import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { NgHeroiconsModule } from "@dimaslz/ng-heroicons";
import { ClockModelListDetails } from "@models/clock-model.model";
import { TerminalService } from "@services/terminal.service";
import { ToastService } from "@services/toast.service";
import { takeWhile, finalize } from 'rxjs';

@Component({
    selector: 'app-delete-clock-model',
    templateUrl: './delete-clock-model.component.html',
    styleUrls: ['./delete-clock-model.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        NgHeroiconsModule,
    ],
    providers: [TerminalService]
})
export class DeleteClockModelComponent {
    public showConfirm = false;
    public canDelete = true;

    constructor(
        public dialogRef: MatDialogRef<DeleteClockModelComponent>,
        private _service: TerminalService,
        private _toastService: ToastService,
        @Inject(MAT_DIALOG_DATA) public data: ClockModelListDetails
    ) { }

    public onDeleteTerminal(): void {
        if (!this.showConfirm) {
            this.showConfirm = true;
            this.canDelete = false;

            setTimeout(() => {
                this.canDelete = true;
            }, 2500)
            return;
        }

        let take = true;
        this._service.deleteClockModel(this.data.cm_id).pipe(
            takeWhile(() => take),
            finalize(() => take = false)
        ).subscribe({
            next: () => {
                this._toastService.generic("Modello cancellato", "Operazione avvenuta con successo");
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
