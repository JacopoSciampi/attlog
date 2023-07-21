export interface StampList {
    data: StampListDetails[];
    hasNext: boolean;
}

export interface StampListDetails {
    attlog_id: number | string;
    attlog_access_type: string;
    attlog_date: string;
    attlog_reason_code: string;
    attlog_terminal_sn: string;
    attlog_work_code: string;
    attlog_time: string;
    attlog_user_id: string;
    customer_name: string;
    clock_location: string;
    attlog_sent: string | boolean;
    attlog_sent_timestamp: number;
    c_model: string;
}
