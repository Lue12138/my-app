import React, { useState } from 'react';

function App() {
  const [formData, setFormData] = useState({
    form_name: '',
    form_data: {
      textInput: '',
      textArea: '',
      selectDropdown: '',
      checkbox: false,
      radioButton: '',
      date: '',
      file: null,
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      form_data: {
        ...prevData.form_data,
        [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
      }
    }));
  };

  const handleFormNameChange = (e) => {
    setFormData({ ...formData, form_name: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/forms/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      console.log('Form saved:', result);
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };

  return (
    <div className="app">
      <h1>Form Builder</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Form Name:</label>
          <input
            type="text"
            name="form_name"
            value={formData.form_name}
            onChange={handleFormNameChange}
          />
        </div>

        {/* Text Input */}
        <div>
          <label>Text Input:</label>
          <input
            type="text"
            name="textInput"
            value={formData.form_data.textInput}
            onChange={handleChange}
          />
        </div>

        {/* Text Area */}
        <div>
          <label>Text Area:</label>
          <textarea
            name="textArea"
            value={formData.form_data.textArea}
            onChange={handleChange}
          />
        </div>

        {/* Select Dropdown */}
        <div>
          <label>Select Dropdown:</label>
          <select
            name="selectDropdown"
            value={formData.form_data.selectDropdown}
            onChange={handleChange}
          >
            <option value="">Choose an option</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </select>
        </div>

        {/* Checkbox */}
        <div>
          <label>
            <input
              type="checkbox"
              name="checkbox"
              checked={formData.form_data.checkbox}
              onChange={handleChange}
            />
            Checkbox
          </label>
        </div>

        {/* Radio Buttons */}
        <div>
          <label>Radio Buttons:</label>
          <label>
            <input
              type="radio"
              name="radioButton"
              value="radio1"
              checked={formData.form_data.radioButton === 'radio1'}
              onChange={handleChange}
            />
            Radio 1
          </label>
          <label>
            <input
              type="radio"
              name="radioButton"
              value="radio2"
              checked={formData.form_data.radioButton === 'radio2'}
              onChange={handleChange}
            />
            Radio 2
          </label>
        </div>

        {/* Date Picker */}
        <div>
          <label>Date Picker:</label>
          <input
            type="date"
            name="date"
            value={formData.form_data.date}
            onChange={handleChange}
          />
        </div>

        {/* File Upload */}
        <div>
          <label>File Upload:</label>
          <input
            type="file"
            name="file"
            onChange={handleChange}
          />
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
