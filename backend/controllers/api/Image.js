/**
 * @swagger
 * tags:
 *  name: Image
 *  description: Endpoint to handle Image related operations 
 *  url: /api/image
 */

const
    // Importing required modules
    {
        Router, ExpressValidator, FileLogger,
        ResponseLogger, csrfProtection,
        setRequestLimiter, ServerConfig,
        getDatabase, minToMs, QueryBuilder
    } = require("../../../library/server/lib.utility.express"),
    // Extracting Packages
    FileSystem = FileLogger.FileSystem,
    Database = getDatabase(),
    // Extracting ExpressValidator from util
    { check, validationResult } = ExpressValidator,
    ImageTable = new QueryBuilder().currentTable("image"),
    UploadRequestLimit = ServerConfig.server.limit.image,
    Image = {
        SelectColumns: ["ImageId", "UserId", "FileName", "Extension", "FilePath", "FileSize", "UploadDate"],
        InsertColumns: ["UserId", "FileName", "Extension", "FilePath", "FileSize"],
    }
// Extracting Router from Router Class
ImageRouter = Router();

/**
* @swagger
* /api/image/upload:
*  post:
*      tags: [Image]
*      summary: Upload Image to ImageServer -> Requires Access Token
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
*              multipart/form-data:
*                  schema:
*                      type: object
*                      properties:
*                          image:
*                              type: array
*                              description: Images to be uploaded
*                              required: true
*                              items:
*                                  type: string
*                                  format: binary
*                          UserId:
*                              type: string
*                              description: UserId of the logged in user
*                              required: true
*                  encoding:
*                      image:
*                      contentType: image/*
*      responses:
*          200:
*              description: Success
*              content:
*                  application/json:
*                      schema:
*                          type: object
*                      properties:
*                          success:
*                              type: bool
*                              description: success of the response
*                          status:
*                              type: string
*                              description: Status of the response
*                          result:
*                              type: string
*                              description: Message of the response
*          400:
*              description: Bad Request
*              content:
*                  application/json:
*                      schema:
*                          type: object
*                      properties:
*                          success:
*                              type: bool
*                              description: error of the response
*                          status:
*                              type: string
*                              description: Status of the response
*                          result:
*                              type: string
*                              description: Message of the response
*          500:
*              description: Internal Server Error
*              content:
*                  application/json:
*                      schema:
*                          type: object
*                      properties:
*                          success:
*                              type: bool
*                              description: error of the response
*                          status:
*                              type: string
*                              description: Status of the response
*                          result:
*                              type: string
*                              description: Message of the response
*/
ImageRouter
    .post("/upload",
        // Checking for CSRF Token
        csrfProtection,
        // Validation Check
        [
            check(['UserId']).not().isEmpty(),
            check("UserId").isNumeric(true)
        ],
        // Implement Request Limit
        // Setup Request Limit -> Requests per minute -> 20 request 10 minutes 
        setRequestLimiter(minToMs(UploadRequestLimit.minutes), UploadRequestLimit.requests),
        (request, response) => {
            const
                filesExists = typeof (request.files) == "object" && Object.keys(request.files).length != 0,
                bodyExists = typeof (request.body) == "object" && Object.keys(request.body).length != 0;
            let Payload = {
                success: false,
                status: "error",
                result: "Images or UserId not found in the request.",
            },
                statusCode = 400,
                statusMessage = "Bad Request";
            if (!validationResult(request).isEmpty()) {
                Payload.success = false;
                Payload.status = "error";
                Payload.result = "UserId or Images not found in the request or might be invalid.";
                statusCode = 400;
                statusMessage = "Bad Request";
                // Logging the response
                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                // Sending the response
                response.status(statusCode).send(Payload);
            } else {
                if (filesExists && bodyExists) {
                    /**
                     * Images is retrieved here after validating the Extension and File Size,
                     * if any of the validation fails image does not gets uploaded to temp directory 
                     * So all I need to do is extract the image from the request.files object and move 
                     * the image to [storage/images] directory according to the users id 
                     */
                    // Images Directory To Store Images Data
                    const
                        imageDir = `${ServerConfig.image.storagePath}/IMAGE_${request.body['UserId']}/`,
                        appImageDir = `${ServerConfig.image.displayPath}/IMAGE_${request.body['UserId']}/`;
                    // Checking IF Image Directory Exists If Not Creating One
                    if (!FileSystem.dir_exists(imageDir)) FileSystem.mkdir(imageDir);
                    let QueryColumn = [];
                    // Iterate Through each image in the request.files object and move the image to the imageDir
                    request.files.forEach(file => {
                        const File = FileSystem.dir_path(file.path) + "\\" + FileSystem.file_path(file.path);
                        // Check if File Exists and Only Moving the file
                        if (FileSystem.file_exists(File))
                            FileSystem.move_file(
                                // SOURCE FILE PATH
                                File,
                                // DESTINATION FILE PATH
                                `${imageDir}/${FileSystem.file_path(file.path)}`
                            );
                        // DB HandLING and Other Data Extraction
                        const
                            FileName = FileSystem.file_name(FileSystem.file_path(file.path)),
                            Extension = FileSystem.file_ext(FileSystem.file_path(file.path)),
                            FilePath = `${appImageDir}/${FileSystem.file_path(file.path)}`,
                            FileSize = FileSystem.file_size(`./${imageDir}/${FileSystem.file_path(file.path)}`);
                        QueryColumn.push([
                            `${request.body['UserId']}`,
                            `'${FileName}'`,
                            `'${Extension}'`,
                            `'${FilePath}'`,
                            `${FileSize}`
                        ]);
                    })
                    // Executing the Query
                    Database.executeQuery(
                        ImageTable.insert(Image.InsertColumns, QueryColumn, QueryBuilder.insertType.BULK).build(), (resp) => {
                            if (resp.status) {
                                Payload.status = "success";
                                Payload.success = true;
                                Payload.result = "Images Uploaded Successfully";
                                statusCode = 200;
                                statusMessage = "OK";
                            } else {
                                Payload.status = "error";
                                Payload.success = false;
                                Payload.result = "Images Uploaded Failed";
                                statusCode = 500;
                                statusMessage = "Internal Server Error";
                            }
                            // Logging the response
                            ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                            // Sending the response
                            response.status(statusCode).send(Payload);
                        })
                } else {
                    // Logging the response
                    ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                    // Sending the response
                    response.status(statusCode).send(Payload);
                }
            }
        })

