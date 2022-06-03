/**
 * @class FileMaths
 * @description FileMaths contains all the mathematical functions required for the application
 * @author Dibesh Raj Subedi
 * @version 1.0.0
 */
class FileMaths {
    /**
     * @description Converts number string to double digit if single
     * @memberof FileMaths
     * @param {int} num 
     * @returns string
     */
    static double_digit(num) {
        return num < 10 ? `0${num}` : '' + num;
    }
    /**
     * @description gets the current date in the format YYYYmmDD
     * @memberof FileMaths
     * @static
     */
    static get_date = `${new Date().getFullYear()}${FileMaths.double_digit(new Date().getMonth() + 1)}${FileMaths.double_digit(new Date().getDate())}`;
    /**
     * @description Converts mb to bytes
     * @memberof FileMaths
     * @param {float} mb 
     * @returns 
     */
    static mbToBytes(mb) {
        return mb * 1024 * 1024;
    };
    /**
     * @description Converts bytes to mb
     * @param {float} bytes
     * @memberof FileMaths
     * @returns {float}
     */
    static bytesToMb(bytes) {
        return bytes / 1024 / 1024;
    }
}
/**
 * @class FileLogger
 * @description FileLogger creates a specific log file with log version controlling and log file size controlling.
 * @author Dibesh Raj Subedi
 * @version 1.0.0
 */
class FileLogger {
    /**
     * @description Instance of FileLogger
     * @memberof FileLogger
     * @param {object} { name: "FileLogger", logType:FileLogger.LogType.ALL, fileType: FileLogger.FileTypes.LOG, maxSizeMb: 5, isConsole: false } 
     */
    constructor(configuration = { name: "FileLogger", logType: FileLogger.LogType.ALL, fileType: FileLogger.FileTypes.LOG, maxSizeMb: 5, isConsole: false }) {
        this
            .#initializeClass(configuration.name)
            .#initializeVariables(configuration.name, configuration.logType, configuration.fileType, configuration.maxSizeMb, configuration.isConsole)
            ;
    }
    /**
     * @description Cli Logger 
     * @memberof FileLogger
     * @static
     */
    static CLI = require('./lib.console.logger');
    /**
     * @description Embedding File System from SniperCode.Filesystem
     * @memberof FileLogger
     * @instance SniperCode.Filesystem.File_System
     * @version 1.0.1
     * @static
     */
    static FileSystem = require('snipercode.filesystem').File_System;
    /**
     * @description Mathematics for file related operations
     * @memberof FileLogger
     * @instance FileMaths
     * @version 1.0.0
     * @static
     */
    static fileMath = FileMaths;
    /**
     * @description File Types in which logs can be stored
     * @memberof FileLogger
     * @static
     */
    static FileTypes = {
        "JSON": ".json",
        "LOG": ".log",
    }
    /**
     * @description Log Types that can be invoked to store specific data
     * @memberof FileLogger
     * @static
     */
    static LogType = {
        "REQUEST": "request",
        "RESPONSE": "response",
        "ALL": "all",
        "DATABASE": "database",
        "DB_QUERY": "query",
    }
    /**
     * @description Initializes the classes required 
     * @memberof FileLogger
     * @private
     * @returns {FileLogger}
     */
    #initializeClass() {
        this.fs = FileLogger.FileSystem
        this.cli = new FileLogger.CLI('FileLogger');
        return this;
    }
    /**
     * @description Initialized the log variables
     * @memberof FileLogger
     * @param {string} name
     * @param {FileLogger.LogType} logType 
     * @param {FileLogger.FileTypes} fileType 
     * @param {float} maxSizeMb 
     * @param {boolean} isConsole 
     * @private
     * @returns {FileLogger}
     */
    #initializeVariables(name, logType, fileType, maxSizeMb, isConsole) {
        this
            .setBaseDir()
            .setFileType(fileType)
            .setLogType(logType)
            .setMaxFileSizeInMb(maxSizeMb)
            .setConsole(isConsole)
            .setupLogger(name)
            ;
        return this;
    }
    /**
     * @description Creates a new file name based on index
     * @memberof FileLogger
     * @param {int} index 
     * @returns  {string}
     */
    #newFileName(index) {
        // Check less than 10
        if (index < 10)
            return `${this.base_dir}${this.currentLogType}/${this.currentLogType}_${FileMaths.double_digit(index)}_${FileLogger.fileMath.get_date}${this.currentFileType}`;
        else
            return `${this.base_dir}${this.currentLogType}/${this.currentLogType}_${index}_${FileLogger.fileMath.get_date}${this.currentFileType}`;
    }
    /**
     * @description Sets the file type to be used
     * @memberof FileLogger
     * @param {FileLogger.FileTypes} fileType 
     * @returns {FileLogger}
     */
    setFileType(fileType = FileLogger.FileTypes.LOG) {
        this.currentFileType = fileType;
        return this;
    }
    /**
     * @description Sets the file type to be used
     * @memberof FileLogger
     * @param {FileLogger.LogType} logType 
     * @returns {FileLogger}
     */
    setLogType(logType = FileLogger.LogType.REQUEST) {
        this.currentLogType = logType;
        return this;
    }
    /**
     * @description Sets the max file size in MB
     * @memberof FileLogger
     * @param {float} maxSizeMb 
     * @returns {FileLogger}
     */
    setMaxFileSizeInMb(maxSizeMb = 0.5) {
        this.maxSizeMb = maxSizeMb;
        return this;
    }
    /**
     * @description Flag to set log on console
     * @memberof FileLogger
     * @param {boolean} isConsole 
     * @returns {FileLogger}
     */
    setConsole(isConsole = true) {
        this.isConsole = isConsole;
        return this;
    }
    /**
     * @description Sets the base directory for the log files
     * @memberof FileLogger
     * @param {string} dir 
     * @returns {FileLogger}
     */
    setBaseDir(dir = "./logs/") {
        this.base_dir = dir;
        return this;
    }
    /**
     * @description Sets Name to cli and Logger
     * @memberof FileLogger
     * @param {string} name 
     * @returns {FileLogger}
     */
    setName(name) {
        this.cli.setName(name);
        return this;
    }
    /**
     * @description Setups Logger for the first time if not already setup
     * @param {string} name
     * @memberof FileLogger
     * @returns {FileLogger}
     */
    setupLogger(name) {
        if (!this.fs.dir_exists(this.base_dir))
            this.resetBaseDirectory();
        else
            this.createNewFile();
        this.cli.log(`🔧 Log file '${name}' setup complete.`, FileLogger.CLI.Colors.yellow);
        this.setName(name)
        return this;
    }
    /**
     * @description Resets the base directory by deleting the directory and creating a new one
     * @memberof FileLogger
     * @returns {FileLogger}
     */
    resetBaseDirectory() {
        this
            .deleteBaseDirectory()
            .createAllLogDirectories()
            .createNewFile()
            ;
        return this;
    }
    /**
     * @description Creates the directory if it does not exist
     * @memberof FileLogger
     * @returns {FileLogger}
     */
    createAllLogDirectories() {
        // Create a directory logs if it doesn't exists
        if (!this.fs.dir_exists(this.base_dir)) {
            this.cli.log(`📂 Directory created - file://${this.fs.path_resolve(this.base_dir).replace(/\\/g, '/')}`);
            this.fs.mkdir(this.base_dir);
        }
        // Create a directory for the log type if it doesn't exists
        for (const type in FileLogger.LogType) {
            if (Object.hasOwnProperty.call(FileLogger.LogType, type)) {
                const typeName = FileLogger.LogType[type];
                // Create a directory for the log type if it doesn't exists
                if (!this.fs.dir_exists(this.base_dir + typeName)) {
                    if (this.currentLogType === typeName) {
                        this.fs.mkdir(this.base_dir + typeName);
                        this.cli.log(`📂 Directory created - file://${this.fs.path_resolve(this.base_dir + typeName).replace(/\\/g, '/')}`);
                    }
                }
            }
        }
        return this;
    }
    /**
     * @description Deletes the base directory
     * @memberof FileLogger
     * @returns {FileLogger}
     */
    deleteBaseDirectory() {
        if (this.fs.dir_exists(this.base_dir)) {
            this.fs.delete_dir(this.base_dir, true, true);
            this.cli.log(`📂 Directory deleted - ${this.fs.path_resolve(this.base_dir).replace(/\\/g, '/')}`, FileLogger.CLI.Colors.red);
        }
        return this;
    }
    /**
     * @description Scans the base directory and returns the files in the directory
     * @memberof FileLogger
     * @returns {FileLogger}
     */
    scanLogDirectory() {
        this.scannedDirectories = this.fs.scan_dir_recursive_depth(this.base_dir, 3);
        return this;
    }
    /**
     * @description Creates a new file
     * @memberof FileLogger
     * @param {string} fileName 
     * @param {FileLogger.FileTypes} fileType 
     * @returns  {FileLogger}
     */
    newFile(fileName, fileType = this.currentFileType) {
        if (fileType === FileLogger.FileTypes.LOG) {
            this.fs.write_file(fileName, "");
            this.cli.log(`📄 File created - file://${this.fs.path_resolve(fileName).replace(/\\/g, '/')}`);
        }
        else if (fileType === FileLogger.FileTypes.JSON) {
            this.fs.write_file(fileName, '[]');
            this.cli.log(`📄 File created - file://${this.fs.path_resolve(fileName).replace(/\\/g, '/')}`);
        }
        return this;
    }
    /**
     * @description Updates details of selectedLogType
     * @memberof FileLogger
     * @returns {FileLogger}
     */
    updateSelectedLogDirectory() {
        for (const dirIndex in this.scannedDirectories.dir) {
            if (Object.hasOwnProperty.call(this.scannedDirectories.dir, dirIndex)) {
                const directory = this.scannedDirectories.dir[dirIndex];
                // Undefined LogType check
                if (directory[this.currentLogType] !== undefined) {
                    // Selecting currentLogType
                    this.selectedLog = directory;
                    this.selectedLog.dir = this.currentLogType;
                    this.selectedLog.file = this.selectedLog['file'] != undefined ? this.selectedLog['file'] : [];
                    this.selectedLog.JSON = this.selectedLog['file'] != undefined ? this.selectedLog['file'].filter(x => x.includes(FileLogger.FileTypes.JSON)) : [];
                    this.selectedLog.LOG = this.selectedLog['file'] != undefined ? this.selectedLog['file'].filter(x => x.includes(FileLogger.FileTypes.LOG)) : [];
                    this.selectedLog.currentFile =
                        this.currentFileType === FileLogger.FileTypes.JSON ?
                            this.selectedLog.JSON.length != 0 ?
                                `${this.base_dir}${this.currentLogType}/${this.selectedLog.JSON[this.selectedLog.JSON.length - 1]}` :
                                '' :
                            this.currentFileType === FileLogger.FileTypes.LOG ?
                                this.selectedLog.LOG.length != 0 ?
                                    `${this.base_dir}${this.currentLogType}/${this.selectedLog.LOG[this.selectedLog.LOG.length - 1]}` :
                                    '' :
                                '';
                    ;
                    this.selectedLog.currentFileType = this.currentFileType === FileLogger.FileTypes.JSON ? "JSON" : "LOG";
                }
            }
        }
        return this;
    }
    /**
     * @description Creates a new file if it does not exist or file size is over the limit
     * @memberof FileLogger
     * @returns {FileLogger}
     */
    createNewFile() {
        this
            // create Directory First
            .createAllLogDirectories()
            // scan the directory
            .scanLogDirectory()
            // update the selected log directory
            .updateSelectedLogDirectory()
            ;
        // Create a new File if it doesn't exists
        if (this.selectedLog.currentFile === "" || (this.selectedLog.JSON.length === 0 && this.selectedLog.LOG.length === 0)) {
            this
                // Create Log File
                .newFile(this.#newFileName(1), this.currentFileType)
                // Scan the directory
                .scanLogDirectory()
                // Update the selected log directory
                .updateSelectedLogDirectory();
        }
        // File exists Check if size is full, if true create a new file
        else if (this.selectedLog.currentFile !== "") {
            // Checking if is Full
            if (this.fs.file_size(this.selectedLog.currentFile) >= FileLogger.fileMath.mbToBytes(this.maxSizeMb))
                this
                    // Create Log File
                    .newFile(this.#newFileName(this.selectedLog[this.selectedLog.currentFileType].length + 1), this.currentFileType)
                    // Scan the directory
                    .scanLogDirectory()
                    // Update the selected log directory
                    .updateSelectedLogDirectory();
        }
        return this;
    }
    /**
     * @description Writes the log to the file
     * @memberof FileLogger
     * @param {string|object} message 
     * @returns {FileLogger}
     */
    writeLog(message) {
        // Create a new File if it doesn't exists
        this.createNewFile()
            .updateSelectedLogDirectory();
        // Structure Stored Message
        const DateStamp = new Date().toLocaleString(),
            FileName = this.cli.name();
        // Write to JSON file
        if (this.currentFileType === FileLogger.FileTypes.JSON) {
            // Read File and Store in Buffer
            const buffer = this.fs.read_file(this.selectedLog.currentFile);
            // Check if file isNot empty
            if (buffer.length !== 0) {
                // Parse Buffer to JSON
                const json = JSON.parse(buffer);
                // Push new message to JSON
                json.push({
                    "Date": DateStamp,
                    "File": FileName,
                    "Message": message.length == 1 ? message[0] : message
                });
                // Write to File
                this.fs.write_file(this.selectedLog.currentFile, JSON.stringify(json));
            } else {
                // Push new message to File
                this.fs.write_file(this.selectedLog.currentFile, JSON.stringify([{
                    "Date": DateStamp,
                    "File": FileName,
                    "Message": message.length == 1 ? message[0] : message
                }]));
            }
        }
        // Write to LOG file
        else if (this.currentFileType === FileLogger.FileTypes.LOG) {
            const messageData = `${FileName}: ${DateStamp} - ${message}\n`;
            this.fs.append_file(this.selectedLog.currentFile, messageData);
        }
        return this;
    }
    /**
     * @description Logs the message to the file and cli
     * @memberof FileLogger
     * @param  {...any} message 
     * @returns {FileLogger}
     */
    log(...message) {
        if (this.isConsole) this.cli.log(message);
        this.writeLog(message);
        return this;
    }
}
module.exports = FileLogger;