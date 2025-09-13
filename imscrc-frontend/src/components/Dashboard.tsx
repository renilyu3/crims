import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { activityTracker } from "../utils/activityTracker";
import { visitorCheckinApi } from "../services/visitorCheckinApi";
import { pdlApi } from "../services/pdlApi";
import "../styles/dashboard.css";

interface Activity {
  id: number;
  activity: string;
  description: string;
  time: string;
  timestamp: number;
  status: string;
  icon: string;
  user: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeVisitsCount, setActiveVisitsCount] = useState(0);
  const [todayVisitsCount, setTodayVisitsCount] = useState(0);
  const [totalPDLs, setTotalPDLs] = useState(0);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Load real-time data from API and localStorage fallback
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Try to load visitor statistics from API
        const response = await visitorCheckinApi.getStatistics();
        if (response.success) {
          setActiveVisitsCount(response.data.active_visitors);
          setTodayVisitsCount(response.data.today_checkins);
        } else {
          // Fallback to localStorage
          loadLocalStorageData();
        }
      } catch (error) {
        console.error("Error loading API statistics:", error);
        // Fallback to localStorage
        loadLocalStorageData();
      }

      // Try to load PDL count from API
      try {
        const pdlResponse = await pdlApi.getStatistics();
        if (pdlResponse.success && pdlResponse.data.total_pdls !== undefined) {
          setTotalPDLs(pdlResponse.data.total_pdls);
        } else {
          // Try alternative method - get first page to get total count
          const pdlListResponse = await pdlApi.getAll({ per_page: 1 });
          if (
            pdlListResponse.success &&
            pdlListResponse.data.total !== undefined
          ) {
            setTotalPDLs(pdlListResponse.data.total);
          } else {
            // Fallback to localStorage
            const pdls = JSON.parse(localStorage.getItem("pdls") || "[]");
            setTotalPDLs(pdls.length);
          }
        }
      } catch (error) {
        console.error("Error loading PDL count from API:", error);
        // Fallback to localStorage
        const pdls = JSON.parse(localStorage.getItem("pdls") || "[]");
        setTotalPDLs(pdls.length);
      }

      // Load recent activities from localStorage
      loadRecentActivities();
    };

    const loadLocalStorageData = () => {
      // Active visits from localStorage
      const activeVisits = JSON.parse(
        localStorage.getItem("activeVisits") || "[]"
      );
      setActiveVisitsCount(activeVisits.length);

      // Today's visits from history
      const visitHistory = JSON.parse(
        localStorage.getItem("visitHistory") || "[]"
      );
      const today = new Date().toDateString();
      const todayVisits = visitHistory.filter(
        (visit: any) => new Date(visit.time_in).toDateString() === today
      );
      setTodayVisitsCount(todayVisits.length + activeVisits.length);
    };

    loadDashboardData();

    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadRecentActivities = () => {
    try {
      // Get activities from ActivityTracker
      const activities = activityTracker.getRecentActivities(10);
      setRecentActivities(activities);
    } catch (error) {
      console.error("Error loading recent activities:", error);
      setRecentActivities([]);
    }
  };

  const addActivity = (activity: Omit<Activity, "id" | "timestamp">) => {
    const newActivity: Activity = {
      ...activity,
      id: Date.now(),
      timestamp: Date.now(),
    };

    // Get existing activities
    const existingActivities = JSON.parse(
      localStorage.getItem("recentActivities") || "[]"
    );

    // Add new activity to the beginning
    const updatedActivities = [newActivity, ...existingActivities].slice(0, 50); // Keep only last 50 activities

    // Save to localStorage
    localStorage.setItem("recentActivities", JSON.stringify(updatedActivities));

    // Update state
    setRecentActivities(updatedActivities.slice(0, 10));
  };

  // Function to get relative time
  const getRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  // Listen for activity updates from ActivityTracker
  useEffect(() => {
    const handleActivitiesUpdated = (event: CustomEvent) => {
      const { activities } = event.detail;
      setRecentActivities(activities.slice(0, 10));
    };

    // Add event listener for activity updates
    window.addEventListener(
      "activitiesUpdated",
      handleActivitiesUpdated as EventListener
    );

    return () => {
      window.removeEventListener(
        "activitiesUpdated",
        handleActivitiesUpdated as EventListener
      );
    };
  }, []);

  const stats = [
    {
      name: "Total PDLs",
      value: totalPDLs.toString(),
      icon: "bi-people",
      color: "primary",
      link: "/pdls",
      trend: "+2 this week",
    },
    {
      name: "Active Visits",
      value: activeVisitsCount.toString(),
      icon: "bi-person-check",
      color: "success",
      link: "/visitors",
      trend: "Live count",
    },
    {
      name: "Today's Visits",
      value: todayVisitsCount.toString(),
      icon: "bi-calendar-day",
      color: "info",
      link: "/visits/history",
      trend: "Since midnight",
    },
    {
      name: "Reports Generated",
      value: "12",
      icon: "bi-file-earmark-text",
      color: "warning",
      link: "/reports",
      trend: "+3 this month",
    },
  ];

  const quickActions = [
    {
      title: "Register New PDL",
      description: "Add new person deprived of liberty",
      icon: "bi-person-plus",
      color: "primary",
      link: "/pdls/register",
    },
    {
      title: "Visitor Check-in",
      description: "Quick visitor time-in process",
      icon: "bi-box-arrow-in-right",
      color: "success",
      link: "/visitors",
    },
    {
      title: "Schedule Activity",
      description: "Court hearings, visits, programs",
      icon: "bi-calendar-plus",
      color: "info",
      link: "/scheduling",
    },
    {
      title: "Generate Report",
      description: "PDL status, visits, activities",
      icon: "bi-file-text",
      color: "warning",
      link: "/reports",
    },
    {
      title: "Manage PDLs",
      description: "View and edit PDL records",
      icon: "bi-people",
      color: "secondary",
      link: "/pdls",
    },
    {
      title: "Visit History",
      description: "View completed visits",
      icon: "bi-clock-history",
      color: "dark",
      link: "/visits/history",
    },
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container-fluid">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div>
            <h1 className="h2 fw-bold text-dark mb-1">
              Welcome back, {user?.name || "User"}
            </h1>
            <p className="text-muted mb-0">
              {user?.role || "Staff"} • Capiz Rehabilitation Center
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="row g-4 mb-4">
        {stats.map((stat) => (
          <div key={stat.name} className="col-sm-6 col-xl-3">
            <Link to={stat.link} className="text-decoration-none">
              <div className="card h-100 border-0 shadow-sm hover-card">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-2">
                        <div
                          className={`bg-${stat.color} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3`}
                          style={{ width: "48px", height: "48px" }}
                        >
                          <i
                            className={`bi ${stat.icon} text-${stat.color} fs-4`}
                          ></i>
                        </div>
                        <div>
                          <h6 className="card-subtitle mb-0 text-muted small">
                            {stat.name}
                          </h6>
                        </div>
                      </div>
                      <div className="d-flex align-items-end justify-content-between">
                        <h3 className="card-title mb-0 fw-bold text-dark">
                          {stat.value}
                        </h3>
                        <small className={`text-${stat.color} fw-medium`}>
                          {stat.trend}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Enhanced Recent Activities */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">
                  <i className="bi bi-activity me-2 text-primary"></i>
                  Recent Activities
                </h5>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={loadRecentActivities}
                  title="Refresh Activities"
                >
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
              </div>
            </div>
            <div className="card-body p-0">
              {recentActivities.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-activity fs-1 text-muted mb-3"></i>
                  <p className="text-muted mb-0">No recent activities</p>
                  <small className="text-muted">
                    Activities will appear here when you perform actions in the
                    system
                  </small>
                </div>
              ) : (
                <div className="list-group list-group-flush activity-list">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="list-group-item border-0 py-3 activity-item"
                    >
                      <div className="d-flex align-items-start">
                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
                            activity.status === "completed"
                              ? "bg-success bg-opacity-10"
                              : activity.status === "active"
                              ? "bg-primary bg-opacity-10"
                              : activity.status === "scheduled"
                              ? "bg-warning bg-opacity-10"
                              : "bg-secondary bg-opacity-10"
                          }`}
                          style={{ width: "40px", height: "40px" }}
                        >
                          <i
                            className={`bi ${activity.icon} ${
                              activity.status === "completed"
                                ? "text-success"
                                : activity.status === "active"
                                ? "text-primary"
                                : activity.status === "scheduled"
                                ? "text-warning"
                                : "text-secondary"
                            }`}
                          ></i>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="mb-1 fw-medium">
                                {activity.activity}
                              </h6>
                              <p className="mb-1 text-muted small">
                                {activity.description}
                              </p>
                              <div className="d-flex align-items-center">
                                <small className="text-muted me-3">
                                  <i className="bi bi-clock me-1"></i>
                                  {getRelativeTime(activity.timestamp)}
                                </small>
                                <small className="text-muted">
                                  <i className="bi bi-person me-1"></i>
                                  {activity.user}
                                </small>
                              </div>
                            </div>
                            <span
                              className={`badge ${
                                activity.status === "completed"
                                  ? "bg-success"
                                  : activity.status === "active"
                                  ? "bg-primary"
                                  : activity.status === "scheduled"
                                  ? "bg-warning"
                                  : "bg-secondary"
                              }`}
                            >
                              {activity.status}
                            </span>
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

        {/* Enhanced Quick Actions */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="card-title mb-0">
                <i className="bi bi-lightning me-2 text-warning"></i>
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-2">
                {quickActions.map((action, index) => (
                  <div key={index} className="col-6">
                    <Link to={action.link} className="text-decoration-none">
                      <div
                        className={`card border-0 bg-${action.color} bg-opacity-10 hover-card h-100 quick-action-card`}
                      >
                        <div className="card-body text-center p-3">
                          <i
                            className={`bi ${action.icon} fs-2 text-${action.color} mb-2`}
                          ></i>
                          <h6 className="card-title mb-1 small fw-bold">
                            {action.title}
                          </h6>
                          <p
                            className="card-text text-muted small mb-0"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="card border-0 shadow-sm mt-4">
            <div className="card-header bg-white border-bottom">
              <h5 className="card-title mb-0">
                <i className="bi bi-shield-check me-2 text-success"></i>
                System Status
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">Database</span>
                <span className="badge bg-success">
                  <span className="status-indicator status-online me-1"></span>
                  Online
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">API Services</span>
                <span className="badge bg-success">
                  <span className="status-indicator status-online me-1"></span>
                  Operational
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">Backup Status</span>
                <span className="badge bg-warning">
                  <span className="status-indicator status-warning me-1"></span>
                  Scheduled
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Last Update</span>
                <small className="text-muted">2 hours ago</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