/** 
* @swagger
* /api/image/delete:
*  post:
*      tags: [Image]
*      summary: Fetch Images of selected User -> Requires Access Token
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
*               application/json:
*                  schema:
*                      type: object
*                      properties:
*                          UserId:
*                              type: number
*                              description: UserId of the logged in user
*                              required: true
*                          ImageId:
*                              type: number
*                              description: ImageId of the image
*                              required: true
*      responses:
*          200:
*              description: Success
*              content:
*                  application/json:
*                      schema:
*                          type: object
*                      properties:
*                          success:
*                              type: bool
*                              description: success of the response
*                          status:
*                              type: string
*                              description: Status of the response
*                          result:
*                              type: string
*                              description: Message of the response
*          400:
*              description: Bad Request
*              content:
*                  application/json:
*                      schema:
*                          type: object
*                      properties:
*                          success:
*                              type: bool
*                              description: error of the response
*                          status:
*                              type: string
*                              description: Status of the response
*                          result:
*                              type: string
*                              description: Message of the response
 */
ImageRouter
    .post("/delete",
        // Checking for CSRF Token
        csrfProtection,
        // Validation Check
        [
            check(['UserId']).not().isEmpty(),
            check("UserId").isNumeric(true),
            check(['ImageId']).not().isEmpty(),
            check("ImageId").isNumeric(true)
        ],
        (request, response) => {
            let Payload = {
                success: false,
                status: "error",
                result: "UserId Or ImageId not found in the request.",
            },
                statusCode = 400,
                statusMessage = "Bad Request";
            if (!validationResult(request).isEmpty()) {
                Payload.success = false;
                Payload.status = "error";
                Payload.result = "UserId Or ImageId not found in the request or might be invalid.";
                statusCode = 400;
                statusMessage = "Bad Request";
                // Logging the response
                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                // Sending the response
                response.status(statusCode).send(Payload);
            } else {
                // Fetch Image Details First
                Database
                    .executeQuery(
                        ImageTable
                            .select(QueryBuilder.selectType.ALL, Image.SelectColumns)
                            .where(`UserId = ${request.body['UserId']} AND ImageId = ${request.body['ImageId']}`)
                            .build(),
                        (resp => {
                            if (resp.status) {
                                const
                                    deleteImage = resp.rows[0],
                                    deleteImagePath = deleteImage.FilePath.replace(ServerConfig.image.displayPath, ServerConfig.image.storagePath);
                                // Check if Image exists and Delete it
                                if (FileSystem.file_exists(deleteImagePath)) {
                                    // Delete Image File from the storage
                                    FileSystem.delete_file(deleteImagePath);
                                }
                                // Delete Command On DB 
                                Database
                                    .executeQuery(
                                        ImageTable
                                            .delete()
                                            .where(`UserId = ${request.body['UserId']} AND ImageId = ${request.body['ImageId']}`)
                                            .build(),
                                        (resp => {
                                            if (resp.status) {
                                                // If Image is deleted successfully then set the Payload to success
                                                Payload.status = "success";
                                                Payload.success = true;
                                                Payload.result = "Image Deleted Successfully";
                                                statusCode = 200;
                                                statusMessage = "OK";
                                                // Logging the response
                                                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                                // Sending the response
                                                response.status(statusCode).send(Payload);
                                            }
                                        })
                                    )
                            } else {
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
* /api/image/view:
*  post:
*      tags: [Image]
*      summary: Fetch Images of selected User -> Requires Access Token
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
*               application/json:
*                  schema:
*                      type: object
*                      properties:
*                          UserId:
*                              type: number
*                              description: UserId of the logged in user
*                              required: true
*      responses:
*          200:
*              description: Success
*              content:
*                  application/json:
*                      schema:
*                          type: object
*                      properties:
*                          success:
*                              type: bool
*                              description: success of the response
*                          status:
*                              type: string
*                              description: Status of the response
*                          result:
*                              type: string
*                              description: Message of the response
*          400:
*              description: Bad Request
*              content:
*                  application/json:
*                      schema:
*                          type: object
*                      properties:
*                          success:
*                              type: bool
*                              description: error of the response
*                          status:
*                              type: string
*                              description: Status of the response
*                          result:
*                              type: string
*                              description: Message of the response
 */
ImageRouter
    .post("/view",
        // Checking for CSRF Token
        csrfProtection,
        // Validation Check
        [
            check(['UserId']).not().isEmpty(),
            check("UserId").isNumeric(true)
        ],
        (request, response) => {
            let Payload = {
                success: false,
                status: "error",
                result: "UserId not found in the request.",
            },
                statusCode = 400,
                statusMessage = "Bad Request";
            if (!validationResult(request).isEmpty()) {
                Payload.success = false;
                Payload.status = "error";
                Payload.result = "UserId not found in the request or might be invalid.";
                statusCode = 400;
                statusMessage = "Bad Request";
                // Logging the response
                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                // Sending the response
                response.status(statusCode).send(Payload);
            } else {
                // Query Database For User having the ID and Send Response
                Database
                    .executeQuery(
                        ImageTable
                            .select(QueryBuilder.selectType.ALL, Image.SelectColumns)
                            .where(`UserId = ${request.body['UserId']}`)
                            .build(),
                        (resp => {
                            if (resp.status) {
                                Payload.status = "success";
                                Payload.success = true;
                                Payload.result = `Images for UserId ${request.body['UserId']}`;
                                statusCode = 200;
                                statusMessage = "OK";
                                Payload.data = {
                                    images: resp.rows,
                                    length: resp.rows.length
                                }
                                // Logging the response
                                ResponseLogger.log(`📶  [${statusCode} ${statusMessage}] with PAYLOAD [${JSON.stringify(Payload)}]`);
                                // Sending the response
                                response.status(statusCode).send(Payload);
                            }
                        })
                    )
            }
        })

// Exporting ImageRouter
module.exports = ImageRouter;