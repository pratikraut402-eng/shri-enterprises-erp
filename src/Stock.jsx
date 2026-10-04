import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

function Stock() {
  const today = new Date().toISOString().split("T")[0];

  const [stock, setStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);

  const [showEntry, setShowEntry] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editingEntry, setEditingEntry] = useState(null);

  const [form, setForm] = useState({
    product_id: "",
    quantity_cases: "",
    entry_date: today,
    notes: "",
  });

  /* =========================================================
     LOAD STOCK
  ========================================================= */

  const loadStock = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API}/stock`);

      if (!response.ok) {
        throw new Error(`Stock API error: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid stock data received.");
      }

      setStock(data);
    } catch (error) {
      console.error("Load Stock Error:", error);
      setStock([]);
      alert(
        `Unable to load stock.\n\nPlease make sure Window 1 backend is running on http://localhost:5000`
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOAD PRODUCTS
  ========================================================= */

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API}/products`);

      if (!response.ok) {
        throw new Error(`Products API error: ${response.status}`);
      }

      const data = await response.json();

      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load Products Error:", error);
      setProducts([]);
      alert("Unable to load products.");
    }
  };

  /* =========================================================
     LOAD STOCK HISTORY
  ========================================================= */

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);

      const response = await fetch(`${API}/stock/history`);

      if (!response.ok) {
        throw new Error(
          `Stock history API error: ${response.status}`
        );
      }

      const data = await response.json();

      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load Stock History Error:", error);
      setHistory([]);
      alert("Unable to load stock history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  /* =========================================================
     LOAD EVERYTHING
  ========================================================= */

  const loadAllStockData = async () => {
    await Promise.all([
      loadStock(),
      loadProducts(),
      loadHistory(),
    ]);
  };

  useEffect(() => {
    loadAllStockData();
  }, []);

  /* =========================================================
     STOCK GROUPS
  ========================================================= */

  const bailleyStock = stock.filter(
    (item) => item.stock_group === "BAILLEY"
  );

  const localStock = stock.filter(
    (item) => item.stock_group === "LOCAL"
  );

  const totalBailleyCases = bailleyStock.reduce(
    (total, item) => total + Number(item.current_stock || 0),
    0
  );

  const totalLocalCases = localStock.reduce(
    (total, item) => total + Number(item.current_stock || 0),
    0
  );

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     RESET FORM
  ========================================================= */

  const resetForm = () => {
    setForm({
      product_id: "",
      quantity_cases: "",
      entry_date: today,
      notes: "",
    });
  };

  /* =========================================================
     OPEN NEW STOCK ENTRY
  ========================================================= */

  const openNewStockEntry = () => {
    resetForm();
    setShowEntry(true);
  };

  /* =========================================================
     SAVE NEW STOCK ENTRY
  ========================================================= */

  const saveStockEntry = async (event) => {
    event.preventDefault();

    if (!form.product_id) {
      alert("Please select a product.");
      return;
    }

    if (
      !form.quantity_cases ||
      Number(form.quantity_cases) <= 0
    ) {
      alert("Please enter the number of cases.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API}/stock/entry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: Number(form.product_id),
          entry_type: "IN",
          quantity_cases: Number(form.quantity_cases),
          entry_date: form.entry_date,
          notes: form.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save stock."
        );
      }

      setShowEntry(false);
      resetForm();

      await loadAllStockData();

      alert("New stock added successfully.");
    } catch (error) {
      console.error("Save Stock Error:", error);

      alert(
        error.message ||
          "Unable to save stock entry."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     OPEN EDIT STOCK
  ========================================================= */

  const openEditStock = (entry) => {
    if (!entry) {
      return;
    }

    if (entry.entry_type !== "IN") {
      alert("Only manually added stock can be edited.");
      return;
    }

    if (entry.reference_type === "INVOICE") {
      alert(
        "Invoice-related stock entries cannot be edited."
      );
      return;
    }

    setEditingEntry(entry);

    setForm({
      product_id: String(entry.product_id || ""),
      quantity_cases: String(entry.quantity_cases || ""),
      entry_date: entry.entry_date || today,
      notes: entry.notes || "",
    });

    setShowEdit(true);
  };

  /* =========================================================
     UPDATE STOCK ENTRY
  ========================================================= */

  const updateStockEntry = async (event) => {
    event.preventDefault();

    if (!editingEntry) {
      return;
    }

    if (!form.product_id) {
      alert("Please select a product.");
      return;
    }

    if (
      !form.quantity_cases ||
      Number(form.quantity_cases) <= 0
    ) {
      alert("Please enter the number of cases.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API}/stock/entry/${editingEntry.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: Number(form.product_id),
            quantity_cases: Number(form.quantity_cases),
            entry_date: form.entry_date,
            notes: form.notes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update stock entry."
        );
      }

      setShowEdit(false);
      setEditingEntry(null);
      resetForm();

      await loadAllStockData();

      alert("Stock entry updated successfully.");
    } catch (error) {
      console.error("Update Stock Error:", error);

      alert(
        error.message ||
          "Unable to update stock entry."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DELETE STOCK ENTRY
  ========================================================= */

  const deleteStockEntry = async (entry) => {
    if (!entry) {
      return;
    }

    if (entry.entry_type !== "IN") {
      alert("Only manually added stock can be deleted.");
      return;
    }

    if (entry.reference_type === "INVOICE") {
      alert(
        "Invoice-related stock entries cannot be deleted."
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete this stock entry?\n\nProduct: ${
        entry.product_name
      }\nQuantity: ${
        entry.quantity_cases
      } cases\nDate: ${
        entry.entry_date
      }\n\nThis will reduce the available stock.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(
        `${API}/stock/entry/${entry.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete stock entry."
        );
      }

      await loadAllStockData();

      alert("Stock entry deleted successfully.");
    } catch (error) {
      console.error("Delete Stock Error:", error);

      alert(
        error.message ||
          "Unable to delete stock entry."
      );
    } finally {
      setDeleting(false);
    }
  };

  /* =========================================================
     CLOSE EDIT
  ========================================================= */

  const closeEdit = () => {
    if (saving) {
      return;
    }

    setShowEdit(false);
    setEditingEntry(null);
    resetForm();
  };

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    const date = new Date(`${dateValue}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================================================
     HISTORY TYPE
  ========================================================= */

  const getHistoryType = (entry) => {
    if (entry.reference_type === "INVOICE") {
      return "Invoice Sale";
    }

    if (entry.entry_type === "IN") {
      return "Stock Added";
    }

    if (entry.entry_type === "OUT") {
      return "Stock Out";
    }

    if (entry.entry_type === "ADJUSTMENT") {
      return "Adjustment";
    }

    if (entry.entry_type === "PRODUCTION") {
      return "Production";
    }

    return entry.entry_type || "-";
  };

  /* =========================================================
     CAN EDIT / DELETE
  ========================================================= */

  const canModifyEntry = (entry) => {
    return (
      entry.entry_type === "IN" &&
      entry.reference_type !== "INVOICE"
    );
  };

  return (
    <div className="stock-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="stock-header">
        <div>
          <div className="stock-breadcrumb">
            INVENTORY / STOCK
          </div>

          <h1>Stock Management</h1>

          <p>
            Simple view of your available stock.
          </p>
        </div>

        <button
          className="new-stock-button"
          onClick={openNewStockEntry}
        >
          + New Stock Entry
        </button>
      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="stock-summary">

        <div className="summary-card violet">
          <div className="summary-top">
            <div>
              <div className="summary-label">
                Total Bailley Stock
              </div>

              <div className="summary-value">
                {totalBailleyCases}
              </div>

              <div className="summary-note">
                Cases available
              </div>
            </div>

            <div className="summary-icon violet-icon">
              ◈
            </div>
          </div>
        </div>

        <div className="summary-card green">
          <div className="summary-top">
            <div>
              <div className="summary-label">
                Total Local Stock
              </div>

              <div className="summary-value">
                {totalLocalCases}
              </div>

              <div className="summary-note">
                Cases available
              </div>
            </div>

            <div className="summary-icon green-icon">
              ◉
            </div>
          </div>
        </div>

        <div className="summary-card blue">
          <div className="summary-top">
            <div>
              <div className="summary-label">
                Products
              </div>

              <div className="summary-value">
                {stock.length}
              </div>

              <div className="summary-note">
                Currently tracked
              </div>
            </div>

            <div className="summary-icon blue-icon">
              ▦
            </div>
          </div>
        </div>

      </div>

      {/* =====================================================
          BAILLEY STOCK
      ===================================================== */}

      <section className="stock-section">

        <div className="section-header">
          <div>
            <h2>Bailley Stock</h2>

            <p>
              Available branded stock
            </p>
          </div>

          <span className="brand-badge">
            BAILLEY
          </span>
        </div>

        {loading ? (
          <div className="loading">
            Loading stock...
          </div>
        ) : bailleyStock.length === 0 ? (
          <div className="empty-stock">
            No Bailley stock available.
          </div>
        ) : (
          <div className="product-grid">

            {bailleyStock.map((item) => (
              <div
                className="stock-product-card"
                key={item.id}
              >

                <div className="product-card-top">

                  <div className="product-icon">
                    💧
                  </div>

                  <span className="available-badge">
                    Available
                  </span>

                </div>

                <div className="product-name">
                  {item.product_name}
                </div>

                <div className="available-title">
                  Available Stock
                </div>

                <div className="available-number">
                  {item.current_stock}
                </div>

                <div className="available-unit">
                  Cases
                </div>

              </div>
            ))}

          </div>
        )}

      </section>

      {/* =====================================================
          LOCAL STOCK
      ===================================================== */}

      <section className="stock-section">

        <div className="section-header">
          <div>
            <h2>Local Stock</h2>

            <p>
              Separate local products
            </p>
          </div>

          <span className="local-badge">
            LOCAL
          </span>
        </div>

        {localStock.length === 0 ? (
          <div className="local-empty">

            <div className="local-empty-icon">
              🏪
            </div>

            <h3>
              No Local Stock Added
            </h3>

            <p>
              Local products will appear here separately
              from Bailley stock.
            </p>

          </div>
        ) : (
          <div className="product-grid">

            {localStock.map((item) => (
              <div
                className="stock-product-card local-card"
                key={item.id}
              >

                <div className="product-card-top">

                  <div className="product-icon local-product-icon">
                    📦
                  </div>

                  <span className="local-available-badge">
                    Available
                  </span>

                </div>

                <div className="product-name">
                  {item.product_name}
                </div>

                <div className="available-title">
                  Available Stock
                </div>

                <div className="available-number local-number">
                  {item.current_stock}
                </div>

                <div className="available-unit">
                  Cases
                </div>

              </div>
            ))}

          </div>
        )}

      </section>

      {/* =====================================================
          STOCK HISTORY
      ===================================================== */}

      <section className="stock-section history-section">

        <div className="section-header history-header">

          <div>
            <h2>
              Stock Entry History
            </h2>

            <p>
              View all stock additions and stock movements
            </p>
          </div>

          <span className="history-badge">
            {history.length} Entries
          </span>

        </div>

        {historyLoading ? (
          <div className="loading">
            Loading stock history...
          </div>
        ) : history.length === 0 ? (
          <div className="empty-history">

            <div className="empty-history-icon">
              📋
            </div>

            <h3>
              No Stock History
            </h3>

            <p>
              Stock entries will appear here after you
              add stock.
            </p>

          </div>
        ) : (
          <div className="history-table-wrapper">

            <table className="history-table">

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Group</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {history.map((entry) => {

                  const editable =
                    canModifyEntry(entry);

                  return (
                    <tr key={entry.id}>

                      <td>
                        <div className="history-date">
                          {formatDate(
                            entry.entry_date
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="history-product">
                          {entry.product_name}
                        </div>
                      </td>

                      <td>
                        <span
                          className={
                            entry.stock_group === "BAILLEY"
                              ? "history-group bailley-history"
                              : "history-group local-history"
                          }
                        >
                          {entry.stock_group}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            entry.reference_type === "INVOICE"
                              ? "history-type invoice-type"
                              : entry.entry_type === "IN"
                              ? "history-type in-type"
                              : "history-type other-type"
                          }
                        >
                          {getHistoryType(entry)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            entry.entry_type === "OUT"
                              ? "history-quantity out-quantity"
                              : "history-quantity"
                          }
                        >
                          {entry.entry_type === "OUT"
                            ? "-"
                            : "+"}
                          {entry.quantity_cases}
                        </span>

                        <span className="history-unit">
                          cases
                        </span>
                      </td>

                      <td>
                        <div className="history-notes">
                          {entry.notes
                            ? entry.notes
                            : "-"}
                        </div>
                      </td>

                      <td>

                        {editable ? (
                          <div className="history-actions">

                            <button
                              className="edit-stock-button"
                              onClick={() =>
                                openEditStock(entry)
                              }
                              disabled={deleting}
                              title="Edit stock entry"
                            >
                              ✏️ Edit
                            </button>

                            <button
                              className="delete-stock-button"
                              onClick={() =>
                                deleteStockEntry(entry)
                              }
                              disabled={deleting}
                              title="Delete stock entry"
                            >
                              🗑 Delete
                            </button>

                          </div>
                        ) : (
                          <span className="locked-entry">
                            🔒 Locked
                          </span>
                        )}

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* =====================================================
          NEW STOCK ENTRY MODAL
      ===================================================== */}

      {showEntry && (
        <div className="modal-overlay">

          <div className="stock-modal">

            <div className="modal-header">

              <div>
                <h2>
                  New Stock Entry
                </h2>

                <p>
                  Add newly received stock.
                </p>
              </div>

              <button
                className="close-button"
                onClick={() => {
                  if (!saving) {
                    setShowEntry(false);
                    resetForm();
                  }
                }}
              >
                ×
              </button>

            </div>

            <form
              className="stock-form"
              onSubmit={saveStockEntry}
            >

              <div className="form-group">

                <label>
                  Product
                </label>

                <select
                  name="product_id"
                  value={form.product_id}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select product
                  </option>

                  {products.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.product_name}
                    </option>
                  ))}

                </select>

              </div>

              <div className="form-group">

                <label>
                  Stock Date
                </label>

                <input
                  type="date"
                  name="entry_date"
                  value={form.entry_date}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Quantity in Cases
                </label>

                <input
                  type="number"
                  name="quantity_cases"
                  value={form.quantity_cases}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  placeholder="Enter number of cases"
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Optional note"
                ></textarea>

              </div>

              <div className="stock-entry-info">

                <div className="entry-info-icon">
                  +
                </div>

                <div>

                  <strong>
                    Stock will increase
                  </strong>

                  <span>
                    The entered cases will be added to
                    the product's available stock.
                  </span>

                </div>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    if (!saving) {
                      setShowEntry(false);
                      resetForm();
                    }
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Stock Entry"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          EDIT STOCK ENTRY MODAL
      ===================================================== */}

      {showEdit && editingEntry && (
        <div className="modal-overlay">

          <div className="stock-modal">

            <div className="modal-header">

              <div>
                <h2>
                  Edit Stock Entry
                </h2>

                <p>
                  Update the manually added stock entry.
                </p>
              </div>

              <button
                className="close-button"
                onClick={closeEdit}
                disabled={saving}
              >
                ×
              </button>

            </div>

            <form
              className="stock-form"
              onSubmit={updateStockEntry}
            >

              <div className="edit-warning-box">

                <div className="edit-warning-icon">
                  ✏️
                </div>

                <div>

                  <strong>
                    Editing Stock Entry
                  </strong>

                  <span>
                    Changes will automatically update the
                    available stock.
                  </span>

                </div>

              </div>

              <div className="form-group">

                <label>
                  Product
                </label>

                <select
                  name="product_id"
                  value={form.product_id}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select product
                  </option>

                  {products.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.product_name}
                    </option>
                  ))}

                </select>

              </div>

              <div className="form-group">

                <label>
                  Stock Date
                </label>

                <input
                  type="date"
                  name="entry_date"
                  value={form.entry_date}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Quantity in Cases
                </label>

                <input
                  type="number"
                  name="quantity_cases"
                  value={form.quantity_cases}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  placeholder="Enter number of cases"
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Optional note"
                ></textarea>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeEdit}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Updating..."
                    : "Update Stock Entry"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          COMPLETE STOCK CSS
      ===================================================== */}

      <style>{`

        .stock-page {
          min-height: 100%;
          background: #eef3f8;
          padding: 28px 30px 35px;
          box-sizing: border-box;
        }

        .stock-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .stock-breadcrumb {
          font-size: 10px;
          font-weight: 800;
          color: #8d78a8;
          letter-spacing: 0.12em;
          margin-bottom: 5px;
        }

        .stock-header h1 {
          margin: 0;
          color: #202033;
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .stock-header p {
          margin: 7px 0 0;
          color: #778196;
          font-size: 13px;
        }

        .new-stock-button {
          border: none;
          background: linear-gradient(
            135deg,
            #8a4fd8,
            #6d36b5
          );
          color: #ffffff;
          border-radius: 9px;
          padding: 12px 18px;
          font-size: 12px;
          font-weight: 800;
          box-shadow:
            0 8px 18px rgba(109, 54, 181, 0.22);
          cursor: pointer;
        }

        .new-stock-button:hover {
          transform: translateY(-1px);
        }

        .stock-summary {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 19px;
        }

        .summary-card {
          background: #fbfcfe;
          border: 1px solid #d9dfeb;
          border-radius: 13px;
          padding: 20px;
          box-shadow:
            0 4px 15px rgba(45, 40, 70, 0.045);
        }

        .summary-card.violet {
          border-top: 5px solid #7b43c4;
        }

        .summary-card.green {
          border-top: 5px solid #2aa86b;
        }

        .summary-card.blue {
          border-top: 5px solid #4285d4;
        }

        .summary-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .summary-label {
          color: #687486;
          font-size: 13px;
          font-weight: 700;
        }

        .summary-value {
          margin-top: 6px;
          font-size: 28px;
          font-weight: 900;
          color: #25283a;
        }

        .summary-note {
          margin-top: 5px;
          color: #939dad;
          font-size: 11px;
        }

        .summary-icon {
          width: 48px;
          height: 48px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 900;
        }

        .violet-icon {
          background: #f0e5ff;
          color: #7b43c4;
        }

        .green-icon {
          background: #e2f7eb;
          color: #2aa86b;
        }

        .blue-icon {
          background: #e5f0ff;
          color: #4285d4;
        }

        .stock-section {
          background: #fbfcfe;
          border: 1px solid #d9dfeb;
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 19px;
          box-shadow:
            0 4px 15px rgba(45, 40, 70, 0.045);
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          border-bottom: 1px solid #e6e9f0;
        }

        .section-header h2 {
          margin: 0;
          color: #25283a;
          font-size: 17px;
          font-weight: 850;
        }

        .section-header p {
          margin: 4px 0 0;
          color: #969fad;
          font-size: 10px;
        }

        .brand-badge {
          padding: 7px 11px;
          border-radius: 999px;
          background: #eee2ff;
          color: #7540bd;
          font-size: 10px;
          font-weight: 900;
        }

        .local-badge {
          padding: 7px 11px;
          border-radius: 999px;
          background: #e3f7ec;
          color: #25945d;
          font-size: 10px;
          font-weight: 900;
        }

        .history-badge {
          padding: 7px 11px;
          border-radius: 999px;
          background: #e5f0ff;
          color: #4285d4;
          font-size: 10px;
          font-weight: 900;
        }

        .product-grid {
          display: grid;
          grid-template-columns:
            repeat(5, minmax(0, 1fr));
          gap: 14px;
          padding: 20px;
        }

        .stock-product-card {
          background: #ffffff;
          border: 1px solid #e3d8f3;
          border-top: 4px solid #7b43c4;
          border-radius: 12px;
          padding: 17px;
          min-height: 180px;
          box-sizing: border-box;
          box-shadow:
            0 4px 12px rgba(92, 48, 145, 0.06);
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease;
        }

        .stock-product-card:hover {
          transform: translateY(-2px);
          box-shadow:
            0 8px 18px rgba(92, 48, 145, 0.10);
        }

        .local-card {
          border-color: #d9ece1;
          border-top-color: #2aa86b;
        }

        .product-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .product-icon {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          background: #f0e5ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
        }

        .local-product-icon {
          background: #e3f7ec;
        }

        .available-badge {
          padding: 5px 8px;
          border-radius: 999px;
          background: #eee2ff;
          color: #7641bc;
          font-size: 8px;
          font-weight: 900;
        }

        .local-available-badge {
          padding: 5px 8px;
          border-radius: 999px;
          background: #e3f7ec;
          color: #23925a;
          font-size: 8px;
          font-weight: 900;
        }

        .product-name {
          margin-top: 17px;
          color: #292b3c;
          font-size: 14px;
          font-weight: 850;
        }

        .available-title {
          margin-top: 15px;
          color: #8c95a4;
          font-size: 10px;
          font-weight: 700;
        }

        .available-number {
          margin-top: 3px;
          color: #7139ba;
          font-size: 29px;
          line-height: 1.05;
          font-weight: 900;
        }

        .local-number {
          color: #22945a;
        }

        .available-unit {
          margin-top: 3px;
          color: #8c95a4;
          font-size: 10px;
          font-weight: 700;
        }

        .loading,
        .empty-stock {
          padding: 45px;
          text-align: center;
          color: #929baa;
          font-size: 12px;
        }

        .local-empty {
          min-height: 210px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 25px;
        }

        .local-empty-icon {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          background: #e3f7ec;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 10px;
        }

        .local-empty h3 {
          margin: 0;
          color: #2b303d;
          font-size: 14px;
        }

        .local-empty p {
          max-width: 340px;
          margin: 6px 0 0;
          color: #929baa;
          font-size: 10px;
          line-height: 1.5;
        }

        .history-section {
          margin-top: 19px;
        }

        .history-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .history-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 950px;
        }

        .history-table th {
          background: #f5f7fa;
          color: #6d7686;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          text-align: left;
          padding: 13px 15px;
          border-bottom: 1px solid #e1e5ec;
          white-space: nowrap;
        }

        .history-table td {
          padding: 14px 15px;
          border-bottom: 1px solid #edf0f4;
          color: #34394a;
          font-size: 10px;
          vertical-align: middle;
        }

        .history-table tbody tr:hover {
          background: #fafbfe;
        }

        .history-table tbody tr:last-child td {
          border-bottom: none;
        }

        .history-date {
          color: #606a7a;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        .history-product {
          color: #292d3e;
          font-size: 11px;
          font-weight: 850;
          min-width: 130px;
        }

        .history-group {
          display: inline-block;
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 900;
        }

        .bailley-history {
          background: #eee2ff;
          color: #7540bd;
        }

        .local-history {
          background: #e3f7ec;
          color: #25945d;
        }

        .history-type {
          display: inline-block;
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 900;
          white-space: nowrap;
        }

        .in-type {
          background: #e3f7ec;
          color: #23925a;
        }

        .invoice-type {
          background: #e5f0ff;
          color: #3979c8;
        }

        .other-type {
          background: #f1edf6;
          color: #6f667a;
        }

        .history-quantity {
          color: #23925a;
          font-size: 12px;
          font-weight: 900;
        }

        .out-quantity {
          color: #c44343;
        }

        .history-unit {
          margin-left: 4px;
          color: #929baa;
          font-size: 8px;
          font-weight: 700;
        }

        .history-notes {
          max-width: 180px;
          color: #777f8e;
          font-size: 9px;
          line-height: 1.4;
        }

        .history-actions {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .edit-stock-button,
        .delete-stock-button {
          border: none;
          border-radius: 7px;
          padding: 7px 9px;
          font-size: 9px;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
        }

        .edit-stock-button {
          background: #eee2ff;
          color: #6d36b5;
        }

        .edit-stock-button:hover {
          background: #e4d2fb;
        }

        .delete-stock-button {
          background: #ffe8e8;
          color: #c44343;
        }

        .delete-stock-button:hover {
          background: #ffd9d9;
        }

        .edit-stock-button:disabled,
        .delete-stock-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .locked-entry {
          color: #9aa2af;
          font-size: 9px;
          font-weight: 800;
          white-space: nowrap;
        }

        .empty-history {
          min-height: 190px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 25px;
        }

        .empty-history-icon {
          width: 52px;
          height: 52px;
          border-radius: 13px;
          background: #e5f0ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 23px;
          margin-bottom: 10px;
        }

        .empty-history h3 {
          margin: 0;
          color: #2b303d;
          font-size: 14px;
        }

        .empty-history p {
          margin: 6px 0 0;
          color: #929baa;
          font-size: 10px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(19, 15, 30, 0.58);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 1000;
        }

        .stock-modal {
          width: 100%;
          max-width: 540px;
          max-height: 92vh;
          overflow-y: auto;
          background: #fbfcfe;
          border-radius: 15px;
          border: 1px solid #ded5eb;
          box-shadow:
            0 25px 70px rgba(32, 18, 55, 0.28);
          overflow-x: hidden;
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px 21px;
          border-bottom: 1px solid #e6e0ee;
        }

        .modal-header h2 {
          margin: 0;
          color: #28233a;
          font-size: 18px;
          font-weight: 850;
        }

        .modal-header p {
          margin: 5px 0 0;
          color: #9290a0;
          font-size: 10px;
        }

        .close-button {
          width: 34px;
          height: 34px;
          border: none;
          border-radius: 8px;
          background: #f1edf6;
          color: #6f667a;
          font-size: 21px;
          cursor: pointer;
        }

        .close-button:hover {
          background: #e8e1ef;
        }

        .close-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .stock-form {
          padding: 21px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 7px;
          color: #524a5e;
          font-size: 11px;
          font-weight: 800;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 11px 12px;
          border: 1px solid #d4ccdf;
          border-radius: 8px;
          background: #ffffff;
          color: #29233a;
          font-size: 11px;
          font-family: inherit;
          box-sizing: border-box;
          outline: none;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: #8a4fd8;
          box-shadow:
            0 0 0 3px rgba(138, 79, 216, 0.08);
        }

        .form-group textarea {
          resize: vertical;
        }

        .stock-entry-info {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f3eaff;
          border: 1px solid #e2d3f6;
          border-radius: 10px;
          padding: 11px 12px;
          margin-bottom: 18px;
        }

        .entry-info-icon {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          border-radius: 9px;
          background: #e4d2fb;
          color: #7139ba;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 900;
        }

        .stock-entry-info strong {
          display: block;
          color: #7139ba;
          font-size: 10px;
        }

        .stock-entry-info span {
          display: block;
          margin-top: 3px;
          color: #847796;
          font-size: 9px;
          line-height: 1.4;
        }

        .edit-warning-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff6df;
          border: 1px solid #f2dfaa;
          border-radius: 10px;
          padding: 11px 12px;
          margin-bottom: 18px;
        }

        .edit-warning-icon {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          border-radius: 9px;
          background: #ffe8a8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .edit-warning-box strong {
          display: block;
          color: #9b7018;
          font-size: 10px;
        }

        .edit-warning-box span {
          display: block;
          margin-top: 3px;
          color: #9b8860;
          font-size: 9px;
          line-height: 1.4;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .cancel-button {
          border: 1px solid #d3cddd;
          background: #ffffff;
          color: #5a5265;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
        }

        .cancel-button:hover {
          background: #f6f3f8;
        }

        .cancel-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .save-button {
          border: none;
          background: linear-gradient(
            135deg,
            #8a4fd8,
            #6d36b5
          );
          color: #ffffff;
          border-radius: 8px;
          padding: 10px 15px;
          font-size: 10px;
          font-weight: 800;
          box-shadow:
            0 6px 14px rgba(109, 54, 181, 0.18);
          cursor: pointer;
        }

        .save-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 1150px) {
          .product-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 850px) {
          .stock-summary {
            grid-template-columns: 1fr;
          }

          .stock-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .product-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .stock-page {
            padding: 20px 15px;
          }

          .product-grid {
            grid-template-columns: 1fr;
          }

          .new-stock-button {
            width: 100%;
          }

          .history-actions {
            flex-direction: column;
            align-items: stretch;
          }
        }

      `}</style>

    </div>
  );
}

export default Stock;