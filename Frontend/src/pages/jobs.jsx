import { useEffect, useState, useCallback } from "react";
import api from "../Api/axios";
import Navbar from "../components/NavBar";

const LIMIT = 5;

const Jobs = () => {
  const [jobs, setJobs] = useState([]);

  // add job
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("APPLIED");

  // filters
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // pagination
  const [page, setPage] = useState(1);

  // editing
  const [editingId, setEditingId] = useState(null);
  const [editCompany, setEditCompany] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("APPLIED");

  /* ---------------- DEBOUNCE SEARCH ---------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  /* ---------------- FETCH JOBS ---------------- */
  const fetchJobs = useCallback(async () => {
    try {
      const res = await api.get("/jobs", {
        params: {
          page,
          limit: LIMIT,
          status: filterStatus,
          search: debouncedSearch,
        },
      });

      const jobsData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.jobs)
        ? res.data.jobs
        : [];

      setJobs(jobsData);
    } catch (err) {
      console.error("Error fetching jobs", err);
    }
  }, [page, filterStatus, debouncedSearch]);

  /* reset page when filters/search change */
  useEffect(() => {
    setPage(1);
  }, [filterStatus, debouncedSearch]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  /* ---------------- ADD JOB ---------------- */
  const handleAddJob = async (e) => {
    e.preventDefault();

    try {
      await api.post("/jobs", { company, role, status });

      setCompany("");
      setRole("");
      setStatus("APPLIED");

      fetchJobs();
    } catch (err) {
      console.error("Error adding job", err);
    }
  };

  /* ---------------- DELETE JOB ---------------- */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;

    try {
      await api.delete(`/jobs/${id}`);
      fetchJobs();
    } catch (err) {
      console.error("Error deleting job", err);
    }
  };

  /* ---------------- EDIT JOB ---------------- */
  const startEdit = (job) => {
    setEditingId(job._id || job.id);
    setEditCompany(job.company);
    setEditRole(job.role);
    setEditStatus(job.status);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/jobs/${id}`, {
        company: editCompany,
        role: editRole,
        status: editStatus,
      });

      setEditingId(null);
      fetchJobs();
    } catch (err) {
      console.error("Error updating job", err);
    }
  };

  return (
    <div>
      <Navbar />
      <h2>My Jobs</h2>

      {/* ADD JOB */}
      <form onSubmit={handleAddJob}>
        <input
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
        />

        <input
          placeholder="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        />

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="APPLIED">APPLIED</option>
          <option value="INTERVIEW">INTERVIEW</option>
          <option value="OFFER">OFFER</option>
          <option value="REJECTED">REJECTED</option>
        </select>

        <button type="submit">Add Job</button>
      </form>

      <hr />

      {/* FILTERS */}
      <input
        placeholder="Search company or role"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
      >
        <option value="">All</option>
        <option value="APPLIED">APPLIED</option>
        <option value="INTERVIEW">INTERVIEW</option>
        <option value="OFFER">OFFER</option>
        <option value="REJECTED">REJECTED</option>
      </select>

      <hr />

      {/* JOB LIST */}
      {jobs.length === 0 ? (
        <p>No jobs found</p>
      ) : (
        jobs.map((job) => {
          const id = job._id || job.id;

          return (
            <div key={id} style={{ borderBottom: "1px solid #ccc" }}>
              {editingId === id ? (
                <>
                  <input
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                  />
                  <input
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                  />
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="APPLIED">APPLIED</option>
                    <option value="INTERVIEW">INTERVIEW</option>
                    <option value="OFFER">OFFER</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>

                  <button onClick={() => saveEdit(id)}>Save</button>
                  <button onClick={cancelEdit}>Cancel</button>
                </>
              ) : (
                <>
                  <h4>{job.company}</h4>
                  <p>{job.role}</p>
                  <p>{job.status}</p>

                  <button onClick={() => startEdit(job)}>Edit</button>
                  <button onClick={() => handleDelete(id)}>Delete</button>
                </>
              )}
            </div>
          );
        })
      )}

      {/* PAGINATION */}
      <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
        Prev
      </button>

      <span style={{ margin: "0 10px" }}>Page {page}</span>

      <button
        disabled={jobs.length < LIMIT}
        onClick={() => setPage((p) => p + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Jobs;

