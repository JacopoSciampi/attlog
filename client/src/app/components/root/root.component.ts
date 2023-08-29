import { CommonModule } from '@angular/common';
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';

import { FooterComponent } from '@components/footer/footer.component';
import { NavbarComponent } from '@components/navbar/navbar.component';
import { SidenavComponent } from '@components/sidenav/sidenav.component';

import { AuthService } from '@services/auth.service';
import { ConstClass } from '@static/const.class';
import { filter, map } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './root.component.html',
    styleUrls: ['./root.component.scss'],
    standalone: true,
    imports: [
        RouterModule,
        CommonModule,
        NavbarComponent,
        FooterComponent,
        SidenavComponent,
    ],
    providers: [
        AuthService
    ]
})
export class RootComponent implements OnInit {
    public initDone = false

    constructor(
        private _router: Router,
        private _ar: ActivatedRoute,
        private _auth: AuthService,
    ) { }

    public ngOnInit(): void {
        this._router.events.pipe(
            filter((e) => e instanceof NavigationEnd),
            map((e) => {
                localStorage.setItem('semprebon-last-url', (e as { url: string }).url)
            })
        ).subscribe();

        this._auth.__init__().then(() => {
            ConstClass.token = this._auth.oAuthService.getAccessToken();
            this.initDone = true;
            const lastRoute = localStorage.getItem('semprebon-last-url');

            if (lastRoute?.indexOf('/?state') !== -1 || lastRoute === '/') {
                this._router.navigate(['homepage']);
                return;
            }
            this._router.navigate([lastRoute || 'homepage']);
        });
    }


}

