const{ exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { logActivity} = require('./activityLog');


//Create the backup directory kung  wala pa
const backupDir = path.join(__dirname, '../../backups');
if(!fs.existsSync(backupDir)){
    fs.mkdirSync(backupDir, {recursive: true});
}

/**
 * Creates a MySQL database backup
 * @param {number} userId - The ID of the user initiating the backup
 * @returns {Promise<Object>} - Result of the backup operation
 */
const createBackup = async (userId) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const filePath = path.join(backupDir, filename);

    return new Promise(async (resolve, reject) => {

        const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, MYSQLDUMP_PATH} = process.env;

        if (!DB_HOST || !DB_USER || !DB_NAME) {
            return reject(new Error('Database configuration missing'));
        }

        const passwordArg = DB_PASSWORD ? `-p${DB_PASSWORD}` : '';
        const mysqldumpPath = MYSQLDUMP_PATH || 'mysqldump';
        const cmd = `"${mysqldumpPath}" -h ${DB_HOST} -u ${DB_USER} ${passwordArg} ${DB_NAME} > "${filePath}"`;

        exec(cmd, async(error, stdout, stderr) => {
            if (error) {
                console.log("Backup error", error);
                return reject(error);
                
            }

            if (stderr && !stderr.includes('Warning')) {
                console.log('Backup stderr', stderr);
                return reject(new Error(stderr))
                
            }

            try{

                const connection = await db.getConnection();
                try {
                    
                    const [result] =  await connection.execute(
                        'INSERT INTO backups (backup_filename, created_by) VALUES (?,?)',
                        [filename, userId]
                    );

                    await logActivity(userId, `Created database backup : ${filename}`);

                    resolve({
                        success: true,
                        filename,
                        path: filePath,
                        backupId: result.insertId,
                        timestamp: new Date().toISOString()
                    })
                } finally {
                    connection.release();
                }

            }catch(dbError){
                console.log("Failed to record backup in database: ", dbError);
                reject(dbError);
                
            }
        })


    } )


}

const getBackups = async () => {
    const connection = await db.getConnection();
    try {
        const [rows] = await connection.execute(`
            SELECT b.backup_id, b.backup_filename, b.backup_date,
            u.user_id, CONCAT(u.first_name, ' ', u.last_name) as user_name
            FROM backups b
            LEFT JOIN users u ON b.created_by = u.user_id
            ORDER BY b.backup_date DESC
            `);

            return rows
    } finally {
        connection.release();
    }
}

module.exports = {
    createBackup,
    getBackups
}