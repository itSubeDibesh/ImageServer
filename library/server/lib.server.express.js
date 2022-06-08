var
    /**
     * @description Importing Packages
     * @memberof Server
     */
    Packages = {
        /**
         * @description Importing Utils
         */
        Utils: require('./lib.utility.express'),
        /**
         * @description Importing Multer
         */
        Multer: require('multer'),
        /**
         * @description Importing Swagger
         * @references https://javascript.plainenglish.io/how-to-implement-and-use-swagger-in-nodejs-d0b95e765245
         */
        Swagger: {
            swaggerUI: require('swagger-ui-express'),
            swaggerJsDoc: require('swagger-jsdoc'),
        },
        /**
         * @description Importing FileLogger
         */
        FileLogger: require('../logger/lib.file.logger'),
        /**
         * @description Importing OS
         */
        System: require('os'),
        /**
         * @description Importing Express
         */
        Express: require('express'),
        /**
        * @description Importing Connect-History-Api-Fallback
        */
        History: require('connect-history-api-fallback'),
        /**
         * @description Importing Cors
         */
        Cors: require('cors'),
        /**
         * @description Importing Express-Session
         */
        Session: require('express-session'),
        /**
         * @description Importing Cookie Parser 
         */
        CookieParser: require('cookie-parser'),
        /**
         * @description Importing Helmet 
         */
        Helmet: require('helmet'),
        /**
         * @description Importing Xss Clean 
         */
        XSS: require('xss-clean'),
    },
    /**
     * @description Importing  Middleware
     * @memberof Server
     */
    MiddleWare = {
        /**  
         * @description Importing SQLInjection Middleware
         */
        SQLInjection: require('../server/middleware/lib.injection.filter.sql').filter,
        /** 
         * @description Importing AccessControl Middleware
         */
        AccessControl: require('../server/middleware/lib.access.control').control,
        /**
         * @description Importing ReCaptcha Middleware
         */
        ReCaptcha: require('./middleware/lib.recaptcha.google').captcha,
    },
    /**
     * @description Importing Configurations
     * @memberof Server
     */
    Configurations = {
        /**
         * @description Importing Server Configuration
         */
        Server: Packages.Utils.ServerConfig,
        /**
         * @description Importing Swagger Configuration
         */
        Swagger: require('../../configuration/swagger.json')
    }
    ;
/**
 * @class Server
 * @description Server that serves the application
 * @author Dibesh Raj Subedi
 * @version 1.0.0
 */
class Server {
    /**
     * @description Extracts Logger
     * @memberof Server
     * @returns {Server}
     */
    #extractLogger() {
        const { Utils, Express, FileLogger } = Packages;
        // Setting Logger
        this.Logger = new FileLogger(
            {
                name: "Server",
                logType: FileLogger.LogType.ALL,
                fileType: FileLogger.FileTypes.LOG,
                maxSizeMb: Configurations.Server.logger.maxLogSize,
                isConsole: Configurations.Server.logger.logInConsole
            }
        )
        this.Response = Utils.ResponseLogger;
        this.Request = Utils.RequestLogger;
        // Setting Express
        this.server = Express();
        return this;
    }

    /**
     * @description Extract Image Configurations
     * @memberof Server
     * @returns {Server}
     */
    #extractImageConfigurations() {
        const
            // Config Extraction
            Config = Configurations.Server.image,
            // Multer Configuration
            imageStorage = Packages.Multer.diskStorage({
                destination: (req, file, cb) => {
                    // CREATE DIRECTORY IF NOT EXISTS
                    const
                        fs = Packages.FileLogger.FileSystem,
                        // Default TEMP Directory of SYSTEM
                        PATH = `${Packages.System.tmpdir()}\\IMAGE_SERVER\\${new Date().toISOString().split('T')[0].replace(/-/g, '')}\\`;
                    if (!fs.dir_exists(PATH))
                        fs.mkdir(PATH);
                    cb(null, PATH);
                },
                filename: (req, file, cb) => {
                    const
                        fileExtension = file.originalname.split('.').pop(),
                        uniqueSuffix = new Date().toISOString().split('T')[0].replace(/-/g, '') + '_' + Math.round(Math.random() * 1E9);
                    cb(null, file.originalname.split(`.${fileExtension}`)[0] + '_' + uniqueSuffix + "." + fileExtension);
                }
            });
        // Configuring Multer Image Uploader 
        this.imageUploader = Packages.Multer({
            storage: imageStorage,
            fileFilter: (req, file, cb) => cb(null, Config.extensions.includes(file.originalname.split('.').pop().toLowerCase())),
            limits: {
                fileSize: Config.maxFileSize,
                files: Config.maxUploads,
            },
        })
        return this;
    }

    /**
     * @description define server variables
     * @memberof Server
     * @returns {Server}
     */
    #defineServerVariables() {
        const Config = Configurations.Server
        this.enableLogging = Config.logger.enableLogger;
        this.PORT = process.env.PORT || Config.server.PORT || 8080;
        this.isHttp = Config.server.isHttp;
        this.preventSqlInjection = Config.server.preventions.sqLInjection;
        this.enableAccessControl = Config.server.preventions.enableAccessControl;
        this.enableReCaptcha = Config.server.preventions.enableReCaptcha;
        this.setRequestLimit = false;
        if (Config.server.preventions.limitRequest.state) {
            const { request, periodInMs } = Config.server.preventions.limitRequest.limit
            this.requestLimit = Packages.Utils.setRequestLimiter(periodInMs, request);
            this.setRequestLimit = true;
        }
        // Check if production mode
        this.isDevelopmentMode = Packages.Utils.DevelopmentEnv;
        // Check if production file exists
        this.productionFileExists = Packages.FileLogger.FileSystem.dir_exists('./public');
        // Check if  Development mode and production file exists then delete the production file
        if (this.isDevelopmentMode) {
            const Fs = Packages.FileLogger.FileSystem;
            if (this.productionFileExists) Fs.delete_dir('./public', true, true);
        }
        // Removing Temporary Files
        Packages.FileLogger.FileSystem.delete_dir(`${Packages.System.tmpdir()}\\IMAGE_SERVER\\${new Date().toISOString().split('T')[0].replace(/-/g, '')}\\`, true, true);
        this.Logger.log(`📡 Server is running in ${this.isDevelopmentMode ? 'Development' : 'Production'} mode`);
        // Extracting Multer Configuration
        return this.#extractImageConfigurations();
    }

    /**
    * @description Logs requests
    * @memberof Server
    * @returns {Server}
    */
    #logRequests() {
        if (this.enableLogging) {
            this
                .server
                .use((req, res, next) => {
                    // Define Payload
                    const payload = {
                        Security_Type: (req.secure ? 'Secured' : 'Unsecured').toUpperCase(),
                        Type: req.method, URL: `${req.protocol}://${req.headers.host}${req.url}`,
                        IP: req.headers['x-forwarded-for'] || req.connection.remoteAddress, HEADERS: req.headers
                    };
                    // Log the request on JSON file
                    if (this.Logger.currentFileType === Packages.FileLogger.FileTypes.JSON) {
                        // Extract Body
                        if (typeof (req.body) == "object" && Object.keys(req.body).length != 0)
                            payload.BODY = req.body
                        // Extract Files
                        if (typeof (req.files) == "object" && Object.keys(req.files).length != 0) {
                            payload.Files = req.files
                            payload.Files.forEach((file, index) => {
                                payload.Files[index].dateStamp = new Date().toISOString().split('T')[0].replace(/-/g, '')
                            });
                        }
                        [this.Request, this.Logger].forEach(logger => logger.log(payload));
                    }
                    // Log the request on LOG file
                    else {
                        let File = [];
                        // Extract Files
                        if (typeof (req.files) == "object" && Object.keys(req.files).length != 0) {
                            req.files.forEach(file => {
                                File.push({
                                    fieldname: file.fieldname,
                                    originalname: file.originalname,
                                    encoding: file.encoding,
                                    mimetype: file.mimetype,
                                    size: file.size,
                                    dateStamp: new Date().toISOString().split('T')[0].replace(/-/g, '')
                                })
                            })
                        }
                        // Inline Logging
                        [this.Request, this.Logger].forEach(logger => logger.log(`📶 ${(req.secure ? 'Secured' : 'Unsecured').toUpperCase()} ${req.method} REQUEST ON ${req.protocol}://${req.headers.host}${req.url} FROM IP [${req.headers['x-forwarded-for'] || req.connection.remoteAddress}] with HEADERS [${JSON.stringify(req.headers)}] ${typeof (req.body) == "object" && Object.keys(req.body).length != 0 ? 'and BODY [' + JSON.stringify(req.body) + ']' : ' '} ${typeof (req.files) == "object" && Object.keys(req.files).length != 0 ? 'and FILES [' + JSON.stringify(File) + ']' : ' '}`));
                    }
                    // Making other middleware calls
                    next();
                })
                // Logging Errors
                .use((err, req, res, next) => {
                    // Define payload
                    const payload = { Error: { Message: err.message, Stack: err.stack, Code: err.statusCode } };
                    // Log on Files
                    this.Logger.log(this.Logger.currentFileType === Packages.FileLogger.FileTypes.JSON ? payload : err.stack)
                    // Error Checking
                    if (err) {
                        this.Response.log(`✉ [500 Internal Error] with PAYLOAD [${JSON.stringify({ success: !1, status: 500, result: err.message })}]`);
                        // Send response
                        res.status(500).send({ success: !1, status: 500, result: err.message });
                    }
                    // Making other middleware calls
                    else next();
                })
        }
        return this;
    }

    /**
     * @description Activates the HTTPS server with defined configuration
     * @memberof Server
     * @returns {Server}
     */
    async #activateHttp() {
        const
            { XSS, Helmet, Cors, Session, Express, CookieParser, History } = Packages,
            { SQLInjection, AccessControl, ReCaptcha } = MiddleWare;
        // Check if the Frontend build is completed
        this.server
            // Hiding the server information
            .disable('x-powered-by')
            // Preventing XSS Attacks
            .use(XSS())
            // Using Helmet to configure security headers
            .use(Helmet())
            // Setting UP Cors for Cross Origin Resource Sharing
            .use(Cors({
                origin: `http://localhost:${this.PORT}`,
            }))
            // Session Config if needed
            .use(Session(this.#setSessionConfiguration()))
            // Parse requests of content-type - application/json
            .use(Express.json())
            // Parse requests of content-type - application/x-www-form-urlencoded
            .use(Express.urlencoded({ extended: true }))
            //  Parse Cookie for Server
            .use(CookieParser())
            // Setting Multer For Image Uploads
            .use(this.imageUploader.any());
        // Preventing Sql Injection Attacks
        if (this.preventSqlInjection) this.server.use(SQLInjection());
        // Enabling Access Control
        if (this.enableAccessControl) this.server.use(AccessControl());
        // Enabling ReCaptcha
        if (this.enableReCaptcha) this.server.use(await ReCaptcha());
        // Setting Request Limit
        if (this.setRequestLimit) this.server.use(this.requestLimit);
        // Checking if its Production Mode and Production Files Exists
        if (this.productionFileExists && !this.isDevelopmentMode) {
            this.server
                // Making SAP Routes Available using History API
                .use(History({
                    verbose: this.isDevelopmentMode,
                    rewrites: [
                        // Rewriting API Routs for SAP -> Vue 
                        {
                            from: /^\/api\/.*$/,
                            to: function (context) {
                                return context.parsedUrl.path
                            }
                        }
                    ]
                }))
                ;
        } else
            this.Logger.cli.warn(`🌎 Frontend not built. Make sure you are in production mode`);
        return this;
    }

    /**
     * @description Sets Session Configuration 
     * @memberof Server
     * @returns {object}
     */
    #setSessionConfiguration() {
        // Session Configuration Extraction
        const { name, secret, resave, saveUninitialized, cookieMaxAge, secureCookie } = Configurations.Server.server.session;
        return {
            name,
            // Session Secret
            secret,
            resave,
            saveUninitialized,
            store: new Packages.Session.MemoryStore(),
            cookie: {
                // Cookie Expiry in Milliseconds (7 Days)
                maxAge: cookieMaxAge,
                // Cookie is only available to the same domain
                secure: secureCookie
            }
        }
    }

    /**
     * @description Handle Routes for HTTP 
     * @memberof Server
     * @returns {Server}
     */
    #handleHttpRoutes() {
        // HTTP CONFIGURATIONS
        if (this.isHttp) {
            // Router Imports 
            const { ApiRouter, WebRouter } = require('../../backend/router');
            // API ROUTER CONFIGURATION
            this.Logger.log(`🛠 Configuring HTTP Routes`);
            const Router = [ApiRouter];
            if (this.isDevelopmentMode)
                Router.push(WebRouter);
            Router.forEach(router =>
                // Instantiating and Configuring the Router
                new router(this).setUpControllers());
        } else
            this.Logger.cli.log(`HTTP Server is disabled`);
        return this;
    }

    /**
     * @description Handle Static File Requests for HTTP
     * @memberof Server
     * @returns {Server}
     */
    #handelHttpStatic() {
        // Configure other Frontend files
        if (this.productionFileExists && !this.isDevelopmentMode)
            this.server
                // Serving the Frontend Compiled Files
                .use(Packages.Express.static('./public'))
        else
            this.Logger.cli.error(`🌎 Static frontend files disabled in development mode`);
        return this;
    }

    /**
     * @description Handles the Errors for HTTP
     * @memberof Server
     * @returns {Server}
     */
    #handelHttpError() {
        this.server
            // Handling 404 Errors
            .get("*", (request, response) => {
                if (!this.isDevelopmentMode)
                    this.Response.log(`✉ [404 Bad Request] with PAYLOAD [${JSON.stringify({ success: !1, status: 'error', result: 'Oops! Page not found!' })}]`);
                response
                    .status(404)
                    .send({ success: !1, status: 'error', result: 'Oops! Page not found!' });
            })
            // Handling CSRF Errors
            .use((error, request, response, next) => {
                this.Logger.log(`🐞 ${error.message} ${error.stack}\n`);
                if (error.code === 'EBADCSRFTOKEN') {
                    if (!this.isDevelopmentMode)
                        this.Response.log(`✉ [403 Forbidden] with PAYLOAD [${JSON.stringify({ success: !1, status: 'error', result: 'Oops! Forbidden!' })}]`);
                    response
                        .status(403)
                        .send({ success: !1, status: 'error', result: 'Oops! Request Forbidden, Un-authorized Request!' });
                } else next();
            })
            // Handling 500 Errors
            .use((error, request, response, next) => {
                this.Logger.log(`🐞 ${error.message} ${error.stack}\n`);
                if (!this.isDevelopmentMode)
                    this.Response.log(`✉ [500 Internal Error] with PAYLOAD [${JSON.stringify({ success: !1, status: 'error', result: 'Oops Something broke out!' })}]`);
                response
                    .status(500)
                    .send({ success: !1, status: 'error', result: 'Oops Something broke out!' });
            })
        return this;
    }

    /**
    * @description Listen to the HTTP server requests
    * @memberof Server
    * @returns {Server}
    */
    #listenHttp() {
        this.activeServer = this.server
            .listen(this.PORT, () => {
                if (this.enableLogging)
                    this.Logger.log(`👂 Connection Established, Serving HTTP with URL [http://localhost:${this.PORT}]\n`);
                this.Logger.cli.log(`👂 Listening on PORT ${this.PORT}, URL:http://localhost:${this.PORT}`)
            })
        return this;
    }

    /**
     * @description Documents the Swagger API
     * @memberof Server
     * @returns {Server} 
     */
    #swaggerHttp() {
        if (this.isDevelopmentMode) {
            const swagger = Packages.Swagger
            this.server
                .use('/docs/', swagger.swaggerUI.serve,
                    swagger.
                        swaggerUI.
                        setup(
                            swagger
                                .swaggerJsDoc(Configurations.Swagger),
                            {
                                swaggerOptions: {
                                    docExpansion: 'list',
                                    filter: true,
                                    showRequestDuration: true,
                                },
                                customCss: '.swagger-ui .topbar { display: none }',
                                customSiteTitle: 'Swagger || Image Server',
                            }))
            this.Logger.log(`📚 Swagger Documentation is available at http://localhost:${this.PORT}/docs/`);
            this.Logger.cli.warn(`📚 Swagger Documentation is available at http://localhost:${this.PORT}/docs/`);
        }
        return this;
    }

    /**
     * @description Listens to Server Kill Signals
     * @memberof Server
     * @returns {Server}
     */
    #listenServerKill() {
        const { Utils } = Packages;
        process
            .on('SIGINT', (e) => {
                this.Logger.log(`💻 Received kill signal, shutting down gracefully.\n`);
                this.activeServer.close();
                Utils.Database.disconnectDatabase()
                this.Logger.cli.log(`🔥 Server shutdown complete.`);
                process.exit();
            })
            .on('SIGTERM', () => {
                this.Logger.log(`💻 Received kill signal, shutting down gracefully.\n`);
                this.activeServer.close();
                Utils.Database.disconnectDatabase()
                this.Logger.cli.log(`🔥 Server shutdown complete.`);
                process.exit();
            })
            .on('SIGHUP', () => {
                this.Logger.log(`💻 Received kill signal, shutting down gracefully.\n`);
                this.activeServer.close();
                Utils.Database.disconnectDatabase()
                this.Logger.cli.log(`🔥 Server shutdown complete.`);
                process.exit();
            })
            ;
        return this;
    }

    /**
     * @description Instantiates the server
     * @constructor
     * @memberof Server
     */
    constructor() {
        this
            // Extracting Logger
            .#extractLogger()
            // Defining Environment Variables
            .#defineServerVariables()
            ;
    }

    /**
     * @description Setups the HTTP Server
     * @memberof Server
     * @returns {Server}
     */
    setupHTTP() {
        this.Logger.log(`🌎 Setting up HTTP Server`);
        this
            // Activate HTTP Configurations
            .#activateHttp()
        // Log All the Incoming requests
        this.#logRequests()
            // Handle Swagger
            .#swaggerHttp()
            // Handel Http Web, API and Socket Routes
            .#handleHttpRoutes()
            // Handel Http Static File Exports 
            .#handelHttpStatic()
            // Handel 404 
            .#handelHttpError()
            // Listen to HTTP Requests
            .#listenHttp()
            // Listen to Server Kill Signals
            .#listenServerKill()
            ;
        return this;
    }

    /**
     * @description Sets the server to listen on HTTP or HTTPS
     * @memberof Server
     * @returns {Server}
     */
    setUpServer() {
        // HTTP Setup
        if (this.isHttp) this.setupHTTP();
        else this.Logger.cli(`🚨 Server is not configured to listen on HTTP`);
        return this;
    }

}
// Exporting Module
module.exports = Server;


/** 
 * Error: listen EADDRINUSE: address already in use :::8080
 * https://www.murarinayak.com/blog/technology/how-to-resolve-eaddrinuse-address-already-in-use-error/
 */