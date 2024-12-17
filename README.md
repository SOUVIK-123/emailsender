# Resilient Email Sending Service

This project implements a resilient email sending service in TypeScript/JavaScript. It is designed to handle email delivery using multiple providers with fallback mechanisms, retry logic, and rate limiting. The service ensures reliability, idempotency, and provides status tracking for each email sent.

## Features

1. **Retry Mechanism with Exponential Backoff**
   - Retries failed email delivery attempts with increasing wait times between attempts.

2. **Fallback Between Providers**
   - Switches to alternative email providers if the current provider fails.

3. **Idempotency**
   - Prevents duplicate emails by tracking sent email IDs.

4. **Rate Limiting**
   - Limits the number of emails sent within a one-minute window.

5. **Status Tracking**
   - Tracks the status of email delivery attempts for each email ID.

### Bonus Features

- **Circuit Breaker Pattern**
  - Can be extended to temporarily block providers that frequently fail.
- **Simple Logging**
  - Logs the status and errors of email sending attempts to the console.
- **Basic Queue System**
  - Processes email sending tasks sequentially.

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/resilient-email-service.git
   cd resilient-email-service
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Usage

1. Run the script:
   ```bash
   node emailService.js
   ```

2. Observe the console logs for email sending statuses, retries, and provider switches.

### Testing

To test the service, replace the mock email providers with real email providers or use simulated conditions to trigger retries and fallbacks. Ensure you have valid email details to test real email sending.

## Project Structure

- **EmailService Class**
  - Core service managing email sending, retries, and provider fallbacks.
- **MockEmailProvider Class**
  - Simulated email provider for testing the service logic.
- **Queue System**
  - Handles email sending tasks sequentially.

## Example Usage

```javascript
const provider1 = new MockEmailProvider("Provider1", 0.3);
const provider2 = new MockEmailProvider("Provider2", 0.1);

const emailService = new EmailService([provider1, provider2]);

await emailService.sendEmail("email1", { to: "user@example.com", subject: "Hello", body: "Welcome!" });
await emailService.sendEmail("email2", { to: "user2@example.com", subject: "Update", body: "Here's your update." });
```

## Assumptions

1. Mock email providers simulate success and failure scenarios.
2. Real email providers can be integrated by replacing the `MockEmailProvider` class.
3. Rate limiting is set to 5 emails per minute by default.

## Future Enhancements

- Implement a full circuit breaker pattern for improved provider management.
- Add support for real email providers like SendGrid or Amazon SES.
- Enhance logging with a centralized logging system.
- Add a configuration file for customizable settings.

## Contributing

Contributions are welcome! Feel free to submit a pull request or report an issue.

## License

This project is licensed under the MIT License.
