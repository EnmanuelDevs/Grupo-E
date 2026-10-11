import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

export default function OccupancyReport() {
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

      let url = "/classes/report/occupancy";
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
      setError(err.message || "Error al cargar el reporte de ocupación.");
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
          Filtros del Reporte
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
          Cargando métricas...
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
                <th scope="col">Clase</th>
                <th scope="col" style={{ textAlign: "center" }}>
                  Capacidad Total
                </th>
                <th scope="col" style={{ textAlign: "center" }}>
                  Reservas
                </th>
                <th scope="col" style={{ textAlign: "center" }}>
                  Disponibles
                </th>
                <th scope="col">Nivel de Ocupación</th>
              </tr>
            </thead>
            <tbody>
              {filteredReport.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No hay datos que coincidan con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredReport.map((item) => {
                  const percentage = item.globalStats?.overallPercentage || 0;

                  let barColor = "#10b981";
                  if (percentage >= 80) barColor = "#ef4444";
                  else if (percentage >= 50) barColor = "#f59e0b";

                  return (
                    <tr key={item.classId}>
                      <td>
                        <strong>{item.title}</strong>
                        <span
                          style={{
                            display: "block",
                            fontSize: "0.85rem",
                            color: "#6b7280",
                          }}
                        >
                          {item.instructor}
                        </span>
                      </td>
                      <td style={{ textAlign: "center", fontWeight: "500" }}>
                        {item.globalStats?.totalCapacity || 0}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {item.globalStats?.totalOccupied || 0}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {item.globalStats?.totalAvailable || 0}
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <span
                            style={{ minWidth: "45px", fontWeight: "bold" }}
                          >
                            {percentage}%
                          </span>
                          <div
                            style={{
                              width: "120px",
                              backgroundColor: "#e5e7eb",
                              borderRadius: "999px",
                              height: "8px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: barColor,
                                height: "100%",
                                transition: "width 0.5s",
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
