// Extracting Methods from Console
const { log, clear } = console;
clear();
log(`Cleanup: Cleaning Project.`);
const
    // Importing Packages From Library
    Library = require('./library')
Directories =
    [
        "./database/SQLite",
        "./logs",
        "./storage"
    ].forEach(directory => {
        if (Library.File.FileSystem.dir_exists(directory)) {
            log(`Cleanup->Library->File: Deleting "${directory}" directory.`);
            Library.File.FileSystem.delete_dir(directory, true, true);
        }
    });
log(`Cleanup: Project Cleaned Up.`);