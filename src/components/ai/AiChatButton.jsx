import "../../styles/ai-chat.css";

function AiChatButton({ onClick, isOpen = false }) {
  return (
    <button
      type="button"
      className={`ai-chat-button ${isOpen ? "ai-chat-button--open" : ""}`}
      onClick={onClick}
      aria-label={isOpen ? "Close TripWise AI" : "Open TripWise AI"}
      title="TripWise AI"
    >
      <span className="ai-chat-button__icon">
        {isOpen ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 3l1.5 4.2L18 9l-4.5 1.8L12 15l-1.5-4.2L6 9l4.5-1.8L12 3Z"
              fill="currentColor"
            />

            <path
              d="M18.5 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"
              fill="currentColor"
            />
          </svg>
        )}
      </span>

      {!isOpen && <span className="ai-chat-button__label">TripWise AI</span>}
    </button>
  );
}

export default AiChatButton;
