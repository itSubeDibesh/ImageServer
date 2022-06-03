const
    // Importing required modules
    { Router, ExpressValidator, SHA_512, ResponseLogger } = require("../../../library/server/lib.utility.express"),
    // Setting Router
    HomeRouter = Router();

HomeRouter
    .get("/", (request, response) => {
        // Send a reset request to delete user and its files
        response.status(200).send({
            status: "success",
            message: "Welcome to SniperCode API",
        });
    })

// Exporting Router
module.exports = HomeRouter;