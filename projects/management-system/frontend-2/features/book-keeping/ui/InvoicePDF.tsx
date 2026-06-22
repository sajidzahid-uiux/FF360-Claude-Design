import { FC } from "react";

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: "Helvetica",
    fontSize: 12,
    backgroundColor: "#fff",
    minHeight: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    alignItems: "flex-start",
  },
  logo: {
    width: 120,
    height: 120,
    objectFit: "contain",
    marginBottom: 8,
  },
  companyInfo: {
    alignItems: "flex-end",
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  table: {
    width: "100%",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#40C351",
    borderStyle: "solid",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#40C351",
    color: "#fff",
  },
  th: {
    fontWeight: "bold",
    color: "#fff",
    padding: 8,
    fontSize: 13,
    flexGrow: 1,
    flexBasis: 0,
    borderRightWidth: 0,
  },
  thNo: { flexBasis: 30, flexGrow: 0, textAlign: "center" },
  thActivity: { flexBasis: 80, flexGrow: 1 },
  thDesc: { flexBasis: 180, flexGrow: 2 },
  thPrice: { flexBasis: 60, flexGrow: 1, textAlign: "right" },
  thQty: { flexBasis: 40, flexGrow: 0, textAlign: "right" },
  thTotal: { flexBasis: 70, flexGrow: 1, textAlign: "right" },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#f7f7f7",
    color: "#000",
  },
  tableRowEven: {
    flexDirection: "row",
    backgroundColor: "#e7e7e7",
    color: "#000",
  },
  td: {
    padding: 8,
    fontSize: 12,
    flexGrow: 1,
    flexBasis: 0,
    borderRightWidth: 0,
  },
  tdNo: { flexBasis: 30, flexGrow: 0, textAlign: "center" },
  tdActivity: { flexBasis: 80, flexGrow: 1, maxWidth: 100, minWidth: 40 },
  tdDesc: { flexBasis: 180, flexGrow: 2, maxWidth: 220, minWidth: 80 },
  descText: {
    fontSize: 12,
    wordBreak: "break-word",
    textWrap: "wrap",
    maxWidth: 220,
    minWidth: 80,
  },
  tdPrice: { flexBasis: 60, flexGrow: 1, textAlign: "right" },
  tdQty: { flexBasis: 40, flexGrow: 0, textAlign: "right" },
  tdTotal: { flexBasis: 70, flexGrow: 1, textAlign: "right" },
  billTo: {
    marginTop: 32,
    marginBottom: 8,
  },
  billToTitle: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 4,
  },
  billToLine: {
    fontSize: 12,
    marginBottom: 2,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 10,
    color: "#888",
    alignItems: "center",
  },
  footerCol: {
    flex: 1,
    textAlign: "center",
  },
  footerColLeft: {
    textAlign: "left",
  },
  footerColRight: {
    textAlign: "right",
  },
  totalSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#40C351",
    paddingTop: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingRight: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 16,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#40C351",
  },
  description: {
    fontSize: 12,
    marginBottom: 8,
    wordBreak: "break-word",
    textWrap: "wrap",
    maxWidth: 220,
    minWidth: 80,
  },
});

// Types
interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  activity?: string;
}

interface InvoiceInformation {
  invoice_number: string;
  date: string;
  due_date: string;
  customer_name: string;
  customer_address?: string;
  customer_email?: string;
  description?: string;
}

interface InvoicePDFProps {
  invoiceInfo: InvoiceInformation;
  invoiceItems: InvoiceItem[];
  companyInfo: {
    name: string;
    email?: string;
    logo?: string;
    address?: string;
    phone?: string;
  };
}

// Pagination logic (8 items first page, 10 for continuation)
const BASE_ITEMS_PER_PAGE = 8;
const BASE_ITEMS_PER_CONTINUATION_PAGE = 10;
const LONG_DESCRIPTION_THRESHOLD = 100;

function estimateItemsPerPage(items: InvoiceItem[], isFirstPage: boolean) {
  const baseCount = isFirstPage
    ? BASE_ITEMS_PER_PAGE
    : BASE_ITEMS_PER_CONTINUATION_PAGE;
  const longDescriptionItems = items.filter(
    (item) =>
      (item.description?.length || 0) > LONG_DESCRIPTION_THRESHOLD ||
      (item.activity?.length || 0) > LONG_DESCRIPTION_THRESHOLD
  ).length;
  const adjustedCount = baseCount - Math.floor(longDescriptionItems / 2);
  return Math.max(1, adjustedCount);
}

