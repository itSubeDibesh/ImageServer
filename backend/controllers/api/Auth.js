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
        QueryBuilder, DevelopmentEnv
    } = require("../../../library/server/lib.utility.express"),
    // Extracting Packages
    Database = getDatabase(),
    RequestLimit = ServerConfig.server.limit.register,
    // Extracting Router from util
    AuthRouter = Router(),
    // Extracting ExpressValidator from util
    { check, validationResult } = ExpressValidator,
    // Database Table Extraction
    UserTable = new QueryBuilder().currentTable("users"),
    OldPasswordTable = new QueryBuilder().currentTable("old_passwords"),
    // Preparing Columns
    User = {
        InsertColumns: ["UserName", "FullName", "Email", "PASSWORD", "VerificationToken"],
        SelectResetColumns: ["UserId", "UserName", "Email", "PASSWORD"],
        SelectColumns: ["UserId", "UserName", "FullName", "Email", "UserGroup", "IsDisabled", "IsLoggedIn", "VerificationStatus", "CreatedAt", "UpdatedAt"],
        VerificationColumns: ["IsDisabled", "VerificationStatus"],
        ResetColumns: ["PASSWORD", "IsLoggedIn"],
    },
    Old_Passwords = {
        InsertColumns: ["UserId", "ResetToken", "HashedPassword"],
        SelectColumns: ["PasswordId", "UserId", "ResetToken", "HashedPassword", "ResetSuccess", "HasExpired", "TokenTimeout", "CreatedAt", "UpdatedAt"],
        UpdateColumns: ["ResetSuccess", "HasExpired"]
    }
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
     *              description: Success
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
    /**
     * @swagger
     * /api/auth/register:
     *  post:
     *      tags: [Auth]
     *      summary: Register a new user
     *      parameters:
     *          - in: header
     *            name: X-CSRF-TOKEN
     *            schema:
     *              type: string
     *            description: CSRF Token
     *            required: true
     *      requestBody:
     *          content:
     *              application/json:
     *                  schema:
     *                      type: object
     *                      properties:
     *                          username:
     *                              type: string
     *                              required: true
     *                          fullname:
     *                              type: string
     *                              required: true
     *                          email:
     *                              type: string
     *                              required: true
     *                              format: email
     *                          password:
     *                              type: string
     *                              required: true
     *      responses:
     *          200:
     *              description: Success
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
     *                                  type: string
     *                                  example: "User registered successfully"
     *          400:
     *              description: Bad Request
     *              content: 
     *                  application/json:
     *                      schema:
     *                          type: object
     *                          properties:
     *                              success:
     *                                  type: boolean
     *                                  example: false  
     *                              status:
     *                                  type: string
     *                                  example: error
     *                              result:
     *                                  type: string
     *                                  example: "Username, Password, Email or Fullname not found in the request or might be invalid."
     *          500:
     *              description: Internal Server Error
     *              content: 
     *                  application/json:
     *                      schema:
     *                          type: object
     *                          properties:
     *                              success:
     *                                  type: boolean
     *                                  example: false  
     *                              status:
     *                                  type: string
     *                                  example: error
     *                              result:
     *                                  type: string
     *                                  example: "User Registration Failed, Please Try Again Later."
     */
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
                    VeriFicationEndPoint = `http://localhost:${DevelopmentEnv ? 8079 : ServerConfig.server.PORT}/verify?token=${VerificationToken}&&email=${request.body.email}`,
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
                        UserTable
                            .insert(User.InsertColumns, [
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
                                statusMessage = "Internal Server Error";
                            }
                            // Logging the response
                            ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                            // Sending the response
                            response.status(statusCode).send(Payload);
                        })
                    )
            }
        })
    // Implement Swagger
    .post("/forgot",
        // Checking for CSRF Token
        csrfProtection,
        // Validation Check
        [
            check("email", "Email is required").notEmpty(),
            check("email", "Email is not valid").isEmail(),
        ],
        (request, response) => {
            let Payload = {
                success: false,
                status: "error",
                result: "Email not found in the request.",
            },
                statusCode = 400,
                statusMessage = "Bad Request";
            // Error Check from Request
            if (!validationResult(request).isEmpty()) {
                Payload.success = false;
                Payload.status = "error";
                Payload.result = "Email not found in the request or might be invalid.";
                statusCode = 400;
                statusMessage = "Bad Request";
                // Logging the response
                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                // Sending the response
                response.status(statusCode).send(Payload);
            } else {
                // Query User Details Using Email
                Database
                    .executeQuery(
                        UserTable
                            .select(QueryBuilder.selectType.COLUMN, User.SelectResetColumns)
                            .where(`Email = '${request.body['email']}'`)
                            .build(),
                        (res => {
                            if (res.status) {
                                const UserDetails = res.rows[0];
                                if (UserDetails) {
                                    // Generate Token and Store on Old Password DB
                                    const
                                        ResetToken = RandomString(25),
                                        ResetEndPoint = `http://localhost:${DevelopmentEnv ? 8079 : ServerConfig.server.PORT}/reset?token=${ResetToken}_${UserDetails.UserId}&&email=${request.body.email}`,
                                        EmailConfig = {
                                            subject: "Reset your password, ImageServer 🔐",
                                            title: "ImageServer - Reset Password ✉",
                                            user: UserDetails.UserName,
                                            email: UserDetails.Email,
                                            message: `Follow this link to reset your password ${UserDetails.UserName}.<br><br>
                                                    <span class="text-center"><a href="${ResetEndPoint}" target="_blank" class="btn btn-success">CLick Me 👆</a></span>
                                                    <br> OR --> <a href="${ResetEndPoint}" target="_blank" class="link-success">${ResetEndPoint}</a><br>
                                                    <strong class="text-danger">This Link is Only Valid for 10 Minutes.</strong>
                                                    `,
                                        }
                                    // Generate Token Store on Old Password DB INcluding User id -> Send Email to User with Link to reset password 
                                    Database
                                        .executeQuery(
                                            OldPasswordTable
                                                .insert(Old_Passwords.InsertColumns,
                                                    [
                                                        `${UserDetails.UserId}`,
                                                        `'${ResetToken}'`,
                                                        `'${UserDetails.PASSWORD}'`
                                                    ])
                                                .build(),
                                            (res => {
                                                if (res.status) {
                                                    // Success
                                                    // Send Email to User
                                                    MailHandel.sendEmail(EmailConfig.subject, EmailConfig.email, EmailConfig.user, EmailConfig.title, EmailConfig.message)
                                                    // Success Response
                                                    Payload.success = true;
                                                    Payload.status = "success";
                                                    Payload.result = `Reset Request Successfully, Please Check Your Email ${EmailConfig.email}!`;
                                                    statusCode = 200;
                                                    statusMessage = "Ok";
                                                } else {
                                                    // Error
                                                    Payload.success = false;
                                                    Payload.status = "error";
                                                    Payload.result = "Reset Request Failed, Please Try Again Later.";
                                                    statusCode = 500;
                                                    statusMessage = "Internal Server Error";
                                                }
                                                // Logging the response
                                                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                                // Sending the response
                                                response.status(statusCode).send(Payload);
                                            })
                                        )
                                } else {
                                    // Error
                                    Payload.success = false;
                                    Payload.status = "error";
                                    Payload.result = `User not found  with ${request.body.email} email.`;
                                    statusCode = 400;
                                    statusMessage = "Bad Request";
                                }
                            }
                            else {
                                // Error
                                Payload.success = false;
                                Payload.status = "error";
                                Payload.result = "Forgot Request Failed! Please try again later.";
                                statusCode = 500;
                                statusMessage = "Internal Server Error";
                                // Logging the response
                                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                // Sending the response
                                response.status(statusCode).send(Payload);
                            }
                        })
                    )
            }
        })
    .post("/reset",
        // Checking for CSRF Token
        csrfProtection,
        // Validation Check
        [
            check("password", "Password is required").notEmpty(),
            check('password', 'Password must be 8-20 characters long').isLength({ min: 8, max: 20 }),
        ],
        (request, response) => {
            let Payload = {
                success: false,
                status: "error",
                result: "Password not found in the request.",
            },
                statusCode = 400,
                statusMessage = "Bad Request";
            // Error Check from Request
            if (!validationResult(request).isEmpty()) {
                Payload.success = false;
                Payload.status = "error";
                Payload.result = "Password not found in the request or might be invalid.";
                statusCode = 400;
                statusMessage = "Bad Request";
                // Logging the response
                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                // Sending the response
                response.status(statusCode).send(Payload);
            } else {
                // Extract Required elements From Request
                const {
                    email, resetToken,
                    userId, password
                } = request.body;
                // Query Old Password DB -> Check if token is valid -> Throw Error if not valid
                Database
                    .executeQuery(
                        OldPasswordTable.
                            select(QueryBuilder.selectType.COLUMN, Old_Passwords.SelectColumns)
                            .where(`UserId = ${userId} AND ResetToken ='${resetToken}'`)
                            .build(),
                        (resp_i => {
                            if (resp_i.status) {
                                // Extract Other Details and Evaluate Time adding up timeout
                                const
                                    resp_i_row = resp_i.rows[0],
                                    resp_i_pwd_id = resp_i_row.PasswordId,
                                    hasTimeExpired = resp_i_row.CreatedAt + resp_i_row.TokenTimeout < new Date().getTime();
                                // Throw Error if Timeout Expired
                                if (hasTimeExpired || resp_i_row.HasExpired) {
                                    // Error
                                    Payload.success = false;
                                    Payload.status = "error";
                                    Payload.result = "Reset Request Expired, Please Try Again.";
                                    statusCode = 400;
                                    statusMessage = "Bad Request";
                                    // Logging the response
                                    ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                    // Sending the response
                                    response.status(statusCode).send(Payload);
                                }
                                else {
                                    // Fetch top 5 old passwords of User using id Fetched from Old Password DB Except current Query Based on Ascending Date
                                    Database
                                        .executeQuery(
                                            OldPasswordTable.select(QueryBuilder.selectType.COLUMN, Old_Passwords.SelectColumns)
                                                .where(`UserId = ${userId} AND PasswordId != ${resp_i_pwd_id} AND ResetSuccess = 1 AND HasExpired = 1`)
                                                .orderBy(["CreatedAt"], QueryBuilder.orderType.DESC)
                                                .limit(5)
                                                .build(),
                                            (resp_ii => {
                                                if (resp_ii.status) {
                                                    // Check Current Hash Matches any if so return error
                                                    // Else Password Accepted Update on User Table and OldPasswordDbTable
                                                    const
                                                        newHashedPAssword = SHA_512(request.body.email + request.body.password + "IMAGE_SERVER_HASH"),
                                                        resp_ii_rows = resp_ii.rows,
                                                        resp_ii_rows_length = resp_ii_rows.length;
                                                    let matchCount = 0;
                                                    for (let i = 0; i < resp_ii_rows_length; i++) { if (resp_ii_rows[i].HashedPassword === newHashedPAssword) { matchCount++; break; } }
                                                    // > sign is used to check if matchCount is greater than 0
                                                    if (matchCount > 0) {
                                                        // Error
                                                        Payload.success = false;
                                                        Payload.status = "error";
                                                        Payload.result = "Password already exists in the top 5 old passwords.";
                                                        statusCode = 400;
                                                        statusMessage = "Bad Request";
                                                        // Logging the response
                                                        ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                                        // Sending the response
                                                        response.status(statusCode).send(Payload);
                                                    } else {
                                                        // UPDATE USER Db
                                                        Database
                                                            .executeQuery(
                                                                UserTable
                                                                    .update(User.ResetColumns, [`'${newHashedPAssword}'`, false])
                                                                    .where(`UserId = ${userId}`)
                                                                    .build()
                                                                ,
                                                                (response_user) => {
                                                                    if (response_user.status) {
                                                                        // UPDATE OLD PASSWORD Db
                                                                        Database
                                                                            .executeQuery(
                                                                                OldPasswordTable
                                                                                    .update(Old_Passwords.UpdateColumns, [true, true])
                                                                                    .where(`UserId = ${userId} AND PasswordId = ${resp_i_pwd_id}`)
                                                                                    .build()
                                                                                ,
                                                                                (response_old_password) => {
                                                                                    if (response_old_password.status) {
                                                                                        // Success
                                                                                        Payload.success = true;
                                                                                        Payload.status = "success";
                                                                                        Payload.result = "Password Reset Successfully. Redirecting to Login Page.";
                                                                                        statusCode = 200;
                                                                                        statusMessage = "OK";
                                                                                    } else {
                                                                                        // Error
                                                                                        Payload.success = false;
                                                                                        Payload.status = "error";
                                                                                        Payload.result = "Password Reset Failed. Please Try Again.";
                                                                                        statusCode = 500;
                                                                                        statusMessage = "Internal Server Error";
                                                                                    }
                                                                                    // Logging the response
                                                                                    ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                                                                    // Sending the response
                                                                                    response.status(statusCode).send(Payload);
                                                                                })
                                                                    } else {
                                                                        // Error
                                                                        Payload.success = false;
                                                                        Payload.status = "error";
                                                                        Payload.result = "Error in updating Password.";
                                                                        statusCode = 500;
                                                                        statusMessage = "Internal Server Error";
                                                                        // Logging the response
                                                                        ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                                                        // Sending the response
                                                                        response.status(statusCode).send(Payload);
                                                                    }
                                                                }
                                                            )
                                                    }
                                                }
                                                else {
                                                    // Error
                                                    Payload.success = false;
                                                    Payload.status = "error";
                                                    Payload.result = "Reset Request Failed, Please Try Again Later.";
                                                    statusCode = 500;
                                                    statusMessage = "Internal Server Error";
                                                    // Logging the response
                                                    ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                                    // Sending the response
                                                    response.status(statusCode).send(Payload);
                                                }
                                            })
                                        )
                                }
                            } else {
                                // Error
                                Payload.success = false;
                                Payload.status = "error";
                                Payload.result = "User not found or Invalid Token.";
                                statusCode = 404;
                                statusMessage = "Not Found";
                                // Logging the response
                                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                // Sending the response
                                response.status(statusCode).send(Payload);
                            }
                        }
                        ))
            }
        })
    /** 
     * @swagger
     * /api/auth/verification:
     *  post:
     *      tags: [Auth]
     *      summary: Verifies the user based on token
     *      parameters:
     *          - in: header
     *            name: X-CSRF-TOKEN
     *            schema:
     *              type: string
     *            description: CSRF Token
     *            required: true
     *      requestBody:
     *          content:
     *              application/json:
     *                  schema:
     *                      type: object
     *                      properties:
     *                          verificationToken:
     *                              type: string
     *                              required: true
     *                          email:
     *                              type: string
     *                              required: true
     *                              format: email
     *      responses:
     *          200:
     *              description: Success
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
     *                                  type: string
     *                                  example: "Verification Successful! Redirecting to Login Page."
     *          400:
     *              description: Bad Request
     *              content: 
     *                  application/json:
     *                      schema:
     *                          type: object
     *                          properties:
     *                              success:
     *                                  type: boolean
     *                                  example: false  
     *                              status:
     *                                  type: string
     *                                  example: error
     *                              result:
     *                                  type: string
     *                                  example: "Email or Verification Token not found in the request or might be invalid."
     *          500:
     *              description: Internal error
     *              content: 
     *                  application/json:
     *                      schema:
     *                          type: object
     *                          properties:
     *                              success:
     *                                  type: boolean
     *                                  example: false  
     *                              status:
     *                                  type: string
     *                                  example: error
     *                              result:
     *                                  type: string
     *                                  example: "Verification Failed! Please try again later."
     *          404:
     *              description: Not Found
     *              content: 
     *                  application/json:
     *                      schema:
     *                          type: object
     *                          properties:
     *                              success:
     *                                  type: boolean
     *                                  example: false  
     *                              status:
     *                                  type: string
     *                                  example: error
     *                              result:
     *                                  type: string
     *                                  example: "Verification Failed! Please try again later."
     */
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
                Database
                    .executeQuery(
                        UserTable
                            .select(QueryBuilder.selectType.COLUMN, User.SelectColumns)
                            .where(`Email = '${request.body['email']}' AND VerificationToken = '${request.body['verificationToken']}'`)
                            .build(),
                        (resp => {
                            if (resp.status) {
                                // Extracting the User Data
                                const details = resp.rows[0];
                                if (!details.VerificationStatus && details.IsDisabled) {
                                    // Update VerificationStatus and IsDisabled
                                    Database
                                        .executeQuery(
                                            UserTable
                                                .update(User.VerificationColumns, [false, true])
                                                .where(`Email = '${request.body['email']}' AND VerificationToken = '${request.body['verificationToken']}'`)
                                                .build(),
                                            (res => {
                                                if (res.status) {
                                                    Payload.success = true;
                                                    Payload.status = "success";
                                                    Payload.result = "Verification Successful! Redirecting to Login Page.";
                                                    statusCode = 200;
                                                    statusMessage = "Ok";
                                                    // Logging the response
                                                    ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                                    // Sending the response
                                                    response.status(statusCode).send(Payload);
                                                }
                                                else {
                                                    // Error
                                                    Payload.success = false;
                                                    Payload.status = "error";
                                                    Payload.result = "Verification Failed! Please try again later.";
                                                    statusCode = 500;
                                                    statusMessage = "Internal Server Error";
                                                    // Logging the response
                                                    ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                                    // Sending the response
                                                    response.status(statusCode).send(Payload);
                                                }
                                            })
                                        )
                                } else {
                                    Payload.success = true;
                                    Payload.status = "success";
                                    Payload.result = "User Already Verified! Redirecting to Login Page.";
                                    statusCode = 200;
                                    statusMessage = "Ok";
                                    ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                    // Sending the response
                                    response.status(statusCode).send(Payload);
                                }
                            } else {
                                // Error
                                Payload.success = false;
                                Payload.status = "error";
                                Payload.result = "Verification Failed, Invalid Verification Code.";
                                statusCode = 404;
                                statusMessage = "Not Found";
                                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                // Sending the response
                                response.status(statusCode).send(Payload);
                                return;
                            }
                        })
                    )
            }
        })
// Exporting AuthRouter
module.exports = AuthRouter;