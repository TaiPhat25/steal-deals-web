"use client";

interface ChatStarterPillsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

const STARTER_PROMPTS = [
  {
    icon: "la-map-marker",
    label: "Surprise bags near me",
    prompt: "Show me surprise bags available near my location today",
  },
  {
    icon: "la-bread-slice",
    label: "Bakery deals today",
    prompt: "What bakeries have surplus surprise bags available today?",
  },
  {
    icon: "la-tag",
    label: "Deals > 50% off",
    prompt: "Find surprise bags with at least 50% discount",
  },
  {
    icon: "la-question-circle",
    label: "How pickup works",
    prompt: "How does surprise bag pickup work on StealDeals?",
  },
];

export default function ChatStarterPills({
  onSelectPrompt,
  disabled = false,
}: ChatStarterPillsProps) {
  return (
    <div className="chat-starter-pills">
      <p className="chat-starter-pills__label">
        <i className="las la-lightbulb" aria-hidden="true"></i> Quick prompts to get started:
      </p>
      <div className="chat-starter-pills__list">
        {STARTER_PROMPTS.map((item) => (
          <button
            key={item.label}
            type="button"
            className="chat-starter-pill"
            disabled={disabled}
            onClick={() => onSelectPrompt(item.prompt)}
          >
            <i className={`las ${item.icon}`} aria-hidden="true"></i>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
