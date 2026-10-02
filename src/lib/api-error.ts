export class ApiError extends Error {
    status: number;
    fieldErrors?: Record<string, string>;

    constructor(
        message: string,
        status: number,
        fieldErrors?: Record<string, string>,
    ) {
        super(message);
        this.status = status;
        this.fieldErrors = fieldErrors;
    }
}
