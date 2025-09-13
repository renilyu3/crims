import React, { useEffect, useMemo, useState } from "react";
import { scheduleApi } from "../../services/scheduleApi";
import type { CalendarEvent } from "../../types/schedule";

type ViewMode = "month" | "week" | "day";

const startOfDayIso = (d: Date) => {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c.toISOString();
};

const endOfDayIso = (d: Date) => {
  const c = new Date(d);
  c.setHours(23, 59, 59, 999);
  return c.toISOString();
};

const addDays = (d: Date, days: number) => {
  const c = new Date(d);
  c.setDate(c.getDate() + days);
  return c;
};

const CalendarView: React.FC = () => {
  const [view, setView] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { startIso, endIso, title } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();

    if (view === "month") {
      const firstOfMonth = new Date(year, month, 1);
      const lastOfMonth = new Date(year, month + 1, 0);
      return {
        startIso: startOfDayIso(firstOfMonth),
        endIso: endOfDayIso(lastOfMonth),
        title: currentDate.toLocaleString(undefined, {
          month: "long",
          year: "numeric",
        }),
      };
    }
    if (view === "day") {
      return {
        startIso: startOfDayIso(currentDate),
        endIso: endOfDayIso(currentDate),
        title: currentDate.toLocaleDateString(),
      };
    }
    // week view
    const dayOfWeek = currentDate.getDay();
    const weekStart = addDays(currentDate, -dayOfWeek);
    const weekEnd = addDays(weekStart, 6);
    const startLabel = weekStart.toLocaleDateString();
    const endLabel = weekEnd.toLocaleDateString();
    return {
      startIso: startOfDayIso(weekStart),
      endIso: endOfDayIso(weekEnd),
      title: `${startLabel} - ${endLabel}`,
    };
  }, [currentDate, view]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await scheduleApi.getCalendarEvents(startIso, endIso);
        if (res.success) setEvents(res.data);
      } catch (e: any) {
        setError("Failed to load calendar events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [startIso, endIso]);

  const onPrev = () => {
    if (view === "month") setCurrentDate(addDays(currentDate, -30));
    else if (view === "week") setCurrentDate(addDays(currentDate, -7));
    else setCurrentDate(addDays(currentDate, -1));
  };
  const onNext = () => {
    if (view === "month") setCurrentDate(addDays(currentDate, 30));
    else if (view === "week") setCurrentDate(addDays(currentDate, 7));
    else setCurrentDate(addDays(currentDate, 1));
  };
  const onToday = () => setCurrentDate(new Date());

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 fw-bold text-dark mb-1">Calendar</h1>
              <p className="text-muted mb-0">
                View schedules by month, week, or day
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div className="btn-group me-2" role="group">
                <button className="btn btn-outline-secondary" onClick={onPrev}>
                  <i className="bi bi-chevron-left"></i>
                </button>
                <button className="btn btn-outline-secondary" onClick={onToday}>
                  Today
                </button>
                <button className="btn btn-outline-secondary" onClick={onNext}>
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
              <div className="btn-group" role="group">
                <button
                  className={`btn btn-${
                    view === "month" ? "primary" : "outline-primary"
                  }`}
                  onClick={() => setView("month")}
                >
                  Month
                </button>
                <button
                  className={`btn btn-${
                    view === "week" ? "primary" : "outline-primary"
                  }`}
                  onClick={() => setView("week")}
                >
                  Week
                </button>
                <button
                  className={`btn btn-${
                    view === "day" ? "primary" : "outline-primary"
                  }`}
                  onClick={() => setView("day")}
                >
                  Day
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-12 d-flex align-items-center justify-content-between">
          <h5 className="mb-0">{title}</h5>
          <span className="text-muted">{events.length} events</span>
        </div>
      </div>

      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "300px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      ) : (
        <div className="card">
          <div className="card-body p-0">
            {/* Simple list-based calendar for now */}
            {events.length === 0 ? (
              <p className="text-muted text-center py-4 mb-0">
                No events in this range
              </p>
            ) : (
              <div className="list-group list-group-flush">
                {events.map((evt) => (
                  <div key={evt.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-1">
                          <span
                            className="badge me-2"
                            style={{ backgroundColor: evt.color }}
                          >
                            {evt.type}
                          </span>
                          <span className="badge bg-secondary">
                            {evt.status}
                          </span>
                        </div>
                        <h6 className="mb-1">{evt.title}</h6>
                        <small className="text-muted">
                          <i className="bi bi-person me-1"></i>
                          {evt.pdl}
                          {evt.facility ? (
                            <>
                              <span className="mx-2">•</span>
                              <i className="bi bi-building me-1"></i>
                              {evt.facility}
                            </>
                          ) : null}
                        </small>
                      </div>
                      <div className="text-end">
                        <div className="text-muted">
                          <i className="bi bi-clock me-1"></i>
                          {new Date(evt.start).toLocaleString()} -{" "}
                          {new Date(evt.end).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
