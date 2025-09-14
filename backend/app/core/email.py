import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings


def send_verification_email(email: str, otp: str, username: str):
    """
    Send email verification OTP to user
    """
    subject = "Email Verification OTP - Job Alert System"
    
    # Create the HTML content
    html_content = f"""
    <html>
    <body>
        <h2>Welcome to Job Alert System!</h2>
        <p>Hi {username},</p>
        <p>Thank you for registering with our Job Alert System. Please verify your email address using the OTP below:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 8px; margin: 0;">{otp}</h1>
        </div>
        <p><strong>Your verification OTP is: {otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <br>
        <p>Best regards,<br>Job Alert Team</p>
    </body>
    </html>
    """
    
    # Create the plain text content
    text_content = f"""
    Welcome to Job Alert System!
    
    Hi {username},
    
    Thank you for registering with our Job Alert System. Please verify your email address using the OTP below:
    
    Your verification OTP is: {otp}
    
    This OTP will expire in 10 minutes.
    
    If you didn't create an account, please ignore this email.
    
    Best regards,
    Job Alert Team
    """
    
    # Create message
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = settings.MAIL_FROM
    msg['To'] = email
    
    # Attach parts
    part1 = MIMEText(text_content, 'plain')
    part2 = MIMEText(html_content, 'html')
    
    msg.attach(part1)
    msg.attach(part2)
    
    # Send email
    try:
        server = smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT)
        server.starttls()
        server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False


def send_password_reset_email(email: str, token: str, username: str):
    """
    Send password reset email to user
    """
    subject = "Password Reset - Job Alert System"
    
    # Create the HTML content
    html_content = f"""
    <html>
    <body>
        <h2>Password Reset Request</h2>
        <p>Hi {username},</p>
        <p>You have requested to reset your password. Click the link below to reset it:</p>
        <p><a href="http://localhost:8000/api/v1/auth/reset-password?email={email}&token={token}" 
           style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">
           Reset Password
        </a></p>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p>http://localhost:8000/api/v1/auth/reset-password?email={email}&token={token}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <br>
        <p>Best regards,<br>Job Alert Team</p>
    </body>
    </html>
    """
    
    # Create the plain text content
    text_content = f"""
    Password Reset Request
    
    Hi {username},
    
    You have requested to reset your password. Visit this link to reset it:
    
    http://localhost:8000/api/v1/auth/reset-password?email={email}&token={token}
    
    This link will expire in 1 hour.
    
    If you didn't request a password reset, please ignore this email.
    
    Best regards,
    Job Alert Team
    """
    
    # Create message
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = settings.MAIL_FROM
    msg['To'] = email
    
    # Attach parts
    part1 = MIMEText(text_content, 'plain')
    part2 = MIMEText(html_content, 'html')
    
    msg.attach(part1)
    msg.attach(part2)
    
    # Send email
    try:
        server = smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT)
        server.starttls()
        server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False


def send_password_reset_otp_email(email: str, otp: str, username: str):
    """
    Send password reset OTP email to user
    """
    subject = "Password Reset OTP - Job Alert System"
    
    # Create the HTML content
    html_content = f"""
    <html>
    <body>
        <h2>Password Reset OTP</h2>
        <p>Hi {username},</p>
        <p>You have requested to reset your password. Use the OTP below to reset it:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 8px; margin: 0;">{otp}</h1>
        </div>
        <p><strong>Your password reset OTP is: {otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <br>
        <p>Best regards,<br>Job Alert Team</p>
    </body>
    </html>
    """
    
    # Create the plain text content
    text_content = f"""
    Password Reset OTP
    
    Hi {username},
    
    You have requested to reset your password. Use the OTP below to reset it:
    
    Your password reset OTP is: {otp}
    
    This OTP will expire in 10 minutes.
    
    If you didn't request a password reset, please ignore this email.
    
    Best regards,
    Job Alert Team
    """
    
    # Create message
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = settings.MAIL_FROM
    msg['To'] = email
    
    # Attach parts
    part1 = MIMEText(text_content, 'plain')
    part2 = MIMEText(html_content, 'html')
    
    msg.attach(part1)
    msg.attach(part2)
    
    # Send email
    try:
        server = smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT)
        server.starttls()
        server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
