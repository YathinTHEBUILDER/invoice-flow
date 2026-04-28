import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient({
  // Handle server errors and return a message to the client
  handleServerError: (e) => {
    console.error("Action Server Error:", e.message);
    return e.message || "An unexpected error occurred. Please try again later.";
  },
});
