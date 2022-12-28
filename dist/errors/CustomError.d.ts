export default class CustomError extends Error {
    constructor(exception: Exception);
}
export interface Exception {
    type: string;
    message: string;
}
//# sourceMappingURL=CustomError.d.ts.map