/**
 * @class PasswordAnalyzer
 * @description Analyze password based on features.
 * @author Dibesh Raj Subedi
 * @version 1.0.0
 * @references
 * [Defending against #password cracking](https://auth0.com/blog/defending-against-#password-cracking-understanding-the-math)
 * @includes
 * ```
 * -[X] Input Password
 * -[X] Extract Password Features
 * -[X] Calculate Possible Combinations
 * -[X] Calculate Password Strength (Based on Features)
 * -[X] Detect Is Acceptable Password (Based on Features)
 * ```
 * @testFile
 * - tests/unit/lib.password.analyzer.test.js
 * @example
 * - Via Library
 * ```
 * const 
 *      {Password} = require('library') // Adjust your path to library -> ./library
 *      Analyzer = new Password.Library(),
 *      Result = Analyzer.setPassword('98613524@PasW0rd# cM') // Returns Json Object
 *      // OR Use the following method to get the result indirectly
 *      Analyzer.setPassword('98613524@PasW0rd# cM', false) // Has Nothing to return
 *      Result = Analyzer.analyze() // Returns Json Object
 *      console.log(Result)
 *      // Output: {features: {...}, message: "..."}
 * ```
 * - Via Native
 * ```
 * const
 *     PasswordAnalyzer = require('library/lib.password.analyzer.js'), // Adjust your path to library -> ./library
 *     Analyzer = new PasswordAnalyzer(),
 *      Result = Analyzer.setPassword('98613524@PasW0rd# cM') // Returns Json Object
 *      // OR Use the following method to get the result indirectly
 *      Analyzer.setPassword('98613524@PasW0rd# cM', false) // Has Nothing to return
 *      Result = Analyzer.analyze() // Returns Json Object
 *      console.log(Result)
 *      // Output: {features: {...}, message: "..."}
 * ```
 */
