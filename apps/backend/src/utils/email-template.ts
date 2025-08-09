export function emailTemplate({
  title,
  greeting,
  message,
  buttonText,
  buttonUrl,
}: {
  title: string;
  greeting: string;
  message: string;
  buttonText?: string;
  buttonUrl?: string;
}) {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 40px;">
    <div style="max-width: 480px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      
      <!-- Header -->
      <div style="background-color: #212121; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 20px; margin: 0;">${title}</h1>
      </div>

      <!-- Content -->
      <div style="padding: 30px; color: #333333;">
        <p style="font-size: 16px; margin-bottom: 20px;">
          ${greeting}
        </p>
        <p style="font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
          ${message}
        </p>

        ${
          buttonText && buttonUrl
            ? `<div style="text-align: center; margin-bottom: 30px;">
                <a href="${buttonUrl}" 
                  style="background-color: #212121; color: #ffffff; text-decoration: none; 
                         padding: 12px 24px; font-size: 15px; border-radius: 6px; display: inline-block;">
                  ${buttonText}
                </a>
              </div>`
            : ""
        }

        <p style="font-size: 13px; color: #666666; line-height: 1.5;">
          If you didn’t request this, you can safely ignore this email.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #888888;">
        © ${new Date().getFullYear()} Juan Akbar Indrian. All rights reserved.
      </div>
    </div>
  </div>
  `;
}
