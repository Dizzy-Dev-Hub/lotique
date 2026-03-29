export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/lotique',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'lotique-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  },

  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  },

  auction: {
    buyersPremiumPercent: 18,
    antiSnipeMinutes: 2,
    antiSnipeThresholdMinutes: 2,
    paymentDueHours: 24,
  },

  email: {
    from: process.env.EMAIL_FROM || 'noreply@lotique.com',
    sendgridApiKey: process.env.SENDGRID_API_KEY || '',
  },
});
