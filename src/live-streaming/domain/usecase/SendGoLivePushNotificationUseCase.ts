import { GO_LIVE_NOTIFICATION_CLICK_URL, GO_LIVE_NOTIFICATION_GROUP_ID, GO_LIVE_NOTIFICATION_NAME, GO_LIVE_SEGMENT, GO_LIVE_TITLE, GO_LIVE_TTL } from "../../config";
import { PUSH_BADGE_URL, PUSH_ICON_URL } from "../../../push-notifications/config";
import { SendPushNotificationUseCase } from "../../../push-notifications/domain/usecase/SendPushNotificationUseCase";
import { YouTubeThumbnailMapper } from "../../data/mapper/YouTubeThumbnailMapper";

export class SendGoLivePushNotificationUseCase {
    constructor(
        private readonly sendPushNotificationUseCase: SendPushNotificationUseCase = new SendPushNotificationUseCase(),
        private readonly youtubeThumbnailMapper: YouTubeThumbnailMapper = new YouTubeThumbnailMapper()
    ) { }

    async execute(eventName: string, videoId: string): Promise<void> {
        const thumbnailUrl = this.youtubeThumbnailMapper.map(videoId);

        const success = await this.sendPushNotificationUseCase.execute({
            title: GO_LIVE_TITLE,
            content: `${eventName} is now live.`,

            segmentToNotify: GO_LIVE_SEGMENT,
            notificationName: GO_LIVE_NOTIFICATION_NAME,

            thumbnailUrl: thumbnailUrl,
            iconUrl: PUSH_ICON_URL,
            badgeUrl: PUSH_BADGE_URL,

            notificationClickUrl: GO_LIVE_NOTIFICATION_CLICK_URL,

            ttl: GO_LIVE_TTL,
            notificationGroupId: GO_LIVE_NOTIFICATION_GROUP_ID,
        });

        if (success) {
            console.info("Sent Go Live push notification");
        } else {
            console.error("Failed to send Go Live push notification");
        }
    }
}
