export interface GenericKeyValueString {
    [key: string]: GenericKeyValueString | string;
}

export interface GenericList<T> {
    id?: string | number;
    key: string;
    value: T,
    disabled: boolean;
}

export interface GenericHttpResponse {
    title: string;
    message: string;
}
