export function checkPasswordRegex(password: string) {
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must include at least one lowercase letter.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter.";
  }
  if (!/\d/.test(password)) {
    return "Password must include at least one number.";
  }
}
export function checkUsernameRegex(username: string) {
  if (!/^[a-zA-Z0-9_-]{1,20}$/.test(username)) {
    return "Username must be 1-20 characters and can only contain letters, numbers, underscores, or hyphens.";
  }
}

export function checkInputType({
  username,
  email,
  password,
  body,
  recipientUserId,
}: {
  username?: unknown;
  email?: unknown;
  password?: unknown;
  body?: unknown;
  recipientUserId?: unknown;
}) {
  if (username !== undefined && typeof username !== "string")
    return "Invalid username.";
  if (email !== undefined && typeof email !== "string") return "Invalid email.";
  if (password !== undefined && typeof password !== "string")
    return "Invalid password.";
  if (body !== undefined && typeof body !== "string")
    return "Invalid message body.";
  if (recipientUserId !== undefined && typeof recipientUserId !== "number")
    return "Invalid recipient ID.";
}
