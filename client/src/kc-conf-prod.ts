import { AuthConfig } from "angular-oauth2-oidc";

export const KC_CONF: AuthConfig = {
    issuer: "http://192.168.0.161:88/auth/realms/timbrature",
    redirectUri: window.origin,
    clientId: "client-app",
    responseType: "code",
    scope: "openid profile email roles",
    showDebugInformation: false,
    timeoutFactor: 0.75,
    clearHashAfterLogin: true,
    requireHttps: false,
    logoutUrl: "http://192.168.0.161:88/auth/realms/timbrature/protocol/openid-connect/logout"
}
