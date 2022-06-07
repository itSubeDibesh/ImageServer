// Configure a Mail Client
// Create MAIL Payload Replacing SUBJECT, USER, TITLE, MESSAGE  -> Bootstrap HTML Text

/**
 * @class Email
 * @description Email class to send emails
 * @author Dibesh Raj Subedi
 * @version 1.0.0
 */
class Email {
    /**
     * @description Importing NodeMailer
     * @memberof Utility
     */
    static NodeMailer = require('nodemailer');
    /**
     * @description Embedding File System from SniperCode.Filesystem
     * @memberof Utility
     * @instance SniperCode.Filesystem.File_System
     * @version 1.0.1
     * @static
     */
    static FileSystem = require('snipercode.filesystem').File_System;
    /**
     * @description Importing Configurations
     * @memberof Utility
     */
    static ServerConfig = require('../../configuration/server.json')
    /**
    * @description Importing FileLogger
    * @memberof Utility
    */
    static FileLogger = require('../logger/lib.file.logger')
    /**
     * @description Extracting Template
     * @memberof Email
     * @returns {Email}
     */
    #extractTemplate() {
        this.templateString = Email.FileSystem.read_file('template/Email.html')
        return this;
    }
    /**
     * @description Configure a Mail Client
     * @memberof Email
     * @returns {Email}
     */
    #configureMailClient() {
        const { from, appName, secure, port, host, priority, auth } = Email.ServerConfig.mail;
        this.From = from;
        this.AppName = appName;
        this.Transport = Email.NodeMailer.createTransport({
            // SMTP Config
            priority,
            host,
            port,
            secure,
            auth
        })
        this.Logger = new Email.FileLogger(
            {
                name: "Server",
                logType: Email.FileLogger.LogType.ALL,
                fileType: Email.FileLogger.FileTypes.LOG,
                maxSizeMb: Email.ServerConfig.logger.maxLogSize,
                isConsole: Email.ServerConfig.logger.logInConsole
            }
        )
        return this;
    }
    /**
     * @constructor
     * @description Creates an instance of Email.
     * @memberof Email
     */
    constructor() {
        this
            .#configureMailClient()
            .#extractTemplate();
    }
    /**
     * @description Resets Email Parameters
     * @memberof Email
     * @returns {Email}
     */
    resetContents() {
        this.EmailPayload = '';
        return this;
    }
    /**
     * @description Send Email
     * @param {string} Subject - Subject of the Email
     * @param {string} EmailAddress - Email Address of the Recipient
     * @param {string} User - User to Send
     * @param {string} Title - Title of the Email
     * @param {string} Message - HTML Text
     * @memberof Email
     * @returns {boolean} - Returns true if Email is sent
     */
    sendEmail(Subject, EmailAddress, User, Title, Message) {
        // Resetting Content
        this.resetContents()
        // Creating Email Payload
        Message = Message ? Message : '';
        let EmailPayload = this.templateString.replace('{{SUBJECT}}', Subject).replace('{{USER}}', User).replace('{{TITLE}}', Title).replace('{{MESSAGE}}', Message);
        // Sending Email
        this.Transport.sendMail(
            // Email Config
            {
                from: `"${this.AppName}" <${this.From}>`,
                to: `"${User}" <${EmailAddress}>`,
                subject: Subject,
                html: EmailPayload
            },
            // Callback
            (error, info) => {
                if (error) {
                    this.Logger.log(`✉ Error in sending Email to ${EmailAddress} With [${error.message}] And ${error.stack}`);
                }
                if (info) {
                    this.Logger.log(`✉ Email sent to ${EmailAddress} with [${JSON.stringify(EmailPayload)}]`);
                }
            }
        )
    }
}
// Exporting The Module
module.exports = Email;