import PropTypes from "prop-types"
import { useEffect, useRef, useState } from "react"

export default function MultiSelectDropdown({ formFieldName, categories, onChange, prompt = "Select one or more options" }) {
  const [selectedOptions, setSelectedOptions] = useState([])
  const [isJsEnabled, setIsJsEnabled] = useState(false)
  const optionsListRef = useRef(null)

  useEffect(() => {
    setIsJsEnabled(true)
  }, [])

  const handleChange = (e) => {
    const isChecked = e.target.checked
    const option = parseInt(e.target.value, 10)
    const selectedOptionSet = new Set(selectedOptions)

    if (isChecked) {
      selectedOptionSet.add(option)
    } else {
      selectedOptionSet.delete(option)
    }

    const newSelectedOptions = Array.from(selectedOptionSet)

    setSelectedOptions(newSelectedOptions)
    onChange(newSelectedOptions)
  }

  const isSelectAllEnabled = selectedOptions.length < categories.length

  const handleSelectAllClick = (e) => {
    e.preventDefault()

    const allIds = categories.map(c => c.id)
    const categoryInputs = optionsListRef.current.querySelectorAll("input")

    categoryInputs.forEach((input) => {
      input.checked = true
    })

    setSelectedOptions(allIds)
    onChange(allIds)
  }

  const isClearSelectionEnabled = selectedOptions.length > 0

  const handleClearSelectionClick = (e) => {
    e.preventDefault()

    const optionsInputs = optionsListRef.current.querySelectorAll("input")

    optionsInputs.forEach((input) => {
      input.checked = false
    })

    setSelectedOptions([])
    onChange([])
  }

  return (
    <label className="relative block rounded z-10">
      <input type="checkbox" className="hidden peer" />

      <div className="cursor-pointer inline-flex items-center border rounded px-5 py-2 peer-checked:after:-rotate-180 after:transition-transform after:ml-1 after:inline-flex after:content-['▼'] after:text-xs">
        {prompt}

        {isJsEnabled && selectedOptions.length > 0 && (
          <span className="ml-1 text-blue-500">{`(${selectedOptions.length} selected)`}</span>
        )}
      </div>

      <div className="absolute left-0 z-20 right-0 mt-2 bg-white dark:bg-gray-700 dark:focus:border-cyan-500 dark:text-white border transition-opacity rounded duration-200 opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:pointer-events-auto max-h-60 peer-checked:border-[rgb(62,145,160)] overflow-y-auto">
        {isJsEnabled && (
          <ul>
            <li>
              <button
                onClick={handleSelectAllClick}
                disabled={!isSelectAllEnabled}
                className="w-full text-left px-2 py-1 text-blue-600 dark:text-white disabled:opacity-50"
              >
                {"Select All"}
              </button>
            </li>
            <li>
              <button
                onClick={handleClearSelectionClick}
                disabled={!isClearSelectionEnabled}
                className="w-full text-left px-2 pt-1 pb-2 text-blue-600 dark:text-white disabled:opacity-50"
              >
                {"Clear selection"}
              </button>
            </li>
          </ul>
        )}

        <ul ref={optionsListRef}>
          {categories &&
            categories.map((category) => (
              <li key={category.id}>
                <label className="flex items-center whitespace-nowrap cursor-pointer px-2 py-1 transition-colors hover:bg-blue-100 dark:hover:bg-gray-500 [&:has(input:checked)]:bg-blue-200 dark:[&:has(input:checked)]:bg-gray-500">
                  <input
                    type="checkbox"
                    name={formFieldName}
                    value={category.id}
                    className="cursor-pointer rounded"
                    onChange={handleChange}
                  />
                  <span className="ml-1">{category.name}</span>
                </label>
              </li>
            ))}
        </ul>
      </div>
    </label>
  )
}

MultiSelectDropdown.propTypes = {
  formFieldName: PropTypes.string.isRequired, 
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired, 
      name: PropTypes.string.isRequired, 
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  prompt: PropTypes.string, 
}

MultiSelectDropdown.defaultProps = {
  prompt: "Select one or more options",
}
