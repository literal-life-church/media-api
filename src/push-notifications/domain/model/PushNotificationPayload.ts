export interface PushNotificationPayloadDomainModel {
    title: string;
    content: string;

    segmentToNotify: string;
    notificationName: string;

    thumbnailUrl?: string;
    iconUrl: string;
    badgeUrl: string;

    notificationClickUrl: string;

    ttl: number;
    notificationGroupId: string;
}
