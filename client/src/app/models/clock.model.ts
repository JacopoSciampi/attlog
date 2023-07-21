export interface AllClockModelList {
    data: AllClockModelListDetails[];
}

export interface AllClockModelListDetails {
    c_id: string;
    c_sn: string;
    c_name: string;
    c_note: string;
    c_desc: string;
    c_model: string;
    c_location: string;
    c_last_timestamp: boolean;
    c_local_ip: string;
    c_mail_sent: string;
    c_custom_id: string;
}
