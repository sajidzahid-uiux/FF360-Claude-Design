import { TouchSlideText } from "../common";

export const TruncatedName = ({ name }: { name: string }) => {
  const isLongname = name?.length > 15;

  if (!isLongname) {
    return <span>{name}</span>;
  }

  return (
    <div className="max-w-[120px] overflow-hidden whitespace-nowrap">
      <TouchSlideText
        className="text-[11px]"
        maxWidth="max-w-[120px]"
        text={name}
      />
    </div>
  );
};
