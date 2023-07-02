const pg = require('pg');

pool = new pg.Client({
    user: process.env.DB_USER || "keycloak",
    password: process.env.DB_PASS || "xUc5rUj!ZISPos0$&iyaGe7riChAkL",
    host: 'localhost',
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
    createCustomer(name, mail) {
        return new Promise((r, j) => {
            pool.query(
                `INSERT INTO "customers" ("c_name", "c_email")
                VALUES ($1, $2)`, [name, mail]).then(() => {
                    r()
                }).catch((err) => {
                    console.log(err);
                    j();
                });
        });
    }

    getCustomerList() {
        return new Promise((r, j) => {
            pool.query(`
                SELECT c.customer_id, c.c_name AS customer_name, c.c_email AS customer_email, COALESCE(cl.total_clocks, 0) AS total_clocks
                FROM customers c
                LEFT JOIN (
                    SELECT fk_customer_id, COUNT(*) AS total_clocks
                    FROM clocks
                    GROUP BY fk_customer_id
                ) cl ON c.customer_id = cl.fk_customer_id;
            `, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                r(data.rows);
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
                    j(null);
                }
            });
        });
    }

    downloadLogs(sn, userId, startDate, endDate, customerName) {
        return new Promise((r, j) => {
            let query = `SELECT attlogs.*, clocks.c_name AS clock_name, COALESCE(customers.c_name, '-') AS customer_name
            FROM public.attlogs
            LEFT JOIN public.clocks ON attlogs.attlog_terminal_sn = clocks.c_sn
            LEFT JOIN public.customers ON clocks.fk_customer_id = customers.customer_id
            WHERE attlogs.attlog_terminal_sn LIKE '${sn}%' AND attlogs.attlog_user_id LIKE '${userId}%'`;

            if (customerName) {
                query += ` AND customers.c_name LIKE '${customerName}%'`;
            }

            if (startDate && endDate) {
                query += ` AND attlogs.attlog_date BETWEEN '${startDate}' AND '${endDate}'`;
            }

            query += ' ORDER BY customer_name ASC';
            pool.query(query, (err, data) => {
                if (err) {
                    console.log(err);
                    j();
                }

                data?.rows?.forEach(log => {
                    log.attlog_reason_code = reasonCode[log.attlog_reason_code];
                    log.attlog_access_type = accessType[log.attlog_access_type];
                });

                let toReturn = '';

                data?.rows?.forEach(i => {
                    Object.entries(i).forEach(([key, value]) => {
                        toReturn += `${key}: ${value} -`;
                    });
                    toReturn += '\n';
                });

                r(toReturn);
            });
        });
    }

    getLogs(sn, userId, startDate, endDate, customerName) {
        return new Promise((r, j) => {
            let query = `SELECT attlogs.*, clocks.c_name AS clock_name, COALESCE(customers.c_name, '-') AS customer_name
            FROM public.attlogs
            LEFT JOIN public.clocks ON attlogs.attlog_terminal_sn = clocks.c_sn
            LEFT JOIN public.customers ON clocks.fk_customer_id = customers.customer_id
            WHERE attlogs.attlog_terminal_sn LIKE '${sn}%' AND attlogs.attlog_user_id LIKE '${userId}%'`;

            if (customerName) {
                query += ` AND customers.c_name LIKE '${customerName}%'`;
            }

            if (startDate && endDate) {
                query += ` AND attlogs.attlog_date BETWEEN '${startDate}' AND '${endDate}'`;
            }

            query += ' ORDER BY customer_name ASC';
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

    getClocks(customerName, status) {
        let mustFilterStatus = status !== "Tutti";

        return new Promise((r, j) => {
            pool.query(`SELECT c.c_id, c.c_sn, c.c_name, c.c_model, c.c_note, c.c_last_timestamp, cu.c_name AS customer_name
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

    updateClockInfo(c_sn, c_name, c_model, fk_customer_name, c_note) {
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
                pool.query(`UPDATE clocks SET c_name = '${c_name}', c_model = '${c_model}', fk_customer_id = '${customerId}', c_note = '${c_note}'  WHERE clocks.c_sn  = '${c_sn}'`, (err, data) => {
                    if (err) {
                        console.log(err);
                        j();
                    }

                    r();
                });

            });

        });
    }

    addClock(c_sn, c_name, c_model, fk_customer_name, c_note) {
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
                        `INSERT INTO "clocks" ("c_sn", "c_name", "c_model", "c_last_timestamp", "fk_customer_id", "c_note")
                    VALUES ($1, $2, $3, $4, $5, $6)`, [c_sn, c_name, c_model, timeStamp, customerId, c_note]).then(() => {
                            r()
                        }).catch((err) => {
                            console.log(err);
                            j();
                        });
                });
            });

        });
    }

    updateClockTimestamp(sn) {
        return new Promise((r, j) => {
            pool.query(`UPDATE clocks SET c_last_timestamp = '${new Date().getTime()}' WHERE clocks.c_sn  = '${sn}'`, (err, data) => {
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
        //'10-2023-06-27 14:51:15-0-1-0-0-0-0-0-0-' // Ingresso mano
        //'10-2023-06-27 14:51:15-0-1-0-0-0-0-0-0-' // Ingresso mano
        //'10-2023-06-27 15:02:40-4-1-0-0-0-0-0-0-' // Ingresso straordinario mano
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
                `INSERT INTO "attlogs" ("attlog_terminal_sn", "attlog_user_id", "attlog_date", "attlog_time", "attlog_reason_code", "attlog_access_type")
                    VALUES ($1, $2, $3, $4, $5, $6)`, [sn, userId_date[0], userId_date[1], otherData[0], otherData[1], otherData[2]]).then(() => {
                    r();
                }).catch((err) => {
                    console.log(err);
                    j();
                });
        });
    }
}

module.exports = JekoPgInit
