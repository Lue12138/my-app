import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import styled from "styled-components";

// Styled Components
const AppContainer = styled.div`
  text-align: center;
  padding: 20px;
  position: relative;
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

// Updated IconButton Styling
const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
`;

// CloseButton remains unchanged
const CloseButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background-color: #28a745;
  color: white;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #218838;
  }
`;

// MainButton remains unchanged
const MainButton = styled.button`
  margin: 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background-color: #6c757d;
  color: white;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #5a6268;
  }
`;

// Styled Component for History Panel Buttons
const HistoryButton = styled.button`
  background-color: #6c757d;
  color: #f9f9f9;
  border: 2px solid #f9f9f9;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  width: 100%;
  text-align: left;
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: #5a6268;
    color: #ffffff;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.5);
  }
`;

// Modal Overlay Styling remains unchanged
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

const PreviewPanel = styled(PropertiesPanel)`
  width: 500px;
`;

// Notification Styling
const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: ${({ success }) => (success ? "#28a745" : "#dc3545")};
  color: white;
  padding: 15px 25px;
  border-radius: 4px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.3);
  display: ${({ visible }) => (visible ? "block" : "none")};
  z-index: 1100;
  transition: opacity 0.5s ease-in-out;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
`;

const FormTitle = styled.h2`
  font-size: 1.5em;
  color: #343a40;
  margin-bottom: 10px;
`;

// Styled Components for Preview Panel
const PreviewField = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 15px;
  width: 100%;
`;

const PreviewLabel = styled.label`
  font-weight: bold;
  margin-bottom: 5px;
`;

const PreviewInput = styled.input`
  padding: 8px;
  width: 100%;
  box-sizing: border-box;
`;

const PreviewTextarea = styled.textarea`
  padding: 8px;
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
`;

const PreviewSelect = styled.select`
  padding: 8px;
  width: 100%;
  box-sizing: border-box;
`;

const PreviewCheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const PreviewRadioContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

// Notification Component
const Notification = ({ message, success, visible }) => (
  <NotificationContainer success={success} visible={visible}>
    {message}
  </NotificationContainer>
);

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
  const [showHistory, setShowHistory] = useState(false);
  const [formHistory, setFormHistory] = useState([]);
  const [currentFormId, setCurrentFormId] = useState(null);

  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationSuccess, setNotificationSuccess] = useState(true);

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
      let response;
      if (currentFormId) {
        response = await fetch(
          `http://localhost:8000/api/forms/update/${currentFormId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "my-secure-api-token",
            },
            body: JSON.stringify(formData),
          }
        );
      } else {
        response = await fetch("http://localhost:8000/api/forms/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "my-secure-api-token",
          },
          body: JSON.stringify(formData),
        });
      }

      const result = await response.json();

      if (response.ok) {
        setNotificationMessage(result.message || "Form saved successfully!");
        setNotificationSuccess(true);
        if (!currentFormId && result.formId) {
          setCurrentFormId(result.formId);
        }
      } else {
        setNotificationMessage(result.message || "Failed to save form.");
        setNotificationSuccess(false);
      }
    } catch (error) {
      console.error("Error saving form:", error);
      setNotificationMessage("Error saving form.");
      setNotificationSuccess(false);
    }

    setShowNotification(true);
  };

  // Automatically hide the notification after 3 seconds
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const closePreviewPanel = () => {
    setPreviewMode(false);
  };

  const handleShowHistory = async () => {
    setShowHistory(true);
    try {
      const response = await fetch("http://localhost:8000/api/forms/list");
      const data = await response.json();
      setFormHistory(data);
    } catch (error) {
      console.error("Error fetching form history:", error);
      setNotificationMessage("Error fetching form history.");
      setNotificationSuccess(false);
      setShowNotification(true);
    }
  };

  const loadForm = async (formId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/forms/${formId}`);
      const data = await response.json();
      setFormTitle(data.form_name);
      setFormComponents(data.form_data);
      setCurrentFormId(data.id);
      setShowHistory(false);
      setNotificationMessage("Form loaded successfully!");
      setNotificationSuccess(true);
      setShowNotification(true);
    } catch (error) {
      console.error("Error loading form:", error);
      setNotificationMessage("Error loading form.");
      setNotificationSuccess(false);
      setShowNotification(true);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <AppContainer>
        <h1>Form Builder</h1>

        <TitleContainer>
          <FormTitle>Form Name</FormTitle>
          <input
            type="text"
            placeholder="Enter form title"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />
        </TitleContainer>

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
                  <Label>
                    Required:
                    <input
                      type="checkbox"
                      checked={formComponents[selectedComponentIndex].required}
                      onChange={(e) => handlePropertyChange(e, "required")}
                    />
                  </Label>
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
                <PreviewField key={index}>
                  <PreviewLabel>{comp.label}</PreviewLabel>
                  {comp.type === "textInput" && (
                    <PreviewInput
                      type="text"
                      placeholder={comp.placeholder}
                      required={comp.required}
                    />
                  )}
                  {comp.type === "textArea" && (
                    <PreviewTextarea
                      placeholder={comp.placeholder}
                      maxLength={comp.maxLength}
                      required={comp.required}
                    />
                  )}
                  {comp.type === "selectDropdown" && (
                    <PreviewSelect required={comp.required}>
                      <option value="">Select an option</option>
                      {comp.options &&
                        comp.options.map((opt, i) => (
                          <option key={i} value={opt}>
                            {opt}
                          </option>
                        ))}
                    </PreviewSelect>
                  )}
                  {comp.type === "checkbox" && (
                    <PreviewCheckboxContainer>
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
                    </PreviewCheckboxContainer>
                  )}
                  {comp.type === "radioButton" && (
                    <PreviewRadioContainer>
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
                    </PreviewRadioContainer>
                  )}
                  {comp.type === "datePicker" && (
                    <PreviewInput type="date" required={comp.required} />
                  )}
                  {comp.type === "fileUpload" && (
                    <PreviewInput type="file" required={comp.required} />
                  )}
                </PreviewField>
              ))}
              <CloseButton onClick={closePreviewPanel}>
                Close Preview
              </CloseButton>
            </PreviewPanel>
          </ModalOverlay>
        )}

        {showHistory && (
          <ModalOverlay>
            <PropertiesPanel>
              <h2>Form History</h2>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {formHistory.map((form) => (
                  <li key={form.id} style={{ marginBottom: "15px" }}>
                    <HistoryButton onClick={() => loadForm(form.id)}>
                      {form.form_name}
                    </HistoryButton>
                    <div style={{ color: "#6c757d", fontSize: "0.9em", marginTop: "5px" }}>
                      Last updated: {new Date(form.updated_at).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
              <CloseButton onClick={() => setShowHistory(false)}>
                Close
              </CloseButton>
            </PropertiesPanel>
          </ModalOverlay>
        )}

        <MainButton onClick={handleShowHistory}>History</MainButton>
        <MainButton onClick={() => setPreviewMode(!previewMode)}>
          {previewMode ? "Edit Mode" : "Preview Mode"}
        </MainButton>
        <MainButton onClick={handleSaveForm}>Save Form</MainButton>

        {/* Notification Component */}
        <Notification
          message={notificationMessage}
          success={notificationSuccess}
          visible={showNotification}
        />
      </AppContainer>
    </DndProvider>
  );
}

export default App;
