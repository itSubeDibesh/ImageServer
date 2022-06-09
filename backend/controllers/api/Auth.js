/**
 * @swagger
 * tags:
 *  name: Auth
 *  description: Endpoint to handle Auth related operations
 *  url: /api/auth
 */

const
    // Importing required modules
    { Router, ExpressValidator, SHA_512,
        ResponseLogger, csrfProtection,
        setRequestLimiter, minToMs, MailHandel,
        ServerConfig, RandomString, getDatabase,
        QueryBuilder
    } = require("../../../library/server/lib.utility.express"),
    // Extracting Packages
    Database = getDatabase(),
    RequestLimit = ServerConfig.server.limit.register,
    // Extracting Router from util
    AuthRouter = Router(),
    // Extracting ExpressValidator from util
    { check, validationResult } = ExpressValidator,
    UserDb = Database.currentTable("users"),
    InsertColumns = ["UserName", "FullName", "Email", "PASSWORD", "VerificationToken"],
    SelectColumns = ["UserId", "UserName", "FullName", "Email", "UserGroup", "IsDisabled", "VerificationStatus", "CreatedAt", "UpdatedAt"]
    ;

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
                // Logging the response
                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                // Sending the response
                response.status(statusCode).send(Payload);
            }
            // When All Request Condition Satisfies
            else {
                const
                    VerificationToken = RandomString(20),
                    VeriFicationEndPoint = `http://localhost:${ServerConfig.server.PORT}/verify?token=${VerificationToken}&&email=${request.body.email}`,
                    EmailConfig = {
                        subject: "Verify your email, ImageServer 🔐",
                        title: "ImageServer - Email Verification ✉",
                        user: request.body.username,
                        email: request.body.email,
                        message: `Follow this link to verify your email address.<br><br>
                                <span class="text-center"><a href="${VeriFicationEndPoint}" target="_blank" class="btn btn-success">CLick Me 👆</a></span>
                                <br> OR --> <a href="${VeriFicationEndPoint}" target="_blank" class="link-success">${VeriFicationEndPoint}</a>
                                `,
                    }
                Database
                    .executeQuery(
                        UserDb
                            .insert(InsertColumns, [
                                `'${request.body.username}'`,
                                `'${request.body.fullname}'`,
                                `'${request.body.email}'`,
                                `'${SHA_512(request.body.email + request.body.password + "IMAGE_SERVER_HASH")}'`,
                                `'${VerificationToken}'`,
                            ]).build(),
                        (res => {
                            if (res.status) {
                                // Success
                                // Send Email to User
                                MailHandel.sendEmail(EmailConfig.subject, EmailConfig.email, EmailConfig.user, EmailConfig.title, EmailConfig.message)
                                // Success Response
                                Payload.success = true;
                                Payload.status = "success";
                                Payload.result = `User Registered Successfully, Please Verify Your Email ${EmailConfig.email}!`;
                                statusCode = 200;
                                statusMessage = "Ok";
                            }
                            else {
                                // Error
                                Payload.success = false;
                                Payload.status = "error";
                                Payload.result = "User Registration Failed, Please Try Again Later.";
                                statusCode = 500;
                                statusMessage = "Oops! Something went wrong. Please try again later.";
                            }
                            // Logging the response
                            ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                            // Sending the response
                            response.status(statusCode).send(Payload);
                        })
                    )
            }
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
    .post("/verification",
        // Checking for CSRF Token
        csrfProtection,
        // Validation Check
        [
            check("verificationToken", "Verification Token is required").notEmpty(),
            check("email", "Email is required").notEmpty(),
            check("email", "Email is not valid").isEmail(),
        ],
        (request, response) => {
            let Payload = {
                success: false,
                status: "error",
                result: "Email or Verification Token not found in the request.",
            },
                statusCode = 400,
                statusMessage = "Bad Request";
            // Error Check from Request
            if (!validationResult(request).isEmpty()) {
                Payload.success = false;
                Payload.status = "error";
                Payload.result = "Email or Verification Token not found in the request or might be invalid.";
                statusCode = 400;
                statusMessage = "Bad Request";
                // Logging the response
                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                // Sending the response
                response.status(statusCode).send(Payload);
            } else {
                // Query Using Where -> Email and Verification Token
                // Update VerificationStatus and IsDisabled
                Database
                    .executeQuery(
                        UserDb
                            .update(["IsDisabled", "VerificationStatus"], [false, true])
                            .where(`Email = '${request.body['email']}' AND VerificationToken = '${request.body['verificationToken']}'`)
                            .build(),
                        (res => {
                            if (res.status) {
                                Payload.success = true;
                                Payload.status = "success";
                                Payload.result = "Verification Successful! Redirecting to Login Page.";
                                statusCode = 200;
                                statusMessage = "Ok";
                            }
                            else {
                                // Error
                                Payload.success = false;
                                Payload.status = "error";
                                Payload.result = "Verification Failed! Please try again later.";
                                statusCode = 500;
                                statusMessage = "Oops! Something went wrong. Please try again later.";
                            }
                            // Logging the response
                            ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                            // Sending the response
                            response.status(statusCode).send(Payload);
                        })
                    )
            }
        })

// Exporting AuthRouter
module.exports = AuthRouter;