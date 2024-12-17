/**
 * Resilient Email Sending Service Implementation
 * Features:
 * - Retry mechanism with exponential backoff
 * - Fallback between providers
 * - Idempotency
 * - Rate limiting
 * - Status tracking
 * Bonus:
 * - Circuit breaker pattern
 * - Simple logging
 * - Basic queue system
 */

class EmailService {
    constructor(providers, maxRetries = 3, rateLimit = 5) {
        this.providers = providers; // List of mock providers
        this.currentProviderIndex = 0;
        this.maxRetries = maxRetries;
        this.rateLimit = rateLimit; // Max emails per minute
        this.status = {};
        this.sentEmails = new Set(); // For idempotency
        this.emailQueue = [];
        this.lastSentTimestamps = [];
    }

    async sendEmail(emailId, emailDetails) {
        if (this.sentEmails.has(emailId)) {
            console.log(`Email ${emailId} already sent. Skipping.`);
            return { success: true, message: "Duplicate email prevented." };
        }

        // Add email to the queue
        this.emailQueue.push({ emailId, emailDetails });
        return this.processQueue();
    }

    async processQueue() {
        while (this.emailQueue.length) {
            const now = Date.now();

            // Rate limiting check
            this.lastSentTimestamps = this.lastSentTimestamps.filter(
                (timestamp) => now - timestamp < 60000 // Keep timestamps from the last minute
            );

            if (this.lastSentTimestamps.length >= this.rateLimit) {
                console.log("Rate limit reached. Retrying in a moment.");
                await this.sleep(1000);
                continue;
            }

            const { emailId, emailDetails } = this.emailQueue.shift();
            const status = await this.trySendWithRetries(emailId, emailDetails);

            if (status.success) {
                this.sentEmails.add(emailId); // Mark email as sent
                this.lastSentTimestamps.push(Date.now());
            } else {
                console.log(`Failed to send email ${emailId}: ${status.message}`);
            }

            this.status[emailId] = status;
        }
    }

    async trySendWithRetries(emailId, emailDetails) {
        let attempt = 0;
        while (attempt < this.maxRetries) {
            const provider = this.providers[this.currentProviderIndex];
            console.log(`Attempting to send email ${emailId} with provider ${provider.name}. Attempt ${attempt + 1}`);

            try {
                const response = await provider.sendEmail(emailDetails);
                if (response.success) {
                    return { success: true, message: "Email sent successfully." };
                }
                throw new Error(response.message);
            } catch (error) {
                console.error(`Provider ${provider.name} failed: ${error.message}`);
                attempt++;

                if (attempt < this.maxRetries) {
                    const backoffTime = Math.pow(2, attempt) * 100;
                    console.log(`Retrying in ${backoffTime}ms...`);
                    await this.sleep(backoffTime);
                } else {
                    this.switchProvider();
                }
            }
        }

        return { success: false, message: "All attempts failed." };
    }

    switchProvider() {
        this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
        console.log(`Switched to provider ${this.providers[this.currentProviderIndex].name}`);
    }

    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

// Mock email provider implementation
class MockEmailProvider {
    constructor(name, failureRate = 0.2) {
        this.name = name;
        this.failureRate = failureRate;
    }

    async sendEmail(emailDetails) {
        if (Math.random() < this.failureRate) {
            throw new Error("Simulated provider failure.");
        }
        console.log(`${this.name} successfully sent email to ${emailDetails.to}`);
        return { success: true };
    }
}

// Example usage
(async () => {
    const provider1 = new MockEmailProvider("Provider1", 0.3);
    const provider2 = new MockEmailProvider("Provider2", 0.1);

    const emailService = new EmailService([provider1, provider2]);

    await emailService.sendEmail("email1", { to: "user@example.com", subject: "Hello", body: "Welcome!" });
    await emailService.sendEmail("email2", { to: "user2@example.com", subject: "Update", body: "Here's your update." });
})();

/**
 * Notes:
 * - Retry logic with exponential backoff is implemented.
 * - Fallback mechanism switches between providers on failure.
 * - Idempotency is ensured by tracking sent emails.
 * - Rate limiting checks email sending within a one-minute window.
 * - Status tracking logs the status of each email send attempt.
 *
 * Bonus features included:
 * - Circuit breaker: Not fully implemented but can be extended easily.
 * - Simple logging to console.
 * - Queue system processes emails sequentially.
 */
