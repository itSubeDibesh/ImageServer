const
    // Importing required modules
    { Router, DevelopmentEnv } = require("../../../library/server/lib.utility.express"),
    // Setting Router
    HomeRouter = Router();

if (DevelopmentEnv)
    HomeRouter
        .get("/", (request, response) => {
            // Send a reset request to delete user and its files
            response.status(200).send({
                status: "success",
                message: "Welcome to ImageServer API",
            });
        })
// Exporting Router
module.exports = HomeRouter;