const
    // Config Imports
    config = require('../../../configuration/server.json'),
    /**
    * @description Importing Json Web Token
    */
    JWT = require('jsonwebtoken');
/**
 * @class LoginMiddleware
 * @author Dibesh Raj Subedi
 * @version 1.0.0
 * @description A middleware to check if user is logged in
 */
class LoginMiddleware {
    /**
     * @static 
     * @memberof LoginMiddleware
     * @description Checks If the User is Logged In
     */
    static checkLogin() {
        return (request, response, next) => {
            let Payload = {
                status: "error",
                success: false,
                result: "Unauthorized Access, Please Login First"
            }, StatusCode = 401,
                Escape = [];
            // check if requested url is not in array
            config.jwt.appliedEndPoints.forEach(endpoint => {
                if (request.url.includes(endpoint)) Escape.push(endpoint)
            })
            if (Escape.length == 0) {
                next();
                return;
            } else {
                // Checking If UserId Is Not Passed On Token
                if (request.body.UserId == null) {
                    response.status(StatusCode).send(Payload);
                }
                // If other url check header containing JWT
                if (request.headers.authorization) {
                    // Extracting JWT from Header
                    const token = request.headers.authorization.split(" ")[1];
                    // Check IF Token Has Expired
                    if (Date.now() >= JWT.verify(token, config.jwt.secret).exp * 1e3) {
                        Payload.result = "Token Expired, Please Login Again";
                        response.status(StatusCode).send(Payload);
                    }
                    // Verifying JWT
                    JWT.verify(token, config.jwt.secret, (err, decoded) => {
                        if (err) response.status(StatusCode).send(Payload);
                        // On Identity Check is Successful
                        if (decoded.UserId == request.body.UserId) next();
                    });
                } else response.status(StatusCode).send(Payload);
            }
        }
    }
}
module.exports = LoginMiddleware;