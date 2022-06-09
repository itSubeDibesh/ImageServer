// Configuration Variable
var
    isDatabaseSet = false,
    Database
    ;
/**
 * @class Utility
 * @description This class is responsible for managing utility
 * @author Dibesh Raj Subedi
 * @version 1.0.0
 */
class Utility {
    /**
    * @description Importing Csrf
    */
    static Csurf = require('csurf')
    /**
     * A CSRF protection middleware used on Methods that require CSRF protection
     * @static
     * @memberof Utility
     */
    static csrfProtection = Utility.Csurf({ cookie: true, sameSite: 'strict', secure: true });
    /**
    * @description Importing Rate Limit
    * @memberof Utility
    */
    static RateLimit = require('express-rate-limit')
    /**
     * @description Importing Express
     * @memberof Utility
     */
    static Express = require('express')
    /**
    * @description Importing FileLogger
    * @memberof Utility
    */
    static FileLogger = require('../logger/lib.file.logger')
    /**
    * @description Importing FileLogger
    * @memberof Utility
    */
    static ServerConfig = require('../../configuration/server.json')
    /** 
     * @description Import Database
     * @memberof Utility
     */
    static SQLite = require('../database/lib.database.sqlite')
    /** 
     * @description Import Crypto
     * @memberof Utility
     */
    static Crypto = require('crypto')
    /**
   * @description Import Mailer
   * @memberof Utility
   */
    static Mailer = require('../mail/lib.mailer.node')
    /**
   * @description Creating Mail Handel
   * @memberof Utility
   */
    static MailHandel = new Utility.Mailer()
    /** 
     * @description Import Express Validator
     * @memberof Utility
     */
    static ExpressValidator = require('express-validator')
    /**
     * @description Converts MilliSeconds to Seconds
     * @param {number} milliSeconds 
     * @returns {number}
     * @memberof Utility
     */
    static msToS = function (milliSeconds) {
        return milliSeconds / 1e3;
    }
    /**
     * @description Converts Min to MilliSeconds
     * @param {number} milliSeconds 
     * @returns {number}
     * @memberof Utility
     */
    static minToMs = function (minutes) {
        return minutes * 6e4;
    }
    /**
      * @description Returns The Request Rate Limiter as per configuration -> use in Request header
      * @summary Allows to send max request within defined windowMs
      * @param {number} windowMs -( 1e3*60*15) in MilliSeconds 
      * @param {number} max - (10) per window
      * @param {boolean} standardHeaders - true
      * @param {boolean} legacyHeaders  - false
      * @returns {object}
      * @memberof Utility
      */
    static setRequestLimiter = function (windowMs = (1e3 * 60 * 15), max = 10, standardHeaders = true, legacyHeaders = false) {
        return Utility.RateLimit({
            max, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
            windowMs, // 15 minutes
            standardHeaders, // Return rate limit info in the `RateLimit-*` headers
            legacyHeaders, // Disable the `X-RateLimit-*` headers
            handler: function (request, response, options) {
                let
                    Payload = {
                        success: false,
                        status: "error",
                        result: `Too Many Requests, Please try again after ${Utility.msToS(windowMs) / 60} minutes.`,
                        data: {
                            timeout: windowMs
                        }
                    },
                    statusCode = 429,
                    statusMessage = "Too Many Requests";
                // Logging the response
                Utility.ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                // Sending the response
                response.status(statusCode).send(Payload);
            }
        })
    }
    /**
     * @description Hash the given string
     * @param {string} stream -> Stream to be hashed
     * @returns {string}
     * @memberof Utility
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
    static ResponseLogger = new Utility.FileLogger({
        name: "Response",
        logType: Utility.FileLogger.LogType.RESPONSE,
        fileType: Utility.FileLogger.FileTypes.LOG,
        maxSizeMb: Utility.ServerConfig.logger.maxLogSize,
        isConsole: Utility.ServerConfig.logger.logInConsole
    })
    /**
     * This method holds Request Logger
     * @static
     * @memberof Utility
     */
    static RequestLogger = new Utility.FileLogger({
        name: "Request",
        logType: Utility.FileLogger.LogType.REQUEST,
        fileType: Utility.FileLogger.FileTypes.LOG,
        maxSizeMb: Utility.ServerConfig.logger.maxLogSize,
        isConsole: Utility.ServerConfig.logger.logInConsole
    })
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
        return Utility.setDatabase()
    }
    /**
     * @static Returns Random String
     * @param {number} length 
     * @returns {string}
     */
    static RandomString = function (length) {
        // Generate Random String
        const
            possibleUpperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            possibleLowerCase = possibleUpperCase.toLowerCase(),
            possibleNumbers = "0123456789",
            possibleSpecialChars = "@$#";
        let text = "";
        for (let i = 0; i < length; i++) {
            let random = Math.floor(Math.random() * 4);
            switch (random) {
                case 0:
                    text += possibleUpperCase.charAt(Math.floor(Math.random() * possibleUpperCase.length));
                    break;
                case 1:
                    text += possibleLowerCase.charAt(Math.floor(Math.random() * possibleLowerCase.length));
                    break;
                case 2:
                    text += possibleNumbers.charAt(Math.floor(Math.random() * possibleNumbers.length));
                    break;
                case 3:
                    text += possibleSpecialChars.charAt(Math.floor(Math.random() * possibleSpecialChars.length));
                    break;
            }
        }
        return text;
    }
}
// Exporting Module
module.exports = Utility;