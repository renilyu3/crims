import React from "react";
import type { PDL } from "../types/pdl";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pdl: PDL | null;
  isLoading: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  pdl,
  isLoading,
}) => {
  if (!isOpen || !pdl) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        className="modal fade show d-block"
        style={{ zIndex: 1050 }}
        tabIndex={-1}
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Confirm Deletion
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                disabled={isLoading}
              ></button>
            </div>

            <div className="modal-body">
              <div className="alert alert-warning">
                <i className="bi bi-warning me-2"></i>
                <strong>Warning:</strong> This action cannot be undone. The PDL
                record will be permanently deleted from the system.
              </div>

              <div className="row">
                <div className="col-12">
                  <h6 className="fw-bold text-danger mb-3">
                    PDL Information to be Deleted:
                  </h6>

                  <div className="card">
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="d-flex align-items-center mb-2">
                            <div
                              className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                              style={{ width: "48px", height: "48px" }}
                            >
                              <span className="text-white fw-bold">
                                {(pdl.first_name || "P").charAt(0)}
                                {(pdl.last_name || "D").charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="fw-bold">
                                {pdl.full_name ||
                                  `${pdl.first_name || ""} ${
                                    pdl.last_name || ""
                                  }`.trim() ||
                                  "Unknown"}
                              </div>
                              <small className="text-muted">
                                Age: {pdl.age || "N/A"}
                              </small>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <p className="mb-1">
                            <strong>PDL Number:</strong>
                            <span className="text-primary ms-1">
                              {pdl.pdl_number || "N/A"}
                            </span>
                          </p>
                          <p className="mb-1">
                            <strong>Case Number:</strong>
                            <span className="ms-1">
                              {pdl.case_number || "N/A"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <hr className="my-3" />

                      <div className="row g-3">
                        <div className="col-md-6">
                          <p className="mb-1">
                            <strong>Legal Status:</strong>
                            <span className={`badge bg-warning ms-2`}>
                              {pdl.legal_status || "N/A"}
                            </span>
                          </p>
                          <p className="mb-1">
                            <strong>Current Status:</strong>
                            <span className={`badge bg-success ms-2`}>
                              {pdl.status || "N/A"}
                            </span>
                          </p>
                        </div>
                        <div className="col-md-6">
                          <p className="mb-1">
                            <strong>Admission Date:</strong>
                            <span className="ms-1">
                              {pdl.admission_date
                                ? new Date(
                                    pdl.admission_date
                                  ).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </p>
                          <p className="mb-1">
                            <strong>Gender:</strong>
                            <span className="ms-1 text-capitalize">
                              {pdl.gender || "N/A"}
                            </span>
                          </p>
                        </div>
                      </div>

                      {pdl.charges &&
                        Array.isArray(pdl.charges) &&
                        pdl.charges.length > 0 && (
                          <>
                            <hr className="my-3" />
                            <div>
                              <strong>Charges:</strong>
                              <ul className="list-unstyled mt-2 mb-0">
                                {pdl.charges
                                  .slice(0, 3)
                                  .map((charge, index) => (
                                    <li key={index} className="text-muted">
                                      <i className="bi bi-dot me-1"></i>
                                      {charge}
                                    </li>
                                  ))}
                                {pdl.charges.length > 3 && (
                                  <li className="text-muted">
                                    <i className="bi bi-dot me-1"></i>
                                    ... and {pdl.charges.length - 3} more
                                  </li>
                                )}
                              </ul>
                            </div>
                          </>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-muted mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Please type <strong>"DELETE"</strong> to confirm this action:
                </p>
                <input
                  type="text"
                  className="form-control mt-2"
                  placeholder="Type DELETE to confirm"
                  id="deleteConfirmInput"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                <i className="bi bi-x-circle me-1"></i>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  const input = document.getElementById(
                    "deleteConfirmInput"
                  ) as HTMLInputElement;
                  if (input && input.value === "DELETE") {
                    onConfirm();
                  } else {
                    alert('Please type "DELETE" to confirm deletion');
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash me-1"></i>
                    Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteConfirmationModal;
