/**
 * @class Console
 * @description Logs data con customized console.
 * @author Dibesh Raj Subedi
 * @version 1.0.0
 */
class Console {
    /**
     * @description Stores The Name of Logger
     * @memberof Console
     */
    #Name;
    /**
     * @description Sets of Colors for Console
     * @memberof Console
     * @static
     */
    static Colors = {
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
        gray: "\x1b[90m",
        grey: "\x1b[90m",
        black: "\x1b[30m",
        bgRed: "\x1b[41m",
        bgGreen: "\x1b[42m",
        bgYellow: "\x1b[43m",
        bgBlue: "\x1b[44m",
        bgMagenta: "\x1b[45m",
        bgCyan: "\x1b[46m",
        bgWhite: "\x1b[47m",
        bgBlack: "\x1b[40m",
        reset: "\x1b[0m",
    };
    /**
     * @description Factory Method to create types of logs
     * @memberof Console
     * @param {function} method 
     * @param {Console.Colors} color -> The Color of Logger
     * @returns {function}
     */
    #factoryMethod = (method, color) => (message) => {
        if (typeof message === "object" && !Array.isArray(message))
            method(color, `${this.#Name}: \n`, Console.Colors.reset, ...message);
        else method(color, `${this.#Name}: ${message}`, Console.Colors.reset);
    };
    /**
     * @constructor
     * @description Instance of Console
     * @memberof Console 
     * @param {string} Name -> The Name of Logger
     */
    constructor(Name) {
        this.#Name = Name;
    }
    /**
     * @description Logs the data in console
     * @memberof Console
     * @param {any} message -> The Message to Log
     * @param {Console.Colors} color -> The Color of Logger 
     * @returns {void}
     */
    log = (message, color = Console.Colors.green) => this.#factoryMethod(console.log, color)(message);
    /**
     * @description Logs the error in console
     * @memberof Console
     * @param {any} message -> The Message to Log
     * @param {Console.Colors} color -> The Color of Logger 
     * @returns {void}
     */
    error = (message, color = Console.Colors.red) => this.#factoryMethod(console.error, color)(message);
    /**
     * @description Logs the warning in console
     * @memberof Console
     * @param {any} message -> The Message to Log
     * @param {Console.Colors} color -> The Color of Logger 
     * @returns {void}
     */
    warn = (message, color = Console.Colors.yellow) => this.#factoryMethod(console.warn, color)(message);
    /**
     * @description Logs the info in console
     * @memberof Console
     * @param {any} message -> The Message to Log
     * @param {Console.Colors} color -> The Color of Logger 
     * @returns {void}
     */
    info = (message, color = Console.Colors.blue) => this.#factoryMethod(console.info, color)(message);
    /**
     * @description Clears Console
     * @memberof Console
     * @returns {void}
     */
    clear = () => console.clear();
    /**
     * @description Returns the name of Logger
     * @memberof Console
     * @returns {string}
     */
    name = () => this.#Name;
    /**
     * @description Sets the name of Logger
     * @memberof Console
     * @param {string} name 
     * @returns {void}
     */
    setName = (name) => (this.#Name = name);
};
// Export the Module
module.exports = Console;