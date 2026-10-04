import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:5000/api";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    customer_id: "",
    invoice_id: "",
    payment_date: new Date().toISOString().slice(0, 10),
    amount: "",
    payment_method: "UPI",
    notes: "",
  });

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    await Promise.all([
      loadPayments(),
      loadCustomers(),
      loadInvoices(),
    ]);
  }

  async function loadPayments() {
    try {
      const response = await fetch(`${API}/payments`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setPayments(data);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error("Payments Load Error:", error);
      setPayments([]);
    }
  }

  async function loadCustomers() {
    try {
      const response = await fetch(`${API}/customers`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error("Customers Load Error:", error);
      setCustomers([]);
    }
  }

  async function loadInvoices() {
    try {
      const response = await fetch(`${API}/invoices`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setInvoices(data.filter(Boolean));
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error("Invoices Load Error:", error);
      setInvoices([]);
    }
  }

  function resetForm() {
    setForm({
      customer_id: "",
      invoice_id: "",
      payment_date: new Date().toISOString().slice(0, 10),
      amount: "",
      payment_method: "UPI",
      notes: "",
    });
  }

  function closeModal() {
    setShowModal(false);
    setErrorMessage("");
    resetForm();
  }

  function openModal() {
    setSuccessMessage("");
    setErrorMessage("");
    resetForm();
    setShowModal(true);
  }

  function handleCustomerChange(value) {
    setForm((previous) => ({
      ...previous,
      customer_id: value,
      invoice_id: "",
      amount: "",
    }));
  }

  function handleInvoiceChange(value) {
    const selectedInvoice = invoices.find(
      (invoice) =>
        invoice &&
        String(invoice.id) === String(value)
    );

    if (!selectedInvoice) {
      setForm((previous) => ({
        ...previous,
        invoice_id: "",
        amount: "",
      }));
      return;
    }

    const balance = Number(
      selectedInvoice.balance_due || 0
    );

    setForm((previous) => ({
      ...previous,
      invoice_id: String(selectedInvoice.id),
      amount:
        balance > 0
          ? balance.toFixed(2)
          : "",
    }));
  }

  async function savePayment(event) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!form.customer_id) {
      setErrorMessage("Please select a customer.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setErrorMessage(
        "Please enter a valid payment amount."
      );
      return;
    }

    const selectedInvoice = invoices.find(
      (invoice) =>
        invoice &&
        String(invoice.id) ===
          String(form.invoice_id)
    );

    if (form.invoice_id && !selectedInvoice) {
      setErrorMessage(
        "The selected invoice could not be found. Please select it again."
      );
      return;
    }

    try {
      const response = await fetch(`${API}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: Number(form.customer_id),
          invoice_id: form.invoice_id
            ? Number(form.invoice_id)
            : null,
          payment_date: form.payment_date,
          amount: Number(form.amount),
          payment_method: form.payment_method,
          notes: form.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          data.message ||
            "Failed to save payment."
        );
        return;
      }

      setSuccessMessage(
        `Payment of ₹${Number(
          form.amount
        ).toLocaleString("en-IN")} recorded successfully.`
      );

      closeModal();

      await loadPayments();
      await loadInvoices();
    } catch (error) {
      console.error("Save Payment Error:", error);

      setErrorMessage(
        "Unable to connect to the backend."
      );
    }
  }

  const customerInvoices = useMemo(() => {
    return invoices.filter(
      (invoice) =>
        invoice &&
        invoice.id &&
        String(invoice.customer_id) ===
          String(form.customer_id) &&
        Number(invoice.balance_due || 0) > 0 &&
        invoice.status !== "CANCELLED"
    );
  }, [invoices, form.customer_id]);

  const totalPayments = payments.reduce(
    (sum, payment) =>
      sum + Number(payment?.amount || 0),
    0
  );

  const upiPayments = payments
    .filter(
      (payment) =>
        String(payment?.payment_method || "")
          .toUpperCase() === "UPI"
    )
    .reduce(
      (sum, payment) =>
        sum + Number(payment?.amount || 0),
      0
    );

  const cashPayments = payments
    .filter(
      (payment) =>
        String(payment?.payment_method || "")
          .toUpperCase() === "CASH"
    )
    .reduce(
      (sum, payment) =>
        sum + Number(payment?.amount || 0),
      0
    );

  const bankPayments = payments
    .filter(
      (payment) =>
        String(payment?.payment_method || "")
          .toUpperCase() === "BANK"
    )
    .reduce(
      (sum, payment) =>
        sum + Number(payment?.amount || 0),
      0
    );

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
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: "#202124",
              fontSize: "30px",
              fontWeight: 700,
            }}
          >
            Payments
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: "#6b7280",
              fontSize: "15px",
            }}
          >
            Record and track customer payments
          </p>
        </div>

        <button
          onClick={openModal}
          style={{
            border: "none",
            background: "#6d28d9",
            color: "#fff",
            padding: "13px 20px",
            borderRadius: "9px",
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Record Payment
        </button>
      </div>

      {/* SUCCESS MESSAGE */}
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

      {/* ERROR MESSAGE */}
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

      {/* SUMMARY CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "18px",
          marginBottom: "28px",
        }}
      >
        <SummaryCard
          title="Total Payments"
          amount={totalPayments}
          background="#6d28d9"
          textColor="#ffffff"
        />

        <SummaryCard
          title="UPI Payments"
          amount={upiPayments}
          background="#ecfdf5"
          textColor="#065f46"
        />

        <SummaryCard
          title="Cash Payments"
          amount={cashPayments}
          background="#fff7ed"
          textColor="#9a3412"
        />

        <SummaryCard
          title="Bank Payments"
          amount={bankPayments}
          background="#eff6ff"
          textColor="#1e40af"
        />
      </div>

      {/* PAYMENT HISTORY */}
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
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "19px",
              color: "#202124",
            }}
          >
            Payment History
          </h2>

          <div
            style={{
              color: "#6b7280",
              fontSize: "13px",
              marginTop: "5px",
            }}
          >
            All recorded customer payments
          </div>
        </div>

        {payments.length === 0 ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              No payments recorded
            </div>

            <div style={{ fontSize: "14px" }}>
              Click “Record Payment” to add your first payment.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
                minWidth: "900px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f9fafb",
                  }}
                >
                  <th style={thStyle}>
                    Date
                  </th>

                  <th style={thStyle}>
                    Customer
                  </th>

                  <th style={thStyle}>
                    Invoice
                  </th>

                  <th style={thStyle}>
                    Amount
                  </th>

                  <th style={thStyle}>
                    Method
                  </th>

                  <th style={thStyle}>
                    Notes
                  </th>
                </tr>
              </thead>

              <tbody>
                {payments.map(
                  (payment, index) => (
                    <tr
                      key={
                        payment?.id ??
                        `payment-${index}`
                      }
                    >
                      <td style={tdStyle}>
                        {payment?.payment_date ||
                          "-"}
                      </td>

                      <td style={tdStyle}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#1f2937",
                          }}
                        >
                          {payment?.customer_name ||
                            "-"}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        {payment?.invoice_no ? (
                          <span
                            style={{
                              background:
                                "#f3e8ff",
                              color:
                                "#6d28d9",
                              padding:
                                "5px 9px",
                              borderRadius:
                                "6px",
                              fontSize:
                                "12px",
                              fontWeight:
                                700,
                            }}
                          >
                            {
                              payment.invoice_no
                            }
                          </span>
                        ) : (
                          <span
                            style={{
                              color:
                                "#6b7280",
                            }}
                          >
                            Advance / General
                          </span>
                        )}
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          fontWeight: 800,
                          color: "#047857",
                        }}
                      >
                        ₹
                        {Number(
                          payment?.amount || 0
                        ).toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </td>

                      <td style={tdStyle}>
                        <PaymentMethodBadge
                          method={
                            payment?.payment_method
                          }
                        />
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          color: "#6b7280",
                        }}
                      >
                        {payment?.notes ||
                          "-"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECORD PAYMENT MODAL */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.55)",
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
              maxWidth: "560px",
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.18)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* MODAL HEADER */}
            <div
              style={{
                padding:
                  "22px 24px",
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
                  Record Payment
                </h2>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    color:
                      "#6b7280",
                    fontSize:
                      "13px",
                  }}
                >
                  Add a customer payment to the ERP
                </p>
              </div>

              <button
                onClick={closeModal}
                style={{
                  border: "none",
                  background:
                    "#f3f4f6",
                  width: "36px",
                  height: "36px",
                  borderRadius:
                    "50%",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#374151",
                }}
              >
                ×
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={savePayment}
              style={{
                padding: "24px",
              }}
            >
              {errorMessage && (
                <div
                  style={{
                    background:
                      "#fee2e2",
                    color: "#991b1b",
                    border:
                      "1px solid #fecaca",
                    padding:
                      "12px 14px",
                    borderRadius:
                      "8px",
                    marginBottom:
                      "18px",
                    fontSize:
                      "13px",
                    fontWeight:
                      600,
                  }}
                >
                  {errorMessage}
                </div>
              )}

              {/* CUSTOMER */}
              <label style={labelStyle}>
                Customer / Retailer
              </label>

              <select
                value={
                  form.customer_id
                }
                onChange={(event) =>
                  handleCustomerChange(
                    event.target.value
                  )
                }
                style={inputStyle}
              >
                <option value="">
                  Select customer
                </option>

                {customers
                  .filter(Boolean)
                  .map((customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.name ||
                        "Unnamed Customer"}
                      {customer.mobile
                        ? ` - ${customer.mobile}`
                        : ""}
                    </option>
                  ))}
              </select>

              {/* INVOICE */}
              <label style={labelStyle}>
                Invoice
              </label>

              <select
                value={
                  form.invoice_id
                }
                onChange={(event) =>
                  handleInvoiceChange(
                    event.target.value
                  )
                }
                style={{
                  ...inputStyle,
                  marginBottom:
                    "17px",
                }}
                disabled={
                  !form.customer_id
                }
              >
                <option value="">
                  {form.customer_id
                    ? "Customer advance / no invoice"
                    : "Select customer first"}
                </option>

                {customerInvoices.map(
                  (invoice) => (
                    <option
                      key={invoice.id}
                      value={invoice.id}
                    >
                      {invoice.invoice_no ||
                        `Invoice #${invoice.id}`}
                      {" - Balance ₹"}
                      {Number(
                        invoice.balance_due ||
                          0
                      ).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits:
                            2,
                        }
                      )}
                    </option>
                  )
                )}
              </select>

              {/* NO UNPAID INVOICE MESSAGE */}
              {form.customer_id &&
                customerInvoices.length ===
                  0 && (
                  <div
                    style={{
                      marginTop:
                        "-8px",
                      marginBottom:
                        "17px",
                      fontSize:
                        "12px",
                      color:
                        "#6b7280",
                    }}
                  >
                    No unpaid invoice found for this customer. You can record an advance/general payment.
                  </div>
                )}

              {/* DATE */}
              <label style={labelStyle}>
                Payment Date
              </label>

              <input
                type="date"
                value={
                  form.payment_date
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    payment_date:
                      event.target
                        .value,
                  })
                }
                style={inputStyle}
              />

              {/* AMOUNT */}
              <label style={labelStyle}>
                Amount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  form.amount
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    amount:
                      event.target
                        .value,
                  })
                }
                placeholder="Enter payment amount"
                style={inputStyle}
              />

              {/* METHOD */}
              <label style={labelStyle}>
                Payment Method
              </label>

              <select
                value={
                  form.payment_method
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    payment_method:
                      event.target
                        .value,
                  })
                }
                style={inputStyle}
              >
                <option value="UPI">
                  UPI
                </option>

                <option value="CASH">
                  Cash
                </option>

                <option value="BANK">
                  Bank / Online
                </option>

                <option value="OTHER">
                  Other
                </option>
              </select>

              {/* NOTES */}
              <label style={labelStyle}>
                Notes
              </label>

              <textarea
                value={
                  form.notes
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    notes:
                      event.target
                        .value,
                  })
                }
                placeholder="Optional payment note"
                rows="3"
                style={{
                  ...inputStyle,
                  resize:
                    "vertical",
                }}
              />

              {/* BUTTONS */}
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: "10px",
                  marginTop:
                    "24px",
                }}
              >
                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  style={{
                    border:
                      "1px solid #d1d5db",
                    background:
                      "#ffffff",
                    color:
                      "#374151",
                    padding:
                      "11px 18px",
                    borderRadius:
                      "8px",
                    fontWeight:
                      600,
                    cursor:
                      "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    border: "none",
                    background:
                      "#6d28d9",
                    color:
                      "#ffffff",
                    padding:
                      "11px 20px",
                    borderRadius:
                      "8px",
                    fontWeight:
                      700,
                    cursor:
                      "pointer",
                  }}
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================
// SUMMARY CARD
// =====================================

function SummaryCard({
  title,
  amount,
  background,
  textColor,
}) {
  return (
    <div
      style={{
        background,
        borderRadius: "14px",
        padding: "20px",
        border:
          background === "#6d28d9"
            ? "none"
            : "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          color: textColor,
          opacity: 0.85,
          fontWeight: 600,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "28px",
          fontWeight: 800,
          color: textColor,
          marginTop: "8px",
        }}
      >
        ₹
        {Number(
          amount || 0
        ).toLocaleString("en-IN", {
          maximumFractionDigits: 2,
        })}
      </div>
    </div>
  );
}

// =====================================
// PAYMENT METHOD BADGE
// =====================================

function PaymentMethodBadge({
  method,
}) {
  const normalizedMethod =
    String(method || "OTHER").toUpperCase();

  let background = "#f3f4f6";
  let color = "#374151";

  if (normalizedMethod === "UPI") {
    background = "#ede9fe";
    color = "#6d28d9";
  }

  if (normalizedMethod === "CASH") {
    background = "#dcfce7";
    color = "#166534";
  }

  if (normalizedMethod === "BANK") {
    background = "#dbeafe";
    color = "#1d4ed8";
  }

  return (
    <span
      style={{
        display: "inline-block",
        background,
        color,
        padding: "6px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      {normalizedMethod}
    </span>
  );
}

// =====================================
// STYLES
// =====================================

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
  border:
    "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "14px",
  color: "#1f2937",
  background: "#ffffff",
  marginBottom: "17px",
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
};
