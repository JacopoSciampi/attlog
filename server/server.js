const JekoPgInit = require('./pg');
const fastify = require('fastify')({ logger: true });
const jwt_decode = require('jwt-decode');
const pgAdapter = new JekoPgInit();

const internal_token = "uQOpixuDj/YtSlXjayO-dNBcsd2fKx14OBqMOmHikiUUXi6Zhg2UxufCQDg7ic=y/yn6i2VSV9K2EMxcGYpzrQSgDNgbbBBaWlc4Xlhc2mOhNAPAF?Y929cAUHXEj6GL5jzxhASk4Z6u?s/gdEjGXjP/PpQqDZvelyGnbhrZocCyYRxy!P5WXS!eu053XhUJV5zLl121glT?g54HPVX2kvvkyqENk1tWl3E/Otz-ErK7SItzubR59ElypGOPwm?f";

fastify.register(require('@fastify/cors'), {
    origin: (origin, cb) => {
        if (!origin) {
            cb(null, true)
            return;
        }

        if (new URL(origin).hostname === "localhost") {
            cb(null, true)
            return
        }
        cb(new Error("Not allowed"), false)
    },
}).then(() => {
    fastify.post('/v3/terminal/log/add', (request, reply) => {
        const tkn = request.headers["x-token-ref"];

        if (!tkn || tkn !== internal_token) {
            reply.status(401).message({ msg: "Unauthorized" });
            return;
        }

        try {
            pgAdapter.addLogIfNotExist(request.body.sn, request.body.log).then(data => {
                reply.status(200).send({ msg: "ok" });
                console.log(`Log add for SN: ${request.body.sn}. Data: ${request.body.log}`);
            }).catch(() => {
                console.log(`Error while adding the log. Log details -> SN: ${request.body.sn}. Data: ${request.body.log}`);
                reply.status(500).send({ title: "Errore", message: "Si è verificato un errore" });
                return;
            })
        } catch (e) {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: "Si è verificato un errore" });
            return;
        }
    });

    fastify.post('/v3/terminal/online', (request, reply) => {
        const tkn = request.headers["x-token-ref"];

        if (!tkn || tkn !== internal_token) {
            reply.status(401).message({ msg: "Unauthorized" });
            return;
        }

        const sn = request.body.sn;

        if (sn) {
            pgAdapter.updateClockTimestamp(sn).then(() => {
                reply.status(200).send({ msg: `Clock ${sn} status updated` });
                return;
            }).catch(() => {
                reply.status(500).send({ title: "Errore", message: "Si è verificato un errore" });
                return;
            })
        } else {
            reply.status(500).send({ msg: "no serial number sent" });
        }

    });

    fastify.get('/', (request, reply) => {
        reply.status(301).send({ message: "Unauthorized" });
    })

    fastify.get('/v1/customer/list', (request, reply) => {
        try {
            pgAdapter.getCustomerList().then(data => {
                reply.status(200).send({ data: data || [] });
                return;
            }).catch(() => {
                reply.status(500).send({ title: "Errore", message: "Si è verificato un errore" });
                return;
            })

        } catch (e) {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: "Si è verificato un errore" });
            return;
        }
    });

    fastify.post('/v1/customer/add', (request, reply) => {
        try {
            pgAdapter.getCustomerDetailByName(request.body.name).then(data => {
                if (data) {
                    reply.status(500).send({ title: "Errore", message: "Cliente già esistente" });
                    return;
                }

                pgAdapter.createCustomer(request.body.name, request.body.mail).then(() => {
                    reply.status(200).send({ title: "Successo", message: "Cliente aggiunto" });
                    return;
                }).catch(() => {
                    reply.status(500).send({ title: "Errore", message: "Si è verificato un errore" });
                    return;
                });

            }).catch(() => {
                reply.status(500).send({ title: "Errore", message: "Si è verificato un errore" });
                return;
            })

        } catch (e) {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: "Si è verificato un errore" });
            return;
        }
    });

    fastify.get('/v1/attlog', (request, reply) => {
        const sn = request.headers['x-sn'] || "";
        const userId = request.headers['x-user-id'] || "";
        const startDate = request.headers['x-start-date'] || "";
        const endDate = request.headers['x-end-date'] || "";

        pgAdapter.getLogs(sn, userId, startDate, endDate).then(data => {
            reply.status(200).send({ data: data?.rows || [] });
        }).catch((e) => {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: "Si è verificato un errore" });
            return;
        });
    });

    fastify.get('/v1/clocks', (request, reply) => {
        const customerName = request.headers['x-customer-name'] || "";

        pgAdapter.getClocks(customerName).then(data => {
            reply.status(200).send({ data: data?.rows || [] });
        }).catch((e) => {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: "Si è verificato un errore" });
            return;
        });
    });

    fastify.post('/v1/clocks', (request, reply) => {
        pgAdapter.addClock(request.body.c_sn, request.body.c_name, request.body.c_model, request.body.fk_customer_name).then(data => {
            reply.status(200).send({ data: data?.rows || [] });
        }).catch((e) => {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: e?.message || "Si è verificato un errore" });
            return;
        });
    });

    const start = async () => {
        try {
            await fastify.listen({ host: "0.0.0.0", port: 8081 });
            console.log("Ready")

        } catch (err) {
            fastify.log.error(err)
            process.exit(1)
        }
    }
    start()
}).catch(err => {
    console.log(err)
});