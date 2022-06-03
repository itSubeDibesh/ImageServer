// Configuration Variable
var isDatabaseSet = false, Database;
/**
 * @class Utility
 * @description This class is responsible for managing utility
 * @author Dibesh Raj Subedi
 * @version 1.0.0
 */
class Utility {
    /**
    * @description Importing Rate Limiter
    */
    static RateLimit = require('express-rate-limit')
    /**
     * @description Importing Express
     */
    static Express = require('express')
    /**
    * @description Importing FileLogger
    */
    static FileLogger = require('../logger/lib.file.logger')
    /**
    * @description Importing FileLogger
    */
    static ServerConfig = require('../../configuration/server.json')
    /** 
     * @description Import Database
     */
    static SQLite = require('../database/lib.database.sqlite')
    /** 
     * @description Import Crypto
     */
    static Crypto = require('crypto')
    /** 
     * @description Import Express Validator
     */
    static ExpressValidator = require('express-validator')
    /**
     * @description Converts MilliSeconds to Seconds
     * @param {number} milliSeconds 
     * @returns {number}
     */
    static msToS = function (milliSeconds) {
        return milliSeconds / 1000;
    }
    /**
      * @description Returns The Request Rate Limiter as per configuration -> use in Request header
      * @summary Allows to send max request within defined windowMs
      * @param {number} windowMs -( 1e3*60*15) in MilliSeconds 
      * @param {number} max - (10) per window
      * @param {boolean} standardHeaders - true
      * @param {boolean} legacyHeaders  - false
      * @returns {object}
      */
    static setRequestLimiter = function (windowMs = (1e3 * 60 * 15), max = 10, standardHeaders = true, legacyHeaders = false) {
        return Utility.RateLimit({
            max, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
            windowMs, // 15 minutes
            standardHeaders, // Return rate limit info in the `RateLimit-*` headers
            legacyHeaders, // Disable the `X-RateLimit-*` headers
            message: {
                status: 429,
                message: `Too Many Requests, Please try again after ${msToS(windowMs) / 60} minutes.`
            }
        })
    }
    /**
     * @description Hash the given string
     * @param {string} stream -> Stream to be hashed
     * @returns {string}
     */
    static SHA_512 = function (stream) {
        return Utility.Crypto.createHash('sha512').update(stream).digest('hex');
    }
    /**
     * @description This method holds server mode
     * @static
     * @memberof Utility
     */
    static DevelopmentEnv = process.env.WORK_ENV.includes("development")
    /**
     * @description This method holds router
     * @static
     * @memberof Utility
     */
    static Router = Utility.Express.Router
    /**
     * This method holds Responser Logger
     * @static
     * @memberof Utility
     */
    static ResponseLogger() {
        return new Utility.FileLogger({
            name: "Response",
            logType: Utility.FileLogger.LogType.RESPONSE,
            fileType: Utility.FileLogger.FileTypes.LOG,
            maxSizeMb: Utility.ServerConfig.logger.maxLogSize,
            isConsole: Utility.ServerConfig.logger.logInConsole
        })
    }
    /**
     * This method holds Request Logger
     * @static
     * @memberof Utility
     */
    static RequestLogger() {
        return new Utility.FileLogger({
            name: "Request",
            logType: Utility.FileLogger.LogType.REQUEST,
            fileType: Utility.FileLogger.FileTypes.LOG,
            maxSizeMb: Utility.ServerConfig.logger.maxLogSize,
            isConsole: Utility.ServerConfig.logger.logInConsole
        })
    }
    /**
     * @description Holds Query Builder
     * @static
     * @memberof Utility
     */
    static QueryBuilder = Utility.SQLite.QueryBuilder;
    /**
     * @static Sets the Database
     * @memberof Utility
     * @returns {object}
     */
    static setDatabase() {
        if (!isDatabaseSet) {
            isDatabaseSet = true;
            Database = new Utility.SQLite.Database({
                databaseName: Utility.ServerConfig.database.scriptName,
                maxSizeMb: Utility.ServerConfig.logger.maxLogSize,
                isConsole: Utility.ServerConfig.logger.logInConsole
            });
        }
        return Database;
    }
    /**
     * @static Gets the Database
     * @memberof Utility
     * @returns {object}
     */
    static getDatabase() {
        return Utility.getDatabase()
    }
}
// Exporting Module
module.exports = Utility;