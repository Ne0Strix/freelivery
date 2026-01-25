export interface ApiResponse<T> {
    status: string;
    data: T;
}

export interface ApiError {
    error: {
        code: string;
        message: string;
    };
}
