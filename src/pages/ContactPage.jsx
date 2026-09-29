import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  MessageSquare,
  Send,
} from "lucide-react";

import { submitContactMessage } from "../services/contact.service";

import "../styles/contact.css";

const INITIAL_FORM = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

function ContactPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(INITIAL_FORM);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");

    if (success) {
      setSuccess("");
    }
  }

  function validateForm() {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const subject = formData.subject.trim();
    const message = formData.message.trim();

    if (!name || !email || !subject || !message) {
      return "Please complete all fields.";
    }

    if (name.length < 2) {
      return "Name must contain at least 2 characters.";
    }

    if (name.length > 100) {
      return "Name cannot exceed 100 characters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }

    if (email.length > 254) {
      return "Email address is too long.";
    }

    if (subject.length < 3) {
      return "Subject must contain at least 3 characters.";
    }

    if (subject.length > 150) {
      return "Subject cannot exceed 150 characters.";
    }

    if (message.length < 10) {
      return "Message must contain at least 10 characters.";
    }

    if (message.length > 3000) {
      return "Message cannot exceed 3000 characters.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const response = await submitContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      setSuccess(
        response.message || "Your message has been sent successfully.",
      );

      setFormData(INITIAL_FORM);
    } catch (err) {
      setError(
        err.message || "Unable to send your message. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="contact-page">
      <main className="contact-container">
        <button
          className="contact-back-button"
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={18} />

          <span>Dashboard</span>
        </button>

        <section className="contact-heading">
          <span>TRIPWISE SUPPORT</span>

          <h1>How can we help?</h1>

          <p>
            Have a question, found an issue, or need help planning your journey?
            Send us a message and the TripWise team will get back to you.
          </p>
        </section>

        <div className="contact-layout">
          <section className="contact-info-card">
            <div className="contact-info-icon">
              <Mail size={24} />
            </div>

            <span className="contact-card-label">CONTACT US</span>

            <h2>We&apos;re here to help</h2>

            <p>
              Send your question directly through TripWise. Your message will be
              delivered securely to our support inbox.
            </p>

            <div className="contact-info-divider" />

            <div className="contact-info-item">
              <MessageSquare size={18} />

              <div>
                <strong>Tell us what you need</strong>

                <span>
                  Questions, feedback, technical issues, or travel planning
                  support.
                </span>
              </div>
            </div>

            <div className="contact-info-item">
              <CheckCircle2 size={18} />

              <div>
                <strong>Direct delivery</strong>

                <span>
                  Messages are sent directly through our secure email service.
                </span>
              </div>
            </div>
          </section>

          <section className="contact-form-card">
            <div className="contact-form-heading">
              <span>SEND A MESSAGE</span>

              <h2>Contact TripWise</h2>

              <p>
                Complete the form below and we&apos;ll receive your message by
                email.
              </p>
            </div>

            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="contact-field">
                <label htmlFor="contact-name">
                  Full name
                  <span>*</span>
                </label>

                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={100}
                  autoComplete="name"
                  disabled={loading}
                />

                <small>{formData.name.length}/100</small>
              </div>

              <div className="contact-field">
                <label htmlFor="contact-email">
                  Email address
                  <span>*</span>
                </label>

                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  maxLength={254}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              <div className="contact-field">
                <label htmlFor="contact-subject">
                  Subject
                  <span>*</span>
                </label>

                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  placeholder="What can we help you with?"
                  value={formData.subject}
                  onChange={handleChange}
                  maxLength={150}
                  disabled={loading}
                />

                <small>{formData.subject.length}/150</small>
              </div>

              <div className="contact-field">
                <label htmlFor="contact-message">
                  Message
                  <span>*</span>
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="Describe your question or issue..."
                  value={formData.message}
                  onChange={handleChange}
                  maxLength={3000}
                  rows={8}
                  disabled={loading}
                />

                <small>{formData.message.length}/3000</small>
              </div>

              {error && (
                <div className="contact-status contact-error" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="contact-status contact-success" role="status">
                  <CheckCircle2 size={18} />

                  <span>{success}</span>
                </div>
              )}

              <button
                className="contact-submit-button"
                type="submit"
                disabled={loading}
              >
                <Send size={17} />

                <span>{loading ? "Sending..." : "Send Message"}</span>
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default ContactPage;
