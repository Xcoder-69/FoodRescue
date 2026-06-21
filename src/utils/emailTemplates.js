/**
 * FoodRescue Email Templates
 * All templates return { subject, html } objects
 * Styled with FoodRescue brand colours: #006c49 (primary green), #fd761a (orange accent)
 */

// ─── Shared Layout ────────────────────────────────────────────────────────────

const wrap = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FoodRescue</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background-color: #f4fbf4; font-family: 'Segoe UI', Arial, sans-serif; color: #161d19; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,108,73,0.10); }
    .header { background: linear-gradient(135deg, #006c49 0%, #10b981 100%); padding: 32px 40px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
    .header p  { color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 4px; }
    .body { padding: 36px 40px; }
    .body h2 { font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #006c49; }
    .body p  { font-size: 15px; line-height: 1.7; color: #3c4a42; margin-bottom: 16px; }
    .btn { display: inline-block; margin: 8px 0 24px; padding: 14px 32px; background: #006c49; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px; }
    .btn:hover { background: #005238; }
    .otp-box { display: inline-block; background: #f4fbf4; border: 2px solid #10b981; border-radius: 12px; padding: 18px 40px; font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #006c49; margin: 16px 0 24px; }
    .divider { border: none; border-top: 1px solid #e8f0e9; margin: 24px 0; }
    .footer { background: #eef6ee; padding: 20px 40px; text-align: center; font-size: 12px; color: #6c7a71; line-height: 1.6; }
    .tag { display: inline-block; background: #fd761a; color: #ffffff; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
    .highlight { color: #006c49; font-weight: 600; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🍱 FoodRescue</h1>
      <p>Rescuing Food. Feeding Lives.</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>This email was sent by FoodRescue Distribution System.</p>
      <p>If you did not request this, please ignore it or contact support.</p>
      <p style="margin-top: 8px;">© ${new Date().getFullYear()} FoodRescue. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// ─── Welcome Email ────────────────────────────────────────────────────────────

/**
 * Welcome email sent after successful registration
 * @param {string} displayName - User's display name
 * @param {string} role        - 'restaurant' | 'ngo' | 'volunteer'
 */
const welcomeEmail = (displayName, role) => {
  const roleMessages = {
    restaurant: {
      emoji: '🍽️',
      headline: 'Start Donating Food Today',
      detail: 'Complete your restaurant profile, upload your FSSAI licence, and post your first food donation. Nearby NGOs will be notified instantly.',
    },
    ngo: {
      emoji: '🏠',
      headline: 'Start Accepting Donations',
      detail: 'Complete your NGO registration and submit your documents for admin verification. Once verified, you can browse and accept food donations near you.',
    },
    volunteer: {
      emoji: '🚴',
      headline: 'Ready to Make a Difference?',
      detail: 'Complete your volunteer profile, set your vehicle type, and toggle yourself online to start receiving pickup assignments near you.',
    },
  };

  const { emoji, headline, detail } = roleMessages[role] || roleMessages.volunteer;

  const html = wrap(`
    <span class="tag">${role}</span>
    <h2>Welcome to FoodRescue, ${displayName}! ${emoji}</h2>
    <p>We're thrilled to have you join our community of food rescuers. Together, we're fighting hunger one meal at a time.</p>
    <hr class="divider" />
    <h2>${headline}</h2>
    <p>${detail}</p>
    <hr class="divider" />
    <p style="font-size: 13px; color: #6c7a71;">
      Together, we've already saved over <span class="highlight">2.4 million meals</span>. You're now part of that story. 🌱
    </p>
  `);

  return {
    subject: `Welcome to FoodRescue, ${displayName}! 🍱`,
    html,
  };
};

// ─── Forgot Password Email ────────────────────────────────────────────────────

/**
 * Password reset email with Firebase-generated reset link
 * @param {string} displayName - User's display name
 * @param {string} resetLink   - Firebase Auth password reset URL
 */
const forgotPasswordEmail = (displayName, resetLink) => {
  const html = wrap(`
    <h2>Reset Your Password 🔐</h2>
    <p>Hi <span class="highlight">${displayName}</span>,</p>
    <p>We received a request to reset the password for your FoodRescue account. Click the button below to create a new password:</p>
    <div style="text-align: center; margin: 24px 0;">
      <a class="btn" href="${resetLink}">Reset My Password</a>
    </div>
    <p>This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password won't change.</p>
    <hr class="divider" />
    <p style="font-size: 13px; color: #6c7a71;">
      If the button doesn't work, copy and paste this link into your browser:<br />
      <a href="${resetLink}" style="color: #006c49; word-break: break-all;">${resetLink}</a>
    </p>
  `);

  return {
    subject: 'Reset your FoodRescue password 🔐',
    html,
  };
};

// ─── OTP Email ────────────────────────────────────────────────────────────────

/**
 * OTP verification email
 * @param {string} displayName - User's display name
 * @param {string} otp         - 6-digit OTP code
 * @param {number} expiryMins  - Minutes until OTP expires (default 10)
 */
const otpEmail = (displayName, otp, expiryMins = 10) => {
  const html = wrap(`
    <h2>Verify Your Email ✉️</h2>
    <p>Hi <span class="highlight">${displayName}</span>,</p>
    <p>Use the one-time password (OTP) below to verify your email address. This code is valid for <strong>${expiryMins} minutes</strong>.</p>
    <div style="text-align: center;">
      <div class="otp-box">${otp}</div>
    </div>
    <p>Enter this code in the app to complete your verification. Do <strong>not</strong> share this code with anyone.</p>
    <hr class="divider" />
    <p style="font-size: 13px; color: #6c7a71;">
      If you didn't request this code, please ignore this email or contact our support team immediately.
    </p>
  `);

  return {
    subject: `${otp} — Your FoodRescue verification code`,
    html,
  };
};

module.exports = { welcomeEmail, forgotPasswordEmail, otpEmail };
