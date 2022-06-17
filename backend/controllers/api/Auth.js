/**
 * @swagger
 * tags:
 *  name: Auth
 *  description: Endpoint to handle Auth related operations
 *  url: /api/auth
 * components:
 *  securitySchemes:
 *      bearerAuth:
 *          type: http
 *          scheme: bearer
 *          in: header
 *          name: Authorization
 *          description: Bearer Token
 *          bearerFormat: JWT
 */
// Note: Expiration token is set based on minutes and seconds-> eg to set 1hr just set 3600 in expiry config
const
    // Importing required modules
    {
        Router, ExpressValidator, SHA_512,
        ResponseLogger, csrfProtection,
        setRequestLimiter, DevelopmentEnv, MailHandel,
        ServerConfig, RandomString, getDatabase,
        timeExceeded, monthToMs, minToMs,
        QueryBuilder, JWT, msToS

    } = require("../../../library/server/lib.utility.express"),
    // Extracting Packages
    Database = getDatabase(),
    // Extracting Limits
    RegisterRequestLimit = ServerConfig.server.limit.register,
    LoginRequestLimit = ServerConfig.server.limit.login,
    // Extracting Expires
    ResetExpiry = ServerConfig.server.expiry.password,
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
        SelectColumns: ["UserId", "UserName", "FullName", "Email", "UserGroup", "IsDisabled", "IsLoggedIn", "VerificationStatus", "LastPasswordResetDate", "CreatedAt", "UpdatedAt"],
        VerificationColumns: ["IsDisabled", "VerificationStatus"],
        ResetColumns: ["PASSWORD", "IsLoggedIn", "LastPasswordResetDate"],
        UpdateLogin: ["IsLoggedIn"]
    },
    Old_Passwords = {
        InsertColumns: ["UserId", "ResetToken", "HashedPassword"],
        SelectColumns: ["PasswordId", "UserId", "ResetToken", "HashedPassword", "ResetSuccess", "HasExpired", "CreatedAt", "UpdatedAt"],
        UpdateColumns: ["ResetSuccess", "HasExpired"]
    }
    ;
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
AuthRouter
    .get("/csrf",
        csrfProtection,
        (request, response) => {
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
/**
 * @swagger
 * /api/auth/login:
 *  post:
 *      tags: [Auth]
 *      summary: Login User with Email and Password -> Returns Details and Access Token
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
 *                                  example: "Login Successful, Redirecting"
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
 *                                  example: "Email or Password not found in the request."
 *          401:
 *              description: Unauthorized
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
 *                                  example: "Your account is disabled. Contact Admin for more details."
 *          403:
 *              description: Forbidden
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
 *                                  example: "Email is not verified."
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
 *                                  example: "Login Request Failed, Please Try Again Later"
 */
AuthRouter.post("/login",
    // Checking for CSRF Token
    csrfProtection,
    // Validation Check
    [
        check("password", "Password is required").notEmpty(),
        check('password', 'Password must be 8-20 characters long').isLength({ min: 8, max: 20 }),
        check("email", "Email is required").notEmpty(),
        check("email", "Email is not valid").isEmail(),
    ],
    // Setup Request Limit -> Requests per minute -> 3 request 10 minutes 
    setRequestLimiter(minToMs(LoginRequestLimit.minutes), LoginRequestLimit.requests),
    // Request Handel
    (request, response) => {
        let Payload = {
            success: false,
            status: "error",
            result: "Email or Password not found in the request.",
            data: {}
        },
            statusCode = 400,
            statusMessage = "Bad Request";
        // Error Check from Request
        if (!validationResult(request).isEmpty()) {
            Payload.success = false;
            Payload.status = "error";
            Payload.result = "Email or Password not found in the request or might be invalid.";
            Payload.data = {};
            statusCode = 400;
            statusMessage = "Bad Request";
            // Logging the response
            ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
            // Sending the response
            response.status(statusCode).send(Payload);
        }
        // When All Request Condition Satisfies
        else {
            // Extracting Email and Password
            const
                Email = request.body.email,
                Password = SHA_512(request.body.email + request.body.password + "IMAGE_SERVER_HASH");
            // Check Database for User
            Database
                .executeQuery(
                    UserTable
                        .select(QueryBuilder.selectType.ALL)
                        .where(`Email = '${Email}' AND PASSWORD = '${Password}'`)
                        .build(),
                    (resp_i => {
                        // Checks Success Result
                        if (resp_i.status) {
                            if (resp_i.rows.length != 0) {
                                // Extracting User Data
                                const {
                                    UserId, UserName, FullName,
                                    Email, IsLoggedIn, UserGroup,
                                    IsDisabled, LastPasswordResetDate, VerificationStatus, CreatedAt
                                } = resp_i.rows[0];
                                // Verification Status Check
                                if (VerificationStatus == 0) {
                                    Payload.success = false;
                                    Payload.status = "error";
                                    Payload.result = "Email is not verified. Please verify your email.";
                                    Payload.data = {};
                                    statusCode = 403;
                                    statusMessage = "Forbidden";
                                    // Logging the response
                                    ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                    // Sending the response
                                    response.status(statusCode).send(Payload);
                                }
                                // Disable Check
                                else if (IsDisabled) {
                                    Payload.success = false;
                                    Payload.status = "error";
                                    Payload.result = "Your account is disabled. Contact Admin for more details.";
                                    Payload.data = {};
                                    statusCode = 401;
                                    statusMessage = "Unauthorized";
                                    // Logging the response
                                    ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                    // Sending the response
                                    response.status(statusCode).send(Payload);
                                }
                                // Last Reset Check
                                else if (timeExceeded(new Date().getTime(), Date.parse(LastPasswordResetDate), monthToMs(ResetExpiry.renewalInMonths))) {
                                    // Force Reset, Send An Email Of Reset
                                    // Generate Token and Store on Old Password DB
                                    const
                                        ResetToken = RandomString(25),
                                        ResetEndPoint = `http://localhost:${DevelopmentEnv ? 8079 : ServerConfig.server.PORT}/reset?token=${ResetToken}_${UserDetails.UserId}&&email=${request.body.email}`,
                                        EmailConfig = {
                                            subject: "Reset your password, ImageServer 🔐",
                                            title: "ImageServer - Reset Password ✉",
                                            user: UserName,
                                            email: Email,
                                            message: `Looks Like You Have not updated your password since ${LastPasswordResetDate.splice(' ')[0]},<br>Please update your password. <br>Follow this link to reset your password ${UserDetails.UserName}.<br><br>
                                                    <span class="text-center"><a href="${ResetEndPoint}" target="_blank" class="btn btn-success">CLick Me 👆</a></span>
                                                    <br> OR --> <a href="${ResetEndPoint}" target="_blank" class="link-success">${ResetEndPoint}</a><br>
                                                    <strong class="text-danger">This Link is Only Valid for ${ResetExpiry.resetExpireInMinute} Minutes.</strong>
                                                    `,
                                        }
                                    // Generate Token Store on Old Password DB INcluding User id -> Send Email to User with Link to reset password 
                                    Database
                                        .executeQuery(
                                            OldPasswordTable
                                                .insert(Old_Passwords.InsertColumns,
                                                    [
                                                        `${UserId}`,
                                                        `'${ResetToken}'`,
                                                        `'${Password}'`
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
                                                    Payload.result = `An Email is Sent to ${EmailConfig.email}, Please Update your password!`;
                                                    statusCode = 200;
                                                    statusMessage = "Ok";
                                                } else {
                                                    // Error
                                                    Payload.success = false;
                                                    Payload.status = "error";
                                                    Payload.result = "Update Request Failed, Please Try Again Later.";
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
                                else {
                                    // Update isLoggedIn to 1
                                    Database
                                        .executeQuery(
                                            UserTable
                                                .update(User.UpdateLogin, [true])
                                                .where(`UserId = '${UserId}'`)
                                                .build(),
                                            (resUp => {
                                                if (resUp.status) {
                                                    // Generate JWT Token
                                                    const
                                                        expiresIn = ServerConfig.jwt.expiry;
                                                    let access = JWT
                                                        .sign({
                                                            UserId, Email, UserGroup,
                                                        }, ServerConfig.jwt.secret, { expiresIn }),
                                                        user = {
                                                            UserId, UserName, FullName,
                                                            Email, IsLoggedIn, UserGroup,
                                                            IsDisabled, LastPasswordResetDate, VerificationStatus, CreatedAt
                                                        }
                                                        ;
                                                    // Create Payload
                                                    Payload.success = true;
                                                    Payload.status = "success";
                                                    Payload.result = "Login Successful, Redirecting....";
                                                    // Send Token + Selected Payload To Client
                                                    Payload.data = {
                                                        user,
                                                        access
                                                    }
                                                    statusCode = 200;
                                                    statusMessage = "Ok";
                                                    // Logging the response
                                                    ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                                    // Sending the response
                                                    response.status(statusCode).send(Payload);
                                                } else {
                                                    Payload.success = false;
                                                    Payload.status = "error";
                                                    Payload.result = "Login Request Failed, Please Try Again Later.";
                                                    Payload.data = {};
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
                                Payload.success = false;
                                Payload.status = "error";
                                Payload.result = "User not found, Make sure you have entered correct email and password.";
                                Payload.data = {};
                                statusCode = 400;
                                statusMessage = "Bad Request";
                                // Logging the response
                                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                // Sending the response
                                response.status(statusCode).send(Payload);
                            }
                        } else {
                            Payload.success = false;
                            Payload.status = "error";
                            Payload.result = "Invalid Email or Password.";
                            Payload.data = {};
                            statusCode = 400;
                            statusMessage = "Bad Request";
                            // Logging the response
                            ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                            // Sending the response
                            response.status(statusCode).send(Payload);
                        }
                    })
                )

        }
    })
/**
 * @swagger
 * /api/auth/logout:
 *  post:
 *      tags: [Auth]
 *      summary: Logout User -> Requires Access Token
 *      parameters:
 *          - in: header
 *            name: X-CSRF-TOKEN
 *            schema:
 *              type: string
 *            description: CSRF Token
 *            required: true
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          UserId:
 *                              type: integer
 *                              required: true
 *                              format: number
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
 *                                  example: "Logout Successful."
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
 *                                  example: "UserId not found in the request or might be invalid"
 *          401:
 *              description: Unauthorized
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
 *                                  example: "Your account is disabled. Contact Admin for more details."
 */
AuthRouter
    .post('/logout',
        // User Id Check
        [check(['UserId']).not().isEmpty()],
        // Handle Request
        (request, response) => {
            let Payload = {
                success: true,
                status: "success",
                result: "Logout Successful.",
            },
                statusCode = 200,
                statusMessage = "Ok";
            // Error Check from Request
            if (!validationResult(request).isEmpty()) {
                Payload.success = false;
                Payload.status = "error";
                Payload.result = "UserId not found in the request or might be invalid.";
                Payload.data = {};
                statusCode = 400;
                statusMessage = "Bad Request";
                // Logging the response
                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                // Sending the response
                response.status(statusCode).send(Payload);
            } else {
                if (request.body.UserId != null) {
                    // Setting Is LoggedIn to False
                    // Update isLoggedIn to 1
                    Database
                        .executeQuery(
                            UserTable
                                .update(User.UpdateLogin, [false])
                                .where(`UserId = '${request.body.UserId}'`)
                                .build(),
                            () => { }
                        )
                } else {
                    Payload.success = false;
                    Payload.status = "error";
                    Payload.result = "Invalid request, Please check your request.";
                    statusCode = 400;
                    statusMessage = "Bad Request";
                }
                // Logging the response
                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                // Sending the response
                response.status(statusCode).send(Payload);
            }
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
AuthRouter.post("/register",
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
    setRequestLimiter(minToMs(RegisterRequestLimit.minutes), RegisterRequestLimit.requests),
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
                            Payload.result = "User Registration Failed, Username or Email already exists.";
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
/**
 * @swagger
 * /api/auth/forgot:
 *  post:
 *      tags: [Auth]
 *      summary: Handles Forgot Request Sending An Email to User
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
 *                                  example: "Reset Request Successfully, Please Check Your Email"
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
 *                                  example: "Email not found in the request or might be invalid."
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
 *                                  example: "Reset Request Failed, Please Try Again Later."
 */
AuthRouter.post("/forgot",
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
                                                    <strong class="text-danger">This Link is Only Valid for ${ResetExpiry.resetExpireInMinute} Minutes.</strong>
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
/**
 * @swagger
 * /api/auth/reset:
 *  post:
 *      tags: [Auth]
 *      summary: Resets Password of User
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
 *                          userId:
 *                              type: integer
 *                              required: true
 *                          password:
 *                              type: string
 *                              required: true
 *                          resetToken:
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
 *                                  example: "Password Reset Successfully. Redirecting to Login Page."
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
 *                                  example: "Password not found in the request or might be invalid."
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
 *                                  example: "Password Reset Failed. Please Try Again."
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
 *                                  example: "User not found or Invalid Token." 
 */
AuthRouter.post("/reset",
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
                            if (resp_i.rows.length != 0) {
                                const
                                    resp_i_row = resp_i.rows[0],
                                    resp_i_pwd_id = resp_i_row.PasswordId,
                                    // Check if Current Time is greater than Check Time
                                    hasExceed = timeExceeded(new Date().getTime(), Date.parse(resp_i_row.CreatedAt), minToMs(ResetExpiry.resetExpireInMinute));
                                // Throw Error if Timeout Expired
                                if (hasExceed || resp_i_row.HasExpired) {
                                    // Delete all the records from Old Password Table Where Status is Not Verified
                                    Database
                                        .executeQuery(
                                            OldPasswordTable
                                                .delete()
                                                .where(`UserId = ${resp_i_row.UserId} AND ResetSuccess = 0`)
                                                .build(),
                                            (res_del => {
                                                // Error
                                                Payload.success = false;
                                                Payload.status = "error";
                                                Payload.result = "Reset Request Expired, Please Try New Request.";
                                                statusCode = 400;
                                                statusMessage = "Bad Request";
                                                // Logging the response
                                                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                                // Sending the response
                                                response.status(statusCode).send(Payload);
                                            })
                                        )
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
                                                    if (newHashedPAssword === resp_i_row.HashedPassword) { matchCount++; }
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
                                                                    .update(User.ResetColumns, [`'${newHashedPAssword}'`, false, `(DATETIME('now', 'localtime')`])
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
                                // Return Token Invalid Error
                                Payload.success = false;
                                Payload.status = "error";
                                Payload.result = "Invalid Token Or Token Already Used.";
                                statusCode = 400;
                                statusMessage = "Bad Request";
                                // Logging the response
                                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                // Sending the response
                                response.status(statusCode).send(Payload);
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
AuthRouter.post("/verification",
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
/**
* @swagger
* /api/auth/login_check:
*  post:
*      tags: [Auth]
*      summary: Check user Login -> Requires Access Token
*      parameters:
*          - in: header
*            name: X-CSRF-TOKEN
*            schema:
*              type: string
*            description: CSRF Token
*            required: true
*      security:
*          - bearerAuth: []
*      requestBody:
*          content:
*              application/json:
*                  schema:
*                      type: object
*                      properties:
*                          UserId:
*                              type: integer
*                              required: true
*                              format: number
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
*                                  example: "Logout Successful."
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
*                                  example: "UserId not found in the request or might be invalid"
*          401:
*              description: Unauthorized
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
*                                  example: "Your account is disabled. Contact Admin for more details."
*/
AuthRouter.post("/login_check",
    // Checking for CSRF Token
    csrfProtection,
    // User Id Check
    [check(['UserId']).not().isEmpty()],
    (request, response) => {
        let Payload = {
            status: "error",
            success: false,
            result: "Unauthorized Access, Please Login First"
        }, StatusCode = 401,
            statusMessage = "Unauthorized";
        if (!validationResult(request).isEmpty()) {
            Payload.success = false;
            Payload.status = "error";
            Payload.result = "UserId not found in the request or might be invalid.";
            Payload.data = {};
            StatusCode = 400;
            statusMessage = "Bad Request";
            // Logging the response
            ResponseLogger.log(`📶  [${StatusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
            // Sending the response
            response.status(StatusCode).send(Payload);
        }
        else {
            // If other url check header containing JWT
            if (request.headers.authorization) {
                // Extracting JWT from Header
                const token = request.headers.authorization.split(" ")[1];
                // Check IF Token Has Expired
                if (Date.now() >= JWT.verify(token, ServerConfig.jwt.secret).exp * 1e3) {
                    Payload.status = "error";
                    Payload.success = false;
                    Payload.result = "Token Expired, Please Login Again";
                    StatusCode = 401;
                    statusMessage = "Unauthorized";
                }
                else {
                    // Verifying JWT
                    JWT.verify(token, ServerConfig.jwt.secret, (err, decoded) => {
                        // On Identity Check is Successful
                        if (decoded.UserId == request.body.UserId) {
                            Payload.success = true;
                            Payload.status = "success";
                            Payload.result = "User Already Logged In! Redirecting to Dashboard.";
                            StatusCode = 200;
                            statusMessage = "Ok";
                        }
                    });
                }
                // Logging the response
                ResponseLogger.log(`📶  [${StatusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                // Sending the response
                response.status(StatusCode).send(Payload);
            }
        }
    })
// Exporting AuthRouter
module.exports = AuthRouter;