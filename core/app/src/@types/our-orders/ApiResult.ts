export type ApiResult = {
    Status: string;
    Success: boolean;
    Message?: string;
    Errors?: { [key: string]: string[]; };
    Code?: number;
};
