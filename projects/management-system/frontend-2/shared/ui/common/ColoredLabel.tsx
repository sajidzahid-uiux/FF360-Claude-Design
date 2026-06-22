interface ColoredLabelProps {
  color: string;
  label: string;
}

export const ColoredLabel = ({ color, label }: ColoredLabelProps) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-3 w-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </div>
  );
};
