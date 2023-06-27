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

    getLogs(sn, userId, startDate, endDate) {
        return new Promise((r, j) => {
            let query = `SELECT * FROM public.attlogs WHERE attlogs.attlog_terminal_sn LIKE '${sn}%' AND attlogs.attlog_user_id LIKE '${userId}%'`;

            if (startDate && endDate) {
                query += ` AND attlogs.attlog_date BETWEEN '${startDate}' AND '${endDate}'`;
            }

            query += ' ORDER BY attlog_terminal_sn ASC';
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
