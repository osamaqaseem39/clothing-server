import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { EmailTemplate, EmailTemplateDocument } from '../schemas/email-template.schema';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(EmailTemplate.name) private emailTemplateModel: Model<EmailTemplateDocument>,
    private configService: ConfigService,
  ) {
    // Initialize nodemailer transporter
    // Configure with SMTP settings via environment variables
    const smtpHost = this.configService.get<string>('SMTP_HOST') || 'mail.spacemail.com';
    const smtpPort = this.configService.get<number>('SMTP_PORT') || 465;
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');
    const smtpSecure = this.configService.get<string>('SMTP_SECURE') !== 'false'; // Default to true for SSL

    if (smtpUser && smtpPass) {
      const isSecure = smtpPort === 465 || smtpSecure;
      
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: isSecure, // true for 465 (SSL), false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        // Connection timeout settings
        connectionTimeout: 15000, // 15 seconds
        greetingTimeout: 15000, // 15 seconds
        socketTimeout: 15000, // 15 seconds
        // Additional options for better compatibility
        tls: {
          rejectUnauthorized: false, // Accept self-signed certificates if needed
          minVersion: 'TLSv1.2', // Minimum TLS version
        },
        // Pool connections for better performance
        pool: true,
        maxConnections: 1,
        maxMessages: 3,
        // Debug mode (set to true for more detailed logs)
        debug: process.env.NODE_ENV === 'development',
        logger: process.env.NODE_ENV === 'development',
      });
      
      // Verify connection (async, don't block startup)
      this.transporter.verify((error, success) => {
        if (error) {
          this.logger.error('SMTP connection verification failed:', error.message);
          this.logger.warn('Emails will still attempt to send, but connection may fail');
        } else {
          this.logger.log('SMTP server connection verified successfully');
        }
      });
    } else {
      // Fallback to console logging if SMTP is not configured
      this.logger.warn('SMTP credentials not configured. Emails will be logged to console only.');
      this.transporter = null;
    }
  }

  async sendEmail(to: string, subject: string, content: string, isHtml: boolean = true): Promise<boolean> {
    try {
      const fromEmail = this.configService.get<string>('SMTP_FROM') || this.configService.get<string>('SMTP_USER') || 'noreply@example.com';
      
      if (!this.transporter) {
        // Log email to console if SMTP is not configured
        this.logger.log(`[EMAIL] To: ${to}`);
        this.logger.log(`[EMAIL] Subject: ${subject}`);
        this.logger.log(`[EMAIL] Content: ${content.substring(0, 200)}...`);
        return true;
      }

      const mailOptions = {
        from: fromEmail,
        to,
        subject,
        [isHtml ? 'html' : 'text']: content,
      };

      // Set a timeout for the email sending operation
      const sendPromise = this.transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email send timeout after 15 seconds')), 15000)
      );

      const info = await Promise.race([sendPromise, timeoutPromise]) as any;
      this.logger.log(`Email sent successfully to ${to}: ${info.messageId}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${to}:`, error.message || error);
      
      // If it's a connection error, try to provide helpful information
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.message?.includes('Greeting never received')) {
        this.logger.error('SMTP Connection Error - Check:');
        this.logger.error('1. SMTP server host and port are correct');
        this.logger.error('2. Firewall allows outbound connections on SMTP port');
        this.logger.error('3. SMTP server is accessible from your network');
        this.logger.error(`4. Current config: ${this.configService.get<string>('SMTP_HOST')}:${this.configService.get<number>('SMTP_PORT')}`);
      }
      
      // Log to console as fallback
      this.logger.log(`[EMAIL FALLBACK] To: ${to}`);
      this.logger.log(`[EMAIL FALLBACK] Subject: ${subject}`);
      this.logger.log(`[EMAIL FALLBACK] Content: ${content.substring(0, 200)}...`);
      return false;
    }
  }

  async sendTemplateEmail(to: string, templateName: string, variables: any = {}): Promise<boolean> {
    const template = await this.emailTemplateModel.findOne({ name: templateName });
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    let content = template.htmlContent || template.textContent || '';
    let subject = template.subject;

    // Replace variables in content and subject
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, variables[key]);
      subject = subject.replace(regex, variables[key]);
    });

    return await this.sendEmail(to, subject, content);
  }

  async createTemplate(templateData: any): Promise<EmailTemplate> {
    const template = new this.emailTemplateModel(templateData);
    return await template.save();
  }

  async updateTemplate(id: string, templateData: any): Promise<EmailTemplate> {
    return await this.emailTemplateModel.findByIdAndUpdate(id, templateData, { new: true });
  }

  async getTemplate(name: string): Promise<EmailTemplate> {
    return await this.emailTemplateModel.findOne({ name });
  }
}
