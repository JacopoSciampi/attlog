import { Injectable } from "@angular/core";

import { ToastrService } from "ngx-toastr";

import { I18NClass } from "@static/i18n.class";

@Injectable()
export class ToastService {
    constructor(private _: ToastrService) { }

    private _parsePlaceholderList(text: string, placeholderList: string[] | null): string {
        if (!placeholderList) {
            return I18NClass.translate(text);
        }

        let _ = I18NClass.translate(text);

        placeholderList.forEach((key, idx) => {
            _ = _.replace(`$${idx}`, key);
        });

        return _;
    }

    public success(title: string, text: string, placeholderList?: string[]): void {
        this._.success(this._parsePlaceholderList(text, placeholderList), I18NClass.translate(title));
    }

    public info(title: string, text: string, placeholderList?: string[]): void {
        this._.info(this._parsePlaceholderList(text, placeholderList), I18NClass.translate(title));
    }

    public error(title: string, text: string, placeholderList?: string[]): void {
        this._.error(this._parsePlaceholderList(text, placeholderList), I18NClass.translate(title));
    }

    public errorGeneric(title: string, text: string): void {
        this._.error(text || "Errore generico", title || "Errore");
    }

    public infoGeneric(title: string, text: string): void {
        this._.info(text, title);
    }

    public generic(title: string, text: string): void {
        this._.success(text, title);
    }
}
