class ServiceError extends Error {
    public readonly statusCode: number;

    /**
   * Constructor
   * @param {string} message Error message
   * @param {string} statusCode statusCode
   */
    constructor(message: string, statusCode: number) {
        super(message)

        /**
         * assign the error class name in your custom error (as a shortcut)
         */
        this.name = this.constructor.name

        /**
         * capturing the stack trace keeps the reference to your error class
         */
        Error.captureStackTrace(this, this.constructor);

        /**
         * you may also assign additional properties to your error
         */

        this.statusCode = statusCode
    }
}

export { ServiceError }
