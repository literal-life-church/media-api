import { IdempotencyCalculatorUseCase } from "./IdempotencyCalculatorUseCase";
import { PUSH_API_KEY, PUSH_API_URL, PUSH_APP_ID, PUSH_TARGET_CHANNEL } from "../../config";
import type { PushNotificationPayloadDomainModel } from "../model/PushNotificationPayload";

export class SendPushNotificationUseCase {
    constructor(
        private readonly idempotencyCalculator: IdempotencyCalculatorUseCase = new IdempotencyCalculatorUseCase()
    ) { }

    async execute(payload: PushNotificationPayloadDomainModel): Promise<void> {
        const body = {
            app_id: PUSH_APP_ID,
            target_channel: PUSH_TARGET_CHANNEL,
            headings: { en: payload.title },
            contents: { en: payload.content },
            included_segments: [payload.segmentToNotify],
            name: payload.notificationName,
            chrome_web_image: payload.thumbnailUrl,
            chrome_web_icon: payload.iconUrl,
            firefox_icon: payload.iconUrl,
            chrome_web_badge: payload.badgeUrl,
            url: payload.notificationClickUrl,
            ttl: payload.ttl,
            web_push_topic: payload.notificationGroupId,
        };

        const idempotency_key = this.idempotencyCalculator.execute(body);

        try {
            const response = await fetch(PUSH_API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Key ${PUSH_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...body,
                    idempotency_key
                })
            });

            if (!response.ok) {
                console.error(`Push notification failed with status ${response.status}:`, await response.text());
                return;
            }
        } catch (error) {
            console.error("Failed to send push notification:", error);
        }
    }
}
