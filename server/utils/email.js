import nodemailer from 'nodemailer';

export const sendInvitationEmail = async (email, inviteeName, inviterName, workspaceName, tempPassword) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  let transporter;
  if (user && pass) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user,
        pass: pass
      }
    });
  } else {
    console.log('⚠️ No EMAIL_USER and EMAIL_PASS set in .env. Attempting Ethereal Test Account...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    } catch (err) {
      console.error('Failed to create Ethereal test account:', err);
      return false;
    }
  }

  const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}`;

  const mailOptions = {
    from: `"WalletFlow Invitations" <${user || 'noreply@walletflow.com'}>`,
    to: email,
    subject: `Join ${inviterName} in the ${workspaceName} Workspace`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5E7EB; border-radius: 8px;">
        <h2 style="color: #111827;">You have been invited!</h2>
        <p>Hi ${inviteeName},</p>
        <p><strong>${inviterName}</strong> has invited you to join their shared workspace <strong>"${workspaceName}"</strong> on WalletFlow.</p>
        
        ${tempPassword ? `
          <div style="background: #F3F4F6; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #374151;">Your Temporary Login Credentials:</p>
            <p style="margin: 8px 0 0 0; color: #4B5563;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 4px 0 0 0; color: #4B5563;"><strong>Password:</strong> ${tempPassword}</p>
          </div>
          <p style="font-size: 13px; color: #6B7280;">Please change your password in the settings page after logging in.</p>
        ` : ''}

        <div style="margin: 30px 0 20px 0;">
          <a href="${loginUrl}" style="background: #00B27A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log In & Access Workspace</a>
        </div>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;" />
        <p style="font-size: 12px; color: #9CA3AF;">If you did not expect this invitation, please ignore this email.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✉️ Email sent successfully:', info.messageId);
    if (!user || !pass) {
      console.log('✉️ View test email at:', nodemailer.getTestMessageUrl(info));
    }
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

export const sendOtpEmail = async (email, otp, userName) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  let transporter;
  if (user && pass) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  } else {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
    } catch (err) { return false; }
  }

  const mailOptions = {
    from: `"WalletFlow Security" <${user || 'noreply@walletflow.com'}>`,
    to: email,
    subject: `Your WalletFlow Verification Code`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5E7EB; border-radius: 8px;">
        <h2 style="color: #111827;">Verification Required</h2>
        <p>Hi ${userName},</p>
        <p>You requested to update your profile details. Please use the verification code below to complete this action:</p>
        <div style="background: #F3F4F6; padding: 16px; border-radius: 6px; margin: 20px 0; text-align: center;">
          <h1 style="margin: 0; color: #00B27A; letter-spacing: 4px;">${otp}</h1>
        </div>
        <p style="font-size: 13px; color: #6B7280;">This code will expire in 10 minutes. If you did not request this change, please ignore this email.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✉️ OTP Email sent successfully to:', email, 'MessageID:', info.messageId);
    if (!user || !pass) {
      console.log('✉️ View OTP test email at:', nodemailer.getTestMessageUrl(info));
    }
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw error;
  }
};
