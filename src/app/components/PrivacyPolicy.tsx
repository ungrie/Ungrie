import { LegalPage } from './LegalPage';

export function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="April 2026">
      <h3>1. Introduction</h3>
      <p>Welcome to Ungrie ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website (ungrie.com) or use our WhatsApp-based ordering software and services.</p>

      <h3>2. Information We Collect</h3>
      <ul>
        <li><strong>From Restaurant Owners (Our Customers):</strong> We collect account information including name, email address, phone number, business details, and payment information to provide our services.</li>
        <li><strong>From End-Customers (Your Customers):</strong> When end-customers interact with the Ungrie WhatsApp bot, we process data necessary to fulfill the order, which may include phone numbers, names, delivery addresses, and order history.</li>
      </ul>

      <h3>3. How We Use Your Information</h3>
      <p>We use the collected information to:</p>
      <ul>
        <li>Facilitate and process restaurant orders via the WhatsApp Business API.</li>
        <li>Manage your account and provide customer support.</li>
        <li>Improve, personalize, and expand our services.</li>
        <li>Process subscription payments.</li>
      </ul>

      <h3>4. Data Sharing and Third Parties</h3>
      <p>We do not sell your personal data. We share data only with essential third-party service providers, including:</p>
      <ul>
        <li><strong>Meta Platforms, Inc.:</strong> To operate the WhatsApp Business API.</li>
        <li><strong>Payment Processors:</strong> (e.g., Stripe) to handle subscription billing.</li>
        <li><strong>Cloud Hosting Providers:</strong> To securely store our database and application infrastructure.</li>
      </ul>

      <h3>5. Data Retention</h3>
      <p>We retain personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy and to comply with our legal obligations.</p>

      <h3>6. Your Rights</h3>
      <p>Depending on your location, you may have the right to access, correct, delete, or restrict the processing of your personal data. To exercise these rights, contact us at the email provided below.</p>

      <h3>7. Contact Us</h3>
      <p>If you have any questions about this Privacy Policy, please contact us at <strong>ungrie.com@gmail.com</strong>.</p>
    </LegalPage>
  );
}