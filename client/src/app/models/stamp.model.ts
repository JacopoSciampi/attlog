export interface StampList {
    data: StampListDetails[];
}

export interface StampListDetails {
    attlog_id: number;
    attlog_access_type: string;
    attlog_date: string;
    attlog_reason_code: string;
    attlog_terminal_sn: string;
    attlog_time: string;
    attlog_user_id: string;
    customer_name: string;
}
