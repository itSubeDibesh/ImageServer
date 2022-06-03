/**
 * @class SqlInjectionMiddleware
 * @author Dibesh Raj Subedi
 * @version 1.0.0
 * @description A middleware to filter out the SQL Injection in Request and Sanitizes the Request
 * @references 
 * 
 * 1. https://snyk.io/blog/sql-injection-cheat-sheet/
 * 2. https://www.owasp.org/index.php/SQL_Injection
 * 
 */
class SQLInjectionMiddleware {
    /**
     * @static
     * @memberof SQLInjectionMiddleware
     * @description Filter out the SQL Injection in Request and Sanitizes the Request
     * @param {string} request -> Request.Query || Request.Params || Request.Body
     * @returns {string}
     */
    static core(request) {
        for (const key in request) {
            if (Object.hasOwnProperty.call(request, key)) {
                if (request[key] != null) {
                    // Removing Every Thing That has following characters in query
                    ["AND", "OR", "NOT", "IN", "LIKE", "BETWEEN",
                        "GROUP BY", "ORDER BY", "HAVING", "LIMIT",
                        "OFFSET", "SLEEP", "WAITFOR", "DELAY", "FOR",
                        "UNION", "BENCHMARK"
                    ]
                        .forEach(conditions => {
                            if (request[key].includes(conditions.toLowerCase()) || request[key].includes(conditions)) {
                                request[key] = request[key].split(conditions)[0];
                            }
                        })

                    // Replacing -- with white space
                    request[key] = request[key].replace(/--/g, "");

                    // Replacing ;-- with white space
                    request[key] = request[key].replace(';--', '');

                    // Replacing - with white space
                    request[key] = request[key].replace(/-/g, "");

                    // Append \ before every types of quotes like ' or " or `
                    let ParseQuery = "";
                    [...request[key]].forEach(char => {
                        if (
                            char == '\"' ||
                            char == '\`' ||
                            char == '“' ||
                            char == '”' ||
                            char == '’'
                        ) ParseQuery += `\\${char}`;
                        // Replace  ' Or ‘ with white space
                        else if (char == "\'" || char == '‘') ParseQuery += "";
                        else ParseQuery += char;

                    })

                    request[key] = ParseQuery.trim();
                }
            }
        }
        return request;
    }
    /**
     * @static
     * @memberof SQLInjectionMiddleware
     * @description Filter out the SQL Injection in Request and Sanitizes the Request
     */
    static filter() {
        return (request, response, next) => {
            if (request.params || request.query || request.body) {
                [request.params, request.query, request.body].forEach(
                    req => {
                        if (req) req = SQLInjectionMiddleware.core(req);
                    }
                );
                next();
            }
        }
    }
}
// Exporting Module
module.exports = SQLInjectionMiddleware