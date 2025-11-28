import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './services/notification.service';
import { EmailService } from './services/email.service';
import { NotificationRepository } from './repositories/notification.repository';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { EmailTemplate, EmailTemplateSchema } from './schemas/email-template.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: EmailTemplate.name, schema: EmailTemplateSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, EmailService, NotificationRepository],
  exports: [NotificationService, EmailService],
})
export class NotificationModule {}
