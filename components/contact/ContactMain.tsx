"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type ContactForm = {
  name: string;
  email: string;
  topic: string;
  message: string;
};

const initialForm: ContactForm = {
  name: "",
  email: "",
  topic: "Pickup help",
  message: "",
};

export default function ContactMain() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="main info-page contact-page">
      <section className="info-page__hero info-page__hero--image">
        <Image
          src="/assets/images/demos/demo-28/banners/4.jpg"
          alt="Fresh food arranged on a table"
          fill
          priority
          sizes="100vw"
        />
        <div className="info-page__hero-overlay"></div>
        <div className="container info-page__hero-content">
          <p className="info-page__eyebrow">We are here to help</p>
          <h1>Contact StealDeals</h1>
          <p>Have a question about a pickup, an order, or joining the food rescue community?</p>
        </div>
      </section>

      <nav aria-label="Breadcrumb" className="breadcrumb-nav border-0 mb-0">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link href="/">Home</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Contact us</li>
          </ol>
        </div>
      </nav>

      <div className="page-content">
        <div className="container">
          <section className="contact-page__intro">
            <div>
              <p className="info-page__eyebrow">Customer support</p>
              <h2>Let&apos;s solve it together</h2>
              <p>Send us the details and our team will have the right context to help with your question.</p>
            </div>
            <div className="contact-page__response-note">
              <strong>Support hours</strong>
              <span>Monday - Saturday, 09:00 - 19:00</span>
              <span>Sunday, 10:00 - 17:00</span>
            </div>
          </section>

          <section className="contact-page__content">
            <aside className="contact-page__details" aria-labelledby="contact-details-title">
              <h2 id="contact-details-title">Contact details</h2>
              <p>For urgent pickup questions, contact the store shown on your order first.</p>

              <dl>
                <div>
                  <dt>Email</dt>
                  <dd><a href="mailto:support@stealdeals.com">support@stealdeals.com</a></dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd><a href="tel:+842838221001">+84 28 3822 1001</a></dd>
                </div>
                <div>
                  <dt>Office</dt>
                  <dd>12 Nguyen Trai Street, District 1, Ho Chi Minh City</dd>
                </div>
              </dl>

              <div className="contact-page__help-list">
                <h3>Before you contact us</h3>
                <ul>
                  <li>Keep your order confirmation nearby.</li>
                  <li>Include the store and pickup window in your message.</li>
                  <li>For account issues, use the email connected to your account.</li>
                </ul>
              </div>
            </aside>

            <div className="contact-page__form-wrap">
              <h2>Send a message</h2>
              <p>We will use your contact details only to respond to this request.</p>

              <form
                className="contact-page__form"
                onSubmit={(event) => {
                  event.preventDefault();
                  setSubmitted(true);
                }}
              >
                <div className="contact-page__form-grid">
                  <label>
                    Name
                    <input
                      type="text"
                      value={form.name}
                      required
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      value={form.email}
                      required
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                    />
                  </label>
                </div>

                <label>
                  Topic
                  <select
                    value={form.topic}
                    onChange={(event) => setForm({ ...form, topic: event.target.value })}
                  >
                    <option>Pickup help</option>
                    <option>Order question</option>
                    <option>Account support</option>
                    <option>Store partnership</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>
                  Message
                  <textarea
                    rows={6}
                    value={form.message}
                    required
                    onChange={(event) => setForm({ ...form, message: event.target.value })}
                  />
                </label>

                <button type="submit" className="btn btn-primary">
                  Send message
                  <i className="icon-long-arrow-right" aria-hidden="true"></i>
                </button>

                {submitted ? (
                  <p className="contact-page__success" role="status">
                    Thanks. Your message has been recorded in this frontend demo.
                  </p>
                ) : null}
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
