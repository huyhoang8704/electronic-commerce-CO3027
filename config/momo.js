const config = {
  partnerCode: process.env.MOMO_PARTNER_CODE,
  accessKey: process.env.MOMO_ACCESS_KEY,
  secretKey: process.env.MOMO_SECRET_KEY,
  apiUrl:
    process.env.MOMO_API_URL ||
    "https://test-payment.momo.vn/v2/gateway/api/create",
  redirectUrl: process.env.MOMO_REDIRECT_URL,
  ipnUrl: process.env.MOMO_IPN_URL,
};

// Debug log to verify environment variables are loaded
if (!config.partnerCode || !config.accessKey || !config.secretKey) {
  console.warn(
    "⚠️  MoMo configuration is incomplete. Please check your .env file:"
  );
  console.warn("   MOMO_PARTNER_CODE:", config.partnerCode ? "✓" : "✗ MISSING");
  console.warn("   MOMO_ACCESS_KEY:", config.accessKey ? "✓" : "✗ MISSING");
  console.warn("   MOMO_SECRET_KEY:", config.secretKey ? "✓" : "✗ MISSING");
}

module.exports = config;
