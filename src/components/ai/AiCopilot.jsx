import { useEffect, useRef, useState } from "react";

import AiChatButton from "./AiChatButton";
import AiChatPanel from "./AiChatPanel";

function AiCopilot() {
  const [isOpen, setIsOpen] = useState(false);

  const [showFarewell, setShowFarewell] = useState(false);

  const farewellTimerRef = useRef(null);

  function handleOpen() {
    if (farewellTimerRef.current) {
      clearTimeout(farewellTimerRef.current);
    }

    setShowFarewell(false);
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);

    setShowFarewell(true);

    if (farewellTimerRef.current) {
      clearTimeout(farewellTimerRef.current);
    }

    farewellTimerRef.current = setTimeout(() => {
      setShowFarewell(false);
    }, 2200);
  }

  useEffect(() => {
    return () => {
      if (farewellTimerRef.current) {
        clearTimeout(farewellTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <AiChatPanel isOpen={isOpen} onClose={handleClose} />

      {!isOpen && <AiChatButton isOpen={false} onClick={handleOpen} />}

      {showFarewell && (
        <div className="ai-copilot-toast" role="status">
          <span className="ai-copilot-toast__icon">✦</span>

          <div>
            <strong>Safe travels</strong>

            <span>Your chat is waiting when you come back.</span>
          </div>
        </div>
      )}
    </>
  );
}

export default AiCopilot;
