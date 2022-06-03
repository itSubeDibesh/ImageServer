/**
 * @swagger
 * tags:
 *  name: Image
 *  description: Endpoint to handle Image related operations 
 *  url: /api/image
 */

const
    // Importing required modules
    { Router, ResponseLogger, FileSystem, ServerConfig, Database, QueryBuilder, DevelopmentEnv } = require("../../../library/server/lib.utility.express"),
    // Extracting Router from Router Class
    ImageRouter = Router();

// Image Test
const
    // ImageDb = Database.currentTable("image"),
    Columns = ["UserId", "FileName", "Extension", "FilePath", "FileType", "FileSize"];

//SQLite3 database/SQLite/ImageServer.db < database/Script/ImageServer.sql -> DB TEST
// First of All Work on Database and Store Image Details first on DB and Create Foreign Key Afterwords

ImageRouter
    .post("/upload", (request, response) => {
        // Handle Upload Request
    })
ImageRouter
    .post("/delete", (request, response) => {
        // Handle Delete Request
    })
ImageRouter
    .post("/view", (request, response) => {
        // Handle View Request Sending Images Along with their route and datasets
    })

// Exporting ImageRouter
module.exports = ImageRouter;