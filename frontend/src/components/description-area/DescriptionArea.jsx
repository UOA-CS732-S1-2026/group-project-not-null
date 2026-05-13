import './DescriptionArea.css'

export default function DescriptionArea({
  label = 'Description',
  name = 'description',
  value,
  onChange,
  placeholder,
  rows = 7,
  required = false,
}) {
  return (
    <label className="description-area">
      {label ? <span>{label}</span> : null}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
      />
    </label>
  )
}
