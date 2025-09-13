import React, { useState } from "react";
import type { PDLFormData, EmergencyContact } from "../../types/pdl";
import { validatePDLForm } from "../../services/pdlApi";

interface PDLRegistrationFormProps {
  onSubmit: (data: PDLFormData) => void;
  loading?: boolean;
  initialData?: Partial<PDLFormData>;
}

// Helper function to normalize data from API
const normalizeInitialData = (
  data: Partial<PDLFormData>
): Partial<PDLFormData> => {
  const normalized = { ...data };

  // Ensure array fields are arrays
  if (normalized.aliases) {
    if (typeof normalized.aliases === "string") {
      try {
        normalized.aliases = JSON.parse(normalized.aliases);
      } catch {
        normalized.aliases = [];
      }
    } else if (!Array.isArray(normalized.aliases)) {
      normalized.aliases = [];
    }
  }

  if (normalized.charges) {
    if (typeof normalized.charges === "string") {
      try {
        normalized.charges = JSON.parse(normalized.charges);
      } catch {
        normalized.charges = [];
      }
    } else if (!Array.isArray(normalized.charges)) {
      normalized.charges = [];
    }
  }

  if (normalized.emergency_contacts) {
    if (typeof normalized.emergency_contacts === "string") {
      try {
        normalized.emergency_contacts = JSON.parse(
          normalized.emergency_contacts
        );
      } catch {
        normalized.emergency_contacts = [];
      }
    } else if (!Array.isArray(normalized.emergency_contacts)) {
      normalized.emergency_contacts = [];
    }
  }

  // Ensure object fields are objects
  const objectFields = [
    "address",
    "contact_information",
    "physical_characteristics",
    "court_information",
    "sentence_details",
    "property_inventory",
    "medical_screening",
  ];
  objectFields.forEach((field) => {
    const fieldKey = field as keyof PDLFormData;
    if (normalized[fieldKey]) {
      const value = normalized[fieldKey];
      if (typeof value === "string") {
        try {
          (normalized as any)[fieldKey] = JSON.parse(value);
        } catch {
          (normalized as any)[fieldKey] = {};
        }
      } else if (typeof value !== "object" || Array.isArray(value)) {
        (normalized as any)[fieldKey] = {};
      }
    }
  });

  return normalized;
};

const PDLRegistrationForm: React.FC<PDLRegistrationFormProps> = ({
  onSubmit,
  loading = false,
  initialData = {},
}) => {
  const normalizedInitialData = normalizeInitialData(initialData);

  const [formData, setFormData] = useState<PDLFormData>({
    first_name: "",
    middle_name: "",
    last_name: "",
    aliases: [],
    date_of_birth: "",
    place_of_birth: "",
    gender: "male",
    civil_status: "single",
    nationality: "Filipino",
    religion: "",
    address: {
      current: "",
      permanent: "",
    },
    contact_information: {
      phone: "",
      email: "",
    },
    emergency_contacts: [],
    physical_characteristics: {
      height: "",
      weight: "",
      identifying_marks: "",
    },
    case_number: "",
    charges: [],
    court_information: {
      court_name: "",
      judge: "",
    },
    sentence_details: {
      sentence: "",
      date_sentenced: "",
    },
    legal_status: "detained",
    admission_date: "",
    admission_time: "",
    arresting_officer: "",
    arresting_agency: "",
    property_inventory: {},
    medical_screening: {
      blood_pressure: "",
      temperature: "",
      medical_conditions: "",
      medications: "",
    },
    status: "active",
    cell_assignment: "",
    notes: "",
    ...normalizedInitialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [aliasInput, setAliasInput] = useState("");
  const [chargeInput, setChargeInput] = useState("");

  const steps = [
    { number: 1, title: "Personal Information", icon: "bi-person" },
    { number: 2, title: "Contact & Address", icon: "bi-house" },
    { number: 3, title: "Legal Information", icon: "bi-file-text" },
    { number: 4, title: "Admission Details", icon: "bi-calendar-plus" },
    { number: 5, title: "Additional Information", icon: "bi-info-circle" },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      const keys = field.split(".");
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else if (keys.length === 2) {
        const parentKey = keys[0] as keyof PDLFormData;
        const parentValue = prev[parentKey];
        if (
          typeof parentValue === "object" &&
          parentValue !== null &&
          !Array.isArray(parentValue)
        ) {
          return {
            ...prev,
            [keys[0]]: {
              ...parentValue,
              [keys[1]]: value,
            },
          };
        }
      }
      return prev;
    });

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addAlias = () => {
    if (aliasInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        aliases: [...(prev.aliases || []), aliasInput.trim()],
      }));
      setAliasInput("");
    }
  };

  const removeAlias = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      aliases: prev.aliases?.filter((_, i) => i !== index) || [],
    }));
  };

  const addCharge = () => {
    if (chargeInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        charges: [...prev.charges, chargeInput.trim()],
      }));
      setChargeInput("");
    }
  };

  const removeCharge = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      charges: prev.charges.filter((_, i) => i !== index),
    }));
  };

  const addEmergencyContact = () => {
    const newContact: EmergencyContact = {
      name: "",
      relationship: "",
      phone: "",
      address: "",
    };
    setFormData((prev) => ({
      ...prev,
      emergency_contacts: [...(prev.emergency_contacts || []), newContact],
    }));
  };

  const updateEmergencyContact = (
    index: number,
    field: keyof EmergencyContact,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      emergency_contacts:
        prev.emergency_contacts?.map((contact, i) =>
          i === index ? { ...contact, [field]: value } : contact
        ) || [],
    }));
  };

  const removeEmergencyContact = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      emergency_contacts:
        prev.emergency_contacts?.filter((_, i) => i !== index) || [],
    }));
  };

  const validateCurrentStep = (): boolean => {
    const stepErrors = validatePDLForm(formData);
    const stepFields = getStepFields(currentStep);
    const currentStepErrors: Record<string, string> = {};

    stepFields.forEach((field) => {
      if (stepErrors[field]) {
        currentStepErrors[field] = stepErrors[field];
      }
    });

    setErrors(currentStepErrors);
    return Object.keys(currentStepErrors).length === 0;
  };

  const getStepFields = (step: number): string[] => {
    switch (step) {
      case 1:
        return [
          "first_name",
          "last_name",
          "date_of_birth",
          "place_of_birth",
          "gender",
          "civil_status",
          "nationality",
        ];
      case 2:
        return [
          "address.current",
          "contact_information.phone",
          "contact_information.email",
        ];
      case 3:
        return ["case_number", "charges", "legal_status"];
      case 4:
        return ["admission_date", "admission_time"];
      case 5:
        return ["status"];
      default:
        return [];
    }
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formErrors = validatePDLForm(formData);

    if (Object.keys(formErrors).length === 0) {
      onSubmit(formData);
    } else {
      setErrors(formErrors);
      // Go to the first step with errors
      for (let step = 1; step <= steps.length; step++) {
        const stepFields = getStepFields(step);
        if (stepFields.some((field) => formErrors[field])) {
          setCurrentStep(step);
          break;
        }
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="row">
            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  className={`form-control ${
                    errors.first_name ? "is-invalid" : ""
                  }`}
                  value={formData.first_name}
                  onChange={(e) =>
                    handleInputChange("first_name", e.target.value)
                  }
                />
                {errors.first_name && (
                  <div className="invalid-feedback">{errors.first_name}</div>
                )}
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">Middle Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.middle_name || ""}
                  onChange={(e) =>
                    handleInputChange("middle_name", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  className={`form-control ${
                    errors.last_name ? "is-invalid" : ""
                  }`}
                  value={formData.last_name}
                  onChange={(e) =>
                    handleInputChange("last_name", e.target.value)
                  }
                />
                {errors.last_name && (
                  <div className="invalid-feedback">{errors.last_name}</div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Date of Birth *</label>
                <input
                  type="date"
                  className={`form-control ${
                    errors.date_of_birth ? "is-invalid" : ""
                  }`}
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    handleInputChange("date_of_birth", e.target.value)
                  }
                />
                {errors.date_of_birth && (
                  <div className="invalid-feedback">{errors.date_of_birth}</div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Place of Birth *</label>
                <input
                  type="text"
                  className={`form-control ${
                    errors.place_of_birth ? "is-invalid" : ""
                  }`}
                  value={formData.place_of_birth}
                  onChange={(e) =>
                    handleInputChange("place_of_birth", e.target.value)
                  }
                />
                {errors.place_of_birth && (
                  <div className="invalid-feedback">
                    {errors.place_of_birth}
                  </div>
                )}
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">Gender *</label>
                <select
                  className={`form-select ${errors.gender ? "is-invalid" : ""}`}
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <div className="invalid-feedback">{errors.gender}</div>
                )}
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">Civil Status *</label>
                <select
                  className={`form-select ${
                    errors.civil_status ? "is-invalid" : ""
                  }`}
                  value={formData.civil_status}
                  onChange={(e) =>
                    handleInputChange("civil_status", e.target.value)
                  }
                >
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                  <option value="separated">Separated</option>
                </select>
                {errors.civil_status && (
                  <div className="invalid-feedback">{errors.civil_status}</div>
                )}
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">Nationality *</label>
                <input
                  type="text"
                  className={`form-control ${
                    errors.nationality ? "is-invalid" : ""
                  }`}
                  value={formData.nationality}
                  onChange={(e) =>
                    handleInputChange("nationality", e.target.value)
                  }
                />
                {errors.nationality && (
                  <div className="invalid-feedback">{errors.nationality}</div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Religion</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.religion || ""}
                  onChange={(e) =>
                    handleInputChange("religion", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Aliases</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={aliasInput}
                    onChange={(e) => setAliasInput(e.target.value)}
                    placeholder="Enter alias"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addAlias())
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={addAlias}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
                {formData.aliases &&
                  Array.isArray(formData.aliases) &&
                  formData.aliases.length > 0 && (
                    <div className="mt-2">
                      {formData.aliases.map((alias, index) => (
                        <span key={index} className="badge bg-secondary me-1">
                          {alias}
                          <button
                            type="button"
                            className="btn-close btn-close-white ms-1"
                            style={{ fontSize: "0.7em" }}
                            onClick={() => removeAlias(index)}
                          ></button>
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="row">
            <div className="col-12">
              <div className="mb-3">
                <label className="form-label">Current Address *</label>
                <textarea
                  className={`form-control ${
                    errors["address.current"] ? "is-invalid" : ""
                  }`}
                  rows={3}
                  value={formData.address.current}
                  onChange={(e) =>
                    handleInputChange("address.current", e.target.value)
                  }
                />
                {errors["address.current"] && (
                  <div className="invalid-feedback">
                    {errors["address.current"]}
                  </div>
                )}
              </div>
            </div>
            <div className="col-12">
              <div className="mb-3">
                <label className="form-label">Permanent Address</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.address.permanent || ""}
                  onChange={(e) =>
                    handleInputChange("address.permanent", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className={`form-control ${
                    errors["contact_information.phone"] ? "is-invalid" : ""
                  }`}
                  value={formData.contact_information?.phone || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "contact_information.phone",
                      e.target.value
                    )
                  }
                />
                {errors["contact_information.phone"] && (
                  <div className="invalid-feedback">
                    {errors["contact_information.phone"]}
                  </div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className={`form-control ${
                    errors["contact_information.email"] ? "is-invalid" : ""
                  }`}
                  value={formData.contact_information?.email || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "contact_information.email",
                      e.target.value
                    )
                  }
                />
                {errors["contact_information.email"] && (
                  <div className="invalid-feedback">
                    {errors["contact_information.email"]}
                  </div>
                )}
              </div>
            </div>
            <div className="col-12">
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label mb-0">Emergency Contacts</label>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={addEmergencyContact}
                  >
                    <i className="bi bi-plus me-1"></i>Add Contact
                  </button>
                </div>
                {formData.emergency_contacts?.map((contact, index) => (
                  <div key={index} className="card mb-2">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-4">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Name"
                            value={contact.name}
                            onChange={(e) =>
                              updateEmergencyContact(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="col-md-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Relationship"
                            value={contact.relationship}
                            onChange={(e) =>
                              updateEmergencyContact(
                                index,
                                "relationship",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="col-md-3">
                          <input
                            type="tel"
                            className="form-control"
                            placeholder="Phone"
                            value={contact.phone}
                            onChange={(e) =>
                              updateEmergencyContact(
                                index,
                                "phone",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="col-md-2">
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => removeEmergencyContact(index)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Case Number *</label>
                <input
                  type="text"
                  className={`form-control ${
                    errors.case_number ? "is-invalid" : ""
                  }`}
                  value={formData.case_number}
                  onChange={(e) =>
                    handleInputChange("case_number", e.target.value)
                  }
                />
                {errors.case_number && (
                  <div className="invalid-feedback">{errors.case_number}</div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Legal Status *</label>
                <select
                  className={`form-select ${
                    errors.legal_status ? "is-invalid" : ""
                  }`}
                  value={formData.legal_status}
                  onChange={(e) =>
                    handleInputChange("legal_status", e.target.value)
                  }
                >
                  <option value="detained">Detained</option>
                  <option value="convicted">Convicted</option>
                  <option value="acquitted">Acquitted</option>
                  <option value="transferred">Transferred</option>
                  <option value="released">Released</option>
                </select>
                {errors.legal_status && (
                  <div className="invalid-feedback">{errors.legal_status}</div>
                )}
              </div>
            </div>
            <div className="col-12">
              <div className="mb-3">
                <label className="form-label">Charges *</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={chargeInput}
                    onChange={(e) => setChargeInput(e.target.value)}
                    placeholder="Enter charge"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addCharge())
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={addCharge}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
                {errors.charges && (
                  <div className="text-danger small mt-1">{errors.charges}</div>
                )}
                {formData.charges.length > 0 && (
                  <div className="mt-2">
                    {formData.charges.map((charge, index) => (
                      <span
                        key={index}
                        className="badge bg-warning text-dark me-1 mb-1"
                      >
                        {charge}
                        <button
                          type="button"
                          className="btn-close ms-1"
                          style={{ fontSize: "0.7em" }}
                          onClick={() => removeCharge(index)}
                        ></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Court Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.court_information?.court_name || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "court_information.court_name",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Judge</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.court_information?.judge || ""}
                  onChange={(e) =>
                    handleInputChange("court_information.judge", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Sentence</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.sentence_details?.sentence || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "sentence_details.sentence",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Date Sentenced</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.sentence_details?.date_sentenced || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "sentence_details.date_sentenced",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Admission Date *</label>
                <input
                  type="date"
                  className={`form-control ${
                    errors.admission_date ? "is-invalid" : ""
                  }`}
                  value={formData.admission_date}
                  onChange={(e) =>
                    handleInputChange("admission_date", e.target.value)
                  }
                />
                {errors.admission_date && (
                  <div className="invalid-feedback">
                    {errors.admission_date}
                  </div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Admission Time *</label>
                <input
                  type="time"
                  className={`form-control ${
                    errors.admission_time ? "is-invalid" : ""
                  }`}
                  value={formData.admission_time}
                  onChange={(e) =>
                    handleInputChange("admission_time", e.target.value)
                  }
                />
                {errors.admission_time && (
                  <div className="invalid-feedback">
                    {errors.admission_time}
                  </div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Arresting Officer</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.arresting_officer || ""}
                  onChange={(e) =>
                    handleInputChange("arresting_officer", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Arresting Agency</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.arresting_agency || ""}
                  onChange={(e) =>
                    handleInputChange("arresting_agency", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Status *</label>
                <select
                  className={`form-select ${errors.status ? "is-invalid" : ""}`}
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="transferred">Transferred</option>
                  <option value="released">Released</option>
                  <option value="deceased">Deceased</option>
                </select>
                {errors.status && (
                  <div className="invalid-feedback">{errors.status}</div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Cell Assignment</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.cell_assignment || ""}
                  onChange={(e) =>
                    handleInputChange("cell_assignment", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="col-12">
              <div className="mb-3">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={formData.notes || ""}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Additional notes or observations..."
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">PDL Registration Form</h5>
      </div>
      <div className="card-body">
        {/* Step Indicator */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={`text-center ${
                    currentStep >= step.number ? "text-primary" : "text-muted"
                  }`}
                  style={{ flex: 1 }}
                >
                  <div
                    className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-2 ${
                      currentStep >= step.number
                        ? "bg-primary text-white"
                        : "bg-light text-muted"
                    }`}
                    style={{ width: "40px", height: "40px" }}
                  >
                    <i className={step.icon}></i>
                  </div>
                  <div className="small">{step.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="d-flex justify-content-between mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <i className="bi bi-arrow-left me-1"></i>Previous
            </button>

            {currentStep < steps.length ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={nextStep}
              >
                Next<i className="bi bi-arrow-right ms-1"></i>
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Registering...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-1"></i>Register PDL
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PDLRegistrationForm;
