import { useEffect, useState } from "react";

// ─── Privacy Policy Page ───────────────────────────────────────────────────────
// Route: /privacy
// Add to your router: <Route path="/privacy" element={<PrivacyPolicy />} />
// Uses Tailwind CSS + Google Fonts (Playfair Display + DM Sans)

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const lastUpdated = "May 2, 2026";

  const sections = [
    { id: "overview",      label: "Overview" },
    { id: "collection",    label: "Information We Collect" },
    { id: "use",           label: "How We Use It" },
    { id: "sharing",       label: "Sharing & Disclosure" },
    { id: "whatsapp",      label: "WhatsApp Messaging" },
    { id: "retention",     label: "Data Retention" },
    { id: "rights",        label: "Your Rights" },
    { id: "security",      label: "Security" },
    { id: "cookies",       label: "Cookies" },
    { id: "children",      label: "Children's Privacy" },
    { id: "changes",       label: "Policy Changes" },
    { id: "contact",       label: "Contact Us" },
  ];

  useEffect(() => {
    // Load fonts
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const handleScroll = () => {
      setScrolled(window.scrollY > 60);

      // Active section tracking
      for (const s of [...sections].reverse()) {
        const el = document.getElementById(s.id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(s.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen bg-[#FAFAF8]">

      {/* ── Sticky top nav ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(250,250,248,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <span
              style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#C4711A" }}
            >
              Ungrie
            </span>
          </a>
          <span className="text-xs font-medium tracking-widest uppercase text-neutral-400">
            Privacy Policy
          </span>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="pt-32 pb-16 px-6 text-center relative overflow-hidden">
        {/* Subtle background texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #C4711A 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C4711A] mb-4">
            Legal
          </p>
          <h1
            style={{ fontFamily: "'Playfair Display', serif", lineHeight: 1.15 }}
            className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6"
          >
            Privacy Policy
          </h1>
          <p className="text-neutral-500 text-base leading-relaxed max-w-lg mx-auto">
            We believe transparency builds trust. Here's exactly what data we collect,
            why we collect it, and how we protect it.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-white border border-neutral-200 rounded-full px-4 py-2 text-xs text-neutral-500 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Last updated: {lastUpdated}
          </div>
        </div>
      </section>

      {/* ── Main layout ── */}
      <div className="max-w-7xl mx-auto px-6 pb-24 flex gap-12">

        {/* ── Sidebar TOC (desktop) ── */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-28">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400 mb-4">
              Contents
            </p>
            <nav className="flex flex-col gap-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className="text-left text-sm py-1.5 px-3 rounded-lg transition-all duration-150"
                  style={{
                    color:      activeSection === s.id ? "#C4711A" : "#737373",
                    background: activeSection === s.id ? "#FDF3E7" : "transparent",
                    fontWeight: activeSection === s.id ? 600 : 400,
                  }}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* ── Content ── */}
        <main className="flex-1 max-w-3xl">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">

            {/* Intro banner */}
            <div className="bg-gradient-to-r from-[#FDF3E7] to-[#FEF9F3] border-b border-[#FADDBB] px-8 py-6">
              <p className="text-sm text-[#8B4A0E] leading-relaxed">
                <strong>In plain English:</strong> Ungrie is a restaurant management and ordering platform.
                We collect only what's necessary to operate the service. We don't sell your data.
                We don't use it for advertising. Everything below explains this in full legal detail.
              </p>
            </div>

            <div className="px-8 py-10 space-y-14">

              {/* 1. Overview */}
              <Section id="overview" title="1. Overview">
                <P>
                  Ungrie ("we", "our", "us") operates an online food ordering and restaurant management
                  platform accessible at <strong>ungrie.com</strong> and associated mobile interfaces.
                  This Privacy Policy applies to all users of the Ungrie platform, including restaurant
                  owners, restaurant staff, and customers placing orders.
                </P>
                <P>
                  By accessing or using Ungrie, you agree to the collection and use of information in
                  accordance with this policy. If you do not agree, please discontinue use of the platform.
                </P>
                <P>
                  This policy is governed by the laws of the State of Kuwait. Where applicable, we also
                  comply with international data protection standards including the General Data Protection
                  Regulation (GDPR).
                </P>
              </Section>

              {/* 2. Information We Collect */}
              <Section id="collection" title="2. Information We Collect">
                <SubHeading>2.1 Information you provide directly</SubHeading>
                <ul className="space-y-2 mt-3 mb-5">
                  {[
                    "Full name and contact details (phone number, address) when creating an account or placing an order",
                    "Delivery address information including block, street, building, and floor",
                    "Payment method preferences (we do not store card details — payments are processed by third-party providers)",
                    "Order notes, preferences, and special instructions",
                    "Business information provided by restaurant owners during onboarding (trade name, address, phone number)",
                    "WhatsApp phone number, if you choose to receive order updates via WhatsApp",
                  ].map((item, i) => <Li key={i}>{item}</Li>)}
                </ul>

                <SubHeading>2.2 Information collected automatically</SubHeading>
                <ul className="space-y-2 mt-3 mb-5">
                  {[
                    "Device type, browser, and operating system",
                    "IP address and approximate geographic location",
                    "Pages visited, time spent, and interaction patterns within the platform",
                    "Order history, frequency, and total spend",
                    "Session identifiers and authentication tokens",
                  ].map((item, i) => <Li key={i}>{item}</Li>)}
                </ul>

                <SubHeading>2.3 Information from third parties</SubHeading>
                <ul className="space-y-2 mt-3">
                  {[
                    "Meta (Facebook/WhatsApp): Message delivery status, opt-in confirmation, and message interaction data when you use WhatsApp updates",
                    "Mapping services: Location data used to calculate delivery zones and distances",
                  ].map((item, i) => <Li key={i}>{item}</Li>)}
                </ul>
              </Section>

              {/* 3. How We Use It */}
              <Section id="use" title="3. How We Use Your Information">
                <P>We use collected information for the following purposes:</P>
                <ul className="space-y-2 mt-3">
                  {[
                    "Processing and fulfilling your orders, including communicating order status",
                    "Operating and improving the Ungrie platform and its features",
                    "Sending transactional communications (order confirmations, status updates, receipts)",
                    "Sending WhatsApp order notifications if you have explicitly opted in",
                    "Enabling restaurants to manage their menus, orders, staff, and analytics",
                    "Calculating delivery fees based on your location and delivery zones",
                    "Detecting and preventing fraud, abuse, or violations of our Terms of Service",
                    "Complying with legal obligations and responding to lawful requests",
                    "Aggregated, anonymised analytics to understand platform usage and improve services",
                  ].map((item, i) => <Li key={i}>{item}</Li>)}
                </ul>
                <Note>
                  We do not use your personal data for targeted advertising, profiling for marketing
                  purposes, or any form of automated decision-making that produces legal effects.
                </Note>
              </Section>

              {/* 4. Sharing */}
              <Section id="sharing" title="4. Sharing & Disclosure">
                <P>We do not sell, rent, or trade your personal data. We share information only in the following circumstances:</P>

                <SubHeading>4.1 With the restaurant you order from</SubHeading>
                <P>
                  When you place an order, your name, phone number, delivery address, and order details
                  are shared with the restaurant fulfilling your order. This is necessary to process and
                  deliver your order.
                </P>

                <SubHeading>4.2 With service providers</SubHeading>
                <P>
                  We engage trusted third-party providers to operate our infrastructure, including Supabase
                  (database and authentication), Meta Platforms (WhatsApp Business API), and mapping
                  services. These providers are contractually bound to protect your data and use it only
                  to provide services to us.
                </P>

                <SubHeading>4.3 Legal requirements</SubHeading>
                <P>
                  We may disclose your information if required by law, court order, or governmental
                  authority, or where disclosure is necessary to protect the rights, property, or safety
                  of Ungrie, our users, or the public.
                </P>

                <SubHeading>4.4 Business transfers</SubHeading>
                <P>
                  In the event of a merger, acquisition, or sale of assets, your data may be transferred
                  as part of that transaction. We will notify you before your data becomes subject to a
                  different privacy policy.
                </P>
              </Section>

              {/* 5. WhatsApp */}
              <Section id="whatsapp" title="5. WhatsApp Messaging">
                <P>
                  Ungrie integrates with the WhatsApp Business API to send order status notifications.
                  This is an optional service and requires your explicit consent.
                </P>
                <SubHeading>5.1 Opt-in</SubHeading>
                <P>
                  You choose to receive WhatsApp notifications by tapping the "Get updates on WhatsApp"
                  button after placing an order. By doing so, you consent to receiving transactional
                  messages about your order from the restaurant's WhatsApp business number.
                </P>
                <SubHeading>5.2 What we send</SubHeading>
                <P>Messages may include: order confirmation, preparation status, out-for-delivery
                  notification with rider details, delivery confirmation, and invoice summaries.
                  We do not send marketing or promotional messages via WhatsApp without separate consent.
                </P>
                <SubHeading>5.3 Opt-out</SubHeading>
                <P>
                  You may opt out of WhatsApp notifications at any time by replying "STOP" to any
                  message, or by contacting us at <strong>privacy@ungrie.com</strong>. Opting out will
                  not affect your ability to place orders.
                </P>
                <SubHeading>5.4 Meta's role</SubHeading>
                <P>
                  WhatsApp messages are transmitted through Meta Platforms, Inc. Message delivery data
                  is subject to Meta's own Privacy Policy available at{" "}
                  <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noreferrer"
                    className="text-[#C4711A] underline underline-offset-2">
                    whatsapp.com/legal/privacy-policy
                  </a>.
                </P>
              </Section>

              {/* 6. Retention */}
              <Section id="retention" title="6. Data Retention">
                <P>We retain your data for as long as necessary to provide our services and comply with legal obligations:</P>
                <div className="mt-4 rounded-xl overflow-hidden border border-neutral-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-neutral-50 text-left">
                        <th className="px-4 py-3 font-semibold text-neutral-700">Data Type</th>
                        <th className="px-4 py-3 font-semibold text-neutral-700">Retention Period</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {[
                        ["Account information", "Duration of account + 2 years"],
                        ["Order history", "7 years (financial record requirement)"],
                        ["Delivery addresses", "Until you delete them or close your account"],
                        ["WhatsApp opt-in records", "Duration of account + 1 year"],
                        ["Session logs", "90 days"],
                        ["Anonymised analytics", "Indefinitely"],
                      ].map(([type, period]) => (
                        <tr key={type} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-4 py-3 text-neutral-700">{type}</td>
                          <td className="px-4 py-3 text-neutral-500">{period}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              {/* 7. Rights */}
              <Section id="rights" title="7. Your Rights">
                <P>Depending on your jurisdiction, you have the following rights regarding your personal data:</P>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {[
                    { title: "Access", desc: "Request a copy of the personal data we hold about you" },
                    { title: "Correction", desc: "Request correction of inaccurate or incomplete data" },
                    { title: "Deletion", desc: "Request deletion of your personal data (subject to legal obligations)" },
                    { title: "Portability", desc: "Receive your data in a structured, machine-readable format" },
                    { title: "Objection", desc: "Object to processing of your data for certain purposes" },
                    { title: "Restriction", desc: "Request restriction of processing in certain circumstances" },
                  ].map((right) => (
                    <div key={right.title} className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                      <p className="font-semibold text-neutral-800 text-sm mb-1">{right.title}</p>
                      <p className="text-neutral-500 text-xs leading-relaxed">{right.desc}</p>
                    </div>
                  ))}
                </div>
                <P className="mt-5">
                  To exercise any of these rights, contact us at <strong>privacy@ungrie.com</strong>.
                  We will respond within 30 days. We may ask you to verify your identity before
                  processing your request.
                </P>
              </Section>

              {/* 8. Security */}
              <Section id="security" title="8. Security">
                <P>
                  We implement industry-standard security measures to protect your data, including
                  TLS encryption for all data in transit, encrypted storage for sensitive data,
                  role-based access controls, and regular security reviews.
                </P>
                <P>
                  No method of transmission over the internet or electronic storage is 100% secure.
                  While we strive to protect your data, we cannot guarantee absolute security.
                  If you believe your account has been compromised, contact us immediately at{" "}
                  <strong>security@ungrie.com</strong>.
                </P>
              </Section>

              {/* 9. Cookies */}
              <Section id="cookies" title="9. Cookies & Similar Technologies">
                <P>
                  We use cookies and similar technologies to maintain your session, remember your
                  preferences, and understand how our platform is used. We use:
                </P>
                <ul className="space-y-2 mt-3">
                  {[
                    "Essential cookies: Required for the platform to function (authentication, session management)",
                    "Preference cookies: Store your settings such as language and display preferences",
                    "Analytics cookies: Anonymised data about how users interact with the platform",
                  ].map((item, i) => <Li key={i}>{item}</Li>)}
                </ul>
                <P className="mt-4">
                  You can control cookies through your browser settings. Disabling essential cookies
                  will prevent you from using the platform.
                </P>
              </Section>

              {/* 10. Children */}
              <Section id="children" title="10. Children's Privacy">
                <P>
                  Ungrie is not intended for use by children under the age of 13. We do not knowingly
                  collect personal information from children under 13. If you believe a child has
                  provided us with personal information, please contact us at{" "}
                  <strong>privacy@ungrie.com</strong> and we will delete it promptly.
                </P>
              </Section>

              {/* 11. Changes */}
              <Section id="changes" title="11. Changes to This Policy">
                <P>
                  We may update this Privacy Policy from time to time. We will notify you of material
                  changes by posting the new policy on this page with an updated "Last updated" date,
                  and where appropriate, by sending you an in-app notification or email.
                </P>
                <P>
                  Your continued use of Ungrie after changes are posted constitutes your acceptance
                  of the revised policy. We encourage you to review this policy periodically.
                </P>
              </Section>

              {/* 12. Contact */}
              <Section id="contact" title="12. Contact Us">
                <P>
                  If you have questions, concerns, or requests regarding this Privacy Policy or our
                  data practices, please contact us:
                </P>
                <div className="mt-5 bg-gradient-to-br from-[#FDF3E7] to-[#FEF9F3] border border-[#FADDBB] rounded-2xl p-6">
                  <p
                    style={{ fontFamily: "'Playfair Display', serif" }}
                    className="text-lg font-semibold text-neutral-800 mb-4"
                  >
                    Ungrie
                  </p>
                  <div className="space-y-2 text-sm text-neutral-700">
                    <p>📧 <a href="mailto:privacy@ungrie.com" className="text-[#C4711A] hover:underline">privacy@ungrie.com</a></p>
                    <p>🌐 <a href="https://www.ungrie.com" className="text-[#C4711A] hover:underline">www.ungrie.com</a></p>
                    <p>📍 Kuwait</p>
                  </div>
                  <p className="mt-4 text-xs text-neutral-500">
                    We aim to respond to all privacy-related enquiries within 5 business days.
                  </p>
                </div>
              </Section>

            </div>

            {/* Footer inside card */}
            <div className="border-t border-neutral-100 bg-neutral-50 px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <p className="text-xs text-neutral-400">
                © {new Date().getFullYear()} Ungrie. All rights reserved.
              </p>
              <p className="text-xs text-neutral-400">
                Last updated: {lastUpdated}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2
        style={{ fontFamily: "'Playfair Display', serif" }}
        className="text-2xl font-bold text-neutral-900 mb-5 pb-3 border-b border-neutral-100"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function SubHeading({ children }) {
  return (
    <h3 className="text-sm font-semibold text-neutral-800 tracking-wide mt-5 mb-2 uppercase">
      {children}
    </h3>
  );
}

function P({ children, className = "" }) {
  return (
    <p className={`text-neutral-600 text-sm leading-[1.8] mb-3 ${className}`}>
      {children}
    </p>
  );
}

function Li({ children }) {
  return (
    <li className="flex gap-2.5 text-sm text-neutral-600 leading-relaxed">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#C4711A] flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function Note({ children }) {
  return (
    <div className="mt-5 flex gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
      <span className="text-blue-400 text-base flex-shrink-0 mt-0.5">ℹ️</span>
      <p className="text-blue-700 text-xs leading-relaxed">{children}</p>
    </div>
  );
}