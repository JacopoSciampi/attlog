-- Table: public.customers

-- DROP TABLE IF EXISTS public.customers;

CREATE TABLE IF NOT EXISTS public.customers
(
    customer_id SERIAL NOT NULL,
    c_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    c_email character varying(100) COLLATE pg_catalog."default" NOT NULL,
    cu_code character varying(100) COLLATE pg_catalog."default" NOT NULL,
    cu_note character varying(100) COLLATE pg_catalog."default" NOT NULL,
    cu_api_key character varying(150) COLLATE pg_catalog."default",
    CONSTRAINT customers_pkey PRIMARY KEY (customer_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.customers
    OWNER to keycloak;