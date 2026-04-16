import { LegalPage } from './LegalPage';

export function CookiePolicy() {
  return (
    <LegalPage title="Cookie Policy" lastUpdated="April 2026">
      <h3>1. What are Cookies?</h3>
      <p>Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site.</p>

      <h3>2. How We Use Cookies</h3>
      <p>Ungrie uses cookies for the following purposes:</p>
      <ul>
        <li><strong>Essential Cookies:</strong> These are necessary for the website and user dashboard to function properly (e.g., keeping you logged in securely).</li>
        <li><strong>Analytics Cookies:</strong> We use these to understand how visitors interact with our website, helping us improve user experience and website performance.</li>
      </ul>

      <h3>3. Third-Party Cookies</h3>
      <p>We may use third-party services (such as Google Analytics) that use cookies to track user interaction with our site. We do not control these third-party cookies.</p>

      <h3>4. Managing Cookies</h3>
      <p>You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer, and you can set most browsers to prevent them from being placed. However, if you do this, you may have to manually adjust some preferences every time you visit a site, and some services and functionalities (like the user dashboard) may not work.</p>

      <h3>5. Contact Us</h3>
      <p>For questions regarding our use of cookies, please contact us at <strong>ungrie.com@gmail.com</strong>.</p>
    </LegalPage>
  );
}