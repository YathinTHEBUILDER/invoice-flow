"use server";

export async function submitContactForm(formData: { name: string; email: string; message: string }) {
  const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID;
  if (!formspreeId || formspreeId === "YOUR_FORMSPREE_FORM_ID") {
    return { success: false, error: "Formspree Form ID is not configured on the server." };
  }

  try {
    const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      return { success: true };
    } else {
      const data = await response.json();
      if (data.errors) {
        return { success: false, error: data.errors.map((err: any) => err.message).join(", ") };
      }
      return { success: false, error: "Failed to send message. Please try again later." };
    }
  } catch (error) {
    console.error("Error in submitContactForm action:", error);
    return { success: false, error: "An error occurred on the server while sending the message." };
  }
}
