-- Table: public.clocks

-- DROP TABLE IF EXISTS public.clocks;

CREATE TABLE IF NOT EXISTS public.clocks
(
    c_id SERIAL NOT NULL,
    c_sn character varying(150) COLLATE pg_catalog."default" NOT NULL,
    c_name character varying(150) COLLATE pg_catalog."default" NOT NULL,
    c_note character varying(150) COLLATE pg_catalog."default" NOT NULL,
    c_desc character varying(150) COLLATE pg_catalog."default" NOT NULL,
    c_model character varying(150) COLLATE pg_catalog."default" NOT NULL,
    c_location character varying(150) COLLATE pg_catalog."default" NOT NULL,
    c_last_timestamp character varying(150) COLLATE pg_catalog."default" NOT NULL,
    c_local_ip character varying(150) COLLATE pg_catalog."default" NOT NULL,
    c_mail_sent character varying(10) COLLATE pg_catalog."default",
    c_custom_id character varying(50) COLLATE pg_catalog."default",
    "fk_customer_id" bigint NOT NULL,
    CONSTRAINT clocks_pkey PRIMARY KEY (c_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.clocks
    OWNER to keycloak;


    