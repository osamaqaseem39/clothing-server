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
    // For production, configure with actual SMTP settings via environment variables
    const smtpHost = this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com';
    const smtpPort = this.configService.get<number>('SMTP_PORT') || 587;
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    if (smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
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

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${to}: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
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
