const JekoPgInit = require('./pg');
const fastify = require('fastify')({ logger: true })
const pgAdapter = new JekoPgInit();

fastify.register(require('@fastify/cors'), {
    origin: (origin, cb) => {
        cb(null, true)
        return;

        const hostname = new URL(origin).hostname
        if (hostname === "localhost") {
            cb(null, true)
            return
        }
        cb(new Error("Not allowed"), false)
    }
}).then(() => {
    let userList = [];

    fastify.post('/v3/terminal/log/add', (request, reply) => {
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

    fastify.get('/', (request, reply) => {
        reply.status(200).send({ a: "lol" });
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