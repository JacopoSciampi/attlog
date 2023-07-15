export interface SettingsDetailsData {
    data: SettingsDetails;
}

export interface SettingsDetails {
    setting_name?: string;
    setting_id?: string;

    set_mail_smtp: string;
    set_mail_ssl: string | boolean;
    set_mail_port: string;
    set_mail_user: string;
    set_mail_pass: string;
    set_mail_sender: string;
    set_mail_receiver_list: string;
    set_mail_offline_after: string;

    set_ftp_server_ip: string;
    set_ftp_server_port: string;
    set_ftp_server_user: string;
    set_ftp_server_password: string;
    set_ftp_server_folder: string;
    set_ftp_send_every: string;

    set_terminal_file_name: string;
    set_terminal_file_format: string;
}
