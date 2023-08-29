import { Injectable } from "@angular/core";

import { OAuthService } from "angular-oauth2-oidc";

import { KC_CONF } from "src/kc.conf";

@Injectable()
export class AuthService {
    constructor(
        public oAuthService: OAuthService
    ) {
        oAuthService.configure(KC_CONF);
    }

    public __init__(): Promise<boolean> {
        return new Promise((res, rej) => {
            this._authenticate().then(() => {
                res(true);
            }).catch(() => {
                rej(false);
            })
        });
    }

    public logout(): void {
        this.oAuthService.logOut();
    }

    private _authenticate(): Promise<boolean> {
        return new Promise((res, rej) => {
            if (!this.oAuthService.hasValidIdToken()) {
                this.oAuthService.loadDiscoveryDocument();
                this.oAuthService.loadDiscoveryDocumentAndLogin({ customHashFragment: window.location.search })
                    .then(() => {
                        if (this.oAuthService.hasValidIdToken()) {
                            res(true);
                            return;
                        }

                        rej(false);
                    }).catch(() => {
                        rej(false);
                    });
            } else {
                res(true);
            }
        });
    }
}
