interface MarqueeTextProps {
  text: string;
  className?: string;
  maxWidth?: string;
  duration?: number;
}

export function MarqueeText({
  text,
  className = "",
  maxWidth = "max-w-[250px]",
  duration = 10,
}: MarqueeTextProps) {
  return (
    <div className={`overflow-hidden ${maxWidth}`}>
      <div
        className={`marquee-scroll ${className}`}
        style={{
          animationDuration: `${duration}s`,
        }}
      >
        {text}
        <span className="mx-8">•</span>
        {text}
      </div>
    </div>
  );
}
