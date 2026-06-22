import { useEffect, useId, useRef } from 'react';
import { ComponentSizeEnum } from '../../../constants';
import { Checkbox } from '../../ui-components/Checkbox';

export function TableSelectAllCheckbox({
  checked,
  indeterminate,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <span className="inline-flex items-center leading-none">
      <Checkbox
        ref={inputRef}
        id={inputId}
        size={ComponentSizeEnum.MD}
        checked={checked}
        onChange={() => onChange()}
        aria-label={label}
      />
    </span>
  );
}
