import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import styled from "styled-components";

const AppContainer = styled.div`
  text-align: center;
  padding: 20px;
`;

const BuilderContainer = styled.div`
  display: flex;
  margin-top: 20px;
`;

const SidePanel = styled.div`
  width: 20%;
  padding: 10px;
  border-right: 1px solid #ccc;
  background-color: #f9f9f9;
`;

const FormBuilderArea = styled.div`
  width: 70%;
  padding: 10px;
  min-height: 400px;
  border: 1px solid #ccc;
  background-color: #fff;
  position: relative;
`;

const DraggableItem = styled.div`
  padding: 8px;
  margin: 5px 0;
  background-color: #e3e3e3;
  border: 1px solid #ccc;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FormComponent = styled(DraggableItem)`
  margin-bottom: 10px;
  position: relative;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const PropertiesPanel = styled.div`
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-weight: bold;
  margin-bottom: 8px;
`;

const CloseButton = styled.button`
  margin-top: 20px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
`;

const PreviewPanel = styled(PropertiesPanel)`
  width: 500px;
`;

const ItemTypes = {
  COMPONENT: "component",
};

const ComponentItem = ({ component }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.COMPONENT,
    item: component,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <DraggableItem ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {component.label}
    </DraggableItem>
  );
};

const FormBuilderDropArea = ({
  formComponents,
  setFormComponents,
  openPropertiesPanel,
}) => {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.COMPONENT,
    drop: (item) => addComponentToForm(item),
  }));

  const addComponentToForm = (component) => {
    setFormComponents((prevComponents) => [
      ...prevComponents,
      {
        type: component.id,
        label: component.label,
        placeholder: "",
        required: false,
        maxLength: component.id === "textArea" ? 100 : undefined,
        options:
          component.id === "selectDropdown" ||
          component.id === "checkbox" ||
          component.id === "radioButton"
            ? []
            : undefined,
      },
    ]);
  };

  const deleteComponent = (index) => {
    setFormComponents((prevComponents) =>
      prevComponents.filter((_, i) => i !== index)
    );
  };

  return (
    <FormBuilderArea ref={drop}>
      <h2>Form Builder Area</h2>
      {formComponents.map((component, index) => (
        <FormComponent key={index}>
          <span>{component.label}</span>
          <div>
            <IconButton onClick={() => openPropertiesPanel(index)}>
              ⋮
            </IconButton>
            <IconButton onClick={() => deleteComponent(index)}>🗑️</IconButton>
          </div>
        </FormComponent>
      ))}
    </FormBuilderArea>
  );
};

function App() {
  const [formTitle, setFormTitle] = useState("");
  const [formComponents, setFormComponents] = useState([]);
  const [selectedComponentIndex, setSelectedComponentIndex] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  const componentsList = [
    { id: "textInput", label: "Text Input" },
    { id: "textArea", label: "Text Area" },
    { id: "selectDropdown", label: "Select Dropdown" },
    { id: "checkbox", label: "Checkbox" },
    { id: "radioButton", label: "Radio Button" },
    { id: "datePicker", label: "Date Picker" },
    { id: "fileUpload", label: "File Upload" },
  ];

  const openPropertiesPanel = (index) => {
    setSelectedComponentIndex(index);
  };

  const handlePropertyChange = (e, property) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormComponents((prevComponents) =>
      prevComponents.map((comp, i) =>
        i === selectedComponentIndex ? { ...comp, [property]: value } : comp
      )
    );
  };

  const handleOptionsChange = (index, newValue) => {
    setFormComponents((prevComponents) =>
      prevComponents.map((comp, i) =>
        i === selectedComponentIndex
          ? {
              ...comp,
              options: comp.options.map((opt, optIndex) =>
                optIndex === index ? newValue : opt
              ),
            }
          : comp
      )
    );
  };

  const addOption = () => {
    setFormComponents((prevComponents) =>
      prevComponents.map((comp, i) =>
        i === selectedComponentIndex
          ? { ...comp, options: [...comp.options, ""] }
          : comp
      )
    );
  };

  const closePropertiesPanel = () => {
    setSelectedComponentIndex(null);
  };

  const handleSaveForm = async () => {
    const formData = {
      form_name: formTitle,
      form_data: formComponents,
    };

    try {
      const response = await fetch("http://localhost:8000/api/forms/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "my-secure-api-token",
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      console.log("Form saved:", result);
      alert(result.message || "Form saved successfully!");
    } catch (error) {
      console.error("Error saving form:", error);
    }
  };

  const closePreviewPanel = () => {
    setPreviewMode(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <AppContainer>
        <h1>Form Builder</h1>
        <input
          type="text"
          placeholder="Enter form title"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
        />

        <BuilderContainer>
          <SidePanel>
            <h2>Components</h2>
            {componentsList.map((component) => (
              <ComponentItem key={component.id} component={component} />
            ))}
          </SidePanel>

          <FormBuilderDropArea
            formComponents={formComponents}
            setFormComponents={setFormComponents}
            openPropertiesPanel={openPropertiesPanel}
          />
        </BuilderContainer>

        {selectedComponentIndex !== null && (
          <ModalOverlay>
            <PropertiesPanel>
              <h3>Edit Properties</h3>
              <Label>
                Label:
                <input
                  type="text"
                  value={formComponents[selectedComponentIndex].label}
                  onChange={(e) => handlePropertyChange(e, "label")}
                />
              </Label>

              {["textInput", "textArea"].includes(
                formComponents[selectedComponentIndex].type
              ) && (
                <>
                  <Label>
                    Placeholder:
                    <input
                      type="text"
                      value={formComponents[selectedComponentIndex].placeholder}
                      onChange={(e) => handlePropertyChange(e, "placeholder")}
                    />
                  </Label>
                  <Label>
                    Required:
                    <input
                      type="checkbox"
                      checked={formComponents[selectedComponentIndex].required}
                      onChange={(e) => handlePropertyChange(e, "required")}
                    />
                  </Label>
                  {formComponents[selectedComponentIndex].type ===
                    "textArea" && (
                    <Label>
                      Max Characters:
                      <input
                        type="number"
                        value={
                          formComponents[selectedComponentIndex].maxLength || ""
                        }
                        onChange={(e) => handlePropertyChange(e, "maxLength")}
                      />
                    </Label>
                  )}
                </>
              )}

              {["selectDropdown", "checkbox", "radioButton"].includes(
                formComponents[selectedComponentIndex].type
              ) && (
                <>
                  <Label>Required:</Label>
                  <input
                    type="checkbox"
                    checked={formComponents[selectedComponentIndex].required}
                    onChange={(e) => handlePropertyChange(e, "required")}
                  />
                  <Label>Options:</Label>
                  {formComponents[selectedComponentIndex].options.map(
                    (opt, index) => (
                      <input
                        key={index}
                        type="text"
                        value={opt}
                        onChange={(e) =>
                          handleOptionsChange(index, e.target.value)
                        }
                      />
                    )
                  )}
                  <button onClick={addOption}>Add Option</button>
                </>
              )}

              {formComponents[selectedComponentIndex].type === "datePicker" && (
                <Label>
                  Required:
                  <input
                    type="checkbox"
                    checked={formComponents[selectedComponentIndex].required}
                    onChange={(e) => handlePropertyChange(e, "required")}
                  />
                </Label>
              )}

              {formComponents[selectedComponentIndex].type === "fileUpload" && (
                <Label>
                  Required:
                  <input
                    type="checkbox"
                    checked={formComponents[selectedComponentIndex].required}
                    onChange={(e) => handlePropertyChange(e, "required")}
                  />
                </Label>
              )}
              <CloseButton onClick={closePropertiesPanel}>
                Save & Close
              </CloseButton>
            </PropertiesPanel>
          </ModalOverlay>
        )}

        {previewMode && (
          <ModalOverlay>
            <PreviewPanel>
              <h2>Form Preview</h2>
              <div>{formTitle}</div>
              {formComponents.map((comp, index) => (
                <div key={index} style={{ marginBottom: "15px" }}>
                  <label>{comp.label}</label>
                  {comp.type === "textInput" && (
                    <input
                      type="text"
                      placeholder={comp.placeholder}
                      required={comp.required}
                    />
                  )}
                  {comp.type === "textArea" && (
                    <textarea
                      placeholder={comp.placeholder}
                      maxLength={comp.maxLength}
                      required={comp.required}
                    />
                  )}
                  {comp.type === "selectDropdown" && (
                    <select required={comp.required}>
                      <option value="">Select an option</option>
                      {comp.options &&
                        comp.options.map((opt, i) => (
                          <option key={i} value={opt}>
                            {opt}
                          </option>
                        ))}
                    </select>
                  )}
                  {comp.type === "checkbox" && (
                    <div>
                      {comp.options &&
                        comp.options.map((opt, i) => (
                          <label
                            key={i}
                            style={{ display: "block", margin: "5px 0" }}
                          >
                            <input
                              type="checkbox"
                              name={comp.label}
                              value={opt}
                              required={comp.required}
                            />
                            {opt}
                          </label>
                        ))}
                    </div>
                  )}
                  {comp.type === "radioButton" && (
                    <div>
                      {comp.options &&
                        comp.options.map((opt, i) => (
                          <label
                            key={i}
                            style={{ display: "block", margin: "5px 0" }}
                          >
                            <input
                              type="radio"
                              name={`radio-${index}`}
                              value={opt}
                              required={comp.required}
                            />
                            {opt}
                          </label>
                        ))}
                    </div>
                  )}
                  {comp.type === "datePicker" && (
                    <input type="date" required={comp.required} />
                  )}
                  {comp.type === "fileUpload" && (
                    <input type="file" required={comp.required} />
                  )}
                </div>
              ))}
              <CloseButton onClick={closePreviewPanel}>
                Close Preview
              </CloseButton>
            </PreviewPanel>
          </ModalOverlay>
        )}

        <button onClick={() => setPreviewMode(!previewMode)}>
          {previewMode ? "Edit Mode" : "Preview Mode"}
        </button>
        <button onClick={handleSaveForm}>Save Form</button>
      </AppContainer>
    </DndProvider>
  );
}

export default App;
