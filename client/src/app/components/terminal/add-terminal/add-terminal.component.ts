import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

import { MatDialogRef } from "@angular/material/dialog";
import { MatButtonModule } from '@angular/material/button';

import { NgHeroiconsModule } from "@dimaslz/ng-heroicons";

import { TerminalService } from "@services/terminal.service";
import { finalize, takeWhile } from "rxjs";
import { ToastService } from "@services/toast.service";

@Component({
    selector: 'app-add-terminal',
    templateUrl: './add-terminal.component.html',
    styleUrls: ['./add-terminal.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        NgHeroiconsModule,
    ],
    providers: [TerminalService]
})
export class AddTerminalModalComponent {
    constructor(public dialogRef: MatDialogRef<AddTerminalModalComponent>,
        private _service: TerminalService,
        private _toastService: ToastService) { }

    public closeMe(update?: boolean): void {
        this.dialogRef.close(update);
    }

    public onTestIp(address: string): void {
        let take = true;
        this._service.testConnection(address).pipe(
            takeWhile(() => take),
            finalize(() => take = false)
        ).subscribe({
            next: () => {
                this._toastService.generic("Risultato test", "Il terminale è online");
            },
            error: () => {
                this._toastService.errorGeneric("Risultato test", "Il terminale è offline");
            }
        });
    }
}
