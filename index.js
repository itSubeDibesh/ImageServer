const
    // Extracting Methods from Console
    { clear, log } = console,
    // Importing Packages From Library
    Library = require('./library')
    ;

if (process.env.WORK_ENV.includes('development')) {
    clear();
    log(`Index: Working on Development Mode.`);
    log(`Index->Library: Library imported "${Object.keys(Library).toString().replace(/,/g, ", ")}" classes.`)
    // Deleting Directories On Each Start
    const Directories =
        [
            // "./database/SQLite",
            "./logs"
        ];
    Directories.forEach(directory => {
        if (Library.File.FileSystem.dir_exists(directory)) {
            log(`Index->Library->File: Deleting "${directory}" directory.`);
            Library.File.FileSystem.delete_dir(directory, true, true);
        }
    });
}

// Setup the Database Initially
Library
    .Utility
    .setDatabase();

// Setup Server After Database Setup
new Library
    .Server()
    .setUpServer()
