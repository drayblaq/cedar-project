const errorMap: Record<string, string> = {
  "Invalid login credentials": "The email or password you entered is incorrect. Please try again.",
  "Email not confirmed": "Please check your email and confirm your account first.",
  "User already registered": "An account with this email already exists.",
  "Password should be at least 6 characters": "Your password must be at least 6 characters long.",
  "Unable to validate email address: invalid format": "Please enter a valid email address.",
  "New password should be different from the old password": "Please choose a different password than your current one.",
  "Token has expired or is invalid": "This link has expired. Please request a new one.",
  "Email rate limit exceeded": "Too many attempts. Please wait a few minutes and try again.",
  "over_email_send_rate_limit": "Too many emails sent. Please wait a few minutes and try again.",
  "User not found": "No account found with that email address.",
  "Invalid email or password": "The email or password you entered is incorrect. Please try again.",
  "signup_disabled": "New sign-ups are currently disabled. Please contact support.",
  "email_address_invalid": "Please enter a valid email address.",
};

export function friendlyError(message: string): string {
  if (!message) return "Something went wrong. Please try again.";
  if (errorMap[message]) return errorMap[message];
  const lower = message.toLowerCase();
  for (const [key, value] of Object.entries(errorMap)) {
    if (lower.includes(key.toLowerCase())) return value;
  }
  return "Something went wrong. Please try again or contact support if the problem continues.";
}
