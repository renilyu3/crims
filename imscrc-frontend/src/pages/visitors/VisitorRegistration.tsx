import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { visitorApi } from "../../services/visitorApi";
import type { VisitorFormData } from "../../types/visitor";

const VisitorRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<VisitorFormData>({
    first_name: "",
    middle_name: "",
    last_name: "",
    id_type: "National ID",
    id_number: "",
    date_of_birth: "",
    gender: "male",
    address: {
      street: "",
      barangay: "",
      city: "",
      province: "",
      postal_code: "",
    },
    contact_information: {
      phone: "",
      email: "",
    },
    emergency_contact: {
      name: "",
      phone: "",
      relationship: "",
    },
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof VisitorFormData] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: [],
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string[]> = {};

    // Required fields validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = ["First name is required"];
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = ["Last name is required"];
    }

    if (!formData.id_number.trim()) {
      newErrors.id_number = ["ID number is required"];
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = ["Date of birth is required"];
    } else {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      if (birthDate >= today) {
        newErrors.date_of_birth = ["Date of birth must be in the past"];
      }
    }

    if (!formData.address.street.trim()) {
      newErrors["address.street"] = ["Street address is required"];
    }

    if (!formData.address.city.trim()) {
      newErrors["address.city"] = ["City is required"];
    }

    if (!formData.address.province.trim()) {
      newErrors["address.province"] = ["Province is required"];
    }

    if (!formData.contact_information.phone.trim()) {
      newErrors["contact_information.phone"] = ["Phone number is required"];
    }

    // Email validation (if provided)
    if (
      formData.contact_information.email &&
      formData.contact_information.email.trim()
    ) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contact_information.email)) {
        newErrors["contact_information.email"] = [
          "Please enter a valid email address",
        ];
      }
    }

    // Emergency contact validation (if any field is filled, all are required)
    const hasEmergencyContact =
      formData.emergency_contact?.name ||
      formData.emergency_contact?.phone ||
      formData.emergency_contact?.relationship;

    if (hasEmergencyContact) {
      if (!formData.emergency_contact?.name?.trim()) {
        newErrors["emergency_contact.name"] = [
          "Emergency contact name is required",
        ];
      }
      if (!formData.emergency_contact?.phone?.trim()) {
        newErrors["emergency_contact.phone"] = [
          "Emergency contact phone is required",
        ];
      }
      if (!formData.emergency_contact?.relationship?.trim()) {
        newErrors["emergency_contact.relationship"] = [
          "Emergency contact relationship is required",
        ];
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please correct the errors below");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await visitorApi.createVisitor(formData);

      if (response.success) {
        setSuccess("Visitor registered successfully!");
        setTimeout(() => {
          navigate("/visitors/list");
        }, 2000);
      } else {
        setError("Failed to register visitor");
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
        setError("Please correct the validation errors");
      } else {
        setError(
          err.response?.data?.message ||
            "An error occurred while registering the visitor"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName: string): string | null => {
    return errors[fieldName]?.[0] || null;
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 fw-bold text-dark mb-1">
                Register New Visitor
              </h1>
              <p className="text-muted mb-0">Add a new visitor to the system</p>
            </div>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate("/visitors")}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {success && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-check-circle me-2"></i>
          {success}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess(null)}
          ></button>
        </div>
      )}

      {/* Registration Form */}
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div className="mb-4">
                  <h5 className="fw-bold mb-3">
                    <i className="bi bi-person me-2 text-primary"></i>
                    Personal Information
                  </h5>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <label htmlFor="first_name" className="form-label">
                        First Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          getFieldError("first_name") ? "is-invalid" : ""
                        }`}
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        required
                      />
                      {getFieldError("first_name") && (
                        <div className="invalid-feedback">
                          {getFieldError("first_name")}
                        </div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="middle_name" className="form-label">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="middle_name"
                        name="middle_name"
                        value={formData.middle_name}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="last_name" className="form-label">
                        Last Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          getFieldError("last_name") ? "is-invalid" : ""
                        }`}
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        required
                      />
                      {getFieldError("last_name") && (
                        <div className="invalid-feedback">
                          {getFieldError("last_name")}
                        </div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="id_type" className="form-label">
                        ID Type
                      </label>
                      <select
                        className="form-select"
                        id="id_type"
                        name="id_type"
                        value={formData.id_type}
                        onChange={handleInputChange}
                      >
                        <option value="National ID">National ID</option>
                        <option value="Driver's License">
                          Driver's License
                        </option>
                        <option value="Passport">Passport</option>
                        <option value="Senior Citizen ID">
                          Senior Citizen ID
                        </option>
                        <option value="PWD ID">PWD ID</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="id_number" className="form-label">
                        ID Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          getFieldError("id_number") ? "is-invalid" : ""
                        }`}
                        id="id_number"
                        name="id_number"
                        value={formData.id_number}
                        onChange={handleInputChange}
                        required
                      />
                      {getFieldError("id_number") && (
                        <div className="invalid-feedback">
                          {getFieldError("id_number")}
                        </div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="gender" className="form-label">
                        Gender
                      </label>
                      <select
                        className="form-select"
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="date_of_birth" className="form-label">
                        Date of Birth <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className={`form-control ${
                          getFieldError("date_of_birth") ? "is-invalid" : ""
                        }`}
                        id="date_of_birth"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                        max={new Date().toISOString().split("T")[0]}
                        required
                      />
                      {getFieldError("date_of_birth") && (
                        <div className="invalid-feedback">
                          {getFieldError("date_of_birth")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="mb-4">
                  <h5 className="fw-bold mb-3">
                    <i className="bi bi-geo-alt me-2 text-primary"></i>
                    Address Information
                  </h5>

                  <div className="row g-3">
                    <div className="col-md-8">
                      <label htmlFor="address.street" className="form-label">
                        Street Address <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          getFieldError("address.street") ? "is-invalid" : ""
                        }`}
                        id="address.street"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleInputChange}
                        placeholder="House/Unit Number, Street Name"
                        required
                      />
                      {getFieldError("address.street") && (
                        <div className="invalid-feedback">
                          {getFieldError("address.street")}
                        </div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="address.barangay" className="form-label">
                        Barangay
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="address.barangay"
                        name="address.barangay"
                        value={formData.address.barangay}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="address.city" className="form-label">
                        City <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          getFieldError("address.city") ? "is-invalid" : ""
                        }`}
                        id="address.city"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        required
                      />
                      {getFieldError("address.city") && (
                        <div className="invalid-feedback">
                          {getFieldError("address.city")}
                        </div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="address.province" className="form-label">
                        Province <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          getFieldError("address.province") ? "is-invalid" : ""
                        }`}
                        id="address.province"
                        name="address.province"
                        value={formData.address.province}
                        onChange={handleInputChange}
                        required
                      />
                      {getFieldError("address.province") && (
                        <div className="invalid-feedback">
                          {getFieldError("address.province")}
                        </div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label
                        htmlFor="address.postal_code"
                        className="form-label"
                      >
                        Postal Code
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="address.postal_code"
                        name="address.postal_code"
                        value={formData.address.postal_code}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mb-4">
                  <h5 className="fw-bold mb-3">
                    <i className="bi bi-telephone me-2 text-primary"></i>
                    Contact Information
                  </h5>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label
                        htmlFor="contact_information.phone"
                        className="form-label"
                      >
                        Phone Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        className={`form-control ${
                          getFieldError("contact_information.phone")
                            ? "is-invalid"
                            : ""
                        }`}
                        id="contact_information.phone"
                        name="contact_information.phone"
                        value={formData.contact_information.phone}
                        onChange={handleInputChange}
                        placeholder="+63 917 123 4567"
                        required
                      />
                      {getFieldError("contact_information.phone") && (
                        <div className="invalid-feedback">
                          {getFieldError("contact_information.phone")}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label
                        htmlFor="contact_information.email"
                        className="form-label"
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        className={`form-control ${
                          getFieldError("contact_information.email")
                            ? "is-invalid"
                            : ""
                        }`}
                        id="contact_information.email"
                        name="contact_information.email"
                        value={formData.contact_information.email}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                      />
                      {getFieldError("contact_information.email") && (
                        <div className="invalid-feedback">
                          {getFieldError("contact_information.email")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="mb-4">
                  <h5 className="fw-bold mb-3">
                    <i className="bi bi-person-exclamation me-2 text-primary"></i>
                    Emergency Contact{" "}
                    <small className="text-muted">(Optional)</small>
                  </h5>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <label
                        htmlFor="emergency_contact.name"
                        className="form-label"
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          getFieldError("emergency_contact.name")
                            ? "is-invalid"
                            : ""
                        }`}
                        id="emergency_contact.name"
                        name="emergency_contact.name"
                        value={formData.emergency_contact?.name || ""}
                        onChange={handleInputChange}
                      />
                      {getFieldError("emergency_contact.name") && (
                        <div className="invalid-feedback">
                          {getFieldError("emergency_contact.name")}
                        </div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label
                        htmlFor="emergency_contact.phone"
                        className="form-label"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className={`form-control ${
                          getFieldError("emergency_contact.phone")
                            ? "is-invalid"
                            : ""
                        }`}
                        id="emergency_contact.phone"
                        name="emergency_contact.phone"
                        value={formData.emergency_contact?.phone || ""}
                        onChange={handleInputChange}
                      />
                      {getFieldError("emergency_contact.phone") && (
                        <div className="invalid-feedback">
                          {getFieldError("emergency_contact.phone")}
                        </div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label
                        htmlFor="emergency_contact.relationship"
                        className="form-label"
                      >
                        Relationship
                      </label>
                      <select
                        className={`form-select ${
                          getFieldError("emergency_contact.relationship")
                            ? "is-invalid"
                            : ""
                        }`}
                        id="emergency_contact.relationship"
                        name="emergency_contact.relationship"
                        value={formData.emergency_contact?.relationship || ""}
                        onChange={handleInputChange}
                      >
                        <option value="">Select relationship</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Parent">Parent</option>
                        <option value="Child">Child</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Relative">Relative</option>
                        <option value="Friend">Friend</option>
                        <option value="Other">Other</option>
                      </select>
                      {getFieldError("emergency_contact.relationship") && (
                        <div className="invalid-feedback">
                          {getFieldError("emergency_contact.relationship")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="mb-4">
                  <h5 className="fw-bold mb-3">
                    <i className="bi bi-journal-text me-2 text-primary"></i>
                    Additional Notes
                  </h5>

                  <div className="row">
                    <div className="col-12">
                      <label htmlFor="notes" className="form-label">
                        Notes
                      </label>
                      <textarea
                        className="form-control"
                        id="notes"
                        name="notes"
                        rows={3}
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Any additional information about the visitor..."
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/visitors")}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
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
                        <i className="bi bi-person-plus me-2"></i>
                        Register Visitor
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorRegistration;
