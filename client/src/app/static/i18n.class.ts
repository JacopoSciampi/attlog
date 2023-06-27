import { EN_US } from "@assets/i18n/en-us";
import { IT_IT } from "@assets/i18n/it-it";

import { I18NEnum } from "@enum/i18n.enum";

import { GenericKeyValueString } from "@models/generics/generic.model";

export class I18NClass {
    private static _translationList: GenericKeyValueString;

    public static init(locale: string): void {
        switch (locale) {
            case I18NEnum["en-US"]: {
                this._translationList = EN_US;
                break;
            }
            case I18NEnum["it-IT"]: {
                this._translationList = IT_IT;
                break;
            }
            default: {
                this._translationList = IT_IT;
            }
        }
    }

    public static translate(key: string, scope = this._translationList): string {
        const parts = key.split('.');
        const [currentKey, ...rest] = parts;

        if (!currentKey || !rest.length) {
            return scope[key] as string;
        }

        return this.translate(parts.shift() && parts.join('.'), scope[currentKey] as GenericKeyValueString);
    }

    public static getAvailableLocaleKeyList(): string[] {
        return Object.keys(this._translationList['generic']['locale']);
    }
}
