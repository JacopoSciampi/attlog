import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from "@angular/core";
import { MatTooltipModule } from '@angular/material/tooltip';

import jwt_decode from "jwt-decode";

import { NgHeroiconsModule } from "@dimaslz/ng-heroicons";

import { AuthService } from '@services/auth.service';

import { KcJwtToken } from '@models/auth.model';
import { GenericKeyValueString } from '@models/generics/generic.model';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        NgHeroiconsModule,
        MatTooltipModule
    ]
})
export class NavbarComponent {
    public username!: string;
    public currentPage = "Homepage";

    private _routeList: GenericKeyValueString = {
        'homepage': 'Homepage',
        'customers': 'Clienti',
        'terminal': 'Terminali',
        'stamps': 'Timbrature',
        'settings': 'Impostazioni'
    }

    constructor(
        public authService: AuthService,
        private _ar: ActivatedRoute,
        private _router: Router,
    ) {
        this.username = jwt_decode<KcJwtToken>(this.authService.oAuthService.getAccessToken()).given_name;

        this._router.events.subscribe(data => {
            if (data instanceof (NavigationEnd)) {
                this.currentPage = data.url.match(/\/([^/]+)/) ? this._routeList[data.url.match(/\/([^/]+)/)[1]] as string : this.currentPage;
            }
        });

        this.currentPage = UrlToName[`${localStorage.getItem('semprebon-last-url').split('/')[1]}`];
    }

    public gotoCredits(): void {
        window.open('https://stackoverflow.com/users/9890873/jacopo-sciampi', '_blank');
    }
}

export enum UrlToName {
    "terminal" = "Terminali",
    "homepage" = "Homepage",
    "customers" = "Clienti",
    "stamps" = "Timbrature",
    "settings" = "Impostazioni"
}
