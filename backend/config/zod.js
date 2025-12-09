import {email, z} from "zod";

export const registerSchema = z.object({
    name:z.string().min(3,"Name must be at least 3 characters long"),
    email:z.string().email("Invalid email format"),
    password:z.string().min(4,"Password must be at least four charcters")
});

export const loginSchema = z.object({
    email:z.string().email("Invalid email format"),
    password:z.string().min(4,"Password must be at least four charcters")
});