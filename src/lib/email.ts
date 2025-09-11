import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailVerificationData {
  email: string;
  verificationCode: string;
  userName: string;
}

export async function sendVerificationEmail({ email, verificationCode, userName }: EmailVerificationData) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.NEXT_PUBLIC_FROM_EMAIL || 'onboarding@resend.dev',
      to: [email],
      subject: 'Verify your Karavan account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your Karavan account</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="width: 40px; height: 40px; background-color: rgba(255, 255, 255, 0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 20px;">🍽️</span>
                </div>
                <span style="font-size: 28px; font-weight: 700; color: white; letter-spacing: 0.02em;">KARAVAN</span>
              </div>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 16px;">Layers of Happiness!</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h1 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">
                Welcome to Karavan, ${userName}!
              </h1>
              
              <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Thank you for signing up for Karavan, your campus canteen delivery service. To complete your registration, please verify your email address using the code below.
              </p>

              <!-- Verification Code Box -->
              <div style="background-color: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 12px; padding: 32px; text-align: center; margin: 32px 0;">
                <p style="color: #374151; font-size: 14px; margin: 0 0 12px 0; font-weight: 500;">
                  Your verification code:
                </p>
                <div style="font-size: 36px; font-weight: 700; color: #10b981; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${verificationCode}
                </div>
                <p style="color: #6b7280; font-size: 12px; margin: 12px 0 0 0;">
                  This code expires in 10 minutes
                </p>
              </div>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                If you didn't create an account with Karavan, you can safely ignore this email.
              </p>

              <!-- Footer -->
              <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                  This email was sent by Karavan Canteen Management System<br>
                  Sandford School Campus Delivery Service
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to Karavan, ${userName}!

Your verification code is: ${verificationCode}

This code expires in 10 minutes. Please enter it on the verification page to complete your registration.

If you didn't create an account with Karavan, you can safely ignore this email.

---
Karavan Canteen Management System
Sandford School Campus Delivery Service
      `.trim(),
    });

    if (error) {
      console.error('Email sending error:', error);
      return { success: false, error: error.message };
    }

    console.log('Verification email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

export async function sendPasswordResetEmail({ email, resetCode, userName }: EmailVerificationData) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.NEXT_PUBLIC_FROM_EMAIL || 'onboarding@resend.dev',
      to: [email],
      subject: 'Reset your Karavan password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset your Karavan password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="width: 40px; height: 40px; background-color: rgba(255, 255, 255, 0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 20px;">🍽️</span>
                </div>
                <span style="font-size: 28px; font-weight: 700; color: white; letter-spacing: 0.02em;">KARAVAN</span>
              </div>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 16px;">Layers of Happiness!</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h1 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">
                Reset your password
              </h1>
              
              <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Hi ${userName}, we received a request to reset your Karavan account password. Use the code below to reset your password.
              </p>

              <!-- Reset Code Box -->
              <div style="background-color: #fef3c7; border: 2px dashed #f59e0b; border-radius: 12px; padding: 32px; text-align: center; margin: 32px 0;">
                <p style="color: #92400e; font-size: 14px; margin: 0 0 12px 0; font-weight: 500;">
                  Your password reset code:
                </p>
                <div style="font-size: 36px; font-weight: 700; color: #f59e0b; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${resetCode}
                </div>
                <p style="color: #92400e; font-size: 12px; margin: 12px 0 0 0;">
                  This code expires in 15 minutes
                </p>
              </div>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                If you didn't request a password reset, you can safely ignore this email.
              </p>

              <!-- Footer -->
              <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                  This email was sent by Karavan Canteen Management System<br>
                  Sandford School Campus Delivery Service
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Reset your password

Hi ${userName}, we received a request to reset your Karavan account password.

Your password reset code is: ${resetCode}

This code expires in 15 minutes. Please enter it on the password reset page.

If you didn't request a password reset, you can safely ignore this email.

---
Karavan Canteen Management System
Sandford School Campus Delivery Service
      `.trim(),
    });

    if (error) {
      console.error('Password reset email error:', error);
      return { success: false, error: error.message };
    }

    console.log('Password reset email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}
