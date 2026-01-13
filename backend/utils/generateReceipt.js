import PDFDocument from "pdfkit";
import cloudinary from "cloudinary";

export const generateAndUploadReceipt = async (order) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const uploadStream = cloudinary.v2.uploader.upload_stream(
            { resource_type: "raw", folder: "receipts", public_id: `receipt_${order._id}.pdf` },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );

        doc.pipe(uploadStream);

        // --- 1. HEADER & BRANDING ---
        doc.rect(0, 0, 612, 100).fill("#1A237E"); // Navy Blue Header Bar
        doc.fillColor("#FFFFFF").fontSize(25).text("LUXE STAY HOTEL", 50, 40, { bold: true });
        doc.fontSize(10).text("123 Hospitality Lane, City Center", 50, 70);

        doc.moveDown(4);
        doc.fillColor("#333333"); // Back to dark grey text

        // --- 2. INVOICE INFO ---
        doc.fontSize(20).text("PAYMENT RECEIPT", { align: "right" });
        doc.fontSize(10).text(`Invoice No: ${order._id.toString().toUpperCase()}`, { align: "right" });
        doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" });

        doc.moveDown();
        doc.path("M 50 160 L 550 160").stroke(); // Horizontal Line Separator
        doc.moveDown();

        // --- 3. CUSTOMER & STAY DETAILS ---
        doc.fontSize(12).text("BILL TO:", { underline: true, bold: true });
        doc.fontSize(11).text(`Customer: ${order.userId.name}`);
        doc.text(`Email: ${order.userId.email}`);

        doc.moveDown();
        doc.fontSize(12).text("STAY DETAILS:", { underline: true, bold: true });
        doc.fontSize(11).text(`Room: ${order.roomId.name} (${order.roomId.type})`);
        doc.text(`Check-in: ${new Date(order.checkInDate).toDateString()}`);
        doc.text(`Check-out: ${new Date(order.checkOutDate).toDateString()}`);

        doc.moveDown(2);

        // --- 4. SUMMARY TABLE ---
        const tableTop = 350;
        doc.rect(50, tableTop, 500, 25).fill("#F5F5F5");
        doc.fillColor("#333333").fontSize(11).text("Description", 60, tableTop + 7);
        doc.text("Amount", 480, tableTop + 7);

        doc.fontSize(11).text(`Room Booking (${order.roomId.name})`, 60, tableTop + 40);
        doc.text(`$${order.totalPrice}.00`, 480, tableTop + 40);

        doc.path("M 50 420 L 550 420").stroke();

        // --- 5. TOTAL ---
        doc.moveDown(2);
        doc.fontSize(16).fillColor("#1A237E").text(`TOTAL PAID: $${order.totalPrice}.00`, { align: "right", bold: true });

        // --- 6. FOOTER ---
        doc.fontSize(10).fillColor("#999999").text("Thank you for choosing Luxe Stay Hotel!", 50, 700, { align: "center" });

        doc.end();
    });
};