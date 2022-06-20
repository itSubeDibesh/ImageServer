const
    // Extracting Methods from Console
    { clear, log } = console,
    // Importing Packages From Library
    Library = require('./library'),
    {
        QueryBuilder, setDatabase, SHA_512,
        RandomString, ServerConfig
    } = Library.Utility
    ;

if (process.env.WORK_ENV.includes('development')) {
    clear();
    log(`Index: Working on Development Mode.`);
    log(`Index->Library: Library imported "${Object.keys(Library).toString().replace(/,/g, ", ")}" classes.`)
    // Deleting Directories On Each Start
    const Directories =
        [
            "./database/SQLite",
            "./logs",
            "./storage"
        ];
    Directories.forEach(directory => {
        if (Library.File.FileSystem.dir_exists(directory)) {
            log(`Index->Library->File: Deleting "${directory}" directory.`);
            Library.File.FileSystem.delete_dir(directory, true, true);
        }
    });
}

// Creating Storage
if (!Library.File.FileSystem.dir_exists(ServerConfig.image.storagePath))
    Library.File.FileSystem.mkdir(ServerConfig.image.storagePath);

const
    // Setup the Database Initially
    DB = setDatabase(),
    Columns = ["UserId", "UserName", "FullName", "Email", "PASSWORD", "UserGroup", "IsDisabled", "IsLoggedIn", "VerificationStatus", "VerificationToken"],
    UserTable = new QueryBuilder().currentTable("users"),
    VerificationToken = RandomString(20)
    ;

// Creating A new User for First Time
setTimeout(() => {
    DB.executeQuery(
        UserTable.select(QueryBuilder.selectType.ALL).where(`UserId = 1`).build(),
        (resp) => {
            if (resp.err != null) log(`Index->Database: Error Occurred While Querying Database. :`, resp.err);
            if (resp.rows.length === 0) {
                log(`Index->Database: Administrator Not Found.`);
                log(`Index->Database: Creating New Administrator.`);
                DB.executeQuery(
                    UserTable
                        .insert(Columns, [
                            1,
                            `'Administrator'`,
                            `'System Administrator'`,
                            `'sysadmin@imageserver.com'`,
                            `'${SHA_512('sysadmin@imageserver.com' + 'Admin@20_22' + "IMAGE_SERVER_HASH")}'`,
                            `'ADMINISTRATOR'`,
                            false,
                            false,
                            true,
                            `'${VerificationToken}'`
                        ])
                        .build(), (
                    response => {
                        log(`Index: Administrator Created: "${response.status}".`);
                        if (response.error != null) {
                            log(`Index: Error: "${response.error}".`);
                        }
                    }
                )
                )
            } else {
                log(`Index->Database: Administrator Found :`, resp.rows[0]);
            }
        }
    )
}, 1e3);

// Setup Server After Database Setup
new Library
    .Server()
    .setUpServer()
