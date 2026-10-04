import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:5000/api";

function emptyItem() {
  return {
    product_id: "",
    quantity_cases: "",
    rate: "",
  };
}

export default function Invoices() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    customer_id: "",
    invoice_date: new Date().toISOString().slice(0, 10),
    amount_paid: "0",
    payment_method: "CASH",
    notes: "",
  });

  const [items, setItems] = useState([emptyItem()]);

  const [editForm, setEditForm] = useState({
    id: "",
    invoice_no: "",
    customer_id: "",
    invoice_date: "",
    amount_paid: "0",
    payment_method: "CASH",
    notes: "",
  });

  const [editItems, setEditItems] = useState([emptyItem()]);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    await Promise.all([
      loadCustomers(),
      loadProducts(),
      loadInvoices(),
    ]);
  }

  async function loadCustomers() {
    try {
      const response = await fetch(`${API}/customers`);
      const data = await response.json();

      setCustomers(
        Array.isArray(data)
          ? data.filter(Boolean)
          : []
      );
    } catch (error) {
      console.error("Customers Error:", error);
      setCustomers([]);
    }
  }

  async function loadProducts() {
    try {
      const response = await fetch(`${API}/products`);
      const data = await response.json();

      setProducts(
        Array.isArray(data)
          ? data.filter(Boolean)
          : []
      );
    } catch (error) {
      console.error("Products Error:", error);
      setProducts([]);
    }
  }

  async function loadInvoices() {
    try {
      const response = await fetch(`${API}/invoices`);
      const data = await response.json();

      setInvoices(
        Array.isArray(data)
          ? data.filter(Boolean)
          : []
      );
    } catch (error) {
      console.error("Invoices Error:", error);
      setInvoices([]);
    }
  }

  function resetNewInvoice() {
    setForm({
      customer_id: "",
      invoice_date: new Date()
        .toISOString()
        .slice(0, 10),
      amount_paid: "0",
      payment_method: "CASH",
      notes: "",
    });

    setItems([emptyItem()]);
  }

  function openNewInvoice() {
    setSuccessMessage("");
    setErrorMessage("");
    resetNewInvoice();
    setShowModal(true);
  }

  function closeNewInvoice() {
    setShowModal(false);
    setErrorMessage("");
    resetNewInvoice();
  }

  function updateItem(index, field, value) {
    setItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function addItem() {
    setItems((previous) => [
      ...previous,
      emptyItem(),
    ]);
  }

  function removeItem(index) {
    if (items.length === 1) {
      return;
    }

    setItems((previous) =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  }

  function resetEditInvoice() {
    setEditForm({
      id: "",
      invoice_no: "",
      customer_id: "",
      invoice_date: "",
      amount_paid: "0",
      payment_method: "CASH",
      notes: "",
    });

    setEditItems([emptyItem()]);
  }

  function closeEditInvoice() {
    setShowEditModal(false);
    setErrorMessage("");
    resetEditInvoice();
  }

  function updateEditItem(
    index,
    field,
    value
  ) {
    setEditItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function addEditItem() {
    setEditItems((previous) => [
      ...previous,
      emptyItem(),
    ]);
  }

  function removeEditItem(index) {
    if (editItems.length === 1) {
      return;
    }

    setEditItems((previous) =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  }

  const newSubtotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total +
        Number(
          item.quantity_cases || 0
        ) *
          Number(item.rate || 0),
      0
    );
  }, [items]);

  const newBalance = Math.max(
    0,
    newSubtotal -
      Number(form.amount_paid || 0)
  );

  const editSubtotal = useMemo(() => {
    return editItems.reduce(
      (total, item) =>
        total +
        Number(
          item.quantity_cases || 0
        ) *
          Number(item.rate || 0),
      0
    );
  }, [editItems]);

  const editBalance = Math.max(
    0,
    editSubtotal -
      Number(
        editForm.amount_paid || 0
      )
  );

  function validateItems(
    invoiceItems
  ) {
    const usableItems =
      invoiceItems.filter(
        (item) =>
          item &&
          item.product_id &&
          Number(
            item.quantity_cases
          ) > 0 &&
          Number(item.rate) > 0
      );

    if (usableItems.length === 0) {
      return {
        valid: false,
        message:
          "Please add at least one product, quantity and rate.",
        items: [],
      };
    }

    const seenProducts =
      new Set();

    for (const item of usableItems) {
      const productId =
        String(item.product_id);

      if (
        seenProducts.has(
          productId
        )
      ) {
        return {
          valid: false,
          message:
            "The same product cannot be added twice. Combine its quantity in one row.",
          items: [],
        };
      }

      seenProducts.add(productId);
    }

    return {
      valid: true,
      message: "",
      items: usableItems,
    };
  }

  async function saveInvoice(event) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!form.customer_id) {
      setErrorMessage(
        "Please select a customer."
      );
      return;
    }

    const validation =
      validateItems(items);

    if (!validation.valid) {
      setErrorMessage(
        validation.message
      );
      return;
    }

    const paid = Number(
      form.amount_paid || 0
    );

    if (paid < 0) {
      setErrorMessage(
        "Amount paid cannot be negative."
      );
      return;
    }

    if (paid > newSubtotal) {
      setErrorMessage(
        "Amount paid cannot be greater than invoice total."
      );
      return;
    }

    try {
      const response =
        await fetch(`${API}/invoices`, {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            customer_id:
              Number(
                form.customer_id
              ),

            invoice_date:
              form.invoice_date,

            items:
              validation.items.map(
                (item) => ({
                  product_id:
                    Number(
                      item.product_id
                    ),
                  quantity_cases:
                    Number(
                      item.quantity_cases
                    ),
                  rate:
                    Number(
                      item.rate
                    ),
                })
              ),

            discount: 0,

            amount_paid:
              paid,

            payment_method:
              form.payment_method,

            notes:
              form.notes,
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {
        setErrorMessage(
          data.message ||
            "Invoice could not be saved."
        );
        return;
      }

      setShowModal(false);
      resetNewInvoice();

      setSuccessMessage(
        `${
          data.invoice_no ||
          "Invoice"
        } saved successfully.`
      );

      await loadInvoices();
    } catch (error) {
      console.error(
        "Create Invoice Error:",
        error
      );

      setErrorMessage(
        "Unable to connect to the backend. Please check Window 1."
      );
    }
  }

  async function openEditInvoice(
    invoiceId
  ) {
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response =
        await fetch(
          `${API}/invoices/${invoiceId}`
        );

      const invoice =
        await response.json();

      if (!response.ok) {
        setErrorMessage(
          invoice.message ||
            "Unable to load invoice."
        );
        return;
      }

      const loadedItems =
        Array.isArray(
          invoice.items
        ) &&
        invoice.items.length > 0
          ? invoice.items.map(
              (item) => ({
                product_id:
                  item.product_id !=
                  null
                    ? String(
                        item.product_id
                      )
                    : "",

                quantity_cases:
                  item.quantity_cases !=
                  null
                    ? String(
                        item.quantity_cases
                      )
                    : "",

                rate:
                  item.rate != null
                    ? String(
                        item.rate
                      )
                    : "",
              })
            )
          : [emptyItem()];

      setEditForm({
        id: invoice.id,

        invoice_no:
          invoice.invoice_no ||
          "",

        customer_id:
          invoice.customer_id !=
          null
            ? String(
                invoice.customer_id
              )
            : "",

        invoice_date:
          invoice.invoice_date ||
          "",

        amount_paid:
          invoice.amount_paid !=
          null
            ? String(
                invoice.amount_paid
              )
            : "0",

        payment_method:
          invoice.payment_method ||
          "CASH",

        notes:
          invoice.notes || "",
      });

      setEditItems(
        loadedItems
      );

      setShowEditModal(
        true
      );
    } catch (error) {
      console.error(
        "Load Edit Invoice Error:",
        error
      );

      setErrorMessage(
        "Unable to load invoice details."
      );
    }
  }

  async function saveEditedInvoice(
    event
  ) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!editForm.id) {
      setErrorMessage(
        "Invoice ID is missing."
      );
      return;
    }

    if (!editForm.customer_id) {
      setErrorMessage(
        "Please select a customer."
      );
      return;
    }

    const validation =
      validateItems(
        editItems
      );

    if (!validation.valid) {
      setErrorMessage(
        validation.message
      );
      return;
    }

    const paid = Number(
      editForm.amount_paid || 0
    );

    if (paid < 0) {
      setErrorMessage(
        "Amount paid cannot be negative."
      );
      return;
    }

    if (paid > editSubtotal) {
      setErrorMessage(
        "Amount paid cannot be greater than invoice total."
      );
      return;
    }

    try {
      const response =
        await fetch(
          `${API}/invoices/${editForm.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              customer_id:
                Number(
                  editForm.customer_id
                ),

              invoice_date:
                editForm.invoice_date,

              items:
                validation.items.map(
                  (item) => ({
                    product_id:
                      Number(
                        item.product_id
                      ),

                    quantity_cases:
                      Number(
                        item.quantity_cases
                      ),

                    rate:
                      Number(
                        item.rate
                      ),
                  })
                ),

              discount: 0,

              amount_paid:
                paid,

              payment_method:
                editForm.payment_method,

              notes:
                editForm.notes,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setErrorMessage(
          data.message ||
            "Invoice could not be updated."
        );
        return;
      }

      setShowEditModal(
        false
      );

      resetEditInvoice();

      setSuccessMessage(
        `${
          data.invoice_no ||
          "Invoice"
        } updated successfully.`
      );

      await loadInvoices();
    } catch (error) {
      console.error(
        "Edit Invoice Error:",
        error
      );

      setErrorMessage(
        "Unable to connect to the backend."
      );
    }
  }

  async function deleteInvoice(
    invoiceId,
    invoiceNo
  ) {
    const confirmed =
      window.confirm(
        `Delete ${
          invoiceNo ||
          "this invoice"
        }?\n\nThe sold stock will be restored and payments linked to this invoice will be removed.`
      );

    if (!confirmed) {
      return;
    }

    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response =
        await fetch(
          `${API}/invoices/${invoiceId}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setErrorMessage(
          data.message ||
            "Invoice could not be deleted."
        );
        return;
      }

      setSuccessMessage(
        `${
          data.invoice_no ||
          invoiceNo ||
          "Invoice"
        } deleted successfully.`
      );

      await loadInvoices();
    } catch (error) {
      console.error(
        "Delete Invoice Error:",
        error
      );

      setErrorMessage(
        "Unable to connect to the backend. Please check Window 1."
      );
    }
  }

  async function printInvoice(
    invoiceId
  ) {
    try {
      const response =
        await fetch(
          `${API}/invoices/${invoiceId}`
        );

      const invoice =
        await response.json();

      if (!response.ok) {
        setErrorMessage(
          invoice.message ||
            "Unable to load invoice."
        );
        return;
      }

      openPrintWindow(
        invoice
      );
    } catch (error) {
      console.error(
        "Print Invoice Error:",
        error
      );

      setErrorMessage(
        "Unable to print bill."
      );
    }
  }

  function openPrintWindow(
    invoice
  ) {
    const invoiceItems =
      Array.isArray(
        invoice.items
      )
        ? invoice.items
        : [];

    const rows =
      invoiceItems
        .map(function (item) {
          return (
            "<tr>" +
            "<td>" +
            escapeHtml(
              item.product_name ||
                "-"
            ) +
            "</td>" +
            "<td class='center'>" +
            Number(
              item.quantity_cases ||
                0
            ) +
            "</td>" +
            "<td class='right'>₹" +
            Number(
              item.rate || 0
            ).toFixed(2) +
            "</td>" +
            "<td class='right bold'>₹" +
            Number(
              item.amount || 0
            ).toFixed(2) +
            "</td>" +
            "</tr>"
          );
        })
        .join("");

    const grandTotal =
      Number(
        invoice.grand_total ||
          0
      );

    const amountPaid =
      Number(
        invoice.amount_paid ||
          0
      );

    const balance =
      Math.max(
        0,
        grandTotal -
          amountPaid
      );

    const customerName =
      invoice.customer_name ||
      "-";

    const customerMobile =
      invoice.customer_mobile ||
      "";

    const customerAddress =
      invoice.customer_address ||
      "";

    /*
      Important:
      The print window is a new window.
      Therefore we use the current frontend origin
      so the logo loads correctly.
    */
    const logoUrl =
      `${window.location.origin}/Shri%20enterprises%20Logo.jpg`;

    const amountInWords =
      numberToWordsIndian(
        grandTotal
      );

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=900,height=800"
      );

    if (!printWindow) {
      setErrorMessage(
        "Please allow pop-ups to print the bill."
      );
      return;
    }

    const billHtml =
      "<!DOCTYPE html>" +
      "<html>" +
      "<head>" +
      "<meta charset='UTF-8'>" +

      "<title>" +
      escapeHtml(
        invoice.invoice_no ||
          "BILL"
      ) +
      "</title>" +

      "<style>" +

      "*{box-sizing:border-box;}" +

      "body{" +
      "margin:0;" +
      "padding:20px;" +
      "font-family:Arial,Helvetica,sans-serif;" +
      "color:#171717;" +
      "background:#fff;" +
      "}" +

      ".bill{" +
      "max-width:850px;" +
      "margin:0 auto;" +
      "padding:28px;" +
      "border:1px solid #d7d7d7;" +
      "background:#fff;" +
      "}" +

      ".top{" +
      "display:flex;" +
      "align-items:center;" +
      "justify-content:space-between;" +
      "gap:18px;" +
      "border-bottom:3px solid #111;" +
      "padding-bottom:18px;" +
      "}" +

      ".logo-wrap{" +
      "width:150px;" +
      "min-width:150px;" +
      "display:flex;" +
      "align-items:center;" +
      "justify-content:flex-start;" +
      "}" +

      ".logo{" +
      "width:150px;" +
      "height:auto;" +
      "max-height:90px;" +
      "object-fit:contain;" +
      "display:block;" +
      "}" +

      ".business{" +
      "flex:1;" +
      "text-align:center;" +
      "padding:0 8px;" +
      "}" +

      ".business-name{" +
      "font-size:28px;" +
      "font-weight:800;" +
      "line-height:1.2;" +
      "white-space:nowrap;" +
      "}" +

      ".business-subtitle{" +
      "font-size:14px;" +
      "margin-top:6px;" +
      "color:#555;" +
      "}" +

      ".bill-title{" +
      "font-size:27px;" +
      "font-weight:900;" +
      "letter-spacing:2px;" +
      "margin-top:13px;" +
      "}" +

      ".bill-number{" +
      "width:120px;" +
      "min-width:120px;" +
      "text-align:right;" +
      "font-size:13px;" +
      "line-height:1.6;" +
      "}" +

      ".info{" +
      "display:flex;" +
      "justify-content:space-between;" +
      "gap:20px;" +
      "margin-top:20px;" +
      "margin-bottom:20px;" +
      "font-size:14px;" +
      "}" +

      ".bill-to{" +
      "border:1px solid #cfcfcf;" +
      "padding:15px;" +
      "margin-bottom:22px;" +
      "}" +

      ".bill-to-title{" +
      "font-size:13px;" +
      "font-weight:900;" +
      "letter-spacing:1px;" +
      "margin-bottom:8px;" +
      "}" +

      ".customer-name{" +
      "font-size:18px;" +
      "font-weight:800;" +
      "margin-bottom:5px;" +
      "}" +

      ".customer-detail{" +
      "font-size:13px;" +
      "line-height:1.5;" +
      "color:#333;" +
      "}" +

      "table{" +
      "width:100%;" +
      "border-collapse:collapse;" +
      "}" +

      "th{" +
      "border:1px solid #999;" +
      "background:#f1f1f1;" +
      "padding:11px 9px;" +
      "font-size:13px;" +
      "font-weight:800;" +
      "}" +

      "td{" +
      "border:1px solid #bdbdbd;" +
      "padding:11px 9px;" +
      "font-size:13px;" +
      "}" +

      ".center{text-align:center;}" +
      ".right{text-align:right;}" +
      ".bold{font-weight:800;}" +

      ".summary{" +
      "width:340px;" +
      "margin-left:auto;" +
      "margin-top:18px;" +
      "}" +

      ".summary-row{" +
      "display:flex;" +
      "justify-content:space-between;" +
      "padding:6px 0;" +
      "font-size:13px;" +
      "}" +

      ".grand{" +
      "border-top:2px solid #111;" +
      "margin-top:4px;" +
      "padding-top:9px;" +
      "font-size:17px;" +
      "font-weight:900;" +
      "}" +

      ".paid{" +
      "color:#166534;" +
      "font-weight:800;" +
      "}" +

      ".due{" +
      "color:#b42318;" +
      "font-weight:800;" +
      "}" +

      ".words{" +
      "margin-top:20px;" +
      "border:1px solid #d0d0d0;" +
      "padding:12px 13px;" +
      "font-size:13px;" +
      "line-height:1.5;" +
      "}" +

      ".payment{" +
      "margin-top:13px;" +
      "border:1px solid #d0d0d0;" +
      "padding:12px 13px;" +
      "font-size:13px;" +
      "}" +

      ".notes{" +
      "margin-top:13px;" +
      "border:1px solid #d0d0d0;" +
      "padding:12px 13px;" +
      "font-size:13px;" +
      "line-height:1.5;" +
      "}" +

      ".footer{" +
      "margin-top:30px;" +
      "padding-top:15px;" +
      "border-top:1px solid #bdbdbd;" +
      "text-align:center;" +
      "color:#444;" +
      "}" +

      ".thanks{" +
      "font-size:14px;" +
      "font-weight:800;" +
      "margin-bottom:10px;" +
      "}" +

      ".office-name{" +
      "font-size:13px;" +
      "font-weight:800;" +
      "}" +

      ".office-address{" +
      "font-size:12px;" +
      "margin-top:4px;" +
      "}" +

      ".office-contact{" +
      "font-size:12px;" +
      "margin-top:4px;" +
      "}" +

      "@media print{" +
      "@page{size:A4;margin:10mm;}" +
      "body{padding:0;}" +
      ".bill{" +
      "border:none;" +
      "max-width:none;" +
      "padding:0;" +
      "}" +
      "}" +

      "</style>" +

      "</head>" +

      "<body>" +

      "<div class='bill'>" +

      "<div class='top'>" +

      "<div class='logo-wrap'>" +

      "<img class='logo' src='" +
      escapeHtml(
        logoUrl
      ) +
      "' alt='Shri Enterprises &amp; Beverages Logo' />" +

      "</div>" +

      "<div class='business'>" +

      "<div class='business-name'>" +
      "Shri Enterprises &amp; Beverages" +
      "</div>" +

      "<div class='business-subtitle'>" +
      "Water Bottle Supply &amp; Manufacturing" +
      "</div>" +

      "<div class='bill-title'>" +
      "BILL" +
      "</div>" +

      "</div>" +

      "<div class='bill-number'>" +

      "<div><strong>Bill No.</strong></div>" +

      "<div>" +
      escapeHtml(
        invoice.invoice_no ||
          "-"
      ) +
      "</div>" +

      "</div>" +

      "</div>" +

      "<div class='info'>" +

      "<div>" +
      "<strong>Bill Date:</strong> " +
      escapeHtml(
        invoice.invoice_date ||
          "-"
      ) +
      "</div>" +

      "<div>" +
      "<strong>Payment:</strong> " +
      escapeHtml(
        invoice.payment_method ||
          "-"
      ) +
      "</div>" +

      "</div>" +

      "<div class='bill-to'>" +

      "<div class='bill-to-title'>" +
      "BILL TO" +
      "</div>" +

      "<div class='customer-name'>" +
      escapeHtml(
        customerName
      ) +
      "</div>" +

      (customerMobile
        ? "<div class='customer-detail'><strong>Mobile:</strong> " +
          escapeHtml(
            customerMobile
          ) +
          "</div>"
        : "") +

      (customerAddress
        ? "<div class='customer-detail'><strong>Address:</strong> " +
          escapeHtml(
            customerAddress
          ) +
          "</div>"
        : "") +

      "</div>" +

      "<table>" +

      "<thead>" +

      "<tr>" +

      "<th style='text-align:left;'>" +
      "Product" +
      "</th>" +

      "<th style='text-align:center;width:90px;'>" +
      "Cases" +
      "</th>" +

      "<th style='text-align:right;width:135px;'>" +
      "Rate / Case" +
      "</th>" +

      "<th style='text-align:right;width:150px;'>" +
      "Amount" +
      "</th>" +

      "</tr>" +

      "</thead>" +

      "<tbody>" +

      (rows ||
        "<tr>" +
        "<td colspan='4' style='text-align:center;'>No products</td>" +
        "</tr>") +

      "</tbody>" +

      "</table>" +

      "<div class='summary'>" +

      "<div class='summary-row'>" +
      "<span>Subtotal</span>" +
      "<strong>₹" +
      grandTotal.toFixed(2) +
      "</strong>" +
      "</div>" +

      "<div class='summary-row grand'>" +
      "<span>Grand Total</span>" +
      "<strong>₹" +
      grandTotal.toFixed(2) +
      "</strong>" +
      "</div>" +

      "<div class='summary-row paid'>" +
      "<span>Amount Paid</span>" +
      "<strong>₹" +
      amountPaid.toFixed(2) +
      "</strong>" +
      "</div>" +

      "<div class='summary-row due'>" +
      "<span>Balance Due</span>" +
      "<strong>₹" +
      balance.toFixed(2) +
      "</strong>" +
      "</div>" +

      "</div>" +

      "<div class='words'>" +

      "<strong>Amount Chargeable (in Words):</strong> " +

      escapeHtml(
        amountInWords
      ) +

      "</div>" +

      "<div class='payment'>" +

      "<strong>Payment Method:</strong> " +

      escapeHtml(
        invoice.payment_method ||
          "-"
      ) +

      "</div>" +

      (invoice.notes
        ? "<div class='notes'>" +
          "<strong>Notes:</strong><br />" +
          escapeHtml(
            invoice.notes
          ) +
          "</div>"
        : "") +

      "<div class='footer'>" +

      "<div class='thanks'>" +
      "Thanks for doing business with Shri Enterprises" +
      "</div>" +

      "<div class='office-name'>" +
      "Shri Enterprises &amp; Beverages" +
      "</div>" +

      "<div class='office-address'>" +
      "Near Sawata Maidan, Old Town, Badnera, Amravati" +
      "</div>" +

      "<div class='office-contact'>" +
      "Contact No: 7499061059 | 7020676887" +
      "</div>" +

      "</div>" +

      "</div>" +

      "<script>" +
      "window.onload=function(){setTimeout(function(){window.print();},300);};" +
      "</script>" +

      "</body>" +

      "</html>";

    printWindow.document.open();
    printWindow.document.write(
      billHtml
    );
    printWindow.document.close();
  }

  function numberToWordsIndian(
    number
  ) {
    const value =
      Number(number || 0);

    if (
      !Number.isFinite(value)
    ) {
      return "Zero Rupees Only";
    }

    const rounded =
      Math.round(
        value * 100
      ) / 100;

    const rupees =
      Math.floor(
        rounded
      );

    const paise =
      Math.round(
        (rounded -
          rupees) *
          100
      );

    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];

    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    function twoDigits(
      num
    ) {
      if (num < 20) {
        return ones[num];
      }

      const ten =
        Math.floor(
          num / 10
        );

      const one =
        num % 10;

      return (
        tens[ten] +
        (one
          ? " " +
            ones[one]
          : "")
      );
    }

    function threeDigits(
      num
    ) {
      const hundred =
        Math.floor(
          num / 100
        );

      const remainder =
        num % 100;

      let result = "";

      if (hundred) {
        result =
          ones[hundred] +
          " Hundred";
      }

      if (remainder) {
        result +=
          (result
            ? " "
            : "") +
          twoDigits(
            remainder
          );
      }

      return result;
    }

    function convert(
      num
    ) {
      if (num === 0) {
        return "Zero";
      }

      let result = "";

      const crore =
        Math.floor(
          num / 10000000
        );

      num %= 10000000;

      const lakh =
        Math.floor(
          num / 100000
        );

      num %= 100000;

      const thousand =
        Math.floor(
          num / 1000
        );

      num %= 1000;

      const remainder =
        num;

      if (crore) {
        result +=
          threeDigits(
            crore
          ) +
          " Crore";
      }

      if (lakh) {
        result +=
          (result
            ? " "
            : "") +
          threeDigits(
            lakh
          ) +
          " Lakh";
      }

      if (thousand) {
        result +=
          (result
            ? " "
            : "") +
          threeDigits(
            thousand
          ) +
          " Thousand";
      }

      if (remainder) {
        result +=
          (result
            ? " "
            : "") +
          threeDigits(
            remainder
          );
      }

      return result;
    }

    let result =
      convert(rupees) +
      " Rupees";

    if (paise > 0) {
      result +=
        " and " +
        twoDigits(
          paise
        ) +
        " Paise";
    }

    result +=
      " Only";

    return result;
  }

  function escapeHtml(
    value
  ) {
    return String(
      value ?? ""
    )
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );
  }

  const sortedInvoices =
    [...invoices].sort(
      (a, b) =>
        Number(
          b?.id || 0
        ) -
        Number(
          a?.id || 0
        )
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
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          gap: "16px",
          flexWrap:
            "wrap",
          marginBottom:
            "24px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize:
                "30px",
              fontWeight: 800,
              color:
                "#202124",
            }}
          >
            Invoices
          </h1>

          <p
            style={{
              margin:
                "7px 0 0",
              color:
                "#6b7280",
              fontSize:
                "15px",
            }}
          >
            Create multi-product
            customer bills
          </p>
        </div>

        <button
          onClick={
            openNewInvoice
          }
          style={{
            border:
              "none",
            background:
              "#6d28d9",
            color:
              "#fff",
            padding:
              "13px 20px",
            borderRadius:
              "9px",
            fontSize:
              "15px",
            fontWeight:
              700,
            cursor:
              "pointer",
          }}
        >
          + New Bill
        </button>
      </div>

      {successMessage && (
        <div
          style={{
            background:
              "#dcfce7",
            color:
              "#166534",
            border:
              "1px solid #bbf7d0",
            padding:
              "13px 16px",
            borderRadius:
              "9px",
            marginBottom:
              "20px",
            fontSize:
              "14px",
            fontWeight:
              600,
          }}
        >
          ✓ {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            background:
              "#fee2e2",
            color:
              "#991b1b",
            border:
              "1px solid #fecaca",
            padding:
              "13px 16px",
            borderRadius:
              "9px",
            marginBottom:
              "20px",
            fontSize:
              "14px",
            fontWeight:
              600,
          }}
        >
          {errorMessage}
        </div>
      )}

      <div
        style={{
          display:
            "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(210px, 1fr))",
          gap:
            "18px",
          marginBottom:
            "28px",
        }}
      >
        <SummaryCard
          title="Total Bills"
          value={
            sortedInvoices.length
          }
          background="#ede9fe"
          color="#6d28d9"
          money={false}
        />

        <SummaryCard
          title="Total Sales"
          value={sortedInvoices.reduce(
            (sum, invoice) =>
              sum +
              Number(
                invoice?.grand_total ||
                  0
              ),
            0
          )}
          background="#dcfce7"
          color="#166534"
        />

        <SummaryCard
          title="Amount Received"
          value={sortedInvoices.reduce(
            (sum, invoice) =>
              sum +
              Number(
                invoice?.amount_paid ||
                  0
              ),
            0
          )}
          background="#dbeafe"
          color="#1d4ed8"
        />

        <SummaryCard
          title="Balance Due"
          value={sortedInvoices.reduce(
            (sum, invoice) =>
              sum +
              Number(
                invoice?.balance_due ||
                  0
              ),
            0
          )}
          background="#ffedd5"
          color="#c2410c"
        />
      </div>

      <div
        style={{
          background:
            "#ffffff",
          borderRadius:
            "14px",
          border:
            "1px solid #e5e7eb",
          overflow:
            "hidden",
          boxShadow:
            "0 4px 16px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            padding:
              "20px 22px",
            borderBottom:
              "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize:
                "19px",
              color:
                "#202124",
            }}
          >
            Bill List
          </h2>
        </div>

        {sortedInvoices.length ===
        0 ? (
          <div
            style={{
              padding:
                "65px 20px",
              textAlign:
                "center",
              color:
                "#6b7280",
            }}
          >
            <div
              style={{
                fontSize:
                  "19px",
                fontWeight:
                  700,
                color:
                  "#374151",
                marginBottom:
                  "8px",
              }}
            >
              No bills yet
            </div>

            <div
              style={{
                fontSize:
                  "14px",
              }}
            >
              Click “New Bill”
              to create your
              first bill.
            </div>
          </div>
        ) : (
          <div
            style={{
              overflowX:
                "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                minWidth:
                  "1180px",
                borderCollapse:
                  "collapse",
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
                    style={{
                      ...thStyle,
                      width:
                        "120px",
                    }}
                  >
                    Bill
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      minWidth:
                        "190px",
                    }}
                  >
                    Customer
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      width:
                        "125px",
                    }}
                  >
                    Date
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      width:
                        "130px",
                      textAlign:
                        "right",
                    }}
                  >
                    Amount
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      width:
                        "130px",
                      textAlign:
                        "right",
                    }}
                  >
                    Paid
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      width:
                        "130px",
                      textAlign:
                        "right",
                    }}
                  >
                    Balance
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      width:
                        "120px",
                      textAlign:
                        "center",
                    }}
                  >
                    Status
                  </th>

                  <th
                    style={{
                      ...thStyle,
                      width:
                        "240px",
                      minWidth:
                        "240px",
                      textAlign:
                        "center",
                    }}
                  >
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedInvoices.map(
                  (
                    invoice,
                    index
                  ) => {
                    const status =
                      invoice?.payment_status ||
                      "UNPAID";

                    const balance =
                      Number(
                        invoice?.balance_due ??
                          Number(
                            invoice?.grand_total ||
                              0
                          ) -
                          Number(
                            invoice?.amount_paid ||
                              0
                          )
                      );

                    return (
                      <tr
                        key={
                          invoice?.id ??
                          `invoice-${index}`
                        }
                      >
                        <td
                          style={{
                            ...tdStyle,
                            width:
                              "120px",
                          }}
                        >
                          <span
                            style={{
                              display:
                                "inline-block",
                              background:
                                "#f3e8ff",
                              color:
                                "#6d28d9",
                              padding:
                                "6px 10px",
                              borderRadius:
                                "6px",
                              fontSize:
                                "12px",
                              fontWeight:
                                800,
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {
                              invoice?.invoice_no ||
                              "-"
                            }
                          </span>
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            minWidth:
                              "190px",
                          }}
                        >
                          <div
                            style={{
                              fontWeight:
                                700,
                              color:
                                "#1f2937",
                            }}
                          >
                            {
                              invoice?.customer_name ||
                              "-"
                            }
                          </div>

                          {invoice?.customer_mobile && (
                            <div
                              style={{
                                fontSize:
                                  "12px",
                                color:
                                  "#6b7280",
                                marginTop:
                                  "3px",
                              }}
                            >
                              {
                                invoice.customer_mobile
                              }
                            </div>
                          )}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            width:
                              "125px",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {
                            invoice?.invoice_date ||
                            "-"
                          }
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            width:
                              "130px",
                            textAlign:
                              "right",
                            fontWeight:
                              800,
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          ₹
                          {Number(
                            invoice?.grand_total ||
                              0
                          ).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits:
                                2,
                            }
                          )}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            width:
                              "130px",
                            textAlign:
                              "right",
                            fontWeight:
                              700,
                            color:
                              "#166534",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          ₹
                          {Number(
                            invoice?.amount_paid ||
                              0
                          ).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits:
                                2,
                            }
                          )}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            width:
                              "130px",
                            textAlign:
                              "right",
                            fontWeight:
                              700,
                            color:
                              balance > 0
                                ? "#b42318"
                                : "#166534",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          ₹
                          {balance.toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits:
                                2,
                            }
                          )}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            width:
                              "120px",
                            textAlign:
                              "center",
                          }}
                        >
                          <StatusBadge
                            status={
                              status
                            }
                          />
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            width:
                              "240px",
                            minWidth:
                              "240px",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "center",
                              alignItems:
                                "center",
                              gap:
                                "8px",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                openEditInvoice(
                                  invoice.id
                                )
                              }
                              style={
                                editButton
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                printInvoice(
                                  invoice.id
                                )
                              }
                              style={
                                printButton
                              }
                            >
                              Print Bill
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteInvoice(
                                  invoice.id,
                                  invoice.invoice_no
                                )
                              }
                              style={
                                deleteButton
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <ModalOverlay>
          <ModalHeader
            title="New Bill"
            subtitle="Create a multi-product customer bill"
            onClose={
              closeNewInvoice
            }
          />

          <form
            onSubmit={
              saveInvoice
            }
            style={{
              padding:
                "24px",
            }}
          >
            {errorMessage && (
              <ErrorBox
                message={
                  errorMessage
                }
              />
            )}

            <div
              style={
                twoColumnGrid
              }
            >
              <div>
                <label
                  style={
                    labelStyle
                  }
                >
                  Customer / Retailer
                </label>

                <select
                  value={
                    form.customer_id
                  }
                  onChange={(
                    event
                  ) =>
                    setForm({
                      ...form,
                      customer_id:
                        event
                          .target
                          .value,
                    })
                  }
                  style={
                    inputStyle
                  }
                >
                  <option value="">
                    Select customer
                  </option>

                  {customers.map(
                    (
                      customer
                    ) => (
                      <option
                        key={
                          customer.id
                        }
                        value={
                          customer.id
                        }
                      >
                        {
                          customer.name
                        }

                        {customer.mobile
                          ? ` - ${customer.mobile}`
                          : ""}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label
                  style={
                    labelStyle
                  }
                >
                  Bill Date
                </label>

                <input
                  type="date"
                  value={
                    form.invoice_date
                  }
                  onChange={(
                    event
                  ) =>
                    setForm({
                      ...form,
                      invoice_date:
                        event
                          .target
                          .value,
                    })
                  }
                  style={
                    inputStyle
                  }
                />
              </div>
            </div>

            <ProductSection
              items={
                items
              }
              products={
                products
              }
              onUpdate={
                updateItem
              }
              onAdd={
                addItem
              }
              onRemove={
                removeItem
              }
            />

            <TotalsBox
              subtotal={
                newSubtotal
              }
              balance={
                newBalance
              }
              amountPaid={
                Number(
                  form.amount_paid ||
                    0
                )
              }
            />

            <div
              style={
                twoColumnGrid
              }
            >
              <div>
                <label
                  style={
                    labelStyle
                  }
                >
                  Amount Paid
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    form.amount_paid
                  }
                  onChange={(
                    event
                  ) =>
                    setForm({
                      ...form,
                      amount_paid:
                        event
                          .target
                          .value,
                    })
                  }
                  style={
                    inputStyle
                  }
                />
              </div>

              <div>
                <label
                  style={
                    labelStyle
                  }
                >
                  Payment Method
                </label>

                <select
                  value={
                    form.payment_method
                  }
                  onChange={(
                    event
                  ) =>
                    setForm({
                      ...form,
                      payment_method:
                        event
                          .target
                          .value,
                    })
                  }
                  style={
                    inputStyle
                  }
                >
                  <option value="CASH">
                    Cash
                  </option>

                  <option value="UPI">
                    UPI
                  </option>

                  <option value="BANK">
                    Bank / Online
                  </option>

                  <option value="OTHER">
                    Other
                  </option>
                </select>
              </div>
            </div>

            <label
              style={
                labelStyle
              }
            >
              Notes
            </label>

            <textarea
              rows="3"
              value={
                form.notes
              }
              onChange={(
                event
              ) =>
                setForm({
                  ...form,
                  notes:
                    event
                      .target
                      .value,
                })
              }
              placeholder="Optional notes"
              style={{
                ...inputStyle,
                resize:
                  "vertical",
              }}
            />

            <div
              style={
                modalButtonRow
              }
            >
              <button
                type="button"
                onClick={
                  closeNewInvoice
                }
                style={
                  cancelButton
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                style={
                  saveButton
                }
              >
                Save Bill
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {showEditModal && (
        <ModalOverlay>
          <ModalHeader
            title={`Edit ${
              editForm.invoice_no ||
              "Bill"
            }`}
            subtitle="Add, remove or correct bill products"
            onClose={
              closeEditInvoice
            }
          />

          <form
            onSubmit={
              saveEditedInvoice
            }
            style={{
              padding:
                "24px",
            }}
          >
            {errorMessage && (
              <ErrorBox
                message={
                  errorMessage
                }
              />
            )}

            <div
              style={
                twoColumnGrid
              }
            >
              <div>
                <label
                  style={
                    labelStyle
                  }
                >
                  Customer / Retailer
                </label>

                <select
                  value={
                    editForm.customer_id
                  }
                  onChange={(
                    event
                  ) =>
                    setEditForm({
                      ...editForm,
                      customer_id:
                        event
                          .target
                          .value,
                    })
                  }
                  style={
                    inputStyle
                  }
                >
                  <option value="">
                    Select customer
                  </option>

                  {customers.map(
                    (
                      customer
                    ) => (
                      <option
                        key={
                          customer.id
                        }
                        value={
                          customer.id
                        }
                      >
                        {
                          customer.name
                        }

                        {customer.mobile
                          ? ` - ${customer.mobile}`
                          : ""}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label
                  style={
                    labelStyle
                  }
                >
                  Bill Date
                </label>

                <input
                  type="date"
                  value={
                    editForm.invoice_date
                  }
                  onChange={(
                    event
                  ) =>
                    setEditForm({
                      ...editForm,
                      invoice_date:
                        event
                          .target
                          .value,
                    })
                  }
                  style={
                    inputStyle
                  }
                />
              </div>
            </div>

            <ProductSection
              items={
                editItems
              }
              products={
                products
              }
              onUpdate={
                updateEditItem
              }
              onAdd={
                addEditItem
              }
              onRemove={
                removeEditItem
              }
            />

            <TotalsBox
              subtotal={
                editSubtotal
              }
              balance={
                editBalance
              }
              amountPaid={
                Number(
                  editForm.amount_paid ||
                    0
                )
              }
            />

            <div
              style={
                twoColumnGrid
              }
            >
              <div>
                <label
                  style={
                    labelStyle
                  }
                >
                  Amount Paid
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    editForm.amount_paid
                  }
                  onChange={(
                    event
                  ) =>
                    setEditForm({
                      ...editForm,
                      amount_paid:
                        event
                          .target
                          .value,
                    })
                  }
                  style={
                    inputStyle
                  }
                />
              </div>

              <div>
                <label
                  style={
                    labelStyle
                  }
                >
                  Payment Method
                </label>

                <select
                  value={
                    editForm.payment_method
                  }
                  onChange={(
                    event
                  ) =>
                    setEditForm({
                      ...editForm,
                      payment_method:
                        event
                          .target
                          .value,
                    })
                  }
                  style={
                    inputStyle
                  }
                >
                  <option value="CASH">
                    Cash
                  </option>

                  <option value="UPI">
                    UPI
                  </option>

                  <option value="BANK">
                    Bank / Online
                  </option>

                  <option value="OTHER">
                    Other
                  </option>
                </select>
              </div>
            </div>

            <label
              style={
                labelStyle
              }
            >
              Notes
            </label>

            <textarea
              rows="3"
              value={
                editForm.notes
              }
              onChange={(
                event
              ) =>
                setEditForm({
                  ...editForm,
                  notes:
                    event
                      .target
                      .value,
                })
              }
              placeholder="Optional notes"
              style={{
                ...inputStyle,
                resize:
                  "vertical",
              }}
            />

            <div
              style={
                modalButtonRow
              }
            >
              <button
                type="button"
                onClick={
                  closeEditInvoice
                }
                style={
                  cancelButton
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                style={
                  saveButton
                }
              >
                Save Changes
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}
    </div>
  );
}

function ProductSection({
  items,
  products,
  onUpdate,
  onAdd,
  onRemove,
}) {
  return (
    <div
      style={{
        marginTop:
          "5px",
        marginBottom:
          "18px",
      }}
    >
      <div
        style={{
          display:
            "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          marginBottom:
            "10px",
        }}
      >
        <div>
          <div
            style={{
              fontSize:
                "15px",
              fontWeight:
                800,
              color:
                "#1f2937",
            }}
          >
            Products
          </div>

          <div
            style={{
              fontSize:
                "12px",
              color:
                "#6b7280",
              marginTop:
                "3px",
            }}
          >
            Add multiple products
            to one bill
          </div>
        </div>

        <button
          type="button"
          onClick={onAdd}
          style={
            addProductButton
          }
        >
          + Add Product
        </button>
      </div>

      <div
        style={{
          border:
            "1px solid #e5e7eb",
          borderRadius:
            "10px",
          overflow:
            "hidden",
        }}
      >
        {items.map(
          (item, index) => (
            <div
              key={`item-${index}`}
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "minmax(220px, 1.7fr) 120px 140px 80px",
                gap:
                  "10px",
                padding:
                  "13px",
                alignItems:
                  "end",
                borderBottom:
                  index <
                  items.length -
                    1
                    ? "1px solid #e5e7eb"
                    : "none",
              }}
            >
              <div>
                <label
                  style={
                    smallLabelStyle
                  }
                >
                  Product
                </label>

                <select
                  value={
                    item.product_id
                  }
                  onChange={(
                    event
                  ) =>
                    onUpdate(
                      index,
                      "product_id",
                      event
                        .target
                        .value
                    )
                  }
                  style={
                    smallInputStyle
                  }
                >
                  <option value="">
                    Select product
                  </option>

                  {products.map(
                    (
                      product
                    ) => (
                      <option
                        key={
                          product.id
                        }
                        value={
                          product.id
                        }
                      >
                        {
                          product.product_name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label
                  style={
                    smallLabelStyle
                  }
                >
                  Cases
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={
                    item.quantity_cases
                  }
                  onChange={(
                    event
                  ) =>
                    onUpdate(
                      index,
                      "quantity_cases",
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="0"
                  style={
                    smallInputStyle
                  }
                />
              </div>

              <div>
                <label
                  style={
                    smallLabelStyle
                  }
                >
                  Rate / Case
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    item.rate
                  }
                  onChange={(
                    event
                  ) =>
                    onUpdate(
                      index,
                      "rate",
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="0.00"
                  style={
                    smallInputStyle
                  }
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  onRemove(
                    index
                  )
                }
                disabled={
                  items.length ===
                  1
                }
                style={{
                  ...removeButton,
                  opacity:
                    items.length ===
                    1
                      ? 0.4
                      : 1,
                }}
              >
                Remove
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function TotalsBox({
  subtotal,
  balance,
  amountPaid,
}) {
  return (
    <div
      style={
        totalsBox
      }
    >
      <div
        style={
          totalRowStyle
        }
      >
        <span>
          Subtotal
        </span>

        <strong>
          ₹
          {Number(
            subtotal || 0
          ).toLocaleString(
            "en-IN",
            {
              minimumFractionDigits:
                2,
            }
          )}
        </strong>
      </div>

      <div
        style={
          grandTotalRowStyle
        }
      >
        <span>
          Grand Total
        </span>

        <strong>
          ₹
          {Number(
            subtotal || 0
          ).toLocaleString(
            "en-IN",
            {
              minimumFractionDigits:
                2,
            }
          )}
        </strong>
      </div>

      <div
        style={
          totalRowStyle
        }
      >
        <span>
          Amount Paid
        </span>

        <strong
          style={{
            color:
              "#166534",
          }}
        >
          ₹
          {Number(
            amountPaid || 0
          ).toLocaleString(
            "en-IN",
            {
              minimumFractionDigits:
                2,
            }
          )}
        </strong>
      </div>

      <div
        style={
          totalRowStyle
        }
      >
        <span>
          Balance Due
        </span>

        <strong
          style={{
            color:
              Number(
                balance || 0
              ) > 0
                ? "#b42318"
                : "#166534",
          }}
        >
          ₹
          {Number(
            balance || 0
          ).toLocaleString(
            "en-IN",
            {
              minimumFractionDigits:
                2,
            }
          )}
        </strong>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  background,
  color,
  money = true,
}) {
  return (
    <div
      style={{
        background,
        borderRadius:
          "14px",
        padding:
          "20px",
        border:
          "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          fontSize:
            "14px",
          color,
          fontWeight:
            600,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize:
            "28px",
          fontWeight:
            800,
          color,
          marginTop:
            "8px",
        }}
      >
        {money
          ? "₹"
          : ""}

        {Number(
          value || 0
        ).toLocaleString(
          "en-IN",
          {
            maximumFractionDigits:
              2,
          }
        )}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}) {
  let background =
    "#f3f4f6";

  let color =
    "#374151";

  if (
    status ===
    "PAID"
  ) {
    background =
      "#dcfce7";

    color =
      "#166534";
  }

  if (
    status ===
    "PARTIAL"
  ) {
    background =
      "#fef3c7";

    color =
      "#92400e";
  }

  if (
    status ===
    "UNPAID"
  ) {
    background =
      "#fee2e2";

    color =
      "#991b1b";
  }

  return (
    <span
      style={{
        display:
          "inline-block",
        background,
        color,
        padding:
          "6px 10px",
        borderRadius:
          "20px",
        fontSize:
          "12px",
        fontWeight:
          700,
        whiteSpace:
          "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function ModalOverlay({
  children,
}) {
  return (
    <div
      style={{
        position:
          "fixed",
        inset: 0,
        background:
          "rgba(15,23,42,0.55)",
        display:
          "flex",
        justifyContent:
          "center",
        alignItems:
          "center",
        padding:
          "20px",
        zIndex:
          1000,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth:
            "900px",
          background:
            "#ffffff",
          borderRadius:
            "16px",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.18)",
          maxHeight:
            "92vh",
          overflowY:
            "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({
  title,
  subtitle,
  onClose,
}) {
  return (
    <div
      style={{
        padding:
          "22px 24px",
        borderBottom:
          "1px solid #e5e7eb",
        display:
          "flex",
        justifyContent:
          "space-between",
        alignItems:
          "center",
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontSize:
              "21px",
            color:
              "#202124",
          }}
        >
          {title}
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
          {subtitle}
        </p>
      </div>

      <button
        type="button"
        onClick={
          onClose
        }
        style={{
          border:
            "none",
          background:
            "#f3f4f6",
          width:
            "36px",
          height:
            "36px",
          borderRadius:
            "50%",
          fontSize:
            "20px",
          cursor:
            "pointer",
          color:
            "#374151",
        }}
      >
        ×
      </button>
    </div>
  );
}

function ErrorBox({
  message,
}) {
  return (
    <div
      style={{
        background:
          "#fee2e2",
        color:
          "#991b1b",
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
      {message}
    </div>
  );
}

const labelStyle = {
  display:
    "block",
  marginBottom:
    "7px",
  color:
    "#374151",
  fontSize:
    "14px",
  fontWeight:
    600,
};

const smallLabelStyle = {
  display:
    "block",
  marginBottom:
    "5px",
  color:
    "#6b7280",
  fontSize:
    "11px",
  fontWeight:
    700,
};

const inputStyle = {
  width:
    "100%",
  padding:
    "11px 12px",
  border:
    "1px solid #d1d5db",
  borderRadius:
    "8px",
  fontSize:
    "14px",
  color:
    "#1f2937",
  background:
    "#ffffff",
  marginBottom:
    "17px",
  outline:
    "none",
};

const smallInputStyle = {
  width:
    "100%",
  padding:
    "9px 10px",
  border:
    "1px solid #d1d5db",
  borderRadius:
    "7px",
  fontSize:
    "13px",
  color:
    "#1f2937",
  background:
    "#ffffff",
};

const twoColumnGrid = {
  display:
    "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap:
    "16px",
};

const totalsBox = {
  background:
    "#f9fafb",
  border:
    "1px solid #e5e7eb",
  borderRadius:
    "10px",
  padding:
    "15px",
  marginBottom:
    "18px",
};

const totalRowStyle = {
  display:
    "flex",
  justifyContent:
    "space-between",
  alignItems:
    "center",
  padding:
    "6px 0",
  color:
    "#374151",
  fontSize:
    "14px",
};

const grandTotalRowStyle = {
  display:
    "flex",
  justifyContent:
    "space-between",
  alignItems:
    "center",
  padding:
    "10px 0",
  marginTop:
    "5px",
  borderTop:
    "2px solid #d1d5db",
  color:
    "#1f2937",
  fontSize:
    "17px",
  fontWeight:
    800,
};

const addProductButton = {
  border:
    "none",
  background:
    "#ede9fe",
  color:
    "#6d28d9",
  padding:
    "9px 13px",
  borderRadius:
    "7px",
  fontSize:
    "12px",
  fontWeight:
    800,
  cursor:
    "pointer",
};

const removeButton = {
  border:
    "1px solid #fecaca",
  background:
    "#fff1f2",
  color:
    "#dc2626",
  padding:
    "8px 9px",
  borderRadius:
    "7px",
  fontSize:
    "11px",
  fontWeight:
    700,
  cursor:
    "pointer",
};

const editButton = {
  border:
    "1px solid #ddd6fe",
  background:
    "#f5f3ff",
  color:
    "#6d28d9",
  padding:
    "8px 12px",
  borderRadius:
    "7px",
  fontSize:
    "12px",
  fontWeight:
    700,
  cursor:
    "pointer",
  whiteSpace:
    "nowrap",
};

const printButton = {
  border:
    "1px solid #dbeafe",
  background:
    "#eff6ff",
  color:
    "#1d4ed8",
  padding:
    "8px 12px",
  borderRadius:
    "7px",
  fontSize:
    "12px",
  fontWeight:
    700,
  cursor:
    "pointer",
  whiteSpace:
    "nowrap",
};

const deleteButton = {
  border:
    "1px solid #fecaca",
  background:
    "#fff1f2",
  color:
    "#dc2626",
  padding:
    "8px 12px",
  borderRadius:
    "7px",
  fontSize:
    "12px",
  fontWeight:
    700,
  cursor:
    "pointer",
  whiteSpace:
    "nowrap",
};

const modalButtonRow = {
  display:
    "flex",
  justifyContent:
    "flex-end",
  gap:
    "10px",
  marginTop:
    "8px",
};

const cancelButton = {
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
};

const saveButton = {
  border:
    "none",
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
};

const thStyle = {
  textAlign:
    "left",
  padding:
    "13px 16px",
  fontSize:
    "12px",
  color:
    "#6b7280",
  fontWeight:
    700,
  borderBottom:
    "1px solid #e5e7eb",
  whiteSpace:
    "nowrap",
};

const tdStyle = {
  padding:
    "15px 16px",
  fontSize:
    "14px",
  color:
    "#374151",
  borderBottom:
    "1px solid #f0f0f0",
  verticalAlign:
    "middle",
};
