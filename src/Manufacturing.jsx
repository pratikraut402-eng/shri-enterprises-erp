import { useEffect, useMemo, useState } from "react";

const API = `${window.location.protocol}//${window.location.hostname}:5000/api`;

function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function Manufacturing() {
  const [products, setProducts] = useState([]);
  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    batch_code: "",
    manufacturing_date: getToday(),
    product_id: "",
    number_of_boxes: "",
    per_box_quantity: "",
    notes: "",
  });

  // =====================================
  // LOAD DATA
  // =====================================

  async function loadProducts() {
    try {
      const response = await fetch(
        `${API}/products`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load products."
        );
      }

      setProducts(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Load Products Error:",
        error
      );

      alert(
        error.message ||
          "Failed to load products."
      );
    }
  }

  async function loadRecords() {
    try {
      setLoading(true);

      const response = await fetch(
        `${API}/manufacturing`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load manufacturing records."
        );
      }

      setRecords(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Load Manufacturing Error:",
        error
      );

      alert(
        error.message ||
          "Failed to load manufacturing records."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
    loadRecords();
  }, []);

  // =====================================
  // FORM HANDLER
  // =====================================

  function updateForm(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function resetForm() {
    setEditingId(null);

    setForm({
      batch_code: "",
      manufacturing_date: getToday(),
      product_id: "",
      number_of_boxes: "",
      per_box_quantity: "",
      notes: "",
    });
  }

  // =====================================
  // CALCULATIONS
  // =====================================

  const totalQuantity = useMemo(() => {
    const boxes =
      Number(
        form.number_of_boxes
      ) || 0;

    const perBox =
      Number(
        form.per_box_quantity
      ) || 0;

    return boxes * perBox;
  }, [
    form.number_of_boxes,
    form.per_box_quantity,
  ]);

  // =====================================
  // SAVE / UPDATE
  // =====================================

  async function handleSubmit(event) {
    event.preventDefault();

    const batchCode =
      form.batch_code.trim();

    const manufacturingDate =
      form.manufacturing_date;

    const productId =
      Number(form.product_id);

    const boxes =
      Number(form.number_of_boxes);

    const perBox =
      Number(form.per_box_quantity);

    if (!batchCode) {
      alert(
        "Please enter Batch Code."
      );
      return;
    }

    if (!manufacturingDate) {
      alert(
        "Please select Manufacturing Date."
      );
      return;
    }

    if (!productId) {
      alert(
        "Please select Product."
      );
      return;
    }

    if (
      !boxes ||
      boxes <= 0
    ) {
      alert(
        "Please enter valid Number of Boxes."
      );
      return;
    }

    if (
      !perBox ||
      perBox <= 0
    ) {
      alert(
        "Please enter valid Per Box Quantity."
      );
      return;
    }

    const calculatedTotal =
      boxes * perBox;

    const payload = {
      batch_code:
        batchCode,

      manufacturing_date:
        manufacturingDate,

      product_id:
        productId,

      number_of_boxes:
        boxes,

      per_box_quantity:
        perBox,

      notes:
        form.notes.trim(),
    };

    try {
      setSaving(true);

      const url = editingId
        ? `${API}/manufacturing/${editingId}`
        : `${API}/manufacturing`;

      const method = editingId
        ? "PUT"
        : "POST";

      const response = await fetch(
        url,
        {
          method,

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save manufacturing record."
        );
      }

      alert(
        editingId
          ? "Manufacturing record updated successfully."
          : `Manufacturing saved successfully.\n\nTotal Quantity: ${calculatedTotal} bottles`
      );

      resetForm();
      await loadRecords();

      // Refresh stock data indirectly
      // whenever this page is revisited.
    } catch (error) {
      console.error(
        "Save Manufacturing Error:",
        error
      );

      alert(
        error.message ||
          "Failed to save manufacturing record."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================
  // EDIT
  // =====================================

  function handleEdit(record) {
    setEditingId(record.id);

    setForm({
      batch_code:
        record.batch_code || "",

      manufacturing_date:
        record.manufacturing_date ||
        getToday(),

      product_id:
        String(
          record.product_id || ""
        ),

      number_of_boxes:
        String(
          record.number_of_boxes ??
            ""
        ),

      per_box_quantity:
        String(
          record.per_box_quantity ??
            ""
        ),

      notes:
        record.notes || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =====================================
  // DELETE
  // =====================================

  async function handleDelete(record) {
    const confirmed =
      window.confirm(
        `Delete manufacturing batch "${record.batch_code}"?\n\n${record.product_name} - ${record.number_of_boxes} boxes`
      );

    if (!confirmed) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API}/manufacturing/${record.id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete manufacturing record."
        );
      }

      alert(
        "Manufacturing record deleted successfully."
      );

      if (
        Number(editingId) ===
        Number(record.id)
      ) {
        resetForm();
      }

      await loadRecords();

    } catch (error) {
      console.error(
        "Delete Manufacturing Error:",
        error
      );

      alert(
        error.message ||
          "Failed to delete manufacturing record."
      );
    }
  }

  // =====================================
  // FORMATTERS
  // =====================================

  function formatNumber(value) {
    const number =
      Number(value || 0);

    return number.toLocaleString(
      "en-IN"
    );
  }

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    const parts =
      String(value).split("-");

    if (
      parts.length !== 3
    ) {
      return value;
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  // =====================================
  // SUMMARY
  // =====================================

  const totalBoxes =
    records.reduce(
      (sum, record) =>
        sum +
        Number(
          record.number_of_boxes || 0
        ),
      0
    );

  const totalProduced =
    records.reduce(
      (sum, record) =>
        sum +
        Number(
          record.total_quantity || 0
        ),
      0
    );

  // =====================================
  // UI
  // =====================================

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 800,
            }}
          >
            Manufacturing
          </h1>

          <div
            style={{
              marginTop: "6px",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Record production by batch
            and automatically add boxes to stock.
          </div>
        </div>

        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            style={{
              border:
                "1px solid #d1d5db",
              background: "#ffffff",
              padding:
                "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* SUMMARY CARDS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border:
              "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "18px",
          }}
        >
          <div
            style={{
              color: "#6b7280",
              fontSize: "13px",
              marginBottom: "6px",
            }}
          >
            Manufacturing Entries
          </div>

          <div
            style={{
              fontSize: "26px",
              fontWeight: 800,
            }}
          >
            {records.length}
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            border:
              "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "18px",
          }}
        >
          <div
            style={{
              color: "#6b7280",
              fontSize: "13px",
              marginBottom: "6px",
            }}
          >
            Total Boxes Produced
          </div>

          <div
            style={{
              fontSize: "26px",
              fontWeight: 800,
            }}
          >
            {formatNumber(
              totalBoxes
            )}
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            border:
              "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "18px",
          }}
        >
          <div
            style={{
              color: "#6b7280",
              fontSize: "13px",
              marginBottom: "6px",
            }}
          >
            Total Bottles Produced
          </div>

          <div
            style={{
              fontSize: "26px",
              fontWeight: 800,
            }}
          >
            {formatNumber(
              totalProduced
            )}
          </div>
        </div>
      </div>

      {/* FORM */}

      <div
        style={{
          background: "#ffffff",
          border:
            "1px solid #e5e7eb",
          borderRadius: "14px",
          padding: "22px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            marginBottom: "18px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: 800,
            }}
          >
            {editingId
              ? "Edit Manufacturing"
              : "New Manufacturing Entry"}
          </h2>

          <div
            style={{
              marginTop: "5px",
              color: "#6b7280",
              fontSize: "13px",
            }}
          >
            Total quantity is calculated
            automatically from boxes × per box quantity.
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: "18px",
            }}
          >
            {/* BATCH CODE */}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                Batch Code
              </label>

              <input
                type="text"
                value={
                  form.batch_code
                }
                onChange={(event) =>
                  updateForm(
                    "batch_code",
                    event.target.value
                  )
                }
                placeholder="Example: BATCH-001"
                style={{
                  width: "100%",
                  boxSizing:
                    "border-box",
                  padding:
                    "12px 13px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
                required
              />
            </div>

            {/* DATE */}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                Date of Manufacturing
              </label>

              <input
                type="date"
                value={
                  form.manufacturing_date
                }
                onChange={(event) =>
                  updateForm(
                    "manufacturing_date",
                    event.target.value
                  )
                }
                style={{
                  width: "100%",
                  boxSizing:
                    "border-box",
                  padding:
                    "12px 13px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
                required
              />
            </div>

            {/* PRODUCT */}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                Product
              </label>

              <select
                value={
                  form.product_id
                }
                onChange={(event) =>
                  updateForm(
                    "product_id",
                    event.target.value
                  )
                }
                style={{
                  width: "100%",
                  boxSizing:
                    "border-box",
                  padding:
                    "12px 13px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background:
                    "#ffffff",
                }}
                required
              >
                <option value="">
                  Select Product
                </option>

                {products.map(
                  (product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.product_name}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* NUMBER OF BOXES */}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                Number of Boxes
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={
                  form.number_of_boxes
                }
                onChange={(event) =>
                  updateForm(
                    "number_of_boxes",
                    event.target.value
                  )
                }
                placeholder="Enter boxes"
                style={{
                  width: "100%",
                  boxSizing:
                    "border-box",
                  padding:
                    "12px 13px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
                required
              />
            </div>

            {/* PER BOX */}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                Per Box Quantity
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={
                  form.per_box_quantity
                }
                onChange={(event) =>
                  updateForm(
                    "per_box_quantity",
                    event.target.value
                  )
                }
                placeholder="Example: 24"
                style={{
                  width: "100%",
                  boxSizing:
                    "border-box",
                  padding:
                    "12px 13px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
                required
              />
            </div>

            {/* TOTAL */}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                Total Quantity
              </label>

              <div
                style={{
                  width: "100%",
                  boxSizing:
                    "border-box",
                  padding:
                    "12px 13px",
                  border:
                    "1px solid #ddd6fe",
                  borderRadius: "8px",
                  fontSize: "18px",
                  fontWeight: 800,
                  background:
                    "#f5f3ff",
                  minHeight: "45px",
                }}
              >
                {formatNumber(
                  totalQuantity
                )}{" "}
                Bottles
              </div>
            </div>

            {/* NOTES */}

            <div
              style={{
                gridColumn:
                  "1 / -1",
              }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                Notes
              </label>

              <textarea
                value={form.notes}
                onChange={(event) =>
                  updateForm(
                    "notes",
                    event.target.value
                  )
                }
                placeholder="Optional notes"
                rows="3"
                style={{
                  width: "100%",
                  boxSizing:
                    "border-box",
                  padding:
                    "12px 13px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  resize: "vertical",
                }}
              />
            </div>
          </div>

          {/* FORM BUTTONS */}

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="submit"
              disabled={saving}
              style={{
                border: "none",
                background:
                  "#6d28d9",
                color: "#ffffff",
                padding:
                  "12px 20px",
                borderRadius: "8px",
                cursor: saving
                  ? "not-allowed"
                  : "pointer",
                fontWeight: 700,
                opacity: saving
                  ? 0.7
                  : 1,
              }}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Manufacturing"
                : "Save Manufacturing"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  border:
                    "1px solid #d1d5db",
                  background:
                    "#ffffff",
                  color: "#111827",
                  padding:
                    "12px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* HISTORY */}

      <div
        style={{
          background: "#ffffff",
          border:
            "1px solid #e5e7eb",
          borderRadius: "14px",
          overflow: "hidden",
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
              fontSize: "20px",
              fontWeight: 800,
            }}
          >
            Manufacturing History
          </h2>

          <div
            style={{
              marginTop: "5px",
              color: "#6b7280",
              fontSize: "13px",
            }}
          >
            All production batches
            recorded in the system.
          </div>
        </div>

        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
              minWidth:
                "1050px",
            }}
          >
            <thead>
              <tr
                style={{
                  background:
                    "#f9fafb",
                }}
              >
                <th
                  style={thStyle}
                >
                  Batch Code
                </th>

                <th
                  style={thStyle}
                >
                  Manufacturing Date
                </th>

                <th
                  style={thStyle}
                >
                  Product
                </th>

                <th
                  style={thStyle}
                >
                  Boxes
                </th>

                <th
                  style={thStyle}
                >
                  Per Box
                </th>

                <th
                  style={thStyle}
                >
                  Total Bottles
                </th>

                <th
                  style={thStyle}
                >
                  Notes
                </th>

                <th
                  style={thStyle}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      padding:
                        "30px",
                      textAlign:
                        "center",
                      color:
                        "#6b7280",
                    }}
                  >
                    Loading manufacturing history...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      padding:
                        "40px",
                      textAlign:
                        "center",
                      color:
                        "#6b7280",
                    }}
                  >
                    No manufacturing records found.
                  </td>
                </tr>
              ) : (
                records.map(
                  (record) => (
                    <tr
                      key={record.id}
                      style={{
                        borderTop:
                          "1px solid #f0f0f0",
                      }}
                    >
                      <td
                        style={tdStyle}
                      >
                        <strong>
                          {
                            record.batch_code
                          }
                        </strong>
                      </td>

                      <td
                        style={tdStyle}
                      >
                        {formatDate(
                          record.manufacturing_date
                        )}
                      </td>

                      <td
                        style={tdStyle}
                      >
                        {
                          record.product_name
                        }
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          fontWeight: 700,
                        }}
                      >
                        {formatNumber(
                          record.number_of_boxes
                        )}
                      </td>

                      <td
                        style={tdStyle}
                      >
                        {formatNumber(
                          record.per_box_quantity
                        )}
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          fontWeight: 800,
                        }}
                      >
                        {formatNumber(
                          record.total_quantity
                        )}
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          maxWidth:
                            "220px",
                        }}
                      >
                        {record.notes ||
                          "-"}
                      </td>

                      <td
                        style={tdStyle}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            gap:
                              "8px",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                record
                              )
                            }
                            style={{
                              border:
                                "1px solid #d1d5db",
                              background:
                                "#ffffff",
                              padding:
                                "7px 12px",
                              borderRadius:
                                "7px",
                              cursor:
                                "pointer",
                              fontWeight:
                                600,
                            }}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                record
                              )
                            }
                            style={{
                              border:
                                "1px solid #fecaca",
                              background:
                                "#fff5f5",
                              color:
                                "#b91c1c",
                              padding:
                                "7px 12px",
                              borderRadius:
                                "7px",
                              cursor:
                                "pointer",
                              fontWeight:
                                600,
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =====================================
// TABLE STYLES
// =====================================

const thStyle = {
  textAlign: "left",
  padding: "13px 14px",
  fontSize: "12px",
  fontWeight: 800,
  color: "#4b5563",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "14px",
  fontSize: "13px",
  color: "#111827",
  verticalAlign: "top",
};

export default Manufacturing;