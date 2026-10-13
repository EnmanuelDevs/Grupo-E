import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

export default function DemandReport() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtros
  const [searchClass, setSearchClass] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadReport = async (start = startDate, end = endDate) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      let url = "/classes/report/demand";
      const params = new URLSearchParams();

      if (start) params.append("startDate", start);
      if (end) params.append("endDate", end);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const data = await apiRequest(url, { token });
      const finalData = Array.isArray(data) ? data : data.data || [];
      setReportData(finalData);
    } catch (err) {
      setError(err.message || "Error al cargar el reporte de demanda.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleApplyDateFilter = (e) => {
    e.preventDefault();
    loadReport(startDate, endDate);
  };

  const filteredReport = reportData.filter((item) =>
    item.title.toLowerCase().includes(searchClass.toLowerCase()),
  );

  const maxReservations =
    reportData.length > 0
      ? Math.max(...reportData.map((item) => item.totalReservations))
      : 1;

  const getMedal = (index) => {
    if (index === 0)
      return (
        <span style={{ fontSize: "1.2rem" }} title="1er Lugar">
          🥇
        </span>
      );
    if (index === 1)
      return (
        <span style={{ fontSize: "1.2rem" }} title="2do Lugar">
          🥈
        </span>
      );
    if (index === 2)
      return (
        <span style={{ fontSize: "1.2rem" }} title="3er Lugar">
          🥉
        </span>
      );
    return (
      <span style={{ color: "#9ca3af", fontWeight: "bold" }}>#{index + 1}</span>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div
        style={{
          backgroundColor: "#f9fafb",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: "15px",
            fontSize: "1rem",
            color: "#374151",
          }}
        >
          Filtros de Demanda
        </h3>

        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div style={{ flex: "1", minWidth: "200px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                marginBottom: "5px",
                fontWeight: "bold",
                color: "#4b5563",
              }}
            >
              Buscar por clase:
            </label>
            <input
              type="text"
              placeholder="Ej. Yoga, Spinning..."
              value={searchClass}
              onChange={(e) => setSearchClass(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
              }}
            />
          </div>

          <form
            onSubmit={handleApplyDateFilter}
            style={{
              display: "flex",
              gap: "15px",
              alignItems: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  marginBottom: "5px",
                  fontWeight: "bold",
                  color: "#4b5563",
                }}
              >
                Desde:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  marginBottom: "5px",
                  fontWeight: "bold",
                  color: "#4b5563",
                }}
              >
                Hasta:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                backgroundColor: "#374151",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Aplicar Fechas
            </button>
            <button
              type="button"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                loadReport("", "");
              }}
              style={{
                padding: "8px 16px",
                backgroundColor: "#e5e7eb",
                color: "#374151",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Limpiar
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          Cargando ranking de clases...
        </div>
      ) : error ? (
        <div className="admin-empty" role="alert">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col" style={{ textAlign: "center", width: "60px" }}>
                  Top
                </th>
                <th scope="col">Clase</th>
                <th scope="col">Instructor</th>
                <th scope="col" style={{ minWidth: "250px" }}>
                  Volumen de Reservas
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReport.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No hay datos para mostrar.
                  </td>
                </tr>
              ) : (
                filteredReport.map((item, index) => {
                  const barWidth =
                    item.totalReservations === 0
                      ? 0
                      : Math.max(
                          (item.totalReservations / maxReservations) * 100,
                          2,
                        );

                  return (
                    <tr key={item.classId}>
                      <td style={{ textAlign: "center" }}>{getMedal(index)}</td>
                      <td>
                        <strong
                          style={{
                            fontSize: "1.05rem",
                            color: index < 3 ? "#111827" : "#374151",
                          }}
                        >
                          {item.title}
                        </strong>
                      </td>
                      <td style={{ color: "#4b5563" }}>{item.instructor}</td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "15px",
                          }}
                        >
                          <span
                            style={{
                              minWidth: "35px",
                              fontWeight: "bold",
                              fontSize: "1.1rem",
                              color: "#1f2937",
                            }}
                          >
                            {item.totalReservations}
                          </span>

                          <div
                            style={{
                              flex: 1,
                              backgroundColor: "#f3f4f6",
                              borderRadius: "4px",
                              height: "16px",
                              overflow: "hidden",
                              display: "flex",
                            }}
                          >
                            <div
                              style={{
                                width: `${barWidth}%`,
                                backgroundColor:
                                  index === 0
                                    ? "#fbbf24"
                                    : index === 1
                                      ? "#9ca3af"
                                      : index === 2
                                        ? "#d97706"
                                        : "#60a5fa",
                                height: "100%",
                                transition: "width 0.8s ease-out",
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
