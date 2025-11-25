const cron = require('node-cron'), spawn = require('child_process').spawn;

let dbBackupTask = cron.schedule('10 21 * * *', () => {
    let backupProcess = spawn('mongodump', [
        '--db=simcam',
        '--archive=/var/www/mongo-backup/backup/',
        '--gzip'
      ]);

    backupProcess.on('exit', (code, signal) => {
        if(code) 
            console.log('Backup process exited with code ', code);
        else if (signal)
            console.error('Backup process was killed with singal ', signal);
        else 
            console.log('Successfully backedup the database')
    });
});