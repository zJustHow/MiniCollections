import { NeuInput } from "../NeuFormControl/NeuInput";

const { Search } = NeuInput;

export default function ListSearchField({
  id,
  name,
  placeholder,
  value,
  onChange,
  onSearch,
}) {
  return (
    <Search
      id={id}
      name={name}
      placeholder={placeholder}
      allowClear
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onSearch={onSearch}
    />
  );
}
