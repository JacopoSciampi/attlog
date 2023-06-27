import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from "@angular/core";

import { NgHeroiconsModule } from "@dimaslz/ng-heroicons";

@Component({
    selector: 'app-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        NgHeroiconsModule,
    ]
})
export class SidenavComponent {
    public idActive = "homepage";

    constructor(
        private _router: Router,
    ) { }

    public setMenuItemActive(id: string): void {
        this.idActive = id;
        this._router.navigate([id]);
    }

}

