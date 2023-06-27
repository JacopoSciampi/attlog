import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from "@angular/core";
import { MatTooltipModule } from '@angular/material/tooltip';

import jwt_decode from "jwt-decode";

import { NgHeroiconsModule } from "@dimaslz/ng-heroicons";

import { AuthService } from '@services/auth.service';

import { KcJwtToken } from '@models/auth.model';

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
export class NavbarComponent implements OnInit {
    public username!: string;

    constructor(
        public authService: AuthService,
        private _router: Router,
    ) {
        this.username = jwt_decode<KcJwtToken>(this.authService.oAuthService.getAccessToken()).given_name;
    }

    public ngOnInit(): void {

    }
}

