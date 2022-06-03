/**
 * @class RouterFactory
 * @description This class is responsible for handling the routes
 * @author Dibesh Raj Subedi
 * @version 1.0.0
 */
class RouterFactory {
    /**
     * @description Embedding File System from SniperCode.Filesystem
     * @memberof RouterFactory
     * @instance SniperCode.Filesystem.File_System
     * @version 1.0.1
     * @static
     */
    static FileSystem = require('snipercode.filesystem').File_System;
    /**
     * @description Setting up Router Dynamically
     * @memberof RouterFactory
     * @returns {RouterFactory}
     */
    setUpControllers() {
        if (this.BasePath && this.ControllerType) {
            // Extracting Controllers
            const Controllers = RouterFactory.FileSystem.scan_dir_recursive(this.BasePath);
            if (Controllers.length != 0) {
                Controllers
                    .forEach(ControllerPath => {
                        const
                            // Extracting Controller Details Based on Path
                            Directories = ControllerPath.split('\\'),
                            // Extracting File Name
                            ControllerFile = Directories[Directories.length - 1],
                            // Getting Controller Name
                            ControllerName = ControllerFile.split('.')[0],
                            // UpperCase Controller Type
                            UcControllerType = this.ControllerType.toUpperCase(),
                            // LowerCase Controller Name
                            LcControllerName = ControllerName.toLowerCase(),
                            // Checking if its a API Controller
                            IsAPI = UcControllerType === 'API',
                            // Normal Dir Length Before Nesting
                            CasualDirLength = 4;
                        // Check the nested directory an create endpoint accordingly
                        let
                            // API Dir Name
                            ApiDir = "api/";
                        if (Directories.length > CasualDirLength) {
                            // Extract Extra directories and Create ApiDir
                            const extraDirs = Directories.splice(CasualDirLength - 1, Directories.length);
                            // Removing the last directory i.e file
                            extraDirs.splice(-1, 1);
                            // Loop and Append to ApiDir
                            extraDirs.forEach(dir => {
                                ApiDir += dir.toLowerCase() + '/';
                            })
                        }
                        // Exporting Dynamic Controller
                        this.$.Logger.log(`🔗 Establishing ${this.ControllerType} Controller [${ControllerName}] at [/${IsAPI ? ApiDir + LcControllerName + "/" : ""}] with ${RouterFactory.FileSystem.path_resolve(ControllerPath).replace(/\\/g, '/')}`)
                        // Defining Controller dynamically
                        this.$.server.use(`/${IsAPI ? ApiDir + LcControllerName + "/" : ""}`, require(`${RouterFactory.FileSystem.path_resolve(ControllerPath)}`))
                    })
            }
        }
        else
            this.$.Logger.cli.error(`🔗 Base Path and Controller type is not set.`);
        return this;
    }
    /**
     * @description Sets the Base Path of the Controller
     * @memberof RouterFactory
     * @param {string} path 
     * @returns {RouterFactory}
     */
    setControllerPath(path) {
        this.BasePath = path;
        return this;
    }
    /**
     * @description Setting up controller type
     * @memberof RouterFactory
     * @param {string} type 
     * @returns {RouterFactory}
     */
    setControllerType(type) {
        this.ControllerType = type;
        return this;
    }
    /**
     * @description Constructor of RouterFactory Class creating instance of RouterFactory
     * @constructor
     * @param {Server} ServerInstance -> Instance of Express Server from Library
     * @memberof RouterFactory
     */
    constructor(ServerInstance) {
        this.$ = ServerInstance;
    }
}
// Exporting the module
module.exports = RouterFactory;