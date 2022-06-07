const
    // Config Imports
    config = require('../../../configuration/access.control.json');
/**
 * @class AccessControl
 * @author Dibesh Raj Subedi
 * @version 1.0.0
 * @description A middleware to handle access control based on config file (json) 
 */
class AccessControl {
    /**
     * @static
     * @description An Express Middleware to handle access control
     * @memberof AccessControl
     */
    static control() {
        return (request, response, next) => {
            // Extracting IP Address
            const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
            // console.log(ip);
            next();
        }
    }
}
// Exporting Module
module.exports = AccessControl