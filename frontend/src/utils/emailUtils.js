import axios from "axios";

export const sendReceiptEmail = async (transaction, pdfData) => {
    try {
        const response = await axios.post(`${BASE_URL}/email/send-receipt`, {
            email: transaction.customerEmail,
            subject: "Your Transaction Receipt",
            text: `Dear ${transaction.customerName},\n\nAttached is your receipt for Transaction ID: ${transaction.id}.`,
            pdfData,
            pdfFilename: `receipt_${transaction.id}.pdf`
        });

        return response.data;
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, message: "Failed to send receipt" };
    }
};
