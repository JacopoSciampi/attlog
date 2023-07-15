-- Table: public.clock_models

-- DROP TABLE IF EXISTS public.clock_models;

CREATE TABLE IF NOT EXISTS public.clock_models
(
    cm_id SERIAL NOT NULL,
    cm_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    cm_desc character varying(150) COLLATE pg_catalog."default",
    CONSTRAINT clock_models_pkey PRIMARY KEY (cm_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.clock_models
    OWNER to keycloak;