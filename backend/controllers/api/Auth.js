/**
 * @swagger
 * tags:
 *  name: Auth
 *  description: Endpoint to handle Auth related operations
 *  url: /api/auth
 */

const
    // Importing required modules
    { Router, ExpressValidator, SHA_512, ResponseLogger, csrfProtection, setRequestLimiter, minToMs, MailHandel, ServerConfig } = require("../../../library/server/lib.utility.express"),
    RequestLimit = ServerConfig.server.limit.register,
    // Extracting Router from util
    AuthRouter = Router(),
    // Extracting ExpressValidator from util
    { check, validationResult } = ExpressValidator;

AuthRouter
    /** 
     * @swagger
     * /api/auth/csrf:
     *  get:
     *      summary: Get CSRF token
     *      tags: [Auth]
     *      responses:
     *          200:
     *              description: Successful response
     *              content: 
     *                  application/json:
     *                      schema:
     *                          type: object
     *                          properties:
     *                              success:
     *                                  type: boolean
     *                                  example: true  
     *                              status:
     *                                  type: string
     *                                  example: success
     *                              result:
     *                                  type: object
     *                                  example:
     *                                         {
     *                                              CsrfToken: "token"
     *                                          }
     */
    .get("/csrf", csrfProtection, (request, response) => {
        let
            Payload = {
                success: true,
                status: "success",
                result: {
                    CsrfToken: request.csrfToken(),
                },
            },
            statusCode = 200,
            statusMessage = "Ok";
        // Logging the response
        ResponseLogger.log(`📶 [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
        // Sending the response
        response.status(statusCode).send(Payload);
    })
    .post("/login", (request, response) => {
        // Handle Login Request
        response.send({
            status: "success",
            message: "Welcome to SniperCode API",
        });
    })
    .post("/register",
        // Checking for CSRF Token
        csrfProtection,
        // Validation Check
        [
            check("username", "Username is required").notEmpty(),
            check('username', 'Username must be 6-16 characters long').isLength({ min: 5, max: 16 }),
            check("password", "Password is required").notEmpty(),
            check('password', 'Password must be 8-20 characters long').isLength({ min: 8, max: 20 }),
            check("email", "Email is required").notEmpty(),
            check("email", "Email is not valid").isEmail(),
            check("fullname", "Fullname is required").notEmpty(),
        ],
        // Setup Request Limit -> Requests per minute -> 3 request 10 minutes 
        setRequestLimiter(minToMs(RequestLimit.minutes), RequestLimit.requests),
        // Request Handel
        (request, response) => {
            /** 
             * Implements a captcha to prevent spam, followed by request limit to prevent DDOS 
             * and auth token to be used for other authorization purposes and Csurf handling.
             * 
             * Store the user's data in a database and send a verification email to the user.
             * Unless the user verifies the email, the user will not be able to login. 
             * 
             * Data stored in the database:
             * - userId
             * - username
             * - email
             * - fullname
             * - password -> hashed
             * - verification_token -> random string -> hashed
             * - verification_status
             * - created_at
             * - updated_at
             * 
             * Data stored in the session:
             * - userId
             * - username
             * - email
             * - fullname
             * - verification_status
             * - created_at
             * - updated_at
             * 
             * 
             * A register form retrieves the following data from the user:
             * - username
             * - email
             * - password
             * - fullname
             * 
             *  Payload:
             * -- INSERT INTO users (UserName,FullName,Email,PASSWORD,VerificationToken,VerificationStatus) VALUES --	('Dibesh199','Dibesh Raj Subedi','dibeshrsubedi@gmail.com','p@ssw0rd','token@123',false)
             * -- UPDATE users SET VerificationStatus = true , VerificationToken='' WHERE UserId = 1;
             * 
             * Db Status : NO, Included -> Work on Frontend Timer and EMail Server
             * 
             * InputRequestValidation: Working, Included
             * CSRF: Working, Included
             * Request Limit: Working, Included
             * Hashing: Working, Included
             * 
             * Captcha: no, Included
             * Auth Token: no, Not Included
             * 
             */
            let Payload = {
                success: false,
                status: "error",
                result: "Username, Password, Email or Fullname not found in the request.",
            },
                statusCode = 400,
                statusMessage = "Bad Request";
            // Error Check from Request
            if (!validationResult(request).isEmpty()) {
                Payload.success = false;
                Payload.status = "error";
                Payload.result = "Username, Password, Email or Fullname not found in the request or might be invalid.";
                statusCode = 400;
                statusMessage = "Bad Request";
            }
            // When All Request Condition Satisfies
            else {
                // console.log(SHA_512(request.body.email + request.body.password + "IMAGE_SERVER_HASH"));
                const EmailConfig = {
                    subject: "Verify your email, ImageServer 🔐",
                    title: "ImageServer - Email Verification ✉",
                    user: request.body.username,
                    email: request.body.email,
                    message: `Follow this link to verify your email address.<br>
                    <span class="text-center"><a href="https://www.github.com/itsubedibesh" target="_blank" class="btn btn-success">CLick Me 👆</a></span>
                    <br>
                    <a href="https://www.github.com/itsubedibesh" target="_blank" class="link-success">http://www.github.com/itsubedibesh</a>
                    `,
                }
                // Send Email to User
                // MailHandel.sendEmail(EmailConfig.subject, EmailConfig.email, EmailConfig.user, EmailConfig.title, EmailConfig.message)


                // Demo Success Response
                Payload.success = true;
                Payload.status = "success";
                Payload.result = `User Registered Successfully, Please Verify Your Email ${EmailConfig.email}!`;
                statusCode = 200;
                statusMessage = "Ok";
            }

            // Logging the response
            ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
            // Sending the response
            response.status(statusCode).send(Payload);
        })
    .post("/forget", (request, response) => {
        // Handle Forget Password Request
        response.send({
            status: "success",
            message: "Welcome to SniperCode API",
        });
    })
    .post("/reset", (request, response) => {
        // Handle Reset Password Request
        response.send({
            status: "success",
            message: "Welcome to SniperCode API",
        });
    })
    .post("/verification", (request, response) => {
        // Handle User Verification Request
        response.send({
            status: "success",
            message: "Welcome to SniperCode API",
        });
    })

// Exporting AuthRouter
module.exports = AuthRouter;