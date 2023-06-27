const ZKLib = require('./zklib');
const JekoPgInit = require('./pg');
const fastify = require('fastify')({ logger: true })
const MAX_TIMEOUT_TIME = 2500;


const pgAdapter = new JekoPgInit()

fastify.register(require('@fastify/cors'), {
    origin: (origin, cb) => {
        const hostname = new URL(origin).hostname
        if (hostname === "localhost") {
            cb(null, true)
            return
        }
        cb(new Error("Not allowed"), false)
    }
}).then(() => {

    let userList = [];

    const accessType = {
        "0": "Password",
        "1": "Impronta digitale",
        "2": "Badge"
    };

    const reasonCode = {
        "0": "Entrata",
        "1": "Uscita",
        "4": "Ingresso straordinario",
        "5": "Uscita straordinaria"
    };

    let zkInstance = new ZKLib('10.0.0.19', 8080, 10000, 4000);
    const test = async () => {
        try {
            // Create socket to machine 
            await zkInstance.createSocket()

            const users = await zkInstance.getUsers()
            userList = users?.data;


        } catch (e) {
            console.log(e)
            if (e.code === 'EADDRINUSE') {
            }
        }

    }

    test()

    fastify.get('/', async (request, reply) => {
        // This goes in error when no records
        const logs = await zkInstance.getAttendances();
        logs?.data?.forEach(log => {
            log['user'] = userList.find(u => u.userId === log.deviceUserId).name;
            log['reasonText'] = reasonCode[log.reasonCode.toString()];
            log['accessType'] = accessType[log.accessTypeId.toString()];
        });

        reply.status(200).send({ data: logs.data });
    })

    fastify.post('/v1/terminal/test-connection', (request, reply) => {
        setTimeout(() => {
            reply.status(500).send({ status: "offline" });
            return;
        }, MAX_TIMEOUT_TIME);
        try {
            const address = request.body.address.split(':');
            const _ = new ZKLib(address[0], address[1], 10000, 4000);
            _.createSocket().then(() => {
                reply.status(200).send({ status: "up" });
                return;
            }).catch((err) => {
                reply.status(500).send({ status: "offline", reason: err });
                return;
            });
        } catch (e) {
            reply.status(500).send({ status: "offline", reason: e });
            return;
        }
    });

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


    fastify.post('/v1/jeko', (request, reply) => {
        debugger;
        reply.status(200).send({ status: "ok" });
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

    const start = async () => {
        try {
            await fastify.listen({ host: "0.0.0.0", port: 8081 })

        } catch (err) {
            fastify.log.error(err)
            process.exit(1)
        }
    }
    start()
}).catch(err => {
    console.log(err)
});