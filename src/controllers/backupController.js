const {createBackup, getBackups, restoreBackup} = require('../utils/dbBackup');

const createBackupHandler = async (req,res) => {
    try {
        const userId = req.user.user_id;
        const result = await createBackup(userId);

        res.status(201).json({
            message: 'Database backup created successfully',
            backup: result
        })
    } catch (error) {
        console.log('Backup creation failed: ', error);
        res.status(500).json({
            message: 'Failed to create database backup',
            error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
        })
        
    }
}

const getBackupsHandler = async (req,res) => {
    try {
        const backups = await getBackups();
        res.status(200).json(backups);
    } catch (error) {
        console.error('Failed to retrieve backups: ', error);
        res.status(500).json({
            message: 'Failed to retrive backups',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        })
        
    }
}

const restoreBackupHandler = async (req, res) => {
    try {
        const {backupId} = req.params;
        const userId = req.user.user_id;

        const result = await restoreBackup(backupId,userId);

        res.status(200).json({
            message: "Database restored successfully",
            result
        })
    } catch (error) {
        console.error('Database restore failed: ', error);
        res.status(500).json({
            message: 'Failed to restore database',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        })
        
    }
}

module.exports = {
    createBackupHandler,
    getBackupsHandler,
    restoreBackupHandler
}