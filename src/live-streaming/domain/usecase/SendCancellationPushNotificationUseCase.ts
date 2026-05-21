import removeMarkdown from "remove-markdown";

import { CANCELLATION_NOTIFICATION_CLICK_URL, CANCELLATION_NOTIFICATION_GROUP_ID, CANCELLATION_NOTIFICATION_NAME, CANCELLATION_SEGMENT, CANCELLATION_TIMEZONE, CANCELLATION_TTL } from "../../config";
import { PUSH_BADGE_URL, PUSH_ICON_URL } from "../../../push-notifications/config";
import { SendPushNotificationUseCase } from "../../../push-notifications/domain/usecase/SendPushNotificationUseCase";

export class SendCancellationPushNotificationUseCase {
    constructor(
        private readonly sendPushNotificationUseCase: SendPushNotificationUseCase = new SendPushNotificationUseCase()
    ) { }

    async execute(name: string, cancellationReason: string, timeOfEvent: string): Promise<void> {
        const dateTime = this.formatEventDate(timeOfEvent, CANCELLATION_TIMEZONE);
        const plainReason = removeMarkdown(cancellationReason);

        const success = await this.sendPushNotificationUseCase.execute({
            title: `${name} is Canceled`,
            content: `${name}, originally scheduled for ${dateTime}, is now canceled. ${plainReason}`,

            segmentToNotify: CANCELLATION_SEGMENT,
            notificationName: CANCELLATION_NOTIFICATION_NAME,

            iconUrl: PUSH_ICON_URL,
            badgeUrl: PUSH_BADGE_URL,

            notificationClickUrl: CANCELLATION_NOTIFICATION_CLICK_URL,

            ttl: CANCELLATION_TTL,
            notificationGroupId: CANCELLATION_NOTIFICATION_GROUP_ID,
        });

        if (success) {
            console.info("Sent Event Cancellation push notification");
        } else {
            console.error("Failed to send Event Cancellation push notification");
        }
    }

    private formatEventDate(isoString: string, timezone: string): string {
        const date = new Date(isoString);
        const opts = { timeZone: timezone } as const;

        const weekday = date.toLocaleDateString("en-US", { ...opts, weekday: "long" });
        const month = date.toLocaleDateString("en-US", { ...opts, month: "long" });
        const day = parseInt(date.toLocaleDateString("en-US", { ...opts, day: "numeric" }), 10);
        const year = date.toLocaleDateString("en-US", { ...opts, year: "numeric" });
        const time = date.toLocaleTimeString("en-US", { ...opts, hour: "numeric", minute: "2-digit", hour12: true });

        return `${weekday}, ${month} ${day}${this.ordinalSuffix(day)}, ${year} at ${time}`;
    }

    private ordinalSuffix(day: number): string {
        if (day >= 11 && day <= 13) return "th";

        switch (day % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    }
}