class PasswordAnalyzer {
    /**
     * @description Configurations for the PasswordAnalyzer
     * @static
     * @memberof PasswordAnalyzer
     */
    static Configuration = {
        // Defining Lengths
        length: {
            // Maximum length of #password
            max: 20,
            // Minimum length of #password
            min: 8,
            // Average length of #password
            average: 14
        }
    }
    /**
     * @description Status of the PasswordAnalyzer
     * @static
     * @memberof PasswordAnalyzer
     */
    static Status = {
        // Empty Password
        EMPTY: "empty",
        // Length Check
        SHORT: "length too short",
        AVERAGE: "length average",
        ABOVE_AVERAGE: "length above average",
        LONG: "length too long",
        // Strength Check
        WEAK: "weak",
        MEDIUM: "medium",
        STRONG: "strong",
        // Alerts
        EXTRACTED: "feature extracted",
        COMBINATION: "combination calculated",
    }
    /**
     * @description Stores the status
     * @memberof PasswordAnalyzer
     */
    #statusLog = [];
    /**
     * @description Stores the Acceptability of the Password
     * @memberof PasswordAnalyzer
     */
    #isAcceptable = false;
    /**
     * @description Holds the #password
     * @memberof PasswordAnalyzer
     */
    #password = ``;
    /**
     * @description Holds the #message
     * @memberof PasswordAnalyzer
     */
    #message = ``;
    /**
     * @description Helps to store input data
     * @memberof PasswordAnalyzer
     */
    #features = {
        characters: [], length: 0,
        characterCount: { lowercase: 0, uppercase: 0, number: 0, specialCharacters: 0, whiteSpace: 0 },
        repeatingCharacters: { lowercase: {}, uppercase: {}, number: {}, specialCharacters: {}, whiteSpace: {} },
        characterSampleSpace: { lowercase: 26, uppercase: 26, number: 10, specialCharacters: 33, whiteSpace: 1, total: 96 },
        combinations: { characterPool: 0, possible: 0 },
        strength: { length: '', characterCoverage: '', wordPercent: 0, totalPercent: 0 }
    }
    /**
     * @description Stores the status
     * @memberof PasswordAnalyzer
     */
    #status = PasswordAnalyzer.Status.EMPTY;
    /** 
     * @description Checks the conditions
     * @memberof PasswordAnalyzer
     * @returns {object}
     */
    #checks = {
        string: (character) => typeof (character) === 'string',
        whiteSpace: (character) => this.#checks.string(character) && character === ' ',
        number: (character) => !isNaN(character) && !this.#checks.whiteSpace(character),
        lowercase: (character) => !this.#checks.number(character) && !this.#checks.whiteSpace(character) && character.toUpperCase() !== character && character.toLowerCase() === character,
        uppercase: (character) => !this.#checks.number(character) && !this.#checks.whiteSpace(character) && character.toLowerCase() !== character && character.toUpperCase() === character,
        specialCharacters: (character) => !this.#checks.number(character) && !this.#checks.whiteSpace(character) && !this.#checks.lowercase(character) && !this.#checks.uppercase(character)
    }
    /**
     * @description Checks if Password is not empty and sets the function
     * @memberof PasswordAnalyzer
     * @param {function} callback 
     */
    #passwordNotEmpty(callback) {
        if (this.#password !== ``)
            callback();
        else
            // Set the error
            this.#status = PasswordAnalyzer.Status.EMPTY;
        if (!this.#statusLog.includes(this.#status))
            this.#statusLog.push(this.#status);
    }
    /**
     * @description Gets the #features
     * @memberof PasswordAnalyzer
     * @returns {PasswordAnalyzer}
     */
    #getFeatures() {
        const
            /**
             * @description Updates the repeat characterCount
             * @memberof PasswordAnalyzer - #getFeatures
             * @param {Object} object
             * @param {any} character
             */
            updateRepeat = (object, character) => {
                if (object[character])
                    // Increase the repeat characterCount
                    object[character]++;
                else
                    // Set the repeat characterCount
                    object[character] = 1;
            };
        // Extract Features
        this.#passwordNotEmpty(() => {
            // Split the #password into an array
            this.#features.characters = [...this.#password];
            // Set the length
            this.#features.length = this.#features.characters.length;
            // Set the characterCount along with repeat characterCount
            this
                .#features
                .characters
                .forEach(character => {
                    /** 
                     * Accomplish the following checks for each character type:
                     * - Number Example
                     *  if (this.#checks.number(character)) {
                            this.#features.characterCount.numbers++
                            updateRepeat(this.#features.repeatingCharacters.numbers, character)
                        }
                     */
                    for (const key in this.#features.repeatingCharacters) {
                        if (Object.hasOwnProperty.call(this.#features.repeatingCharacters, key))
                            // Checking the key is of current character type
                            if (this.#checks[key] !== undefined)
                                // Checking if the character is part of repeat
                                if (this.#checks[key](character)) {
                                    // Increase the characterCount
                                    this.#features.characterCount[key]++;
                                    // Update the repeat characterCount
                                    updateRepeat(this.#features.repeatingCharacters[key], character);
                                }
                    }
                });
            this.#status = PasswordAnalyzer.Status.EXTRACTED;
        })
        return this;
    }
    /**
     * @description Gets the total number of possible combinations
     * @memberof PasswordAnalyzer
     * @returns {PasswordAnalyzer}
     */
    #getCombinations() {
        this.#passwordNotEmpty(() => {
            // Set the character pool
            const
                /** 
                 * @description Sets the character pool
                 * @memberof PasswordAnalyzer - #getCombinations
                 */
                setCharacterPool = () => {
                    for (const key in this.#features.characterCount) {
                        if (Object.hasOwnProperty.call(this.#features.characterCount, key))
                            // Checking if the value of current character type is greater than 0
                            if (this.#features.characterCount[key] > 0)
                                // Set the character pool accordingly
                                this.#features.combinations.characterPool += this.#features.characterSampleSpace[key];
                    }
                };
            // Check if #features are extracted
            if (this.#status !== PasswordAnalyzer.Status.EXTRACTED)
                // Extract #features
                this.#getFeatures();
            // Set the character pool
            setCharacterPool();
            // Set the possible combinations -> characterPool ^ length
            this.#features.combinations.possible = this.#features.combinations.characterPool ** this.#features.length;
            this.#status = PasswordAnalyzer.Status.COMBINATION;
        })
        return this;
    }
    /**
     * @description Gets the #password strength and sets the status
     * @memberof PasswordAnalyzer
     * @returns {PasswordAnalyzer}
     */
    #getStrength() {
        this.#passwordNotEmpty(() => {
            //-------------------------------------------------------------------
            //          Variables
            //-------------------------------------------------------------------
            // SHORT: "Password length is too short!"
            // AVERAGE: "Password length is average!"
            // ABOVE_AVERAGE: "Password length is above average!"
            // LONG: "Password length is too long!"
            //-------------------------------------------------------------------
            //          Conditions
            //-------------------------------------------------------------------
            // Less than 8(min) characters -> SHORT
            // Less than 20(max) characters and greater than 8(min) characters and greater than 14(average) characters -> ABOVE_AVERAGE
            // Less than 20(max) characters and greater than 8(min) characters and less than 14(average) characters -> AVERAGE
            // Greater than 20(max) characters -> LONG
            //-------------------------------------------------------------------
            //          Symbols
            //-------------------------------------------------------------------
            // > : Greater than
            // < : Less than
            // = : Equal to
            //-------------------------------------------------------------------
            const length = PasswordAnalyzer.Configuration.length;
            if (this.#features.length < length.min) {
                this.#status = PasswordAnalyzer.Status.SHORT;
                this.#features.strength.length = 'SHORT';
            }
            else if ((this.#features.length <= length.max) && (this.#features.length >= length.min) && (this.#features.length >= length.average)) {
                this.#status = PasswordAnalyzer.Status.ABOVE_AVERAGE;
                this.#features.strength.length = 'ABOVE_AVERAGE';
            }
            else if ((this.#features.length <= length.max) && (this.#features.length >= length.min) && (this.#features.length < length.average)) {
                this.#status = PasswordAnalyzer.Status.AVERAGE;
                this.#features.strength.length = 'AVERAGE';
            }
            else if (this.#features.length > length.max) {
                this.#status = PasswordAnalyzer.Status.LONG;
                this.#features.strength.length = 'LONG';
            }
        });
        // Calculate Coverage based on areas covered by the #password
        this.#features.strength.characterCoverage = parseFloat(((this.#features.combinations.characterPool / this.#features.characterSampleSpace.total) * 100).toFixed(2));
        if (this.#features.strength.length !== undefined && this.#features.strength.length !== "LONG") {
            // Calculate Word Percentage based on the number of words in the #password
            this.#features.strength.wordPercent = parseFloat(((this.#features.length / PasswordAnalyzer.Configuration.length.max) * 100).toFixed(2));
            // Calculate the total percentage combining the coverage and word percentage
            this.#features.strength.totalPercent = parseFloat(((this.#features.strength.characterCoverage + this.#features.strength.wordPercent) / 2).toFixed(2));
        }
        return this;
    }
    /**
     * @description Returns the Message
     * @member of PasswordAnalyzer
     * @returns {PasswordAnalyzer}
     */
    #getMessage() {
        if (this.#password === "")
            this.#message = `Password ${this.#isAcceptable ? 'accepted' : 'not accepted'}, ${this.#statusLog[this.#statusLog.length - 1]}, please enter a password.`;
        else if (this.#statusLog[this.#statusLog.length - 1] === PasswordAnalyzer.Status.LONG)
            this.#message = `Password ${this.#isAcceptable ? 'accepted' : 'not accepted'}, ${this.#statusLog[this.#statusLog.length - 1]}, please enter a password within [${PasswordAnalyzer.Configuration.length.min}-${PasswordAnalyzer.Configuration.length.max}] characters.`;
        else
            this.#message = `Password ${this.#isAcceptable ? 'accepted' : 'not accepted'}, ${this.#statusLog[this.#statusLog.length - 1]}, with ${this.#features.strength.totalPercent}% password strength and ${this.#features.combinations.possible} possible combinations to crack.`;
        return this;
    }
    /**
     * @description Returns if the Password is Acceptable
     * @memberof PasswordAnalyzer
     * @returns {PasswordAnalyzer}
     */
    #getAcceptable() {
        this.#passwordNotEmpty(() => {
            /**
             * Acceptable Condition
             * - Length Should be within [min, max] -> (8,20)
             * - Strength Should be (average or above) but not( long and short) -> (PasswordAnalyzer.Status.AVERAGE|| PasswordAnalyzer.Status.ABOVE_AVERAGE) && !(PasswordAnalyzer.Status.SHORT || PasswordAnalyzer.Status.LONG)
             * - Character Pool Should be greater than 36 -> this.#features.combinations.characterPool > 36
             */
            this.#isAcceptable = false;
            if (
                (
                    (this.#features.length >= PasswordAnalyzer.Configuration.length.min) &&
                    (this.#features.length <= PasswordAnalyzer.Configuration.length.max)
                ) &&
                (
                    (this.#status === PasswordAnalyzer.Status.AVERAGE || this.#status === PasswordAnalyzer.Status.ABOVE_AVERAGE) &&
                    !(this.#status === PasswordAnalyzer.Status.SHORT || this.#status === PasswordAnalyzer.Status.LONG)
                ) &&
                (
                    // 36 Because (UpperCase/Lowercase + Numbers)  should be included to sum up as 36
                    this.#features.combinations.characterPool >= 36
                )
            ) this.#isAcceptable = true;
        })
        return this;
    }
    /**
     * @description Reset the values
     * @memberof PasswordAnalyzer
     * @returns {PasswordAnalyzer}
     */
    #newSetup() {
        this.#status = PasswordAnalyzer.Status.EMPTY;
        this.#statusLog = [];
        this.#password = ``;
        this.#message = ``;
        this.#isAcceptable = false;
        this.#features = {
            characters: [], length: 0,
            characterCount: { lowercase: 0, uppercase: 0, number: 0, specialCharacters: 0, whiteSpace: 0 },
            repeatingCharacters: { lowercase: {}, uppercase: {}, number: {}, specialCharacters: {}, whiteSpace: {} },
            characterSampleSpace: { lowercase: 26, uppercase: 26, number: 10, specialCharacters: 33, whiteSpace: 1, total: 96 },
            combinations: { characterPool: 0, possible: 0 },
            strength: { length: '', characterCoverage: '', wordPercent: 0, totalPercent: 0 }
        }
        return this;
    }
    /**
     * @description Sets a #password
     * @memberof PasswordAnalyzer
     * @param {string} password 
     * @param {boolean} [analyze=true]
     * @returns {PasswordAnalyzer}
     */
    setPassword(password, analyze = true) {
        // Reset All
        this.#newSetup();
        // Set the #password
        this.#password = `${password}`;
        // Call Functions if analyze
        if (analyze)
            return this.analyze();
        else
            console.log(`Please Invoke the analyze() function to get the password analysis.`);
    }
    /**
     * @description Analyzes the #password
     * @memberof PasswordAnalyzer
     * @returns {Object} - Returns the features and message
     * @example
     * ```
     * const passwordAnalyzer = new PasswordAnalyzer();
     * passwordAnalyzer.setPassword('password');
     * const result = passwordAnalyzer.analyze();
     * console.log(result);
     * // Output:
     * { 
     *     features: {
     *         characters: ['p','a','s','s','w','o','r','d'],
     *         length: 8,
     *         characterCount: {
     *             lowercase: 8,
     *             uppercase: 0,
     *             number: 0,
     *             specialCharacters: 0,
     *             whiteSpace: 0
     *         },
     *         repeatingCharacters: {
     *             lowercase: [Object],
     *             uppercase: {},
     *             number: {},
     *             specialCharacters: {},
     *             whiteSpace: {}
     *         },
     *         combinations: 208827064576,
     *         strength: {
     *             length: 'AVERAGE',
     *             characterCoverage: 27.08,
     *             wordPercent: 40,
     *             totalPercent: 33.54
     *         },
     *       isAcceptable: false,
     *      status: ['feature extracted', 'combination calculated', 'length average'],
     *     },
     *       message: 'Password not accepted, length average, with 33.54% password strength and 208827064576 possible combinations to crack.'
     * }
     * ```
     */
    analyze() {
        // Start Analyzing 
        this
            // Get the #features
            .#getFeatures()
            // Get Combinations
            .#getCombinations()
            // Get the strength
            .#getStrength()
            // Get Acceptable
            .#getAcceptable()
            // Get Message
            .#getMessage();
        // Return Analyzed Dataset
        return JSON
            .parse(
                JSON
                    .stringify({
                        features: {
                            characters: this.#features.characters,
                            length: this.#features.length,
                            characterCount: this.#features.characterCount,
                            repeatingCharacters: this.#features.repeatingCharacters,
                            combinations: this.#features.combinations.possible,
                            strength: this.#features.strength,
                            acceptable: this.#isAcceptable,
                            status: this.#statusLog,
                        },
                        message: this.#message,
                    }));
    }
}
// Exporting The Module
module.exports = PasswordAnalyzer;
