const { createBackup, getBackups, restoreBackup } = require('../utils/dbBackup');
const path = require('path');
const fs = require('fs');
const { createConnection } = require('mysql2/promise');

const createBackupHandler = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const result = await createBackup(userId);

        // Set headers for ZIP download to ensure automatic download
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Stream the ZIP file
        result.stream.pipe(res);

        // Handle stream errors
        result.stream.on('error', (err) => {
            console.error('ZIP stream error:', err);
            if (!res.headersSent) {
                res.status(500).json({
                    message: 'Failed to stream backup file',
                    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
                });
            }
        });

        // Clean up temporary files after streaming
        res.on('finish', () => {
            result.cleanup();
        });

        // Log success
        console.log(`Backup ${result.filename} streamed successfully`);
    } catch (error) {
        console.error('Backup creation failed: ', error);
        res.status(500).json({
            message: 'Failed to create database backup',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

const getBackupsHandler = async (req, res) => {
    try {
        const backups = await getBackups();
        res.status(200).json(backups);
    } catch (error) {
        console.error('Failed to retrieve backups: ', error);
        res.status(500).json({
            message: 'Failed to retrieve backups',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

const restoreBackupHandler = async (req, res) => {
    try {
        const { backupId } = req.params;
        const userId = req.user.user_id;

        const result = await restoreBackup(backupId, userId);

        res.status(200).json({
            message: 'Database restored successfully',
            result
        });
    } catch (error) {
        console.error('Database restore failed: ', error);
        res.status(500).json({
            message: 'Failed to restore database',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

const getBackupFileHandler = async (req, res) => {
    try {
        const { filename } = req.params;
        const userId = req.user.user_id;
        console.log(`Request to serve backup file: ${filename} by user: ${userId}`);

        // Validate filename against backups table
        const connection = await createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        try {
            const [rows] = await connection.execute(
                'SELECT backup_filename FROM backups WHERE backup_filename = ?',
                [filename]
            );
            console.log(`Database query result for ${filename}:`, rows);
            if (rows.length === 0) {
                console.warn(`Backup file ${filename} not found in database`);
                return res.status(404).json({ message: 'Backup file not found in database' });
            }
        } finally {
            await connection.end();
        }

        // Construct file path
        const backupDir = path.join(__dirname, '../../backups');
        const filePath = path.join(backupDir, filename);
        console.log(`Attempting to serve file from: ${filePath}`);

        // Validate file exists and is readable
        try {
            fs.accessSync(filePath, fs.constants.R_OK);
            console.log(`File is readable: ${filePath}`);
        } catch (err) {
            console.warn(`Backup file not found or not readable: ${filePath}`, err);
            return res.status(404).json({ message: 'Backup file not found on server or not readable' });
        }

        // Serve the file
        res.setHeader('Content-Type', 'application/sql');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        console.log(`Serving file: ${filePath}`);
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('Error serving backup file:', err);
                res.status(500).json({
                    message: 'Failed to serve backup file',
                    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
                });
            } else {
                console.log(`Successfully served file: ${filePath}`);
            }
        });
    } catch (error) {
        console.error('Failed to serve backup file:', error);
        res.status(500).json({
            message: 'Failed to serve backup file',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    createBackupHandler,
    getBackupsHandler,
    restoreBackupHandler,
    getBackupFileHandler
};