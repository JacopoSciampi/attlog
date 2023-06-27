import { CommonModule } from '@angular/common';
import { Component, OnInit } from "@angular/core";
import { Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { NgHeroiconsModule } from "@dimaslz/ng-heroicons";
import { AddTerminalModalComponent } from './add-terminal/add-terminal.component';
import { MODAL_SIZE } from '../../enum/modal.enum';

@Component({
    selector: 'app-terminal',
    templateUrl: './terminal.component.html',
    styleUrls: ['./terminal.component.scss'],
    standalone: true,
    imports: [
        RouterModule,
        CommonModule,
        MatTableModule,
        MatDialogModule,
        NgHeroiconsModule,
    ]
})
export class TerminalComponent implements OnInit {
    public displayedColumns = ["_actions", "terminalSN", "terminalIP", "customer", "status"];
    public dataSource;

    constructor(
        private _router: Router,
        private _dialog: MatDialog
    ) { }

    public ngOnInit(): void {

    }

    public onAddTerminal(): void {
        this._dialog.open(AddTerminalModalComponent, {
            height: MODAL_SIZE.LARGE,
            width: MODAL_SIZE.HALF,
        }).afterClosed().subscribe({
            next: () => {

            }
        });
    }
}

