/**
 * @swagger
 * tags:
 *  name: Authentication
 *  description: Endpoint to handle Authentication related operations
 *  url: /api/auth
 */

const
    // Importing required modules
    { Router, ExpressValidator, SHA_512, ResponseLogger } = require("../../../library/server/lib.utility.express"),
    // Extracting Router from util
    AuthRouter = Router(),
    // Extracting ExpressValidator from util
    { check, validationResult } = ExpressValidator;

AuthRouter
    .post("/login", (request, response) => {
        // Handle Login Request
        response.send({
            status: "success",
            message: "Welcome to SniperCode API",
        });
    })
AuthRouter
    .post("/register",
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
        // Setup Request Limit

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
             * Db Status : Working, Included
             * InputRequestValidation: Working, Included
             * Hashing: no, Included
             * Auth Token: no, Not Included
             * Request Limit: no, Included
             * Captcha: no, Included
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
            const RequestErrors = validationResult(request);
            if (!RequestErrors.isEmpty()) {
                Payload.success = false;
                Payload.status = "error";
                Payload.result = RequestErrors.array();
                statusCode = 400;
                statusMessage = "Bad Request";
            }
            // When All Request Condition Satisfies
            else {

            }

            // Logging the response
            ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
            // Sending the response
            response.status(statusCode).send(Payload);
        })
AuthRouter
    .post("/forget", (request, response) => {
        // Handle Forget Password Request
        response.send({
            status: "success",
            message: "Welcome to SniperCode API",
        });
    })
AuthRouter
    .post("/reset", (request, response) => {
        // Handle Reset Password Request
        response.send({
            status: "success",
            message: "Welcome to SniperCode API",
        });
    })
AuthRouter
    .post("/verification", (request, response) => {
        // Handle User Verification Request
        response.send({
            status: "success",
            message: "Welcome to SniperCode API",
        });
    })

// Exporting AuthRouter
module.exports = AuthRouter;