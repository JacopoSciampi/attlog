import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from "@angular/core";

import { NgHeroiconsModule } from "@dimaslz/ng-heroicons";
import { UrlToName } from '@components/navbar/navbar.component';

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
    ) {
        this.idActive = `${localStorage.getItem('semprebon-last-url').split('/')[1]}`;
    }

    public setMenuItemActive(id: string): void {
        this.idActive = id?.indexOf('/') === -1 ? id : id.split('/')[0];
        this._router.navigate([id]);
    }

}

