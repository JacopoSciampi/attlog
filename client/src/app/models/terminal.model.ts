export interface TerminalList {
    data: TerminalListDetails[];
}

export interface TerminalListDetails {
    c_id: number;
    c_last_timestamp: string;
    c_model: string;
    c_name: string;
    c_sn: string;
    customer_name: string;

    online?: boolean;
    tooltip?: string;
}



