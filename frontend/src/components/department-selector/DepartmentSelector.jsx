import './DepartmentSelector.css'

export default function DepartmentSelector({
  label = 'Department',
  name = 'category',
  value,
  options,
  onChange,
}) {
  return (
    <label className="department-selector">
      <span>{label}</span>

      <select name={name} value={value} onChange={onChange} required>
        <option value="">Please select a department</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}