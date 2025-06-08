const { createConnection } = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const { logActivity } = require('./activityLog');

// Create the backup directory if it doesn't exist
const backupDir = path.join(__dirname, '../../backups');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

/**
 * Creates a MySQL database backup using mysql2
 * @param {number} userId - The ID of the user initiating the backup
 * @returns {Promise<Object>} - Result of the backup operation
 */
const createBackup = async (userId) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const filePath = path.join(backupDir, filename);

    const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

    // Validate environment variables
    if (!DB_HOST || !DB_USER || !DB_NAME) {
        throw new Error('Database configuration missing');
    }

    // Create a new connection for backup
    const connection = await createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME
    });

    try {
        // Start writing SQL file
        const stream = fs.createWriteStream(filePath);
        stream.write(`-- Backup for ${DB_NAME} created at ${new Date().toISOString()}\n`);
        stream.write(`-- Database: ${DB_NAME}\n\n`);
        stream.write(`SET FOREIGN_KEY_CHECKS=0;\n\n`); // Disable foreign key checks for restore

        // Get all tables
        const [tables] = await connection.query("SHOW TABLES");
        const tableNames = tables.map(row => Object.values(row)[0]);

        for (const table of tableNames) {
            // Get table structure
            const [createTable] = await connection.query(`SHOW CREATE TABLE \`${table}\``);
            stream.write(`-- Table structure for ${table}\n`);
            stream.write(`${createTable[0]['Create Table']};\n\n`);

            // Get table data
            const [rows] = await connection.query(`SELECT * FROM \`${table}\``);
            if (rows.length > 0) {
                stream.write(`-- Data for ${table}\n`);
                stream.write(`INSERT INTO \`${table}\` VALUES\n`);
                rows.forEach((row, index) => {
                    const values = Object.values(row).map(val => {
                        if (val === null) return 'NULL';
                        if (val instanceof Date) {
                            // Check if the date is valid
                            if (isNaN(val.getTime())) {
                                console.warn(`Invalid date found in table ${table}: ${val}`);
                                return 'NULL'; // Replace invalid dates with NULL
                            }
                            return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                        }
                        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                        return val;
                    }).join(', ');
                    stream.write(`(${values})${index < rows.length - 1 ? ',' : ';'}\n`);
                });
                stream.write('\n');
            }
        }

        stream.write(`SET FOREIGN_KEY_CHECKS=1;\n`); // Re-enable foreign key checks
        stream.end();

        // Log backup in database
        const dbConnection = await createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME
        });
        try {
            const [result] = await dbConnection.execute(
                'INSERT INTO backups (backup_filename, created_by) VALUES (?,?)',
                [filename, userId]
            );

            await logActivity(userId, `Created database backup: ${filename}`);

            return {
                success: true,
                filename,
                path: filePath,
                backupId: result.insertId,
                timestamp: new Date().toISOString()
            };
        } finally {
            await dbConnection.end();
        }
    } finally {
        await connection.end();
    }
};

const getBackups = async () => {
    const connection = await createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    try {
        const [rows] = await connection.execute(`
            SELECT b.backup_id, b.backup_filename, b.backup_date,
            u.user_id, CONCAT(u.first_name, ' ', u.last_name) as user_name
            FROM backups b
            LEFT JOIN users u ON b.created_by = u.user_id
            ORDER BY b.backup_date DESC
        `);
        return rows;
    } finally {
        await connection.end();
    }
};

const restoreBackup = async (backupId, userId) => {
    const connection = await createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    try {
        const [backups] = await connection.execute(
            'SELECT backup_filename FROM backups WHERE backup_id = ?',
            [backupId]
        );

        if (backups.length === 0) {
            throw new Error('Backup not found');
        }

        const filename = backups[0].backup_filename;
        const filePath = path.join(backupDir, filename);

        if (!fs.existsSync(filePath)) {
            throw new Error('Backup file not found on server');
        }

        const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, MYSQL_PATH } = process.env;
        const passwordArg = DB_PASSWORD ? `--password="${DB_PASSWORD}"` : '';
        const mysqlPath = MYSQL_PATH || 'mysql';
        const cmd = `"${mysqlPath}" -h ${DB_HOST} -u ${DB_USER} ${passwordArg} ${DB_NAME} < "${filePath}"`;

        return new Promise((resolve, reject) => {
            const { exec } = require('child_process');
            exec(cmd, { shell: 'cmd.exe' }, async (error, stdout, stderr) => {
                if (error) {
                    console.error("Restore error:", error);
                    return reject(error);
                }

                if (stderr && !stderr.includes('Warning')) {
                    console.error('Restore stderr:', stderr);
                    return reject(new Error(stderr));
                }

                try {
                    await logActivity(userId, `Restored database from backup: ${filename}`);
                    resolve({
                        success: true,
                        message: 'Database restored successfully',
                        filename,
                        timestamp: new Date().toISOString()
                    });
                } catch (logError) {
                    console.error('Failed to log restore activity:', logError);
                    reject(logError);
                }
            });
        });
    } finally {
        await connection.end();
    }
};

module.exports = {
    createBackup,
    getBackups,
    restoreBackup
};