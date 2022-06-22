/**
 * @swagger
 * tags:
 *  name: User
 *  description: Endpoint to handle User related operations
 *  url: /api/user
 */

const
    // Importing required modules
    {
        Router, ExpressValidator, SHA_512,
        ResponseLogger, csrfProtection,
        setRequestLimiter, DevelopmentEnv, MailHandel,
        ServerConfig, RandomString, getDatabase,
        minToMs, FileLogger, QueryBuilder, JWT
    } = require("../../../library/server/lib.utility.express"),
    // Extracting Packages
    Database = getDatabase(),
    FileSystem = FileLogger.FileSystem,
    // Extracting ExpressValidator from util
    { check, validationResult } = ExpressValidator,
    UserTable = new QueryBuilder().currentTable("users"),
    OldPasswordTable = new QueryBuilder().currentTable("old_passwords"),
    ImageTable = new QueryBuilder().currentTable("image"),
    // Extracting Expires
    RegisterRequestLimit = ServerConfig.server.limit.register,
    ResetExpiry = ServerConfig.server.expiry.password,
    // Preparing Columns
    User = {
        InsertColumns: ["UserName", "FullName", "Email", "PASSWORD", "UserGroup", "VerificationToken"],
        SelectColumns: ["UserId", "UserName", "FullName", "Email", "UserGroup", "IsDisabled", "IsLoggedIn", "VerificationStatus", "LastPasswordResetDate", "CreatedAt", "UpdatedAt"],
        UpdateFullName: ["FullName"],
        SelectResetColumns: ["UserId", "UserName", "Email", "PASSWORD"],
        Block: ["IsDisabled"]
    },
    Old_Passwords = {
        InsertColumns: ["UserId", "ResetToken", "HashedPassword"],
    },
    userRoles = {
        Admin: "ADMINISTRATOR",
        User: "USER"
    }
// Extracting Router from util
UserRouter = Router();
/**
* @swagger
* /api/user/first_name:
*  post:
*      tags: [User]
*      summary: Updates users first name only, accessible to all -> Requires Access Token
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
*                          FullName:
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
*                                  example: "Updated Successful."
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
*                                  example: "UserId Or Email not found in the request or might be invalid"
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
*                                  example: "UnAuthorized"
*/
UserRouter
    .post('/first_name',
        // Checking for CSRF Token
        csrfProtection,
        // Validation Check
        [
            check("FullName", "Fullname is required").notEmpty(),
            check(['UserId']).not().isEmpty(),
            check("UserId").isNumeric(true)
        ],
        (request, response) => {
            let Payload = {
                success: false,
                status: "error",
                result: "UserId or Fullname not found in the request.",
            },
                statusCode = 400,
                statusMessage = "Bad Request";
            // Error Check from Request
            if (!validationResult(request).isEmpty()) {
                Payload.success = false;
                Payload.status = "error";
                Payload.result = "UserId or Fullname not found in the request or might be invalid.";
                statusCode = 400;
                statusMessage = "Bad Request";
                // Logging the response
                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                // Sending the response
                response.status(statusCode).send(Payload);
            } else {

                // Decode JWT and Verify UserId
                JWT.verify(request.headers.authorization.split(" ")[1], ServerConfig.jwt.secret, (err, decoded) => {
                    if (err) response.status(StatusCode).send(Payload);
                    // On Identity Check is Successful
                    if (decoded.UserId == request.body.UserId) {
                        Database
                            .executeQuery(
                                UserTable.
                                    update(User.UpdateFullName, [`'${request.body.FullName}'`])
                                    .where(`UserId = ${request.body.UserId}`)
                                    .build(),
                                (res) => {
                                    if (res.status) {
                                        Payload.success = true;
                                        Payload.status = "success";
                                        Payload.result = "Update Successful! Redirecting to Login Page.";
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
                                        Payload.result = "Problem in updating user Fullname.";
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
                });
            }
        })
/**
 * @swagger
 * /api/user/add:
 *  post:
 *      tags: [User]
 *      summary: Register a new user admin user -> Requires Access Token
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
 *                          AdminId:
 *                              type: number
 *                              required: true
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
UserRouter
    .post("/add",
        // Checking for CSRF Token
        csrfProtection,
        // Validation Check
        [
            check('AdminId').not().isEmpty(),
            check('AdminId').isNumeric(true),
            check("username", "Username is required").notEmpty(),
            check('username', 'Username must be 6-16 characters long').isLength({ min: 5, max: 16 }),
            check("email", "Email is required").notEmpty(),
            check("email", "Email is not valid").isEmail(),
            check("fullname", "Fullname is required").notEmpty()
        ],
        // Setup Request Limit -> Requests per minute -> 3 request 10 minutes 
        setRequestLimiter(minToMs(RegisterRequestLimit.minutes), RegisterRequestLimit.requests),
        (request, response) => {
            let Payload = {
                success: false,
                status: "error",
                result: "AdminId, Username, Password, Email, Role or Fullname not found in the request.",
            },
                statusCode = 400,
                statusMessage = "Bad Request";
            // Error Check from Request
            if (!validationResult(request).isEmpty()) {
                Payload.success = false;
                Payload.status = "error";
                Payload.result = "AdminId, Username, Password, Email, Role or Fullname not found in the request or might be invalid.";
                statusCode = 400;
                statusMessage = "Bad Request";
                // Logging the response
                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                // Sending the response
                response.status(statusCode).send(Payload);
            } else {
                const
                    RandomPassword = SHA_512(request.body.email + RandomString(16) + "IMAGE_SERVER_HASH"),
                    ResetToken = RandomString(25),
                    VerificationToken = RandomString(20);
                // Fetch Admin Check Admin
                Database
                    .executeQuery(
                        UserTable
                            .select(QueryBuilder.selectType.ALL)
                            .where(`UserId = ${request.body.AdminId}`)
                            .build(),
                        (respAdmin => {
                            if (respAdmin.status) {
                                const { UserGroup } = respAdmin.rows[0];
                                if (UserGroup == userRoles.Admin) {
                                    // Insert User
                                    Database
                                        .executeQuery(
                                            UserTable
                                                .insert(User.InsertColumns, [
                                                    `'${request.body.username}'`,
                                                    `'${request.body.fullname}'`,
                                                    `'${request.body.email}'`,
                                                    `'${RandomPassword}'`,
                                                    `'${userRoles.Admin}'`,
                                                    `'${VerificationToken}'`,
                                                ]).build(),
                                            (createResp => {
                                                if (createResp.status) {
                                                    // Fetch User
                                                    Database
                                                        .executeQuery(
                                                            UserTable
                                                                .select(QueryBuilder.selectType.ALL)
                                                                .where(`Email = '${request.body.email}' AND PASSWORD = '${RandomPassword}'`)
                                                                .build(),
                                                            (selectResp => {
                                                                if (selectResp.status) {
                                                                    // Reset Password
                                                                    const NewUserDetails = selectResp.rows[0];
                                                                    Database
                                                                        .executeQuery(
                                                                            OldPasswordTable
                                                                                .insert(Old_Passwords.InsertColumns,
                                                                                    [
                                                                                        `${NewUserDetails.UserId}`,
                                                                                        `'${ResetToken}'`,
                                                                                        `'${RandomPassword}'`
                                                                                    ])
                                                                                .build(),
                                                                            (res => {
                                                                                const
                                                                                    ResetEndPoint = `http://localhost:${DevelopmentEnv ? 8079 : ServerConfig.server.PORT}/reset?token=${ResetToken}_${NewUserDetails.UserId}&&email=${request.body.email}`,
                                                                                    // Email Verification
                                                                                    VeriFicationEndPoint = `http://localhost:${DevelopmentEnv ? 8079 : ServerConfig.server.PORT}/verify?token=${VerificationToken}&&email=${request.body.email}`,
                                                                                    EmailConfig = {
                                                                                        subject: "Set password and verify your email, ImageServer 🔐",
                                                                                        title: "ImageServer - Email Verification and Setting Password ✉",
                                                                                        user: request.body.username,
                                                                                        email: request.body.email,
                                                                                        message: `Follow this link to set your password.<br><br>
                                                                                                    <span class="text-center"><a href="${ResetEndPoint}" target="_blank" class="btn btn-success">CLick Me 👆 To Set Password</a></span>
                                                                                                    <br> OR --> <a href="${ResetEndPoint}" target="_blank" class="link-success">${ResetEndPoint}</a>
                                                                                                    <strong class="text-danger">This Link is Only Valid for ${ResetExpiry.resetExpireInMinute} Minutes.</strong>
                                                                                                    <hr>
                                                                                                    Follow this link to verify your email address.<br><br>
                                                                                                    <span class="text-center"><a href="${VeriFicationEndPoint}" target="_blank" class="btn btn-success">CLick Me 👆 To Verify Email</a></span>
                                                                                                    <br> OR --> <a href="${VeriFicationEndPoint}" target="_blank" class="link-success">${VeriFicationEndPoint}</a>
                                                                                                    `,
                                                                                    }
                                                                                    ;
                                                                                if (res.status) {
                                                                                    // Success
                                                                                    // Send Email to User
                                                                                    MailHandel.sendEmail(EmailConfig.subject, EmailConfig.email, EmailConfig.user, EmailConfig.title, EmailConfig.message)
                                                                                    // Success Response
                                                                                    Payload.success = true;
                                                                                    Payload.status = "success";
                                                                                    Payload.result = `User with Email ${request.body.email} created successfully, Check Email.`;
                                                                                    statusCode = 200;
                                                                                    statusMessage = "Ok";
                                                                                } else {
                                                                                    // Error
                                                                                    Payload.success = false;
                                                                                    Payload.status = "error";
                                                                                    Payload.result = "Create Request Failed, Please Try Again Later.";
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
                                                                    Payload.result = "Problem in fetching user.";
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
                                                else {
                                                    // Error
                                                    Payload.success = false;
                                                    Payload.status = "error";
                                                    Payload.result = "User Registration Failed, Username or Email already exists.";
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
                                    // Error
                                    Payload.success = false;
                                    Payload.status = "error";
                                    Payload.result = "Invalid Request, Admin Id is not valid.";
                                    statusCode = 500;
                                    statusMessage = "Internal Server Error";
                                    // Logging the response
                                    ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                    // Sending the response
                                    response.status(statusCode).send(Payload);
                                }
                            }
                        }
                        )
                    )
            }
        })
/**
 * @swagger
 * /api/user/delete:
 *  post:
 *      tags: [User]
 *      summary: Delete User -> Requires Access Token
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
 *                          AdminId:
 *                              type: number
 *                              required: true
 *                          UserId:
 *                              type: number
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
 *                                  example: "User updated successfully"
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
UserRouter
    .post("/delete",
        csrfProtection,
        // Validation Check
        [
            check("AdminId").not().isEmpty(),
            check("AdminId").isNumeric(true),
            check("UserId").not().isEmpty(),
            check("UserId").isNumeric(true)
        ],
        (request, response) => {
            let Payload = {
                success: false,
                status: "error",
                result: "AdminId not found in the request.",
            },
                statusCode = 400,
                statusMessage = "Bad Request";
            // Error Check from Request
            if (!validationResult(request).isEmpty()) {
                Payload.success = false;
                Payload.status = "error";
                Payload.result = "AdminId  not found in the request or might be invalid.";
                statusCode = 400;
                statusMessage = "Bad Request";
                // Logging the response
                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                // Sending the response
                response.status(statusCode).send(Payload);
            } else {
                Database
                    .executeQuery(
                        UserTable
                            .select(QueryBuilder.selectType.ALL)
                            .where(`UserId = ${request.body.AdminId}`)
                            .build(),
                        (respAdmin => {
                            if (respAdmin.status) {
                                const { UserGroup, UserId } = respAdmin.rows[0];
                                if (UserGroup == userRoles.Admin) {
                                    if (UserId == request.body.User) {
                                        Payload.success = false;
                                        Payload.status = "error";
                                        Payload.result = "Admin can't delete self.";
                                        statusCode = 400;
                                        statusMessage = "Bad Request";
                                        // Logging the response
                                        ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                        // Sending the response
                                        response.status(statusCode).send(Payload);
                                    } else {
                                        // User Existence Check
                                        Database
                                            .executeQuery(
                                                UserTable
                                                    .select(QueryBuilder.selectType.ALL)
                                                    .where(`UserId = ${request.body.UserId}`)
                                                    .build(),
                                                (userRef => {
                                                    if (userRef.status && userRef.rows.length != 0) {
                                                        // Delete User
                                                        Database
                                                            .executeQuery(
                                                                UserTable
                                                                    .delete()
                                                                    .where(`UserId = ${request.body.UserId}`)
                                                                    .build(),
                                                                (res => {
                                                                    if (res.status) {
                                                                        // Delete All The Images of Respective User
                                                                        Database
                                                                            .executeQuery(
                                                                                ImageTable
                                                                                    .delete()
                                                                                    .where(`UserId = ${request.body.UserId}`)
                                                                                    .build(),
                                                                                (imgDel => {
                                                                                    if (imgDel.status) {
                                                                                        // Delete Image Files
                                                                                        const
                                                                                            imageDir = `${ServerConfig.image.storagePath}/IMAGE_${request.body['UserId']}/`;
                                                                                        if (FileSystem.dir_exists(imageDir)) FileSystem.delete_dir(imageDir, true, true);
                                                                                        Payload.success = true;
                                                                                        Payload.status = "success";
                                                                                        Payload.result = "User deleted successfully.";
                                                                                        statusCode = 200;
                                                                                        statusMessage = "ok";
                                                                                    } else {
                                                                                        Payload.success = false;
                                                                                        Payload.status = "error";
                                                                                        Payload.result = "Unable to delete user.";
                                                                                        statusCode = 500;
                                                                                        statusMessage = "Internal Server Error";
                                                                                    }
                                                                                    // Logging the response
                                                                                    ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                                                                    // Sending the response
                                                                                    response.status(statusCode).send(Payload);
                                                                                }))
                                                                    } else {
                                                                        Payload.success = false;
                                                                        Payload.status = "error";
                                                                        Payload.result = "Unable to delete user.";
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
                                                        // Not Found
                                                        Payload.success = false;
                                                        Payload.status = "error";
                                                        Payload.result = "User Not found";
                                                        statusCode = 404;
                                                        statusMessage = "Not Found";
                                                        // Logging the response
                                                        ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                                        // Sending the response
                                                        response.status(statusCode).send(Payload);
                                                    }
                                                })
                                            )
                                    }
                                } else {
                                    // Unauthorized Request
                                    Payload.success = false;
                                    Payload.status = "error";
                                    Payload.result = "You are not authorized to perform this action.";
                                    statusCode = 401;
                                    statusMessage = "Unauthorized";
                                    // Logging the response
                                    ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                    // Sending the response
                                    response.status(statusCode).send(Payload);
                                }
                            } else {
                                Payload.success = false;
                                Payload.status = "error";
                                Payload.result = "Unauthorized Request, Admin Id is required;"
                                statusCode = 400;
                                statusMessage = "Bad Request"
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
 * /api/user/disable:
 *  post:
 *      tags: [User]
 *      summary: Disables User -> Requires Access Token
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
 *                          AdminId:
 *                              type: number
 *                              required: true
 *                          UserId:
 *                              type: number
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
 *                                  example: "User updated successfully"
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
UserRouter
    .post("/disable",
        csrfProtection,
        // Validation Check
        [
            check("AdminId").not().isEmpty(),
            check("AdminId").isNumeric(true),
            check("UserId").not().isEmpty(),
            check("UserId").isNumeric(true)
        ],
        (request, response) => {
            let Payload = {
                success: false,
                status: "error",
                result: "AdminId or UserId not found in the request.",
            },
                statusCode = 400,
                statusMessage = "Bad Request";
            // Error Check from Request
            if (!validationResult(request).isEmpty()) {
                Payload.success = false;
                Payload.status = "error";
                Payload.result = "AdminId or UserId not found in the request or might be invalid.";
                statusCode = 400;
                statusMessage = "Bad Request";
                // Logging the response
                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                // Sending the response
                response.status(statusCode).send(Payload);
            } else {
                Database
                    .executeQuery(
                        UserTable
                            .select(QueryBuilder.selectType.ALL)
                            .where(`UserId = ${request.body.AdminId}`)
                            .build(),
                        (respAdmin => {
                            if (respAdmin.status) {
                                const { UserGroup } = respAdmin.rows[0];
                                if (UserGroup == userRoles.Admin) {
                                    Database
                                        .executeQuery(
                                            UserTable
                                                .select(QueryBuilder.selectType.ALL)
                                                .where(`UserId = ${request.body.UserId}`)
                                                .build(),
                                            (userRef => {
                                                if (userRef.status && userRef.rows.length != 0) {
                                                    Database
                                                        .executeQuery(
                                                            UserTable
                                                                .update(User.Block, ['1'])
                                                                .where(`UserId = ${request.body.UserId}`)
                                                                .build(),
                                                            (res => {
                                                                if (res.status) {
                                                                    Payload.success = true;
                                                                    Payload.status = "success";
                                                                    Payload.result = "User Updated Successfully.";
                                                                    statusCode = 200;
                                                                    statusMessage = "ok";
                                                                    // Logging the response
                                                                    ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                                                    // Sending the response
                                                                    response.status(statusCode).send(Payload);
                                                                } else {
                                                                    Payload.success = false;
                                                                    Payload.status = "error";
                                                                    Payload.result = "Unable to update user.";
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
                                                    // Not Found
                                                    Payload.success = false;
                                                    Payload.status = "error";
                                                    Payload.result = "User Not found";
                                                    statusCode = 404;
                                                    statusMessage = "Not Found";
                                                    // Logging the response
                                                    ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                                    // Sending the response
                                                    response.status(statusCode).send(Payload);
                                                }
                                            }))
                                } else {
                                    // Unauthorized Request
                                    Payload.success = false;
                                    Payload.status = "error";
                                    Payload.result = "You are not authorized to perform this action.";
                                    statusCode = 401;
                                    statusMessage = "Unauthorized";
                                    // Logging the response
                                    ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                    // Sending the response
                                    response.status(statusCode).send(Payload);
                                }
                            } else {
                                Payload.success = false;
                                Payload.status = "error";
                                Payload.result = "Unauthorized Request, Admin Id is required;"
                                statusCode = 400;
                                statusMessage = "Bad Request"
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
 * /api/user/enable:
 *  post:
 *      tags: [User]
 *      summary: Enables User -> Requires Access Token
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
 *                          AdminId:
 *                              type: number
 *                              required: true
 *                          UserId:
 *                              type: number
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
 *                                  example: "User updated successfully"
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
UserRouter
    .post("/enable",
        csrfProtection,
        // Validation Check
        [
            check("AdminId").not().isEmpty(),
            check("AdminId").isNumeric(true),
            check("UserId").not().isEmpty(),
            check("UserId").isNumeric(true)
        ],
        (request, response) => {
            let Payload = {
                success: false,
                status: "error",
                result: "AdminId or UserId not found in the request.",
            },
                statusCode = 400,
                statusMessage = "Bad Request";
            // Error Check from Request
            if (!validationResult(request).isEmpty()) {
                Payload.success = false;
                Payload.status = "error";
                Payload.result = "AdminId or UserId not found in the request or might be invalid.";
                statusCode = 400;
                statusMessage = "Bad Request";
                // Logging the response
                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                // Sending the response
                response.status(statusCode).send(Payload);
            } else {
                Database
                    .executeQuery(
                        UserTable
                            .select(QueryBuilder.selectType.ALL)
                            .where(`UserId = ${request.body.AdminId}`)
                            .build(),
                        (respAdmin => {
                            if (respAdmin.status) {
                                const { UserGroup, UserId } = respAdmin.rows[0];
                                if (UserGroup == userRoles.Admin) {
                                    Database
                                        .executeQuery(
                                            UserTable
                                                .select(QueryBuilder.selectType.ALL)
                                                .where(`UserId = ${request.body.UserId}`)
                                                .build(),
                                            (userRef => {
                                                if (userRef.status && userRef.rows.length != 0) {
                                                    Database
                                                        .executeQuery(
                                                            UserTable
                                                                .update(User.Block, ['0'])
                                                                .where(`UserId = ${request.body.UserId}`)
                                                                .build(),
                                                            (res => {
                                                                if (res.status) {
                                                                    Payload.success = true;
                                                                    Payload.status = "success";
                                                                    Payload.result = "User Updated Successfully.";
                                                                    statusCode = 200;
                                                                    statusMessage = "ok";
                                                                } else {
                                                                    Payload.success = false;
                                                                    Payload.status = "error";
                                                                    Payload.result = "Unable to update user.";
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
                                                    // Not Found
                                                    Payload.success = false;
                                                    Payload.status = "error";
                                                    Payload.result = "User Not found";
                                                    statusCode = 404;
                                                    statusMessage = "Not Found";
                                                    // Logging the response
                                                    ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                                    // Sending the response
                                                    response.status(statusCode).send(Payload);
                                                }
                                            }))
                                } else {
                                    // Unauthorized Request
                                    Payload.success = false;
                                    Payload.status = "error";
                                    Payload.result = "You are not authorized to perform this action.";
                                    statusCode = 401;
                                    statusMessage = "Unauthorized";
                                    // Logging the response
                                    ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                    // Sending the response
                                    response.status(statusCode).send(Payload);
                                }
                            } else {
                                Payload.success = false;
                                Payload.status = "error";
                                Payload.result = "Unauthorized Request, Admin Id is required;"
                                statusCode = 400;
                                statusMessage = "Bad Request"
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
* /api/user/reset_request:
*  post:
*      tags: [User]
*      summary: Sends Reset Request -> Requires Access Token
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
*                          AdminId:
*                              type: integer
*                              required: true
*                              format: number
*                          Email:
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
*                                  example: "Updated Successful."
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
*                                  example: "UserId Or Email not found in the request or might be invalid"
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
*                                  example: "Unauthorized"
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
*                                  example: "Internal Server Error"
 */
UserRouter
    .post("/reset_request",
        // Checking for CSRF Token
        csrfProtection,
        // Validation Check
        [
            check("Email", "Email is required").notEmpty(),
            check("Email", "Email is not valid").isEmail(),
            check("AdminId").not().isEmpty(),
            check("AdminId").isNumeric(true)
        ],
        (request, response) => {
            let Payload = {
                success: false,
                status: "error",
                result: "Email or AdminId not found in the request.",
            },
                statusCode = 400,
                statusMessage = "Bad Request";
            // Error Check from Request
            if (!validationResult(request).isEmpty()) {
                Payload.success = false;
                Payload.status = "error";
                Payload.result = "Email or AdminId  not found in the request or might be invalid.";
                statusCode = 400;
                statusMessage = "Bad Request";
                // Logging the response
                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                // Sending the response
                response.status(statusCode).send(Payload);
            } else {
                // Query Whether user is Admin or not else only send reset request
                Database
                    .executeQuery(
                        UserTable
                            .select(QueryBuilder.selectType.ALL)
                            .where(`UserId = ${request.body.AdminId}`)
                            .build(),
                        (respAdmin => {
                            if (respAdmin.status) {
                                const { UserGroup, UserId } = respAdmin.rows[0];
                                if (UserGroup == userRoles.Admin) {
                                    if (UserId == request.body.AdminId) {
                                        Payload.success = false;
                                        Payload.status = "error";
                                        Payload.result = "Admin can't send enable own account.";
                                        statusCode = 400;
                                        statusMessage = "Bad Request";
                                        // Logging the response
                                        ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                        // Sending the response
                                        response.status(statusCode).send(Payload);
                                    } else
                                        // Query User Details Using Email
                                        Database
                                            .executeQuery(
                                                UserTable
                                                    .select(QueryBuilder.selectType.COLUMN, User.SelectResetColumns)
                                                    .where(`Email = '${request.body['Email']}'`)
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
                                                                    title: "ImageServer - Reset Password requested by Admin ✉",
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
                                } else {
                                    // Unauthorized Request
                                    Payload.success = false;
                                    Payload.status = "error";
                                    Payload.result = "You are not authorized to perform this action.";
                                    statusCode = 401;
                                    statusMessage = "Unauthorized";
                                    // Logging the response
                                    ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                    // Sending the response
                                    response.status(statusCode).send(Payload);
                                }
                            }
                        })
                    )
            }
        })

/** 
* @swagger
* /api/user/view:
*  post:
*      tags: [User]
*      summary: Retrieves User List -> Requires Access Token
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
*                          AdminId:
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
*                                  example: "Ok."
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
 */
UserRouter
    .post("/view",
        csrfProtection,
        // Validation Check
        [
            check("AdminId").not().isEmpty(),
            check("AdminId").isNumeric(true)
        ],
        (request, response) => {
            let Payload = {
                success: false,
                status: "error",
                result: "AdminId not found in the request.",
            },
                statusCode = 400,
                statusMessage = "Bad Request";
            // Error Check from Request
            if (!validationResult(request).isEmpty()) {
                Payload.success = false;
                Payload.status = "error";
                Payload.result = "AdminId  not found in the request or might be invalid.";
                statusCode = 400;
                statusMessage = "Bad Request";
                // Logging the response
                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                // Sending the response
                response.status(statusCode).send(Payload);
            } else {
                // Fetch user Except Admin
                Database
                    .executeQuery(
                        UserTable
                            .select(QueryBuilder.selectType.COLUMN, User.SelectColumns)
                            .where(`UserId != ${request.body.AdminId}`)
                            .build(),
                        (resp => {
                            if (resp.status) {
                                // Success
                                Payload.success = true;
                                Payload.status = "success";
                                Payload.result = resp.result;
                                statusCode = 200;
                                statusMessage = "Ok";
                                Payload.data = {
                                    users: resp.rows,
                                    length: resp.rows.length
                                }
                            } else {
                                // Error
                                Payload.success = false;
                                Payload.status = "error";
                                Payload.result = "Users not found.";
                                statusCode = 400;
                                statusMessage = "Bad Request";
                            }
                            // Logging the response
                            ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                            // Sending the response
                            response.status(statusCode).send(Payload);
                        })
                    )
            }
        })
    ;
/**
 * @swagger
 * /api/user/userStats:
 *  post:
 *      tags: [User]
 *      summary: Statistics Users -> Requires Access Token
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
 *                          AdminId:
 *                              type: number
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
 *                                  example: "User updated successfully"
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
UserRouter
    .post("/userStats",
        csrfProtection,
        // Validation Check
        [
            check("AdminId").not().isEmpty(),
            check("AdminId").isNumeric(true),
        ],
        (request, response) => {
            let Payload = {
                success: false,
                status: "error",
                result: "AdminId not found in the request.",
            },
                statusCode = 400,
                statusMessage = "Bad Request";
            // Error Check from Request
            if (!validationResult(request).isEmpty()) {
                Payload.success = false;
                Payload.status = "error";
                Payload.result = "AdminId not found in the request or might be invalid.";
                statusCode = 400;
                statusMessage = "Bad Request";
                // Logging the response
                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                // Sending the response
                response.status(statusCode).send(Payload);
            } else {
                Database
                    .executeQuery(
                        UserTable
                            .select(QueryBuilder.selectType.ALL)
                            .where(`UserId = ${request.body.AdminId}`)
                            .build(),
                        (respAdmin => {
                            if (respAdmin.status) {
                                const { UserGroup } = respAdmin.rows[0];
                                if (UserGroup == userRoles.Admin) {
                                    Database
                                        .executeQuery(
                                            `SELECT 
                                                count(*) AS 'TotalUsers',
                                                sum(case when UserGroup = '${userRoles.Admin}' then 1 else 0 end) AS 'Admins',
                                                sum(case when UserGroup = '${userRoles.User}' then 1 else 0 end) AS 'Users',
                                                sum(case when VerificationStatus = 0 then 1 else 0 end) AS 'Unverified',
                                                sum(case when IsDisabled = 1 then 1 else 0 end) AS 'BlockedUsers',
                                                sum(case when IsLoggedIn = 1 then 1 else 0 end) AS 'ActiveUsers'
                                            FROM users;`,
                                            (stats => {
                                                if (stats.status) {
                                                    Payload.success = true;
                                                    Payload.status = "success";
                                                    Payload.result = "Status Fetched Successfully";
                                                    statusCode = 200;
                                                    statusMessage = "ok";
                                                    Payload.data = stats.rows[0]
                                                } else {
                                                    Payload.success = false;
                                                    Payload.status = "error";
                                                    Payload.result = "Problem fetching data";
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
                                    // Unauthorized Request
                                    Payload.success = false;
                                    Payload.status = "error";
                                    Payload.result = "You are not authorized to perform this action.";
                                    statusCode = 401;
                                    statusMessage = "Unauthorized";
                                    // Logging the response
                                    ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                    // Sending the response
                                    response.status(statusCode).send(Payload);
                                }
                            } else {
                                Payload.success = false;
                                Payload.status = "error";
                                Payload.result = "Unauthorized Request, Admin Id is required;"
                                statusCode = 400;
                                statusMessage = "Bad Request"
                                // Logging the response
                                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                // Sending the response
                                response.status(statusCode).send(Payload);
                            }
                        }
                        ))
            }
        })
// Exporting UserRouter
module.exports = UserRouter;
