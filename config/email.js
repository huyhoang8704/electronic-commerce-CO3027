// utils/emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Gửi email OTP xác thực
 * @param {string} to Email người nhận
 * @param {string} otpCode Mã OTP 6 chữ số
 */
async function sendOtpEmail(to, otpCode) {
  const mailOptions = {
    from: `"BK Soft Solutions" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Xác thực Email của bạn (OTP)",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px; text-align: center;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); padding: 30px;">
          
          <!-- Logo -->
          <div style="margin-bottom: 20px;">
            <img src="https://jwiitopxryltgtkbmcsb.supabase.co/storage/v1/object/public/materials/1760114622084-pllu5pxr0h.jpg" alt="BK Soft Solutions Logo" style="width: 120px; height: auto;">
          </div>

          <h2 style="color: #2E86DE; margin-bottom: 10px;">Xin chào,</h2>
          <p style="font-size: 15px; color: #333; margin-bottom: 20px;">
            Bạn đã yêu cầu xác thực email trong hệ thống <b>BK Soft Solutions</b>.
          </p>

          <p style="font-size: 16px; color: #333;">Mã OTP của bạn là:</p>

          <div style="display: inline-block; background-color: #e8f0fe; color: #2E86DE; font-size: 26px; letter-spacing: 4px; font-weight: bold; padding: 12px 24px; border-radius: 8px; margin: 10px 0;">
            ${otpCode}
          </div>

          <p style="font-size: 14px; color: #555;">
            Mã này sẽ hết hạn sau <b>5 phút</b>.<br>
            Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

          <p style="font-size: 13px; color: #888;">
            Trân trọng,<br>
            <b>Đội ngũ hỗ trợ BK Soft Solutions</b><br>
            <a href="https://bksoft.vn" style="color: #2E86DE; text-decoration: none;">https://bksoft.vn</a>
          </p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendOtpEmail };
