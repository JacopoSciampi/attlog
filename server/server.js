const JekoPgInit = require('./pg');
const JekoEmailer = require('./email');
const fastify = require('fastify')({ logger: true });
const jwt_decode = require('jwt-decode');
const pgAdapter = new JekoPgInit();
const jekoEmailer = new JekoEmailer();

var osu = require('node-os-utils');
const __cpu = osu.cpu;
const __mem = osu.mem;

const uptime = new Date().getTime();
let queryFromClocks = 0;
let queryToDatabase = 0;

// jekoEmailer.__init__();
// jekoEmailer.sendMailTerminalOffline().then(data => {
//     console.log(data)
// }).catch(e => {
//     console.log(e);
// });

const internal_token = "uQOpixuDj/YtSlXjayO-dNBcsd2fKx14OBqMOmHikiUUXi6Zhg2UxufCQDg7ic=y/yn6i2VSV9K2EMxcGYpzrQSgDNgbbBBaWlc4Xlhc2mOhNAPAF?Y929cAUHXEj6GL5jzxhASk4Z6u?s/gdEjGXjP/PpQqDZvelyGnbhrZocCyYRxy!P5WXS!eu053XhUJV5zLl121glT?g54HPVX2kvvkyqENk1tWl3E/Otz-ErK7SItzubR59ElypGOPwm?f";

function validatePrismaToken(token, reply) {
    try {
        queryToDatabase++;
        return jwt_decode(token);
    } catch {
        reply.status(500).send({ message: 'Invalid token sent from the client' });
        return false;
    }
}

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
        queryFromClocks++;

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
        queryFromClocks++;

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

    fastify.post('/v3/terminal/ip', (request, reply) => {
        const tkn = request.headers["x-token-ref"];
        queryFromClocks++;

        if (!tkn || tkn !== internal_token) {
            reply.status(401).message({ msg: "Unauthorized" });
            return;
        }

        const ip = request.body.ip;
        const sn = request.body.sn;

        if (sn && ip) {
            pgAdapter.updateClockLocalIp(sn, ip).then(() => {
                reply.status(200).send({ msg: `Clock ${sn} status updated` });
                return;
            }).catch(() => {
                reply.status(500).send({ title: "Errore", message: "Si è verificato un errore" });
                return;
            })
        } else {
            reply.status(500).send({ msg: "no serial number or IP sent" });
        }
    });

    fastify.get('/', (request, reply) => {
        reply.status(301).send({ message: "Unauthorized" });
    })

    fastify.get('/v1/metrics', (request, reply) => {
        if (!validatePrismaToken(request.headers['x-prisma-token'], reply)) {
            return;
        }

        try {
            Promise.all([
                __mem.info(),
                __cpu.usage(),
                pgAdapter.getMetrics()
            ])
                .then(info => {
                    reply.status(200).send({
                        data: {
                            cpu: {
                                usage: info[1]
                            },
                            memory: {
                                used: info[0].usedMemPercentage,
                                free: info[0].freeMemPercentage
                            },
                            db: {
                                totalCustomers: info[2].total_customers,
                                totalClocks: info[2].total_clocks,
                                totalAttlogs: info[2].total_attlogs
                            },
                            uptime: uptime,
                            queryFromClocks: queryFromClocks,
                            queryToDatabase: queryToDatabase
                        }
                    });
                    return;
                })
        } catch {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: "Si è verificato un errore" });
            return;
        }
    });

    fastify.get('/v1/customer/list', (request, reply) => {
        if (!validatePrismaToken(request.headers['x-prisma-token'], reply)) {
            return;
        }

        const name = request.headers['x-name'] || "";
        const email = request.headers['x-email'] || "";

        try {
            pgAdapter.getCustomerList(name, email).then(data => {
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
        if (!validatePrismaToken(request.headers['x-prisma-token'], reply)) {
            return;
        }

        pgAdapter.updateCustomerInfo(request.body.customer_id, request.body.cu_code, request.body.cu_note, request.body.name, request.body.mail).then(data => {
            reply.status(200).send({ data: data?.rows || [] });
        }).catch((e) => {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: e?.message || "Si è verificato un errore" });
            return;
        });

    });

    fastify.put('/v1/customer/add', (request, reply) => {
        if (!validatePrismaToken(request.headers['x-prisma-token'], reply)) {
            return;
        }

        try {
            pgAdapter.getCustomerDetailByName(request.body.name).then(data => {
                if (data) {
                    reply.status(500).send({ title: "Errore", message: "Cliente già esistente" });
                    return;
                }

                pgAdapter.createCustomer(request.body.name, request.body.mail, request.body.cu_code, request.body.cu_note).then(() => {
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

    fastify.delete('/v1/customer', (request, reply) => {
        if (!validatePrismaToken(request.headers['x-prisma-token'], reply)) {
            return;
        }

        const customer_id = request.headers['customer_id'] || "";
        const cu_code = request.headers['cu_code'] || "";

        pgAdapter.deleteCustomer(customer_id, cu_code).then(data => {
            reply.status(200).send({ data: data?.rows || [] });
        }).catch((e) => {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: e?.message || "Si è verificato un errore" });
            return;
        });
    });

    fastify.post('/v1/attlog/download', (request, reply) => {
        if (!validatePrismaToken(request.headers['x-prisma-token'], reply)) {
            return;
        }

        const sn = request.body.sn || "";
        const userId = request.body.userId || "";
        const startDate = request.body.startDate || "";
        const endDate = request.body.endDate || "";
        const customerName = request.body.customerName || "";

        pgAdapter.downloadLogs(sn, userId, startDate, endDate, customerName).then(data => {
            reply.status(200).send({ data: data || '' });
        }).catch((e) => {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: "Si è verificato un errore" });
            return;
        });
    });

    fastify.get('/v1/attlog', (request, reply) => {
        if (!validatePrismaToken(request.headers['x-prisma-token'], reply)) {
            return;
        }

        const sn = request.headers['x-sn'] || "";
        const userId = request.headers['x-user-id'] || "";
        const startDate = request.headers['x-start-date'] || "";
        const endDate = request.headers['x-end-date'] || "";
        const customerName = request.headers['x-customer-name'] || "";
        const clockLocation = request.headers['x-clock-location'] || "";

        pgAdapter.getLogs(sn, userId, startDate, endDate, customerName, clockLocation).then(data => {
            reply.status(200).send({ data: data?.rows || [] });
        }).catch((e) => {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: "Si è verificato un errore" });
            return;
        });
    });

    fastify.get('/v1/clocks', (request, reply) => {
        if (!validatePrismaToken(request.headers['x-prisma-token'], reply)) {
            return;
        }

        const customerName = request.headers['x-customer-name'] || "";
        const status = request.headers['x-status'] || "";

        pgAdapter.getClocks(customerName, status).then(data => {
            reply.status(200).send({ data: data?.rows || [] });
        }).catch((e) => {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: "Si è verificato un errore" });
            return;
        });
    });

    fastify.put('/v1/clocks', (request, reply) => {
        if (!validatePrismaToken(request.headers['x-prisma-token'], reply)) {
            return;
        }

        pgAdapter.addClock(request.body.c_sn, request.body.c_name, request.body.c_model, request.body.fk_customer_name, request.body.c_note, request.body.c_desc, request.body.c_location).then(data => {
            reply.status(200).send({ data: data?.rows || [] });
        }).catch((e) => {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: e?.message || "Si è verificato un errore" });
            return;
        });
    });

    fastify.post('/v1/clocks', (request, reply) => {
        if (!validatePrismaToken(request.headers['x-prisma-token'], reply)) {
            return;
        }

        pgAdapter.updateClockInfo(request.body.c_sn, request.body.c_name, request.body.c_model, request.body.fk_customer_name, request.body.c_note, request.body.c_desc, request.body.c_location).then(data => {
            reply.status(200).send({ data: data?.rows || [] });
        }).catch((e) => {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: e?.message || "Si è verificato un errore" });
            return;
        });
    });

    fastify.delete('/v1/clocks', (request, reply) => {
        if (!validatePrismaToken(request.headers['x-prisma-token'], reply)) {
            return;
        }

        const clock_sn = request.headers['c_sn'] || "";

        pgAdapter.deleteClock(clock_sn).then(data => {
            reply.status(200).send({ data: data?.rows || [] });
        }).catch((e) => {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: e?.message || "Si è verificato un errore" });
            return;
        });
    });

    fastify.get('/v1/clock_models', (request, reply) => {
        if (!validatePrismaToken(request.headers['x-prisma-token'], reply)) {
            return;
        }

        pgAdapter.getClockModelList().then(data => {
            reply.status(200).send({ data: data?.rows || [] });
        }).catch((e) => {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: e?.message || "Si è verificato un errore" });
            return;
        });
    });

    fastify.put('/v1/clock_models', (request, reply) => {
        if (!validatePrismaToken(request.headers['x-prisma-token'], reply)) {
            return;
        }

        pgAdapter.addClockModel(request.body.cm_name, request.body.cm_desc).then(data => {
            reply.status(200).send({ data: data?.rows || [] });
        }).catch((e) => {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: e?.message || "Si è verificato un errore" });
            return;
        });
    });

    fastify.post('/v1/clock_models', (request, reply) => {
        if (!validatePrismaToken(request.headers['x-prisma-token'], reply)) {
            return;
        }

        pgAdapter.updateClockModelList(request.body.cm_id, request.body.cm_name, request.body.cm_desc).then(data => {
            reply.status(200).send({ data: data?.rows || [] });
        }).catch((e) => {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: e?.message || "Si è verificato un errore" });
            return;
        });
    });

    fastify.delete('/v1/clock_models', (request, reply) => {
        if (!validatePrismaToken(request.headers['x-prisma-token'], reply)) {
            return;
        }

        const cm_id = request.headers['cm_id'] || "";

        pgAdapter.deleteClockModelList(cm_id).then(data => {
            reply.status(200).send({ data: data?.rows || [] });
        }).catch((e) => {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: e?.message || "Si è verificato un errore" });
            return;
        });
    });

    fastify.get('/v1/settings', (request, reply) => {
        if (!validatePrismaToken(request.headers['x-prisma-token'], reply)) {
            return;
        }

        pgAdapter.getSettings().then(data => {
            if (data && data?.rows && data?.rows[0]) {
                data.rows[0].set_ftp_server_password = data.rows[0].set_ftp_server_password ? '*****' : '';
                data.rows[0].set_mail_pass = data.rows[0].set_mail_pass ? '*****' : '';
            }

            reply.status(200).send({ data: data?.rows && data.rows[0] || null });
        }).catch((e) => {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: e?.message || "Si è verificato un errore" });
            return;
        });
    });

    fastify.put('/v1/settings', (request, reply) => {
        if (!validatePrismaToken(request.headers['x-prisma-token'], reply)) {
            return;
        }

        pgAdapter.createSettings(request.body).then(data => {
            reply.status(200).send({ data: data?.rows && data.rows[0] || null });
        }).catch((e) => {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: e?.message || "Si è verificato un errore" });
            return;
        });
    });

    fastify.post('/v1/settings/email', (request, reply) => {
        if (!validatePrismaToken(request.headers['x-prisma-token'], reply)) {
            return;
        }

        pgAdapter.updateSettingsEmail(request.body).then(data => {
            reply.status(200).send({ data: data?.rows && data.rows[0] || null });
        }).catch((e) => {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: e?.message || "Si è verificato un errore" });
            return;
        });
    });

    fastify.post('/v1/settings/ftp', (request, reply) => {
        if (!validatePrismaToken(request.headers['x-prisma-token'], reply)) {
            return;
        }

        pgAdapter.updateSettingsFtp(request.body).then(data => {
            reply.status(200).send({ data: data?.rows && data.rows[0] || null });
        }).catch((e) => {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: e?.message || "Si è verificato un errore" });
            return;
        });
    });

    fastify.post('/v1/settings/stamps', (request, reply) => {
        if (!validatePrismaToken(request.headers['x-prisma-token'], reply)) {
            return;
        }

        pgAdapter.updateSettingsStamps(request.body).then(data => {
            reply.status(200).send({ data: data?.rows && data.rows[0] || null });
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