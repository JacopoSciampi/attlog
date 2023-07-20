const pg = require('pg');

pool = new pg.Client({
    user: process.env.DB_USER || "keycloak",
    password: process.env.DB_PASS || "xUc5rUj!ZISPos0$&iyaGe7riChAkL",
    host: 'pgsql',
    port: 5432,
    database: 'timbrature'
});


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

pool.connect(err => {
    if (err) {
        console.log("Connection to DB failed");
        throw err;
    }

    console.log("DB Connected")
});

class JekoPgInit {
    createCustomer(name, mail, cu_code, cu_note, cu_api_key) {
        return new Promise((r, j) => {
            pool.query(
                `INSERT INTO "customers" ("c_name", "c_email", "cu_code", "cu_note", "cu_api_key")
                VALUES ($1, $2, $3, $4, $5)`, [name, mail, cu_code, cu_note, cu_api_key]).then(() => {
                    r()
                }).catch((err) => {
                    console.log(err);
                    j();
                });
        });
    }

    deleteCustomer(customer_id, cu_code) {
        return new Promise((r, j) => {
            pool.query(`DELETE FROM public.customers WHERE customers.customer_id = '${+customer_id}' AND customers.cu_code = '${cu_code}'`, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                r();
            });
        });
    }

    getCustomerList(name, customerCode) {
        return new Promise((r, j) => {
            pool.query(`
            SELECT c.customer_id, c.cu_code, c.cu_note, c.cu_api_key, c.c_name AS customer_name, c.c_email AS customer_email, COALESCE(cl.total_clocks, 0) AS total_clocks
            FROM customers c
            LEFT JOIN (
                SELECT fk_customer_id, COUNT(*) AS total_clocks
                FROM clocks
                GROUP BY fk_customer_id
            ) cl ON c.customer_id = cl.fk_customer_id
            WHERE c.c_name LIKE '%${name}%' AND c.cu_code LIKE '%${customerCode}%';
            `, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                r(data.rows);
            });
        });
    }

    updateCustomerInfo(customer_id, cu_code, cu_note, customer_name, customer_email, cu_api_key) {
        return new Promise((r, j) => {
            pool.query(`SELECT * FROM public.customers WHERE customers.customer_id = '${customer_id}'`, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                if (!data?.rowCount) {
                    j({ message: `Cliente ${customer_name} non trovato` });
                    return;
                }

                pool.query(`UPDATE customers SET cu_code = '${cu_code}', cu_api_key = '${cu_api_key}', cu_note = '${cu_note}', c_name = '${customer_name}', c_email = '${customer_email}' WHERE customers.customer_id  = '${customer_id}'`, (err, data) => {
                    if (err) {
                        console.log(err);
                        j();
                    }

                    r();
                });

            });

        });
    }

    getCustomerDetailByName(name) {
        return new Promise((r, j) => {
            pool.query(`SELECT * FROM customers WHERE customers.c_name = '${name}'`, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                if (data?.rowCount) {
                    const userId = data.rows[0].customer_id;

                    Promise.all([
                        pool.query(`SELECT * FROM clocks WHERE clocks.FK_customer_id = '${userId}'`),
                    ]).then(joined => {
                        data.rows[0]['clocks'] = joined[1].rows;

                        r(data);
                    }).catch(err => {
                        console.log(err);
                        j(err);
                    })
                } else {
                    r(null);
                }
            });
        });
    }

    downloadLogs(sn, userId, startDate, endDate, customerName, toBeSent) {
        return new Promise((r, j) => {
            let query = `SELECT attlogs.*, clocks.c_name AS clock_name, COALESCE(customers.c_name, '-') AS customer_name, users.user_badge, customers.cu_code, clocks.c_custom_id
            FROM public.attlogs
            LEFT JOIN public.clocks ON attlogs.attlog_terminal_sn = clocks.c_sn
            LEFT JOIN public.customers ON clocks.fk_customer_id = customers.customer_id
			LEFT JOIN public.users ON users.user_sn LIKE '%${sn}%' AND users.user_pin = attlogs.attlog_user_id
            WHERE attlogs.attlog_terminal_sn LIKE '%${sn}%'`;

            if (userId) {
                query += ` AND attlogs.attlog_user_id LIKE '%${userId}%'`;
            }
            if (customerName) {
                query += ` AND customers.c_name LIKE '${customerName}%'`;
            }

            if (startDate && endDate) {
                startDate = startDate.replaceAll('/', '-');
                endDate = endDate.replaceAll('/', '-');
                query += ` AND attlogs.attlog_date BETWEEN '${startDate}' AND '${endDate}'`;
            }

            if (toBeSent) {
                query += ` AND attlogs.attlog_sent IS null OR attlogs.attlog_sent = 'false'`;
            }

            query += ' ORDER BY customer_name ASC';
            pool.query(query, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                data?.rows?.forEach(log => {
                    log.int_attlog_reason_code = log.attlog_reason_code;
                    log.int_attlog_access_type = log.attlog_access_type;
                    log.attlog_reason_code = reasonCode[log.attlog_reason_code];
                    log.attlog_access_type = accessType[log.attlog_access_type];
                });

                r(data);
            });
        });
    }

    setAllStampToBeSent(data) {
        return new Promise((resolve, reject) => {
            const updatePromises = data.rows?.map(item => {
                return new Promise((resolveItem, rejectItem) => {
                    pool.query(`UPDATE attlogs SET attlog_sent = 'false', attlog_sent_timestamp = '' WHERE attlogs.attlog_id = '${item.attlog_id}'`, (err, data) => {
                        if (err) {
                            console.log(err);
                            rejectItem(err);
                        } else {
                            resolveItem(data);
                        }
                    });
                });
            });

            Promise.all(updatePromises)
                .then(results => {
                    resolve(results);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    setStampToBeSent(attlog_id) {
        return new Promise((r, j) => {
            pool.query(`UPDATE attlogs SET attlog_sent = 'false', attlog_sent_timestamp = '' WHERE attlogs.attlog_id  = '${attlog_id}'`, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                r(data);
            });
        });
    }

    batchUpdateStamps(data) {
        const timestamp = new Date().getTime();

        data?.rows?.forEach(item => {
            pool.query(`UPDATE attlogs SET attlog_sent = 'true', attlog_sent_timestamp = '${timestamp}' WHERE attlogs.attlog_id  = '${item.attlog_id}'`, (err, data) => {
                if (err) {
                    console.log(`Error while updating the status SENT of the attlog ${item.attlog_id}`);
                    console.log(err);
                }
            });
        });
    }

    getLogsFromApiKey(key) {
        return new Promise((r, j) => {
            pool.query(`
            SELECT * from public.attlogs
            LEFT JOIN public.clocks ON clocks.c_sn = attlogs.attlog_terminal_sn
            LEFT JOIN public.customers ON customers.customer_id = public.clocks.fk_customer_id
            WHERE customers.cu_api_key = '${key}' AND (attlogs.attlog_sent IS NULL OR attlogs.attlog_sent = 'false')
            `, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                pool.query(`SELECT cu_code FROM public.customers WHERE customers.cu_api_key = '${key}'`, (err, cu_code) => {
                    if (err) {
                        console.log(err);
                        j();
                    }

                    if (!data?.rowCount) {
                        j(`Requested a non existing API KEY: ${key}`);
                    }

                    r({ data: data, code: cu_code });
                });
            });
        });
    }

    getLogsForFtp() {
        return new Promise((r, j) => {
            pool.query(`
                SELECT * FROM public.attlogs
                LEFT JOIN public.clocks ON clocks.c_sn = attlogs.attlog_terminal_sn
                LEFT JOIN public.customers ON customers.customer_id = attlogs.attlog_user_id::int
                WHERE attlogs.attlog_sent IS NULL OR attlogs.attlog_sent LIKE '${false}'
                AND (customers.cu_api_key IS NULL OR customers.cu_api_key <> '')
            `, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                r(data);
            });
        });
    }

    getLogs(sn, userId, startDate, endDate, customerName, clockLocation, clockModel) {
        return new Promise((r, j) => {
            let query = `SELECT attlogs.*, clocks.c_name AS clock_name, clocks.c_location AS clock_location, COALESCE(customers.c_name, '-') AS customer_name, clocks.c_model
            FROM public.attlogs
            LEFT JOIN public.clocks ON attlogs.attlog_terminal_sn = clocks.c_sn
            LEFT JOIN public.customers ON clocks.fk_customer_id = customers.customer_id
            WHERE attlogs.attlog_terminal_sn LIKE '${sn}%' AND attlogs.attlog_user_id LIKE '${userId}%'`;

            if (clockModel) {
                query += ` AND clocks.c_model = '${clockModel}'`;
            }

            if (customerName) {
                query += ` AND customers.c_name LIKE '${customerName}%'`;
            }

            if (startDate && endDate) {
                startDate = startDate.replaceAll('/', '-');
                endDate = endDate.replaceAll('/', '-');
                query += ` AND attlogs.attlog_date BETWEEN '${startDate}' AND '${endDate}'`;
            }

            if (clockLocation) {
                query += ` AND clocks.c_location LIKE '%${clockLocation}%'`;
            }

            query += ' ORDER BY attlogs.attlog_id DESC';
            pool.query(query, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                data?.rows?.forEach(log => {
                    log.attlog_reason_code = reasonCode[log.attlog_reason_code];
                    log.attlog_access_type = accessType[log.attlog_access_type];
                });

                r(data);
            });
        });
    }

    getClocksForMail() {
        return new Promise((r, j) => {
            pool.query(`SELECT * FROM public.clocks`,
                (err, data) => {
                    if (err) {
                        console.log(err);
                        j();
                    }

                    data?.rows?.forEach(item => {
                        item['online'] = new Date().getTime() - +item.c_last_timestamp < 60000;
                    });

                    r(data);
                });
        });
    }

    getClockBySn(sn) {
        return new Promise((r, j) => {
            pool.query(`SELECT c.c_id, c.c_sn, c.c_name, c.c_local_ip, c.c_mail_sent, c.c_model, c.c_note, c.c_desc, c.c_location, c.c_last_timestamp, cu.c_name AS customer_name, cu.cu_code AS customer_code
            FROM public.clocks c
            LEFT JOIN public.customers cu ON c.fk_customer_id = cu.customer_id
            WHERE c.c_sn LIKE '%${sn}%'
            ORDER BY c.c_sn ASC;`, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                r(data);
            });
        });
    }

    getClocks(customerName, status) {
        let mustFilterStatus = status !== "Tutti";

        return new Promise((r, j) => {
            pool.query(`SELECT c.c_id, c.c_custom_id, c.c_sn, c.c_name, c.c_local_ip, c.c_mail_sent, c.c_model, c.c_note, c.c_desc, c.c_location, c.c_last_timestamp, cu.c_name AS customer_name
            FROM public.clocks c
            LEFT JOIN public.customers cu ON c.fk_customer_id = cu.customer_id
            WHERE cu.c_name LIKE '${customerName}%'
            ORDER BY c.c_sn ASC;`,
                (err, data) => {
                    if (err) {
                        console.log(err);
                        j();
                    }

                    data?.rows?.forEach(item => {
                        item['online'] = new Date().getTime() - +item.c_last_timestamp < 60000;
                    });

                    if (mustFilterStatus && data?.rows) {
                        data.rows = data.rows.filter(e => e.online === (status === 'Online' ? true : false));
                    }

                    r(data);
                });
        });
    }

    deleteClock(c_sn) {
        return new Promise((r, j) => {
            pool.query(`DELETE FROM public.clocks WHERE clocks.c_sn = '${c_sn}'`, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                r();
            });
        });
    }

    updateClockInfo(c_sn, c_name, c_model, fk_customer_name, c_note, c_desc, c_location) {
        return new Promise((r, j) => {
            pool.query(`SELECT * FROM public.customers WHERE customers.c_name = '${fk_customer_name}'`, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                if (!data?.rowCount) {
                    j({ message: `Cliente ${fk_customer_name} non trovato` });
                    return;
                }

                const customerId = data.rows[0].customer_id;
                pool.query(`UPDATE clocks SET c_name = '${c_name}', c_model = '${c_model}', fk_customer_id = '${customerId}', c_note = '${c_note}' , c_desc = '${c_desc}', c_location = '${c_location}' WHERE clocks.c_sn  = '${c_sn}'`, (err, data) => {
                    if (err) {
                        console.log(err);
                        j();
                    }

                    r();
                });

            });

        });
    }

    addClock(c_sn, c_name, c_model, fk_customer_name, c_note, c_desc, c_location, c_custom_id) {
        return new Promise((r, j) => {
            pool.query(`SELECT * FROM public.customers WHERE customers.c_name = '${fk_customer_name}'`, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                if (!data?.rowCount) {
                    j({ message: `Cliente ${fk_customer_name} non trovato` });
                    return;
                }

                const customerId = data.rows[0].customer_id;

                pool.query(`SELECT * FROM public.clocks WHERE clocks.c_sn = '${c_sn}'`, (err, data) => {
                    if (err) {
                        console.log(err);
                        j();
                    }

                    if (data?.rowCount) {
                        j({ message: `SN ${c_sn} già registrato` });
                        return;
                    }

                    const timeStamp = "-1";
                    pool.query(
                        `INSERT INTO "clocks" ("c_sn", "c_name", "c_model", "c_last_timestamp", "fk_customer_id", "c_note", "c_desc", "c_location", "c_local_ip", "c_custom_id")
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [c_sn, c_name, c_model, timeStamp, customerId, c_note, c_desc, c_location, '', c_custom_id]).then(() => {
                            r()
                        }).catch((err) => {
                            console.log(err);
                            j();
                        });
                });
            });

        });
    }

    updateClockMailSent(sn, status) {
        return new Promise((r, j) => {
            pool.query(`UPDATE clocks SET c_mail_sent = '${status}' WHERE clocks.c_sn  = '${sn}'`, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                r();
            });
        });
    }

    updateClockTimestamp(sn) {
        return new Promise((r, j) => {
            pool.query(`UPDATE clocks SET c_last_timestamp = '${new Date().getTime()}', c_mail_sent = '${false}' WHERE clocks.c_sn  = '${sn}'`, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                r();
            });
        });
    }

    updateClockLocalIp(sn, c_local_ip) {
        return new Promise((r, j) => {
            pool.query(`UPDATE clocks SET c_local_ip = '${c_local_ip}' WHERE clocks.c_sn  = '${sn}'`, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                r();
            });
        });
    }

    addLogIfNotExist(sn, data) {
        // const userId_date = _f[0].split(/-(.*)/).filter(e => !!e);
        // const otherData = _f[1].split('-').filter(e => !!e);
        //'10-2023-06-27 14:51:15-0-1-0-0-0-0-0-0-' // Ingresso               mano
        //'10-2023-06-27 14:51:15-0-1-0-0-0-0-0-0-' // Ingresso               mano
        //'10-2023-06-27 15:02:40-4-1-0-0-0-0-0-0-' // Ingresso straordinario mano
        //' 1-2023-07-18 14:51:27-0-2-0-0-0-0-0-0-' // Ingresso               badge
        //  1-2023-07-18 14:53:18-0-2-55-0-0-0-0-0- // Ingresso               badge codiceLavoro55
        //  1-2023-07-18 14:53:18-0-2-2-0-0-0-0-0- // Ingresso                badge codiceLavoro2
        return new Promise((r, j) => {
            const _f = data.split(' ');
            const userId_date = _f[0].split(/-(.*)/).filter(e => !!e);
            const otherData = _f[1].split('-').filter(e => !!e);

            pool.query(`SELECT * FROM attlogs WHERE 
                attlogs.attlog_terminal_sn = '${sn}' AND
                attlogs.attlog_user_id = '${userId_date[0]}' AND
                attlogs.attlog_date = '${userId_date[1]}' AND
                attlogs.attlog_time = '${otherData[0]}'`, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }
            });

            if (data?.rowCount) {
                j(null);
                return;
            }

            pool.query(
                `INSERT INTO "attlogs" ("attlog_terminal_sn", "attlog_user_id", "attlog_date", "attlog_time", "attlog_reason_code", "attlog_access_type", "attlog_sent", "attlog_sent_timestamp", "attlog_work_code")
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [sn, userId_date[0], userId_date[1], otherData[0], otherData[1], otherData[2], 'false', '', otherData[3]]).then(() => {
                    r();
                }).catch((err) => {
                    console.log(err);
                    j();
                });
        });
    }

    getMetrics() {
        return new Promise((r, j) => {
            pool.query(`SELECT
            (SELECT COUNT(*) FROM customers) AS total_customers,
            (SELECT COUNT(*) FROM clocks) AS total_clocks,
            (SELECT COUNT(*) FROM attlogs) AS total_attlogs;`, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                r(data.rows[0]);
            });
        });
    }

    addClockModel(name, desc) {
        return new Promise((r, j) => {
            pool.query(`SELECT * FROM public.clock_models WHERE clock_models.cm_name = '${name}'`, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                if (data?.rowCount) {
                    j({ message: `Modello ${name} già registrato` });
                    return;
                }

                pool.query(
                    `INSERT INTO "clock_models" ("cm_name", "cm_desc")
                    VALUES ($1, $2)`, [name, desc]).then(() => {
                        r()
                    }).catch((err) => {
                        console.log(err);
                        j();
                    });
            });
        });
    }

    getClockModelList() {
        return new Promise((r, j) => {
            pool.query(`SELECT * FROM public.clock_models`, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                r(data);
            });
        });
    }

    deleteClockModelList(cm_id) {
        return new Promise((r, j) => {
            console.log(`DELETE FROM public.clock_models WHERE clock_models.cm_id = '${cm_id}'`);
            pool.query(`DELETE FROM public.clock_models WHERE clock_models.cm_id = '${cm_id}'`, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                r();
            });
        });
    }

    updateClockModelList(cm_id, cm_name, cm_desc) {
        return new Promise((r, j) => {
            pool.query(`UPDATE clock_models SET cm_name = '${cm_name}', cm_desc = '${cm_desc}' WHERE clock_models.cm_id  = '${cm_id}'`, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                r();
            });
        });
    }

    getSettings() {
        return new Promise((r, j) => {
            pool.query(`SELECT * FROM public.settings`, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                r(data);
            });
        });
    }

    createSettings(data) {
        return new Promise((r, j) => {
            pool.query(`SELECT * FROM public.settings WHERE settings.setting_name = '${data.setting_name}'`, (err, res) => {
                if (err) {
                    console.log(err);
                    j();
                }

                if (res?.rowCount) {
                    j({ message: `Il Nome ${data.setting_name} risulta già utilizzato` });
                    return;
                }


                pool.query(
                    `INSERT INTO "settings" ("setting_name", "set_mail_smtp", "set_mail_ssl", "set_mail_port", "set_mail_user", "set_mail_pass", "set_mail_sender", "set_mail_receiver_list", "set_mail_offline_after", "set_ftp_server_ip", "set_ftp_server_port", "set_ftp_server_user", "set_ftp_server_password", "set_ftp_server_folder", "set_ftp_send_every", "set_terminal_file_name", "set_terminal_file_format", "set_ftp_enabled", "set_terminal_attendance", "set_terminal_pause","set_terminal_service")
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`, [data.setting_name, data.set_mail_smtp, data.set_mail_ssl, data.set_mail_port, data.set_mail_user, data.set_mail_pass, data.set_mail_sender, data.set_mail_receiver_list, data.set_mail_offline_after, data.set_ftp_server_ip, data.set_ftp_server_port, data.set_ftp_server_user, data.set_ftp_server_password, data.set_ftp_server_folder, data.set_ftp_send_every, data.set_terminal_file_name, data.set_terminal_file_format, data.set_ftp_enabled, data.set_terminal_attendance, data.set_terminal_pause, data.set_terminal_service]).then(() => {
                        r()
                    }).catch((err) => {
                        console.log(err);
                        j();
                    });


            });
        });
    }

    updateSettingsEmail(data) {
        return new Promise((r, j) => {
            pool.query(`SELECT * FROM public.settings WHERE settings.setting_id = '${data.setting_id}'`, (err, res) => {
                if (err) {
                    console.log(err);
                    j();
                }

                if (!res?.rowCount) {
                    j({ message: `Configurazione non trovata` });
                    return;
                }

                data.set_mail_ssl === 'true' ? true : false;
                pool.query(`UPDATE settings SET 
                        set_mail_smtp = '${data.set_mail_smtp}',
                        set_mail_ssl = '${data.set_mail_ssl}',
                        set_mail_port = '${data.set_mail_port}',
                        set_mail_user = '${data.set_mail_user}',
                        ${data.set_mail_pass !== "*****" ? `set_mail_pass = '${data.set_mail_pass}',` : ''}
                        set_mail_sender = '${data.set_mail_sender}',
                        set_mail_receiver_list = '${data.set_mail_receiver_list}',
                        set_mail_offline_after = '${data.set_mail_offline_after}'
                        WHERE settings.setting_id = '${data.setting_id}'`, (err, data) => {
                    if (err) {
                        console.log(err);
                        j();
                    }

                    r();
                });
            });
        });
    }

    updateSettingsFtp(data) {
        return new Promise((r, j) => {
            pool.query(`SELECT * FROM public.settings WHERE settings.setting_id = '${data.setting_id}'`, (err, res) => {
                if (err) {
                    console.log(err);
                    j();
                }

                if (!res?.rowCount) {
                    j({ message: `Configurazione non trovata` });
                    return;
                }

                pool.query(`UPDATE settings SET set_ftp_server_ip = '${data.set_ftp_server_ip}',
                set_ftp_server_port = '${data.set_ftp_server_port}',
                set_ftp_server_user = '${data.set_ftp_server_user}',
                set_ftp_enabled = '${data.set_ftp_enabled}',
                ${data.set_ftp_server_password !== "*****" ? `set_ftp_server_password = '${data.set_ftp_server_password}',` : ''}
                set_ftp_server_folder = '${data.set_ftp_server_folder}',
                set_ftp_send_every = '${data.set_ftp_send_every}' WHERE settings.setting_id  = '${data.setting_id}'`, (err, data) => {
                    if (err) {
                        console.log(err);
                        j();
                    }

                    r();
                });
            });
        });
    }

    updateSettingsStamps(data) {
        return new Promise((r, j) => {
            pool.query(`SELECT * FROM public.settings WHERE settings.setting_id = '${data.setting_id}'`, (err, res) => {
                if (err) {
                    console.log(err);
                    j();
                }

                if (!res?.rowCount) {
                    j({ message: `Configurazione non trovata` });
                    return;
                }

                pool.query(`UPDATE settings SET set_terminal_file_name = '${data.set_terminal_file_name}',
                set_terminal_file_format = '${data.set_terminal_file_format}',
                set_terminal_attendance = '${data.set_terminal_attendance}',
                set_terminal_pause = '${data.set_terminal_pause}',
                set_terminal_service = '${data.set_terminal_service}' WHERE settings.setting_id  = '${data.setting_id}'`, (err, data) => {
                    if (err) {
                        console.log(err);
                        j();
                    }

                    r();
                });
            });
        });
    }

    getUserBySnAndPin(sn, pin) {
        return new Promise((r, j) => {
            pool.query(`SELECT * FROM public.users WHERE users.user_sn = '${sn}' AND users.user_pin = '${pin}'`, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                if (!data?.rowCount) {
                    j({ message: `USER_NOT_FOUND` });
                    return;
                }

                r(data)
            });
        });
    }

    upsertUser(sn, pin, user_name, user_pass, user_badge) {
        return new Promise((r, j) => {
            pool.query(`SELECT * FROM public.users WHERE users.user_sn = '${sn}' AND users.user_pin = '${pin}'`, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                if (data?.rowCount) {
                    pool.query(`UPDATE users SET user_name = '${user_name}',
                    user_pass = '${user_pass}',
                    user_badge = '${user_badge}'
                     WHERE users.user_sn  = '${sn}' AND users.user_pin  = '${pin}'`, (err, data) => {
                        if (err) {
                            console.log(err);
                            j();
                        }

                        r();
                    });
                } else {
                    pool.query(
                        `INSERT INTO "users" ("user_sn", "user_pin", "user_name", "user_pass", "user_badge")
                        VALUES ($1, $2, $3, $4, $5)`, [sn, pin, user_name, user_pass, user_badge]).then(() => {
                            r()
                        }).catch((err) => {
                            console.log(err);
                            j();
                        });
                }

            });
        });
    }
}

module.exports = JekoPgInit
