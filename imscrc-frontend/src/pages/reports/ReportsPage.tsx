import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { reportApi } from "../../services/reportApi";
import type {
  Report,
  ReportGeneration,
  ReportStatistics,
} from "../../types/report";

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [recentGenerations, setRecentGenerations] = useState<
    ReportGeneration[]
  >([]);
  const [statistics, setStatistics] = useState<ReportStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportsRes, generationsRes, statsRes] = await Promise.all([
        reportApi.getReports({ search: searchTerm, type: selectedType }),
        reportApi.getRecentGenerations(),
        reportApi.getStatistics(),
      ]);

      if (reportsRes.success) {
        setReports(reportsRes.data.data);
      }

      if (generationsRes.success) {
        setRecentGenerations(generationsRes.data);
      }

      if (statsRes.success) {
        setStatistics(statsRes.data);
      }
    } catch (error) {
      console.error("Error loading reports data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadData();
  };

  const handleQuickGenerate = async (type: "pdl_status" | "statistics") => {
    try {
      let result;
      if (type === "pdl_status") {
        result = await reportApi.generatePDLStatusReport({});
      } else {
        result = await reportApi.exportStatisticsToExcel({});
      }

      if (result.success) {
        alert(
          "Report generation started! Check the generations list for progress."
        );
        loadData(); // Refresh data
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    }
  };

  const handleDownload = async (generation: ReportGeneration) => {
    try {
      const blob = await reportApi.downloadGeneration(generation.id);
      reportApi.downloadFile(
        blob,
        generation.file_name ||
          `report_${generation.id}.${generation.file_type}`
      );
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Statistics Cards */}
      {statistics && (
        <div className="row g-4 mb-4">
          <div className="col-sm-6 col-lg-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div
                    className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "48px", height: "48px" }}
                  >
                    <i className="bi bi-file-earmark-text text-white fs-4"></i>
                  </div>
                  <div>
                    <h6 className="card-subtitle mb-1 text-muted">
                      Total Reports
                    </h6>
                    <h4 className="card-title mb-0">
                      {statistics.total_reports}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div
                    className="bg-success rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "48px", height: "48px" }}
                  >
                    <i className="bi bi-check-circle text-white fs-4"></i>
                  </div>
                  <div>
                    <h6 className="card-subtitle mb-1 text-muted">Completed</h6>
                    <h4 className="card-title mb-0">
                      {statistics.completed_generations}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div
                    className="bg-warning rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "48px", height: "48px" }}
                  >
                    <i className="bi bi-clock text-white fs-4"></i>
                  </div>
                  <div>
                    <h6 className="card-subtitle mb-1 text-muted">
                      Recent (7 days)
                    </h6>
                    <h4 className="card-title mb-0">
                      {statistics.recent_generations}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div
                    className="bg-info rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: "48px", height: "48px" }}
                  >
                    <i className="bi bi-person-check text-white fs-4"></i>
                  </div>
                  <div>
                    <h6 className="card-subtitle mb-1 text-muted">
                      My Reports
                    </h6>
                    <h4 className="card-title mb-0">{statistics.my_reports}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* Quick Actions */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => handleQuickGenerate("pdl_status")}
                >
                  <i className="bi bi-file-earmark-pdf me-2"></i>
                  Generate PDL Status Report
                </button>
                <button
                  className="btn btn-outline-success"
                  onClick={() => handleQuickGenerate("statistics")}
                >
                  <i className="bi bi-file-earmark-spreadsheet me-2"></i>
                  Export Statistics to Excel
                </button>
                <Link to="/reports/generate" className="btn btn-outline-info">
                  <i className="bi bi-gear me-2"></i>
                  Custom Report Generator
                </Link>
                <Link
                  to="/reports/generations"
                  className="btn btn-outline-secondary"
                >
                  <i className="bi bi-clock-history me-2"></i>
                  View All Generations
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Generations */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Recent Report Generations</h5>
              <Link
                to="/reports/generations"
                className="btn btn-sm btn-outline-primary"
              >
                View All
              </Link>
            </div>
            <div className="card-body">
              {recentGenerations.length === 0 ? (
                <p className="text-muted text-center py-4 mb-0">
                  No recent report generations
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Report Name</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Generated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentGenerations.slice(0, 5).map((generation) => (
                        <tr key={generation.id}>
                          <td>
                            <div className="fw-medium">
                              {generation.report_name}
                            </div>
                            {generation.file_size && (
                              <small className="text-muted">
                                {reportApi.formatFileSize(generation.file_size)}
                              </small>
                            )}
                          </td>
                          <td>
                            <span className="badge bg-light text-dark">
                              {generation.file_type.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${reportApi.getStatusBadgeClass(
                                generation.status
                              )}`}
                            >
                              <i
                                className={`bi ${reportApi.getStatusIcon(
                                  generation.status
                                )} me-1`}
                              ></i>
                              {generation.status}
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(
                                generation.created_at
                              ).toLocaleDateString()}
                            </small>
                          </td>
                          <td>
                            {generation.status === "completed" && (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleDownload(generation)}
                              >
                                <i className="bi bi-download"></i>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Templates */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <div className="row align-items-center">
                <div className="col">
                  <h5 className="card-title mb-0">Report Templates</h5>
                </div>
                <div className="col-auto">
                  <div className="d-flex gap-2">
                    <div className="input-group" style={{ width: "300px" }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        onClick={handleSearch}
                      >
                        <i className="bi bi-search"></i>
                      </button>
                    </div>
                    <select
                      className="form-select"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      style={{ width: "150px" }}
                    >
                      <option value="">All Types</option>
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="dashboard">Dashboard</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body">
              {reports.length === 0 ? (
                <div className="text-center py-5">
                  <i
                    className="bi bi-file-earmark-text text-muted"
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <h5 className="text-muted mt-3">No Report Templates Found</h5>
                  <p className="text-muted">
                    Create your first report template to get started.
                  </p>
                  <Link to="/reports/builder" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>
                    Create Report Template
                  </Link>
                </div>
              ) : (
                <div className="row g-3">
                  {reports.map((report) => (
                    <div key={report.id} className="col-md-6 col-lg-4">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="card-title mb-0">{report.name}</h6>
                            <span
                              className={`badge ${
                                report.type === "pdf"
                                  ? "bg-danger"
                                  : report.type === "excel"
                                  ? "bg-success"
                                  : "bg-info"
                              }`}
                            >
                              {report.type.toUpperCase()}
                            </span>
                          </div>
                          <p className="card-text text-muted small">
                            {report.description || "No description available"}
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              {report.is_public ? (
                                <>
                                  <i className="bi bi-globe me-1"></i>Public
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-lock me-1"></i>Private
                                </>
                              )}
                            </small>
                            <div className="btn-group btn-group-sm">
                              <Link
                                to={`/reports/${report.id}`}
                                className="btn btn-outline-primary"
                              >
                                <i className="bi bi-eye"></i>
                              </Link>
                              <Link
                                to={`/reports/${report.id}/edit`}
                                className="btn btn-outline-secondary"
                              >
                                <i className="bi bi-pencil"></i>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
