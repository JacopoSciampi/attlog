-- Table: public.clocks

-- DROP TABLE IF EXISTS public.attlogs;

CREATE TABLE IF NOT EXISTS public.attlogs
(
    attlog_id SERIAL NOT NULL,
    attlog_terminal_sn character varying(150) COLLATE pg_catalog."default" NOT NULL,
    attlog_user_id character varying(15) COLLATE pg_catalog."default" NOT NULL,
    attlog_date character varying(15) COLLATE pg_catalog."default" NOT NULL,
    attlog_time character varying(15) COLLATE pg_catalog."default" NOT NULL,
    attlog_reason_code character varying(2) COLLATE pg_catalog."default" NOT NULL,
    attlog_access_type character varying(2) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT attlogs_pkey PRIMARY KEY (attlog_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.attlogs
    OWNER to keycloak;