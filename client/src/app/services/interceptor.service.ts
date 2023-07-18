import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConstClass } from "@static/const.class";
import { Observable } from "rxjs";

@Injectable()
export class Interceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!ConstClass.token) {
            return next.handle(req);
        }

        const authReq = req.clone({
            headers: req.headers.append('x-prisma-token', ConstClass.token)
        });

        return next.handle(authReq);
    }
}
