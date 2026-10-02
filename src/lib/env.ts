export const env = (variable: string): string => {
    return process.env[variable] || "http://localhost:8080/api";
};
