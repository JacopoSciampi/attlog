import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { NgHeroiconsModule } from "@dimaslz/ng-heroicons";
import { TerminalService } from "@services/terminal.service";
import { ToastService } from "@services/toast.service";
import { takeWhile, finalize } from 'rxjs';

@Component({
    selector: 'app-delete-terminal',
    templateUrl: './delete-terminal.component.html',
    styleUrls: ['./delete-terminal.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        NgHeroiconsModule,
    ],
    providers: [TerminalService]
})
export class DeleteTerminal {
    constructor(
        public dialogRef: MatDialogRef<DeleteTerminal>,
        private _service: TerminalService,
        private _toastService: ToastService,
        @Inject(MAT_DIALOG_DATA) public data: {
            c_sn: string;
            c_name: string;
        }
    ) { }

    public onDeleteTerminal(): void {
        let take = true;
        this._service.deleteTerminal(this.data.c_sn).pipe(
            takeWhile(() => take),
            finalize(() => take = false)
        ).subscribe({
            next: () => {
                this._toastService.generic("Terminale cancellato", "Operazione avvenuta con successo");
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