function splitItemsIntoPages(items: InvoiceItem[]): InvoiceItem[][] {
  if (!items || items.length === 0) return [[]];
  const pages: InvoiceItem[][] = [];
  let currentPage: InvoiceItem[] = [];
  let currentPageItems = 0;
  let maxItemsOnCurrentPage = estimateItemsPerPage(items, true);
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const descriptionLength =
      (item.description?.length || 0) + (item.activity?.length || 0);
    let itemSpaceNeeded = 1;
    if (descriptionLength > LONG_DESCRIPTION_THRESHOLD) {
      itemSpaceNeeded = Math.ceil(
        descriptionLength / LONG_DESCRIPTION_THRESHOLD
      );
    }
    if (currentPageItems + itemSpaceNeeded > maxItemsOnCurrentPage) {
      pages.push([...currentPage]);
      currentPage = [];
      currentPageItems = 0;
      maxItemsOnCurrentPage = estimateItemsPerPage(items.slice(i), false);
    }
    currentPage.push(item);
    currentPageItems += itemSpaceNeeded;
  }
  if (currentPage.length > 0) pages.push([...currentPage]);
  return pages;
}

export const InvoicePDF: FC<InvoicePDFProps> = ({
  invoiceInfo,
  invoiceItems,
  companyInfo,
}) => {
  // Use fallback values for unit_price, quantity, and total
  const safeItems = (invoiceItems || []).map((item) => ({
    ...item,
    unit_price: typeof item.unit_price === "number" ? item.unit_price : 0,
    quantity: typeof item.quantity === "number" ? item.quantity : 0,
    total:
      typeof item.total === "number"
        ? item.total
        : typeof item.unit_price === "number" &&
            typeof item.quantity === "number"
          ? item.unit_price * item.quantity
          : 0,
  }));
  const pages = splitItemsIntoPages(safeItems);
  const total = safeItems.reduce(
    (sum, item) => sum + (item.total || item.unit_price * item.quantity),
    0
  );

  return (
    <Document>
      {pages.map((items, pageIndex) => (
        <Page key={pageIndex} wrap size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.invoiceTitle}>Invoice</Text>
              <Text>Invoice No: {invoiceInfo.invoice_number}</Text>
              <Text>Date: {invoiceInfo.date}</Text>
              <Text>Due Date: {invoiceInfo.due_date}</Text>
              <Text style={styles.description}>
                Description: {invoiceInfo.description}
              </Text>
            </View>
            <View style={styles.companyInfo}>
              {companyInfo.logo && (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image
                  cache={false}
                  src={companyInfo.logo}
                  style={styles.logo}
                />
              )}
              <Text style={{ fontWeight: "bold", fontSize: 13 }}>
                {companyInfo.name || "Contractor Name"}
              </Text>
              <Text>Address: {companyInfo.address || ""}</Text>
              <Text>Phone Number: {companyInfo.phone || ""}</Text>
              <Text>Email: {companyInfo.email || ""}</Text>
            </View>
          </View>

          {/* Table */}
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.th, styles.thNo]}>No.</Text>
              <Text style={[styles.th, styles.thActivity]}>Activity</Text>
              <Text style={[styles.th, styles.thDesc]}>Description</Text>
              <Text style={[styles.th, styles.thPrice]}>Price</Text>
              <Text style={[styles.th, styles.thQty]}>Qty</Text>
              <Text style={[styles.th, styles.thTotal]}>Total</Text>
            </View>
            {/* Table Rows */}
            {items.map((item, idx) => (
              <View
                key={idx}
                style={idx % 2 === 0 ? styles.tableRow : styles.tableRowEven}
              >
                <Text style={[styles.td, styles.tdNo]}>
                  {pageIndex === 0
                    ? idx + 1
                    : pages
                        .slice(0, pageIndex)
                        .reduce((acc, p) => acc + p.length, 0) +
                      idx +
                      1}
                </Text>
                <Text style={[styles.td, styles.tdActivity]}>
                  {item.activity || ""}
                </Text>
                <View style={[styles.td, styles.tdDesc]}>
                  <Text style={styles.descText}>{item.description || ""}</Text>
                </View>
                <Text style={[styles.td, styles.tdPrice]}>
                  ${(item.unit_price ?? 0).toFixed(2)}
                </Text>
                <Text style={[styles.td, styles.tdQty]}>
                  {item.quantity ?? 0}
                </Text>
                <Text style={[styles.td, styles.tdTotal]}>
                  ${(item.total ?? item.unit_price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Total Section - Only show on last page */}
          {pageIndex === pages.length - 1 && (
            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              </View>
            </View>
          )}

          {/* Bill To */}
          <View style={styles.billTo}>
            <Text style={styles.billToTitle}>Bill To</Text>
            <Text style={styles.billToLine}>
              Job Title: {invoiceInfo.customer_name || ""}
            </Text>
            <Text style={styles.billToLine}>
              Client Address: {invoiceInfo.customer_address || ""}
            </Text>
            <Text style={styles.billToLine}>
              Contact Information: {invoiceInfo.customer_email || ""}
            </Text>
          </View>

          {/* Footer */}
          <View fixed style={styles.footer}>
            <Text style={[styles.footerCol, styles.footerColLeft]}>
              &copy; fieldflow360.com
            </Text>
            <Text style={styles.footerCol}>
              Thank you for choosing FieldFlow360 for your drainage needs.
            </Text>
            <Text style={[styles.footerCol, styles.footerColRight]}>
              &#9993; {companyInfo.email || "customersupport@fieldflow360.com"}
            </Text>
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default InvoicePDF;
