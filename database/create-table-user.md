-- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
    user_id SERIAL NOT NULL,
    user_sn character varying(150) COLLATE pg_catalog."default" NOT NULL,
    user_pin character varying(150) COLLATE pg_catalog."default",
    user_name character varying(150) COLLATE pg_catalog."default",
    user_pass character varying(150) COLLATE pg_catalog."default",
    user_badge character varying(150) COLLATE pg_catalog."default",
    CONSTRAINT users_pkey PRIMARY KEY (user_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to keycloak;
