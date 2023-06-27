import { Injectable } from "@angular/core";

import { MatDialogRef, MatDialog } from '@angular/material/dialog';

import { MODAL_SIZE } from "@enum/modal.enum";

@Injectable()
export class ModalService {
    private _modal!: MatDialogRef<any>;

    constructor(private _dialog: MatDialog) { }

    public openDialog<T, Y, Z>(componentRef: T, width: MODAL_SIZE, height: MODAL_SIZE, data?: Y): Promise<Z | any> {
        return new Promise((res, rej) => {
            this._modal = this._dialog.open(componentRef as any, {
                panelClass: 'modal-custom-background',
                disableClose: false,
                width: width,
                height: height,
                data: data || null
            });

            this._modal.afterClosed().subscribe({
                next: (result) => { res(result) },
                error: (error) => { rej(error) }
            });
        });

    }
}
