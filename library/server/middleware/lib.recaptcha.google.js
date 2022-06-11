const
    // Config Imports
    config = require('../../../configuration/server.json'),
    // Importing Fetch from node
    fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
/**
 * @class ReCaptcha
 * @author Dibesh Raj Subedi
 * @version 1.0.0
 * @description A middleware to handle access captcha
 */
class ReCaptcha {
    /**
     * @static
     * @description An Express Middleware to handle access captcha
     * @memberof ReCaptcha
     */
    static async captcha() {
        return async (request, response, next) => {
            if (request.method === 'POST') {
                const
                    CaptchaConfig = config.reCaptcha;
                let Includes = [];
                // If Captcha is not enabled then skip
                CaptchaConfig.endPoints.forEach(endPoint => {
                    // If Should search for captcha in the endPoint
                    if (request.url == endPoint) Includes.push(endPoint);
                })
                // If Captcha is not enabled then skip
                if (Includes.length === 0)
                    next();
                // If Captcha is Not Found
                if (!request.body.captcha)
                    return response.status(400).json({
                        success: false,
                        status: "error",
                        result: `Captcha is required`,
                    });

                const
                    // Extracting Secret Key
                    secretKey = CaptchaConfig.secretKey,
                    // Preparing Verification Payload
                    payload = JSON.stringify({
                        secret: secretKey,
                        response: request.body.captcha,
                        remoteip: request.headers['x-forwarded-for'] || request.connection.remoteAddress
                    }),
                    // Preparing URL
                    url = `https://www.google.com/recaptcha/api/siteverify?${payload}`,
                    // Preparing Request 
                    body = await fetch(url).then(res => res.json());
                // If Captcha is not verified
                if (body.success !== undefined && !body.success)
                    return response.status(400).json({
                        success: false,
                        status: "error",
                        result: `Failed to verify captcha`,
                    });
                // If Captcha is verified       
                next();
            }
            next()
        }
    }
}
// Exporting Module
module.exports = ReCaptcha