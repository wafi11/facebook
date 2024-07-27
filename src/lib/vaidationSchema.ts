import z from "zod";
const RequiredString = z.string().trim().min(1, "Required");

export const register = z.object({
  email: RequiredString.email("Invalid Email address"),
  name: RequiredString.regex(
    /^[a-zA-Z0-9]+$/,
    "Only Lettees,numbers,-and _ allowed"
  ),
  password: RequiredString.min(8, "Must have at least 8 characters"),
});

export type RegisterSchema = z.infer<typeof register>;

export const loginSchema = z.object({
  name: RequiredString,
  password: RequiredString,
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const createPostsSchema = z.object({
  content: RequiredString,
  mediaIds: z.array(z.string()).max(5, "Cannot have more than 5 projects"),
});

export const UpdateUserProfile = z.object({
  displayname: RequiredString,
  bio: z.string().max(100, "Must has 100 characters"),
});

export const createComments = z.object({
  content: RequiredString,
});
export type UpdateUserProfileValues = z.infer<typeof UpdateUserProfile>;
