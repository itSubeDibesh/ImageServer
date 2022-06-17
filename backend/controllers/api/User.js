/**
 * @swagger
 * tags:
 *  name: User
 *  description: Endpoint to handle User related operations
 *  url: /api/user
 */

const
    // Importing required modules
    { Router } = require("../../../library/server/lib.utility.express"),
    // Extracting Router from util
    UserRouter = Router();

UserRouter
    .post('/first_name', (request, response) => {
        // Retrieve first name from request body
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
