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
    // Preparing Columns
    User = {
        SelectColumns: ["UserId", "UserName", "FullName", "Email", "UserGroup", "IsDisabled", "IsLoggedIn", "VerificationStatus", "LastPasswordResetDate", "CreatedAt", "UpdatedAt"],
        UpdateFullName: ["FullName"]
    },
    // Extracting Router from util
    UserRouter = Router();
/**
* @swagger
* /api/user/first_name:
*  post:
*      tags: [User]
*      summary: Updates users first name only -> Requires Access Token
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
UserRouter
    .post("/reset_request", (request, response) => {
        // Send a reset request of user to MAIL Client
        response.send({
            status: "success",
            message: "Welcome to SniperCode API",
        });
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
