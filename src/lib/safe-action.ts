import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient({
  // Log the action for security auditing
  handleServerErrorLog: (e) => {
    console.error("Action Server Error:", e.message);
  },
  // Handle server errors and return a generic message to the client
  handleReturnedServerError: (e) => {
    if (e instanceof Error) {
      return e.message;
    }
    return "An unexpected error occurred. Please try again later.";
  },
});
