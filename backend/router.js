// Importing Router Factory
const RouterFactory = require('../library/server/middleware/lib.router.factory');
/**
 * @class ApiRouter
 * @description This class is responsible for handling the API routes
 * @author Dibesh Raj Subedi
 * @version 1.0.0
 */
class ApiRouter extends RouterFactory {
    /**
     * @description Controller Path
     * @static
     * @memberof ApiRouter
     */
    static ControllerPath = "./backend/controllers/api/";
    /**
     * @description Constructor of ApiRouter Class creating instance of ApiRouter
     * @constructor
     * @extends RouterFactory
     * @param {Server} ServerInstance -> Instance of Express Server from Library
     * @memberof ApiRouter
     */
    constructor(ServerInstance) {
        super(ServerInstance);
        this
            // Setting Controller Type
            .setControllerType("API")
            // Setting Controller Path
            .setControllerPath(ApiRouter.ControllerPath)
            ;
    }
}
/**
 * @class WebRouter
 * @description This class is responsible for handling the API routes
 * @author Dibesh Raj Subedi
 * @version 1.0.0
 */
class WebRouter extends RouterFactory {
    /**
     * @description Controller Path
     * @static
     * @memberof WebRouter
     */
    static ControllerPath = "./backend/controllers/web/";
    /**
     * @description Constructor of WebRouter Class creating instance of WebRouter
     * @constructor
     * @extends RouterFactory
     * @param {Server} ServerInstance -> Instance of Express Server from Library
     * @memberof WebRouter
     */
    constructor(ServerInstance) {
        super(ServerInstance);
        this
            // Setting Controller Type
            .setControllerType("Web")
            // Setting Controller Path
            .setControllerPath(WebRouter.ControllerPath)
            ;
    }
}
// Exporting the module
module.exports = {
    ApiRouter,
    WebRouter
};