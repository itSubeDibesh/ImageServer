let
    /**
       * @description Stores the expiry tokens to prevent from hijacking
       */
    tokensStore = new Set(),
    // Config Imports
    config = require('../../../configuration/server.json'),
    /**
      * @description Importing Json Web Token
      */
    JWT = require('jsonwebtoken');
/**
 * @class SessionExpiry
 * @author Dibesh Raj Subedi
 * @version 1.0.0
 * @description A middleware to check if session has expired
 */
class SessionExpiry {
    /**
     * @static 
     * @memberof SessionExpiry
     * @description Checks If the User is Logged In
     */
    static checkExpiry() {
        return (request, response, next) => {
            // JWT should expire when time is out -> handled by auth.loggedin middleware so,
            // JWT should expire when user hits logout route
            // So i need to intercept logout route and store the
            // expired token and check if a request is being made using 
            // Same token, if so throw unauthorized access 
            if (request.headers.authorization) {
                const token = request.headers.authorization.split(" ")[1];
                // Intercepting Logout request and its headers
                if (request.url == '/api/auth/logout') {
                    // Extracting JWT from Header
                    // Storing the token in store
                    tokensStore.add(token)
                    // Proceeding to next middleware
                    next();
                } else {
                    // Evaluate if the request header includes same token as stored in store
                    if (tokensStore.has(token)) {
                        // Check Expiry of token and remove token from store if expired
                        response.status(401).send({
                            status: "error",
                            success: false,
                            result: "Session Expired, Please Login Again"
                        });
                    }
                }
            } next();
        }
    }
}
module.exports = SessionExpiry;