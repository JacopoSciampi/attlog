const JekoPgInit = require('./pg');
const JekoEmailer = require('./email');
const ftp = require("basic-ftp");
const { Readable } = require('stream');
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

let intervalMailCheck;
let intervalStampSend;

const ftpClient = new ftp.Client()

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
        cb(null, true);
        return;

        if (!origin) {
            cb(null, true)
            return;
        }

        if (new URL(origin).hostname === "localhost" || new URL(origin).hostname === "192.168.0.161") {
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
    });;

    fastify.post('/v3/user/upsert', (request, reply) => {
        const tkn = request.headers["x-token-ref"];
        queryFromClocks++;

        if (!tkn || tkn !== internal_token) {
            reply.status(401).message({ msg: "Unauthorized" });
            return;
        }

        const sn = request.body.sn;
        const pin = request.body.pin;
        const name = request.body.name;
        const pass = request.body.pass;
        const badgeId = request.body.badgeId;


        if (sn && pin) {
            pgAdapter.upsertUser(sn, pin, name, pass, badgeId,).then(() => {
                console.log(`User ${name} upsert`);
                reply.status(200).send({ msg: `User ${name} upsert` });
                return;
            }).catch(() => {
                reply.status(500).send({ title: "Errore", message: "Si è verificato un errore" });
                return;
            })
        } else {
            reply.status(500).send({ msg: "no serial number or PIN sent" });
        }
    });

    fastify.get('/', (request, reply) => {
        reply.status(301).send({ message: "Unauthorized" });
    })

    fastify.get('/v2/api-key/:key', (request, reply) => {
        pgAdapter.getLogsFromApiKey(request.params.key).then(data => {
            const a = generateFilContentForStamps(data?.data?.rows, jekoEmailer.config.set_terminal_file_format, data.code.rows[0].cu_code)
            reply.code(200).send(a);
        }).catch(err => {
            console.log(err);
            reply.status(500).send();
        });
    });

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

        pgAdapter.updateCustomerInfo(request.body.customer_id, request.body.cu_code, request.body.cu_note, request.body.name, request.body.mail, request.body.cu_api_key).then(data => {
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

                pgAdapter.createCustomer(request.body.name, request.body.mail, request.body.cu_code, request.body.cu_note, request.body.cu_api_key).then(() => {
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

        const customer_id = request.headers['customer-id'] || "";
        const cu_code = request.headers['cu-code'] || "";

        pgAdapter.deleteCustomer(customer_id, cu_code).then(data => {
            reply.status(200).send({ data: data?.rows || [] });
        }).catch((e) => {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: e?.message || "Si è verificato un errore" });
            return;
        });
    });

    function __getDataInArrayForLogs__(data, customer_code) {
        return data?.rows.reduce((acc, current) => {
            const { attlog_access_type, attlog_date, attlog_id, attlog_reason_code, attlog_terminal_sn, attlog_time, attlog_user_id, clock_name, customer_name, int_attlog_access_type, int_attlog_reason_code } = current;
            const existingCustomerIndex = acc.findIndex((entry) => entry.customer_code === customer_code);

            if (existingCustomerIndex === -1) {
                acc.push({
                    customer_code,
                    entries: [{ attlog_access_type, attlog_date, attlog_id, attlog_reason_code, attlog_terminal_sn, attlog_time, attlog_user_id, clock_name, customer_name, int_attlog_access_type, int_attlog_reason_code }],
                });
            } else {
                acc[existingCustomerIndex].entries.push({ attlog_access_type, attlog_date, attlog_id, attlog_reason_code, attlog_terminal_sn, attlog_time, attlog_user_id, clock_name, customer_name, int_attlog_access_type, int_attlog_reason_code });
            }

            return acc;
        }, []);
    }

    fastify.post('/v1/attlog/set_all_to_be_sent', (request, reply) => {
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
            pgAdapter.setAllStampToBeSent(data).then(() => {
                reply.status(200).send({ message: 'Aggiornamento effettuato con successo' });
            }).catch((e) => {
                console.log(e);
                reply.status(500).send({ title: "Errore", message: "Si è verificato un errore" });
                return;
            });
        }).catch((e) => {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: "Si è verificato un errore" });
            return;
        });
    });

    fastify.post('/v1/attlog/set_to_be_sent', (request, reply) => {
        if (!validatePrismaToken(request.headers['x-prisma-token'], reply)) {
            return;
        }

        const id = request.body.id || "";
        pgAdapter.setStampToBeSent(id).then(() => {
            reply.status(200).send({ message: 'Aggiornamento effettuato con successo' });
        }).catch((e) => {
            console.log(e);
            reply.status(500).send({ title: "Errore", message: "Si è verificato un errore" });
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
        let customerName = request.body.customerName || "";

        if (sn) {
            pgAdapter.getClockBySn(sn).then(data => {
                customerName = data.rows[0].customer_name;
                const customer_code = data.rows[0].customer_code;

                pgAdapter.downloadLogs(sn, userId, startDate, endDate, customerName).then(data => {
                    let fileName = jekoEmailer.config.set_terminal_file_name;
                    const fileFormat = jekoEmailer.config.set_terminal_file_format;

                    const newArray = __getDataInArrayForLogs__(data, customer_code)

                    if ((!fileName || !fileFormat) || newArray?.length !== 1) {
                        console.info("stamps config not set or multiple customers detected. Using default");
                        fileName = generateGenericFileName();
                    } else {
                        fileName = generateFileNameForStamps(fileName,
                            newArray[0].customer_code,
                            newArray[0].entries.every(x => x.attlog_terminal_sn === sn) ? sn : null
                        );
                    }

                    data = generateFilContentForStamps(data.rows, fileFormat, customer_code);

                    reply.status(200).send({ data: data || '', fileName: fileName });
                }).catch((e) => {
                    console.log(e);
                    reply.status(500).send({ title: "Errore", message: "Si è verificato un errore" });
                    return;
                });
            }).catch((e) => {
                console.log(e);
                reply.status(500).send({ title: "Errore", message: "Si è verificato un errore nel download" });
                return;
            });
        } else {
            pgAdapter.downloadLogs(sn, userId, startDate, endDate, customerName).then(data => {
                const fileName = generateGenericFileName();
                const fileFormat = jekoEmailer.config.set_terminal_file_format;
                data = generateFilContentForStamps(data.rows, fileFormat, '');

                reply.status(200).send({ data: data || '', fileName: fileName });
            }).catch((e) => {
                console.log(e);
                reply.status(500).send({ title: "Errore", message: "Si è verificato un errore" });
                return;
            });
        }
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

        const clock_sn = request.headers['c-sn'] || "";

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

        console.log(request.headers);
        const cm_id = request.headers['cm-id'] || "";

        pgAdapter.deleteClockModelList(+cm_id).then(data => {
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
            upsertEmailStuff();
            upsertStampFtpStuff();
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
            upsertEmailStuff();
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
            upsertStampFtpStuff();
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

    function upsertEmailStuff() {
        return new Promise((res, rej) => {
            pgAdapter.getSettings().then(data => {
                if (data && data.rows && data.rows[0]) {
                    console.log("Email settings UP")
                    jekoEmailer.__init__(data.rows[0]);
                    _upsertTerminalChecker();
                    _upsertFtpChecker();
                } else {
                    console.log("WARNING: YOU MUST DEFINE THE SETTINGS IN THE FRONT END, THEN RESTART THE SERVER")
                }
                res();
            }).catch(e => {
                console.error("Error while setting up the email at startup");
                console.error(e);
                rej();
            });
        });
    }

    function upsertStampFtpStuff() {
        return new Promise((res, rej) => {
            pgAdapter.getSettings().then(data => {
                if (data && data.rows && data.rows[0]) {
                    console.log("FTP settings UP")
                    jekoEmailer.__init__(data.rows[0]);
                    _upsertFtpChecker();
                } else {
                    console.log("WARNING: YOU MUST DEFINE THE SETTINGS IN THE FRONT END, THEN RESTART THE SERVER")
                }

            }).catch(e => {
                console.error("Error while setting up the ftp at startup");
                console.error(e);
                rej();
            });
        });
    }

    function _upsertFtpChecker() {
        if (!jekoEmailer.config.set_ftp_enabled) {
            return;
        }

        clearInterval(intervalStampSend);

        intervalStampSend = setInterval(() => {
            let fileName = jekoEmailer.config.set_terminal_file_name;
            const fileFormat = jekoEmailer.config.set_terminal_file_format;

            if (!fileName || !fileFormat) {
                console.log("Cannot send FTP data: file name or format not set in settings");
                return;
            }

            console.log("Checking terminal status for FTP...");
            pgAdapter.getLogsForFtp().then(data => {
                if (data && data?.rows) {
                    ftpClient.access({
                        host: jekoEmailer.config.set_ftp_server_ip,
                        port: jekoEmailer.config.set_ftp_server_port,
                        user: jekoEmailer.config.set_ftp_server_user,
                        password: jekoEmailer.config.set_ftp_server_password,
                        secure: false
                    }).then(() => {
                        const stringToReadable = (str) => {
                            const readableStream = new Readable();
                            readableStream._read = () => { };
                            readableStream.push(str);
                            readableStream.push(null);
                            return readableStream;
                        };

                        const remoteFolder = jekoEmailer.config.set_ftp_server_folder;
                        pgAdapter.downloadLogs('', null, null, null, null, true).then(data => {
                            const _ = data;
                            data = generateFilContentForStamps(data.rows, fileFormat, '');
                            fileName = generateGenericFileName();
                            const fileContent = stringToReadable(data);
                            ftpClient.uploadFrom(fileContent, `${remoteFolder} ${fileName}`).then(() => {
                                console.log("FTP stamps uploaded");
                                pgAdapter.batchUpdateStamps(_);
                            }).catch(err => {
                                console.log("Error while uploading to the FTP server");
                                console.error(err);
                            });

                            console.log("Check done");
                        });
                    }).catch(err => {
                        console.log("Error while connecting to the FTP server");
                        console.error(err);
                    });

                }
            }).catch(() => {
                console.error("There was an error getting the clock list");
            })
        }, jekoEmailer.config.set_ftp_send_every * 1000);
    }

    function _upsertTerminalChecker() {
        clearInterval(intervalMailCheck);

        intervalMailCheck = setInterval(() => {
            console.log("Checking terminal status for email...");
            pgAdapter.getClocksForMail().then(data => {
                if (data && data?.rows) {
                    let terminalList = data?.rows?.filter(e => !e.online && (!e.c_mail_sent || e.c_mail_sent === "false"));

                    terminalList?.forEach(terminal => {
                        if (!jekoEmailer.snList.find(sn => sn === terminal.c_sn)) {
                            jekoEmailer.snList.push(terminal.c_sn);

                            jekoEmailer.sendMailTerminalOffline(terminal).then(() => {
                                console.log(`Terminal ${terminal.c_sn} offline. Mail sent.`);
                                pgAdapter.updateClockMailSent(terminal.c_sn, true).then(() => { }).catch(() => { });
                                const idx = jekoEmailer.snList.indexOf(terminal.c_sn);
                                jekoEmailer.snList = jekoEmailer.snList.splice(idx, 1);
                            });

                        }
                    });

                    console.log("Check done");
                }
            }).catch(() => {
                console.error("There was an error getting the clock list");
            })
        }, jekoEmailer.config.set_mail_offline_after * 60 * 1000);
    }

    function generateFilContentForStamps(data, path, customer_code) {
        const parts = path.split('_');
        const dataToSendAsArray = [];

        data?.forEach(item => {
            let string = '';
            const k = '';
            let kl = 0;

            parts.forEach(key => {
                const length = key.length;

                if (key.startsWith('T')) {
                    string += item.attlog_terminal_sn.slice(0, length);
                } else if (key.startsWith('F')) {
                    if (!customer_code) {
                        string += item.cu_code.slice(0, length);
                    } else {
                        string += customer_code.slice(0, length);
                    }
                } else if (key.startsWith('B')) {
                    string += (item.user_badge || '').slice(0, length);
                } else if (key.startsWith('A') || key.startsWith('M') || key.startsWith('G')) {
                    const year = key.replace(/[^A]/g, "").length;
                    const month = key.replace(/[^M]/g, "").length;
                    const day = key.replace(/[^G]/g, "").length;
                    const now = new Date(item.attlog_date);

                    let _ = '';
                    new Set(key).forEach(k => {
                        if (k.startsWith('A')) {
                            _ += now.getFullYear().toString().slice(-year);
                        } else if (k.startsWith('M')) {
                            _ += (now.getMonth() + 1).toString().padStart(month, '0');
                        } else if (k.startsWith('G')) {
                            _ += now.getDate().toString().padStart(day, '0');
                        }
                    });

                    string += _;
                } else if (key.startsWith('H') || key.startsWith('N') || key.startsWith('S')) {
                    const now = new Date();

                    const hours = key.replace(/[^H]/g, "").length;
                    const minutes = key.replace(/[^N]/g, "").length;
                    const seconds = key.replace(/[^S]/g, "").length;

                    let _ = '';
                    new Set(key).forEach(k => {
                        if (k.startsWith('H')) {
                            _ += item.attlog_time.split(':')[0].slice(-hours);
                        } else if (k.startsWith('N')) {
                            _ += item.attlog_time.split(':')[1].padStart(minutes, '0');
                        } else if (k.startsWith('S')) {
                            _ += item.attlog_time.split(':')[2].padStart(seconds, '0');
                        }
                    });

                    string += _;
                } else if (key.startsWith('V')) {
                    string += item.attlog_access_type.padStart(length, '0');
                } else if (key.startsWith('C')) {
                    string += '<c>' + (item.attlog_work_code || "").padStart(length, '0') + '</c>';
                } else if (key.startsWith('K')) {
                    k = item.attlog_work_code;
                    kl = key.length;
                    const attendance = (jekoEmailer.config.set_terminal_attendance || "").split(',');
                    const pause = (jekoEmailer.config.set_terminal_pause || "").split(',');
                    const service = (jekoEmailer.config.set_terminal_service || "").split(',');

                    if (!!attendance.find(e => e === item.attlog_work_code)) {
                        string += "0".padStart(length, '0');
                    }

                    if (!!pause.find(e => e === item.attlog_work_code)) {
                        string += "1".padStart(length, '0');
                    }

                    if (!!service.find(e => e === item.attlog_work_code)) {
                        string += "2".padStart(length, '0');
                    }
                }
            });

            if (string.indexOf('<c>') !== -1) {
                if (k) {
                    string = string.replace(/<c>.*?<\/c>/g, k.padStart(kl, '0'));
                } else {
                    string = string.replace('<c>', '');
                    string = string.replace('</c>', '');
                }
            }

            dataToSendAsArray.push(string);
        });

        return dataToSendAsArray.join('\n');
    }

    function generateFileNameForStamps(path, customer, clockSn) {
        const formatter = path.split('.')[0];
        const fileExt = path.split('.')[1];
        const parts = formatter.split('_');

        let fileNameAsArray = [];

        parts.forEach(key => {
            const length = key.length;

            if (key.startsWith('C')) {
                fileNameAsArray.push(customer.slice(0, length));
            } else if (key.startsWith('T')) {
                fileNameAsArray.push(clockSn.slice(0, length));
            } else if (key.startsWith('A') || key.startsWith('M') || key.startsWith('G')) {
                const now = new Date();

                const year = key.replace(/[^A]/g, "").length;
                const month = key.replace(/[^M]/g, "").length;
                const day = key.replace(/[^G]/g, "").length;

                let string = '';
                new Set(key).forEach(k => {
                    if (k.startsWith('A')) {
                        string += now.getFullYear().toString().slice(-year);
                    } else if (k.startsWith('M')) {
                        string += (now.getMonth() + 1).toString().padStart(month, '0');
                    } else if (k.startsWith('G')) {
                        string += now.getDate().toString().padStart(day, '0');
                    }
                });

                fileNameAsArray.push(string);
            } else if (key.startsWith('H') || key.startsWith('N') || key.startsWith('S')) {
                const now = new Date();

                const hours = key.replace(/[^H]/g, "").length;
                const minutes = key.replace(/[^N]/g, "").length;
                const seconds = key.replace(/[^S]/g, "").length;

                let string = '';
                new Set(key).forEach(k => {
                    if (k.startsWith('H')) {
                        string += now.getHours().toString().slice(-hours);
                    } else if (k.startsWith('N')) {
                        string += (now.getMonth() + 1).toString().padStart(minutes, '0');
                    } else if (k.startsWith('S')) {
                        string += now.getDate().toString().padStart(seconds, '0');
                    }
                });

                fileNameAsArray.push(string);
            }
        });

        let name = fileNameAsArray.join('_');

        if (fileExt) {
            name += `.${fileExt}`;
        }

        return name;
    }

    function generateGenericFileName() {
        const date = new Date();
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        return `${day}/${month}/${year}-${hours}_${minutes}_${seconds}`;
    }

    const start = async () => {
        try {
            await fastify.listen({ host: "0.0.0.0", port: 8081 });
            upsertEmailStuff().then(() => {
            }).catch(() => { });
        } catch (err) {
            fastify.log.error(err)
            process.exit(1)
        }
    }
    start()
}).catch(err => {
    console.log(err)
});