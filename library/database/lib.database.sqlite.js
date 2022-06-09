/**
 * @class QueryBuilder
 * @description This class is responsible for building the desired query.
 * @author Dibesh Raj Subedi
 * @version 1.0.0
 */
class QueryBuilder {
    /**
     * @description Select Types
     * @static
     * @memberof QueryBuilder
     */
    static selectType = {
        ALL: "*",
        COLUMN: "column",
        DISTINCT: "DISTINCT"
    }

    /**
     * @description Statement Type
     * @static
     * @memberof QueryBuilder
     */
    static statementType = {
        SELECT: "SELECT",
        UPDATE: "UPDATE",
        INSERT: "INSERT",
        DELETE: "DELETE"
    }

    /**
     * @description Order Type
     * @static
     * @memberof QueryBuilder
     */
    static orderType = {
        ASC: "ASC",
        DESC: "DESC",
        NONE: ""
    }

    /**
     * @description Holds table Name
     * @memberof QueryBuilder
     */
    #table = undefined;

    /**
     * @description Holds Current Query
     * @memberof QueryBuilder
     */
    #sqlQuery = "";

    /**
     * @description Holds Current Statement
     * @memberof QueryBuilder
     */
    #currentStatement = "";

    /**
     * @description Table to be queried on
     * @memberof QueryBuilder
     * @param {string} table - Table Name 
     * @returns {QueryBuilder}
     */
    currentTable(table) {
        this.#table = table;
        return this;
    }

    /**
     * @description Sets the Where Clause
     * @memberof QueryBuilder
     * @param {string} condition - Condition to be checked
     * @returns {QueryBuilder}
     */
    where(condition) {
        // Checking if table is defined
        if (this.#table != undefined &&
            (this.#currentStatement == QueryBuilder.statementType.SELECT ||
                this.#currentStatement == QueryBuilder.statementType.UPDATE ||
                this.#currentStatement == QueryBuilder.statementType.DELETE)
        )
            this.#sqlQuery += ` WHERE ${condition}`;
        return this;
    }

    /**
     * @description Sets the Limit Clause
     * @memberof QueryBuilder
     * @param {number} limit - Limit of the query
     * @returns {QueryBuilder}
     */
    limit(limit) {
        if (this.#table != undefined && this.#currentStatement == QueryBuilder.statementType.SELECT)
            this.#sqlQuery += ` LIMIT ${limit}`;
        return this;
    }

    /**
     * @description Sets the offset Clause
     * @memberof QueryBuilder
     * @param {number} offset - Offset of the query
     * @returns {QueryBuilder}
     */
    offset(offset) {
        if (this.#table != undefined && this.#currentStatement == QueryBuilder.statementType.SELECT)
            this.#sqlQuery += ` OFFSET ${offset}`;
        return this;
    }

    /**
     * @description Sets the Order By Clause
     * @memberof QueryBuilder
     * @param {array} column - Column Names
     * @param {QueryBuilder.orderType} order - Order Type
     * @returns 
     */
    orderBy(column = [], order = QueryBuilder.orderType.ASC) {
        if (this.#table != undefined && this.#currentStatement == QueryBuilder.statementType.SELECT)
            this.#sqlQuery += ` ORDER BY ${[...column]} ${order}`;
        return this;
    }

    /**
     * @description Sets the Group By Clause
     * @memberof QueryBuilder
     * @param {array} column - Column Names
     * @returns {QueryBuilder}
     */
    groupBy(column = []) {
        if (this.#table != undefined && this.#currentStatement == QueryBuilder.statementType.SELECT)
            this.#sqlQuery += ` GROUP BY ${[...column]}`;
        return this;
    }

    /**
     * @description Join Clause
     * @memberof QueryBuilder
     * @param {string} table 
     * @param {string} condition 
     * @returns {QueryBuilder}
     */
    join(table, condition) {
        if (this.#table != undefined && this.#currentStatement == QueryBuilder.statementType.SELECT)
            this.#sqlQuery += ` JOIN ${table} ON ${condition}`;
        return this;
    }

    /**
     * @description Left Join Clause
     * @memberof QueryBuilder
     * @param {string} table 
     * @param {string} condition 
     * @returns {QueryBuilder}
     */
    leftJoin(table, condition) {
        if (this.#table != undefined && this.#currentStatement == QueryBuilder.statementType.SELECT)
            this.#sqlQuery += ` LEFT JOIN ${table} ON ${condition}`;
        return this;
    }

    /**
     * @description Right Join Clause
     * @memberof QueryBuilder
     * @param {string} table 
     * @param {string} condition 
     * @returns {QueryBuilder}
     */
    rightJoin(table, condition) {
        if (this.#table != undefined && this.#currentStatement == QueryBuilder.statementType.SELECT)
            this.#sqlQuery += ` RIGHT JOIN ${table} ON ${condition}`;
        return this;
    }

    /**
     * @description Inner Join Clause
     * @memberof QueryBuilder
     * @param {string} table 
     * @param {string} condition 
     * @returns {QueryBuilder}
     */
    innerJoin(table, condition) {
        if (this.#table != undefined && this.#currentStatement == QueryBuilder.statementType.SELECT)
            this.#sqlQuery += ` INNER JOIN ${table} ON ${condition}`;
        return this;
    }

    /**
     * @description Full Join Clause
     * @memberof QueryBuilder
     * @param {string} table 
     * @param {string} condition 
     * @returns {QueryBuilder}
     */
    fullJoin(table, condition) {
        if (this.#table != undefined && this.#currentStatement == QueryBuilder.statementType.SELECT)
            this.#sqlQuery += ` FULL JOIN ${table} ON ${condition}`;
        return this;
    }

    /**
     * @description Cross Join Clause
     * @memberof QueryBuilder
     * @param {string} table 
     * @returns {QueryBuilder}
     */
    crossJoin(table) {
        if (this.#table != undefined && this.#currentStatement == QueryBuilder.statementType.SELECT)
            this.#sqlQuery += ` CROSS JOIN ${table}`;
        return this;
    }

    /**
     * @description Outer Join Clause
     * @memberof QueryBuilder
     * @param {string} table 
     * @param {string} condition 
     * @returns {QueryBuilder}
     */
    outerJoin(table, condition) {
        if (this.#table != undefined && this.#currentStatement == QueryBuilder.statementType.SELECT)
            this.#sqlQuery += ` OUTER JOIN ${table} ON ${condition}`;
        return this;
    }

    /**
     * @description Select Statement
     * @memberof QueryBuilder
     * @param {QueryBuilder.selectType} selectType - Select Type
     * @param {array} columns - Columns
     * @returns {QueryBuilder}
     */
    select(selectType, columns = []) {
        // Resetting Query
        this.#sqlQuery = ""
        this.#currentStatement = QueryBuilder.statementType.SELECT;
        // Checking if table is defined
        if (this.#table != undefined && this.#currentStatement == QueryBuilder.statementType.SELECT) {
            // Basic Query -> SELECT */Columns FROM Table 
            this.#sqlQuery += this.#currentStatement;
            if (selectType == QueryBuilder.selectType.ALL)
                this.#sqlQuery += " *";
            if (selectType == QueryBuilder.selectType.COLUMN && columns.length != 0)
                this.#sqlQuery += ` ${[...columns]}`;
            if (selectType == QueryBuilder.selectType.DISTINCT && columns.length != 0)
                this.#sqlQuery += ` DISTINCT ${[...columns]}`;
            this.#sqlQuery += ` FROM ${this.#table}`;
        }
        return this;
    }

    /**
     * @description Update Statement
     * @memberof QueryBuilder
     * @param {array} columns 
     * @param {array} values 
     * @returns {QueryBuilder}
     */
    update(columns, values) {
        // Resetting Query
        this.#sqlQuery = ""
        this.#currentStatement = QueryBuilder.statementType.UPDATE;
        if (this.#table != undefined && this.#currentStatement == QueryBuilder.statementType.UPDATE) {
            // Basic Query -> UPDATE Table SET Column = Value
            this.#sqlQuery += this.#currentStatement;
            this.#sqlQuery += ` ${this.#table}`;
            this.#sqlQuery += ` SET ${[...columns].map((column, index) => `${column} = ${values[index]}`).join(", ")}`;
            // Remove Last Comma
            if (this.#sqlQuery.endsWith(", "))
                this.#sqlQuery = this.#sqlQuery.substring(0, this.#sqlQuery.length - 2);
        }
        return this;
    }

    /**
     * @description Insert Statement
     * @memberof QueryBuilder
     * @param {array} columns 
     * @param {array} values 
     * @returns {QueryBuilder}
     */
    insert(columns, values) {
        // Resetting Query
        this.#sqlQuery = ""
        this.#currentStatement = QueryBuilder.statementType.INSERT;
        if (this.#table != undefined && this.#currentStatement == QueryBuilder.statementType.INSERT) {
            // Basic Query -> INSERT INTO Table (Columns) VALUES (Values)
            this.#sqlQuery += this.#currentStatement;
            this.#sqlQuery += ` INTO ${this.#table}`;
            this.#sqlQuery += ` (${[...columns]})`;
            this.#sqlQuery += ` VALUES (${[...values]})`;
        }
        return this;
    }

    /**
     * @description Delete Statement
     * @memberof QueryBuilder
     * @returns {QueryBuilder}
     */
    delete() {
        // Resetting Query
        this.#sqlQuery = ""
        this.#currentStatement = QueryBuilder.statementType.DELETE;
        if (this.#table != undefined && this.#currentStatement == QueryBuilder.statementType.DELETE) {
            // Basic Query -> DELETE FROM Table
            this.#sqlQuery += this.#currentStatement;
            this.#sqlQuery += ` FROM ${this.#table}`;
        }
        return this;
    }

    /**
     * @description Builds the Query and return it
     * @memberof QueryBuilder
     * @returns {string}
     */
    build() {
        // Statement End
        if (this.#currentStatement != "") {
            this.#sqlQuery += ";";
            const FinalQuery = this.#sqlQuery;
            this.#sqlQuery = "";
            this.#currentStatement = "";
            return FinalQuery;
        }
        return "";
    }
}

/**
 * @class Database
 * @description This class is responsible database Manipulation.
 * @author Dibesh Raj Subedi
 * @version 1.0.0
 * @references
 * 1. https://www.computerhope.com/issues/ch002076.htm
 * 1. https://www.sqlite.org/index.html
 * 1. https://www.linode.com/docs/guides/getting-started-with-nodejs-sqlite/
 */
class Database extends QueryBuilder {
    /**
     * @description Database Configuration 
     * @static
     * @memberof Database
     */
    static Configuration = {
        dbPath: `database/SQLite/`,
        scriptPath: `database/Script/`,
        developmentMode: process.env.WORK_ENV.includes("development")
    }

    /**
    * @description Embedding File System from SniperCode.Filesystem
    * @memberof Database
    * @instance SniperCode.Filesystem.File_System
    * @version 1.0.1
    * @static
    */
    static FileSystem = require('snipercode.filesystem').File_System;

    /**
     * @description Importing FileLogger
     * @static
     * @memberof Database
     */
    static FileLogger = require('../logger/lib.file.logger')

    /**
     * @description Importing SQLite3
     * @static
     * @memberof Database
     */
    static SQLite3 = require('sqlite3').verbose();

    /**
     * @description Executes a Shell Command
     * @static
     * @memberof Database
     */
    static Shell = require('child_process')

    /**
     * @description Sets the Database Name
     * @memberof Database
     * @param {string} databaseName 
     * @returns {Database}
     */
    #setDatabaseName(databaseName) {
        this.dbName = databaseName.replace(/\s+/g, '').trim();
        this.dbFileName = this.dbName + ".db";
        this.dbPath = `${Database.Configuration.dbPath}${this.dbFileName}`;
        return this;
    }

    /**
     * @description Configures Logger to Log Database Operations
     * @memberof Database
     * @param {number} maxSizeMb - Maximum Size of Log File in MB
     * @param {boolean} isConsole - Logs to Console
     * @returns {Database}
     */
    #configureLogger(maxSizeMb, isConsole) {
        this.Logger = new Database.FileLogger({
            name: "SqlLite",
            logType: Database.FileLogger.LogType.DATABASE,
            fileType: Database.FileLogger.FileTypes.LOG,
            maxSizeMb,
            isConsole
        });
        this.Query = new Database.FileLogger({
            name: "SqlQueries",
            logType: Database.FileLogger.LogType.DB_QUERY,
            fileType: Database.FileLogger.FileTypes.LOG,
            maxSizeMb,
            isConsole
        })
        return this;
    }

    /**
     * @description Creates a instance of Database
     * @memberof Database
     * @constructor
     * @param {{databaseName: "MySqlLiteDatabase", autoCreate: true}} configurations - {
     *     databaseName: "MySqlLiteDatabase",
     *     maxSizeMb: 5,
     *     isConsole: true
     * }
     */
    constructor(configurations = {
        databaseName: "MySqlLiteDatabase",
        maxSizeMb: 5,
        isConsole: true
    }) {
        super();
        this
            // Configuring Logger
            .#configureLogger(configurations.maxSizeMb, configurations.isConsole)
            // Setting Database Name
            .#setDatabaseName(configurations.databaseName)
            ;

        this
            // Creating Database
            .create()
            // Connecting Database
            .connectDatabase();
    }

    /**
     * @description Creates a new Database
     * @memberof Database
     * @returns {Database}
     */
    create() {
        // Checking if Database File Name has been set
        const fs = Database.FileSystem;
        if (!this.dbFileName) {
            this.Logger.log("🐞 Database File Name has not been set");
        } else {
            // Creating Directory if not exists
            if (!fs.dir_exists(Database.Configuration.dbPath)) {
                fs.mkdir(Database.Configuration.dbPath);
                this.Logger.cli.log(`📁 Directory Created: ${fs.path_resolve(Database.Configuration.dbPath)}`);
            }
            // Creating Database File if not exists
            if (!fs.file_exists(fs.path_resolve(this.dbPath))) {
                fs.write_file(this.dbPath, '');
                this.Logger.log(`💾 Database File Created:  file://${fs.path_resolve(this.dbPath).replace(/\\/g, '/')}`);
            }
        }
        // If File Exists
        if (fs.file_exists(fs.path_resolve(this.dbPath))) {
            // Run Terminal Command to execute scripts of Database in cmd
            const Child = Database.Shell.spawn(
                'cmd',
                [
                    '/c',
                    `SQLite3 ${this.dbPath} < ${Database.Configuration.scriptPath}${this.dbName}.sql`
                ]
            );
            Child
                .stdout
                .on('data', (data) => this.Logger.log(`📺 ${data}`))
                .on('data', (data) => this.Logger.log(`📺 ${data}`))
                .on('close', (code) => this.Logger.log(`📺 Child Process Closed with Code: ${code}`));
        }
        return this;
    }

    /**
     * @description Connects Database
     * @memberof Database
     * @returns {Database}
     */
    connectDatabase() {
        const fs = Database.FileSystem;
        // Checking if Database File Name has been set
        if (fs.file_exists(fs.path_resolve(this.dbPath))) {
            const SQLite = Database.SQLite3.Database;
            this.database = new SQLite(this.dbPath, Database.SQLite3.OPEN_READWRITE, (err) => {
                if (err) {
                    this.Logger.log(`🐞 ${err}`);
                } else {
                    [this.Logger, this.Logger.cli].forEach(db => db.log(`🌎 Database Connected : [${this.dbName}] at ${this.dbPath}`));
                }
            });
        } else
            this.Logger.log(`🐞 Database File Not Found: [${this.dbName}] at ${this.dbPath}`);
        return this;
    }

    /**
     * @description Disconnects Database
     * @memberof Database
     * @returns {Database}
     */
    disconnectDatabase() {
        this.database.close((err) => {
            if (err) this.Logger.cli.error(`💥 Error - `, err);
        });
        this.Logger.log(`🌎 Database Disconnected: [${this.dbName}] at ${this.dbPath}`)
        return this;
    }

    /**
     * @description Drops the Database Connection
     * @memberof Database
     * @returns {Database}
     */
    drop() {
        // Checking if Database File Name has been set
        if (!this.dbFileName) {
            this.Logger.log("🐞 Database File Name has not been set");
        } else {
            // Dropping the Connection first
            this.disconnectDatabase();
            const fs = Database.FileSystem;
            // Creating Directory if not exists
            if (fs.dir_exists(Database.Configuration.dbPath)) {
                fs.delete_dir(Database.Configuration.dbPath, true, true);
                this.Logger.cli.log(`📁 Directory Deleted: ${fs.path_resolve(Database.Configuration.dbPath)}`);
            }
        }
        return this;
    }

    /**
     * @description Executes a Query
     * @memberof Database
     * @param {string} SQLQuery 
     * @param {function} callback 
     */
    executeQuery(SQLQuery, callback) {
        this.Query.log(`📄 ${SQLQuery}`);
        if (SQLQuery.includes(QueryBuilder.statementType.SELECT))
            this.database.all(SQLQuery, (err, rows) => {
                if (err) {
                    this.Logger.log(`🐞 ${err.code} ${err} ${err.stack}\n`);
                    callback({
                        error: err,
                        rows: null,
                        status: false
                    });
                }
                else {
                    this.Logger.log(`📄 ${SQLQuery}`);
                    callback({
                        error: null,
                        rows: rows,
                        status: true
                    });
                }
            });
        else
            this.database
                .run(SQLQuery, (err) => {
                    if (err) {
                        this.Logger.log(`🐞 ${err.code} ${err} ${err.stack}\n`);
                        callback({
                            error: err,
                            status: false
                        });
                    } else {
                        this.Logger.log(`📄 ${SQLQuery}`);
                        callback({
                            error: null,
                            status: true
                        });
                    }
                });
    }
}

// Exporting Module
module.exports = {
    Database,
    QueryBuilder
}

/** 
 * COMMANDS:
 * 1- SQLite3
 * 2- .open dbPath (.open database/SQLite/ImageServer.db)
 * 3- .read scriptFile (.read database/Script/ImageServer.sql)
 * 4- .quit
 */