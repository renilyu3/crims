import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { scheduleApi } from "../../services/scheduleApi";
import type {
  Schedule,
  ScheduleConflict,
  CalendarEvent,
} from "../../types/schedule";

const SchedulingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState<Schedule[]>([]);
  const [unresolvedConflicts, setUnresolvedConflicts] = useState<
    ScheduleConflict[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [todayResponse, upcomingResponse, conflictsResponse] =
        await Promise.all([
          scheduleApi.getTodaySchedules(),
          scheduleApi.getUpcomingSchedules(5),
          scheduleApi.getUnresolvedConflicts(),
        ]);

      if (todayResponse.success) {
        setTodaySchedules(todayResponse.data);
      }

      if (upcomingResponse.success) {
        setUpcomingSchedules(upcomingResponse.data);
      }

      if (conflictsResponse.success) {
        setUnresolvedConflicts(conflictsResponse.data);
      }
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-secondary";
      case "confirmed":
        return "bg-primary";
      case "completed":
        return "bg-success";
      case "cancelled":
        return "bg-danger";
      case "rescheduled":
        return "bg-warning";
      default:
        return "bg-secondary";
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-success";
      case "medium":
        return "bg-warning";
      case "high":
        return "bg-danger";
      case "critical":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString();
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
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 fw-bold text-dark mb-1">
                Scheduling Dashboard
              </h1>
              <p className="text-muted mb-0">
                Manage court appearances, visits, and rehabilitation programs
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary"
                onClick={() => navigate("/scheduling/calendar")}
              >
                <i className="bi bi-calendar3 me-2"></i>
                Calendar View
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/scheduling/create")}
              >
                <i className="bi bi-plus-lg me-2"></i>
                New Schedule
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div
                  className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{ width: "48px", height: "48px" }}
                >
                  <i className="bi bi-calendar-event text-white fs-4"></i>
                </div>
                <div>
                  <h6 className="card-subtitle mb-1 text-muted">
                    Today's Schedules
                  </h6>
                  <h4 className="card-title mb-0">{todaySchedules.length}</h4>
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
                  <i className="bi bi-clock text-white fs-4"></i>
                </div>
                <div>
                  <h6 className="card-subtitle mb-1 text-muted">Upcoming</h6>
                  <h4 className="card-title mb-0">
                    {upcomingSchedules.length}
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
                  <i className="bi bi-exclamation-triangle text-white fs-4"></i>
                </div>
                <div>
                  <h6 className="card-subtitle mb-1 text-muted">Conflicts</h6>
                  <h4 className="card-title mb-0">
                    {unresolvedConflicts.length}
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
                  <i className="bi bi-building text-white fs-4"></i>
                </div>
                <div>
                  <h6 className="card-subtitle mb-1 text-muted">Facilities</h6>
                  <h4 className="card-title mb-0">
                    <button
                      className="btn btn-link p-0 text-decoration-none"
                      onClick={() => navigate("/scheduling/facilities")}
                    >
                      Manage
                    </button>
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Today's Schedules */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Today's Schedules</h5>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => navigate("/scheduling/list")}
              >
                View All
              </button>
            </div>
            <div className="card-body">
              {todaySchedules.length === 0 ? (
                <p className="text-muted text-center py-4 mb-0">
                  No schedules for today
                </p>
              ) : (
                <div className="list-group list-group-flush">
                  {todaySchedules.slice(0, 5).map((schedule) => (
                    <div key={schedule.id} className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-1">
                            <span
                              className="badge me-2"
                              style={{
                                backgroundColor: schedule.schedule_type?.color,
                              }}
                            >
                              {schedule.schedule_type?.display_name}
                            </span>
                            <span
                              className={`badge ${getStatusBadgeClass(
                                schedule.status
                              )}`}
                            >
                              {schedule.status}
                            </span>
                          </div>
                          <h6 className="mb-1">{schedule.title}</h6>
                          <p className="mb-1 text-muted">
                            <i className="bi bi-person me-1"></i>
                            {schedule.pdl?.first_name} {schedule.pdl?.last_name}
                          </p>
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            {formatTime(schedule.start_datetime)} -{" "}
                            {formatTime(schedule.end_datetime)}
                          </small>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => navigate(`/scheduling/${schedule.id}`)}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Unresolved Conflicts */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Unresolved Conflicts</h5>
              <button
                className="btn btn-sm btn-outline-warning"
                onClick={() => navigate("/scheduling/conflicts")}
              >
                View All
              </button>
            </div>
            <div className="card-body">
              {unresolvedConflicts.length === 0 ? (
                <p className="text-muted text-center py-4 mb-0">
                  No unresolved conflicts
                </p>
              ) : (
                <div className="list-group list-group-flush">
                  {unresolvedConflicts.slice(0, 5).map((conflict) => (
                    <div key={conflict.id} className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-1">
                            <span
                              className={`badge ${getSeverityBadgeClass(
                                conflict.severity
                              )} me-2`}
                            >
                              {conflict.severity}
                            </span>
                            <small className="text-muted">
                              {conflict.conflict_type_display ||
                                conflict.conflict_type}
                            </small>
                          </div>
                          <p className="mb-1">{conflict.description}</p>
                          <small className="text-muted">
                            {formatDate(conflict.created_at)}
                          </small>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() =>
                            navigate(`/scheduling/conflicts/${conflict.id}`)
                          }
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={() => navigate("/scheduling/court")}
                  >
                    <i className="bi bi-building me-2"></i>
                    Court Scheduling
                  </button>
                </div>
                <div className="col-md-3">
                  <button
                    className="btn btn-outline-success w-100"
                    onClick={() => navigate("/scheduling/visits")}
                  >
                    <i className="bi bi-people me-2"></i>
                    Family Visits
                  </button>
                </div>
                <div className="col-md-3">
                  <button
                    className="btn btn-outline-info w-100"
                    onClick={() => navigate("/scheduling/programs")}
                  >
                    <i className="bi bi-book me-2"></i>
                    Programs
                  </button>
                </div>
                <div className="col-md-3">
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={() => navigate("/scheduling/facilities")}
                  >
                    <i className="bi bi-building me-2"></i>
                    Facilities
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulingDashboard;
