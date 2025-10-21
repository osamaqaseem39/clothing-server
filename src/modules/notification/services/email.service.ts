import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailTemplate, EmailTemplateDocument } from '../schemas/email-template.schema';

@Injectable()
export class EmailService {
  constructor(
    @InjectModel(EmailTemplate.name) private emailTemplateModel: Model<EmailTemplateDocument>,
  ) {}

  async sendEmail(to: string, subject: string, content: string): Promise<boolean> {
    // TODO: Implement actual email sending logic (e.g., using Nodemailer, SendGrid, etc.)
    console.log(`Sending email to ${to}: ${subject}`);
    return true;
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
