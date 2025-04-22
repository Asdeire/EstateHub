export class MissingTelegramUsernameError extends Error {
    constructor(message: string = 'User must have a Telegram username set in their profile') {
        super(message);
        this.name = 'MissingTelegramUsernameError';
    }
}

export class TelegramChatNotLinkedError extends Error {
    constructor(message: string = 'Telegram chat not linked. Please start a chat with @EstateHubBot and send /link') {
        super(message);
        this.name = 'TelegramChatNotLinkedError';
    }
}

export class TelegramChatNotFoundError extends Error {
    constructor(message: string = 'Telegram chat not found. Please start a chat with @EstateHubBot and send /link') {
        super(message);
        this.name = 'TelegramChatNotFoundError';
    }
}

export class SubscriptionNotFoundError extends Error {
    constructor(message: string = 'Subscription not found') {
        super(message);
        this.name = 'SubscriptionNotFoundError';
    }
}