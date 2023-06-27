-- Table: public.clocks

-- DROP TABLE IF EXISTS public.clocks;

CREATE TABLE IF NOT EXISTS public.clocks
(
    c_sn character varying(150) COLLATE pg_catalog."default" NOT NULL,
    c_name character varying(150) COLLATE pg_catalog."default" NOT NULL,
    c_model character varying(150) COLLATE pg_catalog."default" NOT NULL,
    c_status character varying(150) COLLATE pg_catalog."default" NOT NULL,
    c_ip_address character varying(500) COLLATE pg_catalog."default" NOT NULL,
    c_port character varying(10) COLLATE pg_catalog."default" NOT NULL,
    "fk_customer_id" bigint NOT NULL,
    CONSTRAINT clocks_pkey PRIMARY KEY (c_sn)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.clocks
    OWNER to keycloak;