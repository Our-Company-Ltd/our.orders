import { ModelBase, PaymentStatus, PaymentMethod } from '.';

export type PaymentNotificationTemplate = ModelBase & {
    Type: 'paymentnotificationtemplate';

    TemplateId: string;
    
    Title: string;

    Description: string;

    Body: string;

    Subject: string;

    Provider: string;

    Status: PaymentStatus;

    Method?: PaymentMethod;
};