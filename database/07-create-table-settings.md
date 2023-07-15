-- Table: public.settings

-- DROP TABLE IF EXISTS public.settings;

CREATE TABLE IF NOT EXISTS public.settings
(
    setting_id SERIAL NOT NULL,
    setting_name character varying(150) COLLATE pg_catalog."default" NOT NULL,

    set_mail_smtp character varying(150) COLLATE pg_catalog."default" ,
    set_mail_ssl character varying(150) COLLATE pg_catalog."default" ,
    set_mail_port character varying(150) COLLATE pg_catalog."default" ,
    set_mail_user character varying(150) COLLATE pg_catalog."default" ,
    set_mail_pass character varying(150) COLLATE pg_catalog."default" ,
    set_mail_sender character varying(150) COLLATE pg_catalog."default" ,
    set_mail_receiver_list character varying(999) COLLATE pg_catalog."default" ,
    set_mail_offline_after character varying(10) COLLATE pg_catalog."default" ,
    
    set_ftp_server_ip character varying(50) COLLATE pg_catalog."default" ,
    set_ftp_server_port character varying(50) COLLATE pg_catalog."default" ,
    set_ftp_server_user character varying(50) COLLATE pg_catalog."default" ,
    set_ftp_server_password character varying(50) COLLATE pg_catalog."default" ,
    set_ftp_server_folder character varying(50) COLLATE pg_catalog."default" ,
    set_ftp_send_every character varying(50) COLLATE pg_catalog."default" ,
    
    set_terminal_file_name character varying(50) COLLATE pg_catalog."default" ,
    set_terminal_file_format character varying(50) COLLATE pg_catalog."default" ,
    
    CONSTRAINT settings_pkey PRIMARY KEY (setting_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.settings
    OWNER to keycloak;