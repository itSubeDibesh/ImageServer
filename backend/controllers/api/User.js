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
        timeExceeded, monthToMs, minToMs,
        QueryBuilder, JWT } = require("../../../library/server/lib.utility.express"),
    // Extracting Packages
    Database = getDatabase(),
    // Extracting ExpressValidator from util
    { check, validationResult } = ExpressValidator,
    UserTable = new QueryBuilder().currentTable("users"),
    OldPasswordTable = new QueryBuilder().currentTable("old_passwords"),
    // Extracting Expires
    ResetExpiry = ServerConfig.server.expiry.password,
    // Preparing Columns
    User = {
        SelectColumns: ["UserId", "UserName", "FullName", "Email", "UserGroup", "IsDisabled", "IsLoggedIn", "VerificationStatus", "LastPasswordResetDate", "CreatedAt", "UpdatedAt"],
        UpdateFullName: ["FullName"],
        SelectResetColumns: ["UserId", "UserName", "Email", "PASSWORD"],
    },
    Old_Passwords = {
        InsertColumns: ["UserId", "ResetToken", "HashedPassword"],
    }
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

UserRouter
    .post("/add", (request, response) => {
        // Send a reset request to delete user and its files
        response.send({
            status: "success",
            message: "Welcome to SniperCode API",
        });
    })

UserRouter
    .post("/delete", (request, response) => {
        // Send a reset request to delete user and its files
        response.send({
            status: "success",
            message: "Welcome to SniperCode API",
        });
    })

UserRouter
    .post("/disable", (request, response) => {
        // Send a reset request to disable user from access
        response.send({
            status: "success",
            message: "Welcome to SniperCode API",
        });
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
            check(['AdminId']).not().isEmpty(),
            check(['AdminId']).isNumeric(true)
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
                                const { UserGroup } = respAdmin.rows[0];
                                if (UserGroup == userRoles.Admin) {
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

UserRouter
    .post("/view", (request, response) => {
        // Send List of User Along with Other Information
        // For Admin To Manage the User
        response.send({
            status: "success",
            message: "Welcome to SniperCode API",
        });
    })
    ;

// Exporting UserRouter
module.exports = UserRouter;
