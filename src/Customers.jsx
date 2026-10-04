import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    address: "",
    opening_balance: "0",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(`${API}/customers`);
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          data.message || "Unable to load customers."
        );
        return;
      }

      setCustomers(
        Array.isArray(data)
          ? data.filter(Boolean)
          : []
      );
    } catch (error) {
      console.error("Customers Error:", error);

      setErrorMessage(
        "Unable to connect to the backend. Please check Window 1."
      );
    } finally {
      setLoading(false);
    }
  }

  function openModal() {
    setSuccessMessage("");
    setErrorMessage("");

    setForm({
      name: "",
      mobile: "",
      address: "",
      opening_balance: "0",
    });

    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setErrorMessage("");

    setForm({
      name: "",
      mobile: "",
      address: "",
      opening_balance: "0",
    });
  }

  async function saveCustomer(event) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    const name = form.name.trim();

    if (!name) {
      setErrorMessage(
        "Customer name is required."
      );
      return;
    }

    const openingBalance =
      Number(form.opening_balance || 0);

    if (
      Number.isNaN(openingBalance) ||
      openingBalance < 0
    ) {
      setErrorMessage(
        "Opening balance must be a valid amount."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API}/customers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            mobile: form.mobile.trim(),
            address: form.address.trim(),
            opening_balance: openingBalance,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          data.message ||
            "Customer could not be saved."
        );
        return;
      }

      setSuccessMessage(
        "Customer added successfully."
      );

      setShowModal(false);

      setForm({
        name: "",
        mobile: "",
        address: "",
        opening_balance: "0",
      });

      await loadCustomers();
    } catch (error) {
      console.error(
        "Add Customer Error:",
        error
      );

      setErrorMessage(
        "Unable to connect to the backend. Please check Window 1."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6fb",
        padding: "28px",
        fontFamily:
          "Inter, Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              fontWeight: 800,
              color: "#202124",
            }}
          >
            Customers
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: "#6b7280",
              fontSize: "15px",
            }}
          >
            Manage your retailers and customer balances
          </p>
        </div>

        <button
          type="button"
          onClick={openModal}
          style={{
            border: "none",
            background: "#6d28d9",
            color: "#ffffff",
            padding: "13px 20px",
            borderRadius: "9px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Add Customer
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div
          style={{
            background: "#dcfce7",
            color: "#166534",
            border: "1px solid #bbf7d0",
            padding: "13px 16px",
            borderRadius: "9px",
            marginBottom: "20px",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          ✓ {successMessage}
        </div>
      )}

      {errorMessage && !showModal && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            border: "1px solid #fecaca",
            padding: "13px 16px",
            borderRadius: "9px",
            marginBottom: "20px",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            background: "#ede9fe",
            borderRadius: "14px",
            padding: "20px",
            border:
              "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: "#6d28d9",
              fontWeight: 600,
            }}
          >
            Total Customers
          </div>

          <div
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#6d28d9",
              marginTop: "8px",
            }}
          >
            {customers.length}
          </div>
        </div>

        <div
          style={{
            background: "#dcfce7",
            borderRadius: "14px",
            padding: "20px",
            border:
              "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: "#166534",
              fontWeight: 600,
            }}
          >
            Opening Balance
          </div>

          <div
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#166534",
              marginTop: "8px",
            }}
          >
            ₹
            {customers
              .reduce(
                (sum, customer) =>
                  sum +
                  Number(
                    customer?.opening_balance ||
                      0
                  ),
                0
              )
              .toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
          </div>
        </div>
      </div>

      {/* Customer table */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          boxShadow:
            "0 4px 16px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            padding: "20px 22px",
            borderBottom:
              "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "19px",
                color: "#202124",
              }}
            >
              Customer List
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                color: "#6b7280",
                fontSize: "13px",
              }}
            >
              All saved retailers and customers
            </p>
          </div>

          <button
            type="button"
            onClick={loadCustomers}
            style={{
              border:
                "1px solid #ddd6fe",
              background: "#f5f3ff",
              color: "#6d28d9",
              padding: "8px 12px",
              borderRadius: "7px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>

        {loading && customers.length === 0 ? (
          <div
            style={{
              padding: "70px 20px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            Loading customers...
          </div>
        ) : customers.length === 0 ? (
          <div
            style={{
              padding: "70px 20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "19px",
                fontWeight: 700,
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              No customers yet
            </div>

            <div
              style={{
                fontSize: "14px",
                color: "#6b7280",
              }}
            >
              Click “Add Customer” to create your
              first customer.
            </div>
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                minWidth: "850px",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f9fafb",
                  }}
                >
                  <th style={thStyle}>
                    ID
                  </th>

                  <th style={thStyle}>
                    Customer
                  </th>

                  <th style={thStyle}>
                    Mobile
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      minWidth: "250px",
                    }}
                  >
                    Address
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      textAlign: "right",
                    }}
                  >
                    Opening Balance
                  </th>
                </tr>
              </thead>

              <tbody>
                {customers.map(
                  (customer, index) => (
                    <tr
                      key={
                        customer?.id ??
                        `customer-${index}`
                      }
                    >
                      <td style={tdStyle}>
                        {customer?.id || "-"}
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          fontWeight: 700,
                          color: "#1f2937",
                        }}
                      >
                        {customer?.name || "-"}
                      </td>

                      <td style={tdStyle}>
                        {customer?.mobile || "-"}
                      </td>

                      <td style={tdStyle}>
                        {customer?.address || "-"}
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "right",
                          fontWeight: 700,
                        }}
                      >
                        ₹
                        {Number(
                          customer?.opening_balance ||
                            0
                        ).toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15,23,42,0.55)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "650px",
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.18)",
              maxHeight: "92vh",
              overflowY: "auto",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                padding: "22px 24px",
                borderBottom:
                  "1px solid #e5e7eb",
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "21px",
                    color: "#202124",
                  }}
                >
                  Add Customer
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#6b7280",
                    fontSize: "13px",
                  }}
                >
                  Add a new retailer or customer
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                style={{
                  border: "none",
                  background: "#f3f4f6",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#374151",
                }}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={saveCustomer}
              style={{
                padding: "24px",
              }}
            >
              {errorMessage && (
                <div
                  style={{
                    background: "#fee2e2",
                    color: "#991b1b",
                    border:
                      "1px solid #fecaca",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    marginBottom: "18px",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {errorMessage}
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "16px",
                }}
              >
                <div>
                  <label style={labelStyle}>
                    Customer Name
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        name: event.target.value,
                      })
                    }
                    placeholder="Enter customer name"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Mobile Number
                  </label>

                  <input
                    type="text"
                    value={form.mobile}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        mobile: event.target.value,
                      })
                    }
                    placeholder="Enter mobile number"
                    style={inputStyle}
                  />
                </div>

                <div
                  style={{
                    gridColumn: "1 / -1",
                  }}
                >
                  <label style={labelStyle}>
                    Address
                  </label>

                  <textarea
                    rows="3"
                    value={form.address}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        address:
                          event.target.value,
                      })
                    }
                    placeholder="Enter customer address"
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                    }}
                  />
                </div>

                <div
                  style={{
                    gridColumn: "1 / -1",
                  }}
                >
                  <label style={labelStyle}>
                    Opening Balance
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.opening_balance
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        opening_balance:
                          event.target.value,
                      })
                    }
                    placeholder="0.00"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  style={cancelButton}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...saveButton,
                    opacity:
                      loading ? 0.7 : 1,
                  }}
                >
                  {loading
                    ? "Saving..."
                    : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  color: "#374151",
  fontSize: "14px",
  fontWeight: 600,
};

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "14px",
  color: "#1f2937",
  background: "#ffffff",
  outline: "none",
};

const thStyle = {
  textAlign: "left",
  padding: "13px 16px",
  fontSize: "12px",
  color: "#6b7280",
  fontWeight: 700,
  borderBottom:
    "1px solid #e5e7eb",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "15px 16px",
  fontSize: "14px",
  color: "#374151",
  borderBottom:
    "1px solid #f0f0f0",
  verticalAlign: "middle",
};

const cancelButton = {
  border:
    "1px solid #d1d5db",
  background: "#ffffff",
  color: "#374151",
  padding: "11px 18px",
  borderRadius: "8px",
  fontWeight: 600,
  cursor: "pointer",
};

const saveButton = {
  border: "none",
  background: "#6d28d9",
  color: "#ffffff",
  padding: "11px 20px",
  borderRadius: "8px",
  fontWeight: 700,
  cursor: "pointer",
};
