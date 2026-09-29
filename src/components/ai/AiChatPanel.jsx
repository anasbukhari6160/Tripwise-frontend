import { useEffect, useRef, useState } from "react";

import { sendAiMessage } from "../../services/ai.service";

const STARTER_PROMPTS = [
  "Plan a 3-day Dubai trip",
  "Suggest a relaxing beach vacation",
  "Help me improve my itinerary",
];

/* =========================================================
   SEND ICON
========================================================= */

function SendIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 12L20 4l-6 16-2.6-6.4L4 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   SOURCE DOMAIN
========================================================= */

function getSourceDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Source";
  }
}

/* =========================================================
   AI CHAT PANEL
========================================================= */

function AiChatPanel({ onClose, isOpen }) {
  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  /* =======================================================
     AUTO SCROLL
  ======================================================= */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoading, isOpen]);

  /* =======================================================
     SEND MESSAGE
  ======================================================= */

  async function submitMessage(content) {
    const cleanInput = content.trim();

    if (!cleanInput || isLoading) {
      return;
    }

    const userMessage = {
      role: "user",
      content: cleanInput,
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);

    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const response = await sendAiMessage(nextMessages);

      const assistantMessage = {
        role: "assistant",

        content: response.message,

        grounded: Boolean(response.grounded),

        sources: Array.isArray(response.sources) ? response.sources : [],
      };

      setMessages((currentMessages) => [...currentMessages, assistantMessage]);
    } catch (requestError) {
      setError(requestError.message || "TripWise AI is currently unavailable.");
    } finally {
      setIsLoading(false);
    }
  }

  /* =======================================================
     FORM SUBMIT
  ======================================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    await submitMessage(input);
  }

  /* =======================================================
     STARTER PROMPTS
  ======================================================= */

  async function handleStarterPrompt(prompt) {
    await submitMessage(prompt);
  }

  /* =======================================================
     ENTER TO SEND
  ======================================================= */

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <section
      className={`ai-chat-panel ${
        isOpen ? "ai-chat-panel--open" : "ai-chat-panel--closed"
      }`}
      aria-label="TripWise AI Copilot"
      aria-hidden={!isOpen}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="ai-chat-panel__header">
        <div className="ai-chat-panel__identity">
          <div className="ai-chat-panel__avatar">✦</div>

          <div>
            <h2>TripWise AI</h2>

            <p>Your travel copilot</p>
          </div>
        </div>

        <button
          type="button"
          className="ai-chat-panel__close"
          onClick={onClose}
          aria-label="Close TripWise AI"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>

      {/* ===================================================
          BODY
      =================================================== */}

      <div className="ai-chat-panel__body">
        {messages.length === 0 ? (
          <div className="ai-chat-empty">
            <div className="ai-chat-empty__icon">✦</div>

            <h3>Where are we going?</h3>

            <p>Ask TripWise AI to plan, improve, or rethink your next trip.</p>

            {/* =============================================
                STARTER SUGGESTIONS
            ============================================= */}

            <div className="ai-chat-suggestions">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  onClick={() => handleStarterPrompt(prompt)}
                  disabled={isLoading}
                >
                  <span>{prompt}</span>

                  <span className="ai-chat-suggestion__icon">
                    <SendIcon size={17} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="ai-chat-messages">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`ai-message ai-message--${message.role}`}
              >
                <div className="ai-message__label">
                  {message.role === "assistant" ? "TripWise AI" : "You"}
                </div>

                <div className="ai-message__bubble">{message.content}</div>

                {/* =====================================
                      GROUNDED SOURCES
                  ===================================== */}

                {message.role === "assistant" &&
                  message.sources?.length > 0 && (
                    <div className="ai-message__sources">
                      <div className="ai-message__sources-heading">
                        <span className="ai-message__verified-dot" />

                        <span>Sources</span>
                      </div>

                      <div className="ai-message__source-list">
                        {message.sources.map((source, sourceIndex) => (
                          <a
                            key={`${source.url}-${sourceIndex}`}
                            className="ai-message__source"
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={source.title || source.url}
                          >
                            <span className="ai-message__source-number">
                              {sourceIndex + 1}
                            </span>

                            <span className="ai-message__source-info">
                              <strong>{source.title || "Travel source"}</strong>

                              <small>{getSourceDomain(source.url)}</small>
                            </span>

                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path
                                d="M14 5h5v5M19 5l-8 8M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}

            {/* ===========================================
                TYPING INDICATOR
            =========================================== */}

            {isLoading && (
              <div className="ai-message ai-message--assistant">
                <div className="ai-message__label">TripWise AI</div>

                <div className="ai-message__bubble ai-message__bubble--typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="ai-chat-error" role="alert">
          {error}
        </div>
      )}

      {/* ===================================================
          INPUT
      =================================================== */}

      <form className="ai-chat-composer" onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask TripWise anything about your trip..."
          rows="1"
          maxLength="2000"
          disabled={isLoading}
          aria-label="Message TripWise AI"
        />

        <button
          type="submit"
          className="ai-chat-composer__send"
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
        >
          <SendIcon size={18} />
        </button>
      </form>

      {/* ===================================================
          FOOTER
      =================================================== */}

      <div className="ai-chat-panel__footer">
        AI responses may require verification for live travel information.
      </div>
    </section>
  );
}

export default AiChatPanel;
