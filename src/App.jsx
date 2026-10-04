import { useState } from "react";
import Stock from "./Stock";
import Customers from "./Customers";
import Invoices from "./Invoices";
import Manufacturing from "./Manufacturing";
import Login from "./Login";

function App() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem("shriERPLoggedIn") === "true");

  const handleLogout = () => {
    localStorage.removeItem("shriERPLoggedIn");
    setLoggedIn(false);
  };

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  const menuItems = [
    { name: "Dashboard", icon: "⌂" },
    { name: "Invoices", icon: "▤" },
    { name: "Customers", icon: "♙" },
    { name: "Products", icon: "▦" },
    { name: "Stock", icon: "◫" },
    { name: "Payments", icon: "₹" },
    { name: "Manufacturing", icon: "⚙" },
    { name: "Expenses", icon: "↗" },
    { name: "Ledger", icon: "☷" },
    { name: "Reports", icon: "▥" },
  ];

  const stats = [
    {
      title: "Total Sales",
      value: "₹0",
      small: "This month",
      icon: "₹",
      color: "#2878D8",
      light: "#E7F1FF",
    },
    {
      title: "Outstanding",
      value: "₹0",
      small: "Amount due",
      icon: "◷",
      color: "#D47A00",
      light: "#FFF1D9",
    },
    {
      title: "Customers",
      value: "0",
      small: "Active customers",
      icon: "♙",
      color: "#1F9D5A",
      light: "#E3F8EC",
    },
    {
      title: "Stock Items",
      value: "5",
      small: "Products available",
      icon: "▦",
      color: "#7946C7",
      light: "#F0E6FF",
    },
  ];

  const handleMenuClick = (name) => {
    setActiveMenu(name);
  };

  return (
    <div style={styles.app}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.logoPlaceholder}>SE</div>

          <div>
            <div style={styles.brandName}>
              Shri Enterprises
            </div>

            <div style={styles.brandBeverages}>
              & Beverages
            </div>
          </div>
        </div>

        <div style={styles.brandLine}></div>

        <div style={styles.businessTag}>
          MANUFACTURING & SUPPLY
        </div>

        <div style={styles.menuHeading}>
          MAIN MENU
        </div>

        <div>
          {menuItems.map((item) => {
            const active = activeMenu === item.name;

            return (
              <button
                key={item.name}
                onClick={() =>
                  handleMenuClick(item.name)
                }
                style={{
                  ...styles.menuItem,
                  ...(active
                    ? styles.menuItemActive
                    : {}),
                }}
              >
                <span
                  style={{
                    ...styles.menuIcon,
                    ...(active
                      ? styles.menuIconActive
                      : {}),
                  }}
                >
                  {item.icon}
                </span>

                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        <div style={styles.sidebarBottom}>
          <div style={styles.sidebarInfo}>
            <div style={styles.infoIcon}>
              ✓
            </div>

            <div>
              <div style={styles.infoTitle}>
                Business ERP
              </div>

              <div style={styles.infoText}>
                Manufacturing & Distribution
              </div>
            </div>
          </div>

          <div style={styles.version}>
            Shri ERP • Version 1.0
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={styles.main}>
        {/* TOP HEADER */}
        <header style={styles.header}>
          <div>
            <div style={styles.breadcrumb}>
              WORKSPACE /{" "}
              {activeMenu.toUpperCase()}
            </div>

            <div style={styles.headerTitle}>
              {activeMenu}
            </div>
          </div>

          <div style={styles.headerRight}>
            <button style={styles.monthButton}>
              October 2026 <span>⌄</span>
            </button>

            <button
              style={styles.notificationButton}
            >
              🔔
            </button>

            <button type="button" onClick={handleLogout} style={styles.logoutButton}>Logout</button>

            <div style={styles.profile}>
              <div style={styles.profileAvatar}>
                SE
              </div>

              <div>
                <div style={styles.profileName}>
                  Shri Enterprises
                </div>

                <div style={styles.profileRole}>
                  Administrator
                </div>
              </div>

              <span style={styles.profileArrow}>
                ⌄
              </span>
            </div>
          </div>
        </header>

        {/* INVOICES */}
        {activeMenu === "Invoices" ? (
          <Invoices />
        ) : /* CUSTOMERS */
        activeMenu === "Customers" ? (
          <Customers />
        ) : /* STOCK */
        activeMenu === "Stock" ? (
          <Stock />
        ) : /* MANUFACTURING */
        activeMenu === "Manufacturing" ? (
          <Manufacturing />
        ) : (
          /* DASHBOARD */
          <div style={styles.content}>
            {/* WELCOME */}
            <div style={styles.welcomeRow}>
              <div>
                <div style={styles.welcomeTitle}>
                  Good afternoon 👋
                </div>

                <div style={styles.welcomeText}>
                  Here's what's happening with your
                  business today.
                </div>
              </div>

              <div style={styles.actionButtons}>
                <button
                  style={styles.customerButton}
                  onClick={() =>
                    setActiveMenu("Customers")
                  }
                >
                  + Add Customer
                </button>

                <button
                  style={styles.invoiceButton}
                  onClick={() =>
                    setActiveMenu("Invoices")
                  }
                >
                  + New Invoice
                </button>
              </div>
            </div>

            {/* STAT CARDS */}
            <div style={styles.statsGrid}>
              {stats.map((item) => (
                <div
                  key={item.title}
                  style={{
                    ...styles.statCard,
                    borderTop: `5px solid ${item.color}`,
                  }}
                >
                  <div style={styles.statTop}>
                    <div>
                      <div style={styles.statLabel}>
                        {item.title}
                      </div>

                      <div style={styles.statValue}>
                        {item.value}
                      </div>
                    </div>

                    <div
                      style={{
                        ...styles.statIcon,
                        color: item.color,
                        background:
                          item.light,
                      }}
                    >
                      {item.icon}
                    </div>
                  </div>

                  <div style={styles.statFooter}>
                    <span
                      style={{
                        ...styles.statDot,
                        background:
                          item.color,
                      }}
                    ></span>

                    {item.small}
                  </div>
                </div>
              ))}
            </div>

            {/* SALES + SUMMARY */}
            <div style={styles.mainGrid}>
              {/* SALES */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <div style={styles.cardTitle}>
                      Sales Overview
                    </div>

                    <div style={styles.cardSubtitle}>
                      Monitor your sales performance
                    </div>
                  </div>

                  <select style={styles.select}>
                    <option>
                      Last 6 months
                    </option>

                    <option>
                      This year
                    </option>

                    <option>
                      Last year
                    </option>
                  </select>
                </div>

                <div style={styles.chartContainer}>
                  <div style={styles.chartYAxis}>
                    <span>50K</span>
                    <span>40K</span>
                    <span>30K</span>
                    <span>20K</span>
                    <span>10K</span>
                    <span>0</span>
                  </div>

                  <div style={styles.chart}>
                    {[0, 1, 2, 3, 4].map(
                      (item) => (
                        <div
                          key={item}
                          style={{
                            ...styles.chartHorizontal,
                            top: `${item * 20}%`,
                          }}
                        ></div>
                      )
                    )}

                    <div
                      style={
                        styles.chartMessage
                      }
                    >
                      <div
                        style={{
                          ...styles.chartIcon,
                          background:
                            "#E5F0FF",
                          color: "#2878D8",
                        }}
                      >
                        ₹
                      </div>

                      <div
                        style={
                          styles.emptyTitle
                        }
                      >
                        No sales data yet
                      </div>

                      <div
                        style={
                          styles.emptyText
                        }
                      >
                        Create your first invoice
                        and your sales graph will
                        appear here.
                      </div>
                    </div>

                    <div
                      style={
                        styles.chartXAxis
                      }
                    >
                      <span>May</span>
                      <span>Jun</span>
                      <span>Jul</span>
                      <span>Aug</span>
                      <span>Sep</span>
                      <span>Oct</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BUSINESS SUMMARY */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <div style={styles.cardTitle}>
                      Business Summary
                    </div>

                    <div style={styles.cardSubtitle}>
                      Financial snapshot
                    </div>
                  </div>
                </div>

                <div style={styles.summaryList}>
                  <Summary
                    title="Paid Amount"
                    amount="₹0"
                    icon="✓"
                    color="#1F9D5A"
                    light="#E3F8EC"
                  />

                  <Summary
                    title="Pending Amount"
                    amount="₹0"
                    icon="◷"
                    color="#D47A00"
                    light="#FFF1D9"
                  />

                  <Summary
                    title="Total Expenses"
                    amount="₹0"
                    icon="↗"
                    color="#D94343"
                    light="#FFE7E7"
                  />

                  <Summary
                    title="Estimated Profit"
                    amount="₹0"
                    icon="↗"
                    color="#2878D8"
                    light="#E5F0FF"
                  />
                </div>
              </div>
            </div>

            {/* LOWER CARDS */}
            <div style={styles.bottomGrid}>
              {/* INVOICES */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <div style={styles.cardTitle}>
                      Recent Invoices
                    </div>

                    <div style={styles.cardSubtitle}>
                      Latest billing activity
                    </div>
                  </div>

                  <button
                    style={styles.viewAll}
                    onClick={() =>
                      setActiveMenu("Invoices")
                    }
                  >
                    View all →
                  </button>
                </div>

                <div style={styles.emptyBox}>
                  <div
                    style={{
                      ...styles.largeEmptyIcon,
                      background:
                        "#E8F0FF",
                      color: "#2878D8",
                    }}
                  >
                    ▤
                  </div>

                  <div style={styles.emptyTitle}>
                    No invoices yet
                  </div>

                  <div style={styles.emptyText}>
                    Your latest invoices will
                    appear here.
                  </div>

                  <button
                    style={styles.createButton}
                    onClick={() =>
                      setActiveMenu("Invoices")
                    }
                  >
                    Create Invoice
                  </button>
                </div>
              </div>

              {/* STOCK */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <div style={styles.cardTitle}>
                      Stock Status
                    </div>

                    <div style={styles.cardSubtitle}>
                      Inventory overview
                    </div>
                  </div>

                  <button
                    style={styles.viewAll}
                    onClick={() =>
                      setActiveMenu("Stock")
                    }
                  >
                    Manage →
                  </button>
                </div>

                <div style={styles.emptyBox}>
                  <div
                    style={{
                      ...styles.largeEmptyIcon,
                      background:
                        "#F0E7FF",
                      color: "#7946C7",
                    }}
                  >
                    📦
                  </div>

                  <div style={styles.emptyTitle}>
                    Manage your stock
                  </div>

                  <div style={styles.emptyText}>
                    Track Bailley and Local Stock
                    from the Stock Management page.
                  </div>

                  <button
                    style={styles.stockButton}
                    onClick={() =>
                      setActiveMenu("Stock")
                    }
                  >
                    Manage Stock
                  </button>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div style={styles.quickBar}>
              <div>
                <div style={styles.quickTitle}>
                  Quick Actions
                </div>

                <div style={styles.quickText}>
                  Manage your daily business
                  activities
                </div>
              </div>

              <div style={styles.quickActions}>
                <QuickButton
                  text="+ Invoice"
                  color="#5B8DEF"
                  onClick={() =>
                    setActiveMenu("Invoices")
                  }
                />

                <QuickButton
                  text="+ Customer"
                  color="#32A96B"
                  onClick={() =>
                    setActiveMenu("Customers")
                  }
                />

                <QuickButton
                  text="+ Stock"
                  color="#9A68DD"
                  onClick={() =>
                    setActiveMenu("Stock")
                  }
                />

                <QuickButton
                  text="+ Payment"
                  color="#E19A32"
                />
              </div>
            </div>

            {/* FOOTER */}
            <div style={styles.footer}>
              <span>
                © 2026 Shri Enterprises & Beverages
              </span>

              <span>
                Manufacturing • Distribution •
                Billing • Inventory
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* SUMMARY */
function Summary({
  title,
  amount,
  icon,
  color,
  light,
}) {
  return (
    <div style={styles.summaryRow}>
      <div
        style={{
          ...styles.summaryIcon,
          background: light,
          color: color,
        }}
      >
        {icon}
      </div>

      <div style={styles.summaryInfo}>
        <div style={styles.summaryTitle}>
          {title}
        </div>

        <div style={styles.summaryAmount}>
          {amount}
        </div>
      </div>

      <div
        style={{
          ...styles.summaryArrow,
          color: color,
        }}
      >
        ›
      </div>
    </div>
  );
}

/* QUICK BUTTON */
function QuickButton({
  text,
  color,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.quickButton,
        borderColor: color,
      }}
    >
      <span
        style={{
          ...styles.quickDot,
          background: color,
        }}
      ></span>

      {text}
    </button>
  );
}

/* STYLES */
const styles = {
  app: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    background: "#EEF3F8",
    fontFamily: "Inter, Arial, sans-serif",
    color: "#172033",
  },

  sidebar: {
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    width: "255px",
    minWidth: "255px",
    background:
      "linear-gradient(180deg, #152640 0%, #101C2F 100%)",
    color: "#FFFFFF",
    padding: "20px 15px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "5px 8px 15px",
  },

  logoPlaceholder: {
    width: "46px",
    height: "46px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #4A8CF5, #245BC0)",
    color: "#FFFFFF",
    fontSize: "15px",
    fontWeight: "900",
    boxShadow:
      "0 8px 22px rgba(44, 112, 225, 0.32)",
  },

  brandName: {
    fontSize: "15px",
    fontWeight: "800",
  },

  brandBeverages: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#83AEF8",
    marginTop: "2px",
  },

  brandLine: {
    height: "1px",
    background:
      "rgba(255,255,255,0.07)",
    margin: "0 8px 16px",
  },

  businessTag: {
    margin: "0 8px 18px",
    padding: "9px 10px",
    borderRadius: "8px",
    background:
      "rgba(255,255,255,0.06)",
    border:
      "1px solid rgba(255,255,255,0.07)",
    color: "#93A6BF",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "0.10em",
  },

  menuHeading: {
    color: "#73869F",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "0.12em",
    padding: "0 11px 9px",
  },

  menuItem: {
    width: "100%",
    border:
      "1px solid transparent",
    background: "transparent",
    color: "#AEBBCB",
    borderRadius: "9px",
    padding: "10px 10px",
    marginBottom: "4px",
    display: "flex",
    alignItems: "center",
    gap: "11px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "600",
  },

  menuItemActive: {
    background:
      "linear-gradient(90deg, rgba(60,125,230,0.28), rgba(60,125,230,0.10))",
    color: "#FFFFFF",
    border:
      "1px solid rgba(100,153,236,0.15)",
    boxShadow:
      "inset 3px 0 #4F91F8",
  },

  menuIcon: {
    width: "33px",
    height: "33px",
    borderRadius: "8px",
    background:
      "rgba(255,255,255,0.055)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#8CA0BA",
    fontSize: "15px",
    fontWeight: "800",
  },

  menuIconActive: {
    background:
      "rgba(80,141,240,0.20)",
    color: "#81AEFF",
  },

  sidebarBottom: {
    marginTop: "auto",
  },

  sidebarInfo: {
    display: "flex",
    gap: "9px",
    alignItems: "center",
    padding: "12px",
    borderRadius: "10px",
    background:
      "rgba(255,255,255,0.055)",
    border:
      "1px solid rgba(255,255,255,0.07)",
  },

  infoIcon: {
    width: "33px",
    height: "33px",
    borderRadius: "9px",
    background:
      "rgba(58,180,111,0.15)",
    color: "#6DD49A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "13px",
  },

  infoTitle: {
    fontSize: "11px",
    fontWeight: "800",
  },

  infoText: {
    fontSize: "9px",
    color: "#8295AE",
    marginTop: "2px",
  },

  version: {
    textAlign: "center",
    color: "#65788F",
    fontSize: "9px",
    marginTop: "11px",
  },

  main: {
    marginLeft: "255px",
    width: "calc(100% - 255px)",
    minHeight: "100vh",
  },

  header: {
    height: "78px",
    background: "#F8FAFD",
    borderBottom: "1px solid #D9E1EA",
    padding: "0 30px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  breadcrumb: {
    color: "#8492A4",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "0.12em",
    marginBottom: "4px",
  },

  headerTitle: {
    fontSize: "21px",
    fontWeight: "850",
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },

  monthButton: {
    border: "1px solid #D2DBE6",
    background: "#FFFFFF",
    color: "#4F5D70",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "12px",
    fontWeight: "700",
  },

  notificationButton: {
    width: "39px",
    height: "39px",
    borderRadius: "8px",
    border:
      "1px solid #D2DBE6",
    background: "#FFFFFF",
    fontSize: "15px",
  },

  logoutButton: {
    border: "1px solid #D7E0EC",
    background: "#FFFFFF",
    color: "#D64545",
    borderRadius: "7px",
    padding: "7px 10px",
    fontSize: "10px",
    fontWeight: "800",
    cursor: "pointer",
  },

  profile: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    paddingLeft: "5px",
  },

  profileAvatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#DCE8FA",
    color: "#3266B4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "900",
  },

  profileName: {
    fontSize: "11px",
    fontWeight: "800",
  },

  profileRole: {
    fontSize: "9px",
    color: "#8795A7",
    marginTop: "2px",
  },

  profileArrow: {
    color: "#8B98A8",
    fontSize: "13px",
  },

  content: {
    width: "100%",
    padding: "28px 30px 30px",
    boxSizing: "border-box",
  },

  welcomeRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },

  welcomeTitle: {
    fontSize: "28px",
    fontWeight: "900",
    letterSpacing: "-0.04em",
  },

  welcomeText: {
    marginTop: "5px",
    color: "#718096",
    fontSize: "13px",
  },

  actionButtons: {
    display: "flex",
    gap: "9px",
  },

  customerButton: {
    border: "1px solid #CCD6E2",
    background: "#FFFFFF",
    color: "#425066",
    borderRadius: "8px",
    padding: "11px 15px",
    fontSize: "12px",
    fontWeight: "800",
  },

  invoiceButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #3E82EA, #245FC8)",
    color: "#FFFFFF",
    borderRadius: "8px",
    padding: "11px 16px",
    fontSize: "12px",
    fontWeight: "800",
    boxShadow:
      "0 6px 15px rgba(37, 100, 205, 0.20)",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "17px",
  },

  statCard: {
    background: "#FBFCFE",
    borderLeft: "1px solid #D8E1EB",
    borderRight: "1px solid #D8E1EB",
    borderBottom: "1px solid #D8E1EB",
    borderRadius: "13px",
    padding: "20px",
    boxShadow:
      "0 4px 15px rgba(40, 60, 90, 0.055)",
  },

  statTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  statLabel: {
    color: "#667085",
    fontSize: "14px",
    fontWeight: "700",
  },

  statValue: {
    marginTop: "7px",
    fontSize: "28px",
    lineHeight: "1.1",
    fontWeight: "900",
    letterSpacing: "-0.04em",
  },

  statIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "13px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "21px",
    fontWeight: "900",
  },

  statFooter: {
    marginTop: "15px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#7B8794",
    fontSize: "12px",
    fontWeight: "600",
  },

  statDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    display: "inline-block",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns:
      "1.55fr 0.85fr",
    gap: "16px",
    marginBottom: "17px",
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns:
      "1.08fr 0.92fr",
    gap: "16px",
    marginBottom: "17px",
  },

  card: {
    background: "#FBFCFE",
    border: "1px solid #D8E1EB",
    borderRadius: "13px",
    overflow: "hidden",
    boxShadow:
      "0 4px 15px rgba(40, 60, 90, 0.05)",
  },

  cardHeader: {
    minHeight: "70px",
    padding: "16px 19px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #E3E8EF",
  },

  cardTitle: {
    fontSize: "14px",
    fontWeight: "850",
  },

  cardSubtitle: {
    marginTop: "4px",
    color: "#8A96A5",
    fontSize: "10px",
  },

  select: {
    border: "1px solid #D3DCE6",
    background: "#FFFFFF",
    borderRadius: "7px",
    padding: "8px 10px",
    color: "#566477",
    fontSize: "10px",
  },

  chartContainer: {
    height: "290px",
    display: "flex",
    padding: "18px 19px 15px",
  },

  chartYAxis: {
    width: "38px",
    paddingBottom: "23px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    color: "#9AA6B5",
    fontSize: "10px",
  },

  chart: {
    position: "relative",
    flex: 1,
    borderLeft: "1px solid #C9D4E0",
    borderBottom: "1px solid #C9D4E0",
  },

  chartHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTop: "1px dashed #DEE5ED",
  },

  chartMessage: {
    position: "absolute",
    left: "50%",
    top: "48%",
    transform:
      "translate(-50%, -50%)",
    width: "250px",
    textAlign: "center",
  },

  chartIcon: {
    width: "48px",
    height: "48px",
    margin: "0 auto 10px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "17px",
    fontWeight: "900",
  },

  emptyTitle: {
    fontSize: "12px",
    fontWeight: "850",
  },

  emptyText: {
    marginTop: "5px",
    color: "#98A4B3",
    fontSize: "10px",
    lineHeight: "1.5",
  },

  chartXAxis: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "-23px",
    display: "flex",
    justifyContent: "space-between",
    color: "#9AA6B5",
    fontSize: "9px",
  },

  summaryList: {
    padding: "4px 19px 15px",
  },

  summaryRow: {
    minHeight: "64px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderBottom: "1px solid #E5EAF0",
  },

  summaryIcon: {
    width: "39px",
    height: "39px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "900",
  },

  summaryInfo: {
    flex: 1,
  },

  summaryTitle: {
    fontSize: "10px",
    color: "#7C8999",
    fontWeight: "700",
  },

  summaryAmount: {
    marginTop: "4px",
    fontSize: "16px",
    fontWeight: "900",
  },

  summaryArrow: {
    fontSize: "20px",
    fontWeight: "700",
  },

  viewAll: {
    border: "none",
    background: "transparent",
    color: "#3676D4",
    fontSize: "10px",
    fontWeight: "800",
  },

  emptyBox: {
    minHeight: "220px",
    padding: "25px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },

  largeEmptyIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    marginBottom: "10px",
  },

  createButton: {
    marginTop: "13px",
    border: "none",
    background: "#3479D9",
    color: "#FFFFFF",
    borderRadius: "7px",
    padding: "9px 14px",
    fontSize: "10px",
    fontWeight: "800",
  },

  stockButton: {
    marginTop: "13px",
    border: "1px solid #CDB7F2",
    background: "#F2EBFF",
    color: "#754BC1",
    borderRadius: "7px",
    padding: "9px 14px",
    fontSize: "10px",
    fontWeight: "800",
  },

  quickBar: {
    minHeight: "75px",
    padding: "15px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    borderRadius: "11px",
    background:
      "linear-gradient(90deg, #172C49, #203C62)",
    boxShadow:
      "0 8px 18px rgba(18, 43, 74, 0.13)",
  },

  quickTitle: {
    color: "#FFFFFF",
    fontSize: "12px",
    fontWeight: "850",
  },

  quickText: {
    color: "#9EB0C6",
    fontSize: "10px",
    marginTop: "3px",
  },

  quickActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  quickButton: {
    minWidth: "85px",
    border: "1px solid",
    background:
      "rgba(255,255,255,0.06)",
    color: "#FFFFFF",
    borderRadius: "7px",
    padding: "9px 10px",
    fontSize: "10px",
    fontWeight: "700",
  },

  quickDot: {
    display: "inline-block",
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    marginRight: "6px",
  },

  footer: {
    paddingTop: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#8C98A8",
    fontSize: "9px",
  },
};

export default App;











