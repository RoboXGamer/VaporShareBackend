import { Resend } from "resend";
import logger from "./logger";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "VaporShare <noreply@resend.dev>", // Note: Replace with verified domain in production
      to,
      subject,
      html,
    });

    if (error) {
      logger.error("Resend Email Error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    logger.error("Email sending failed:", error);
    return { success: false, error };
  }
};
