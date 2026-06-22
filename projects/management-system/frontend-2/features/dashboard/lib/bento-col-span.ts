const XL_COLS = 4;
const MD_COLS = 2;

function spanForLastRowItem(
  indexInLastRow: number,
  itemsInLastRow: number,
  cols: number
): number {
  if (itemsInLastRow <= 0) {
    return 1;
  }
  if (itemsInLastRow === 1) {
    return 1;
  }
  if (itemsInLastRow === 2) {
    return cols / 2;
  }
  if (itemsInLastRow === 3 && cols === 4) {
    return indexInLastRow === 0 ? 2 : 1;
  }
  return 1;
}

function colSpanClass(span: number, prefix: "md" | "xl"): string {
  if (span >= 4 && prefix === "xl") {
    return "xl:col-span-4";
  }
  if (span >= 3 && prefix === "xl") {
    return "xl:col-span-3";
  }
  if (span >= 2) {
    return prefix === "md" ? "md:col-span-2" : "xl:col-span-2";
  }
  return prefix === "md" ? "md:col-span-1" : "xl:col-span-1";
}

/** Full width when the priority row has a single widget. */
export function getDashboardPriorityColSpan(
  _index: number,
  total: number
): string {
  if (total === 1) {
    return "md:col-span-2";
  }
  return "";
}

/** Expands widgets on the last grid row so partial rows do not leave empty columns. */
export function getDashboardRowColSpan(
  index: number,
  total: number,
  xlCols: number,
  expandLoneItem = false
): string {
  if (total <= 0) {
    return "";
  }

  if (total === 1 && expandLoneItem) {
    if (xlCols >= 4) {
      return "md:col-span-2 xl:col-span-4";
    }
    if (xlCols === 3) {
      return "md:col-span-2 xl:col-span-3";
    }
    return "md:col-span-2 xl:col-span-2";
  }

  const xlRemainder = total % xlCols;
  const mdRemainder = total % MD_COLS;

  const xlLastRowStart = xlRemainder === 0 ? total : total - xlRemainder;
  const mdLastRowStart = mdRemainder === 0 ? total : total - mdRemainder;

  const classes: string[] = [];

  if (index >= xlLastRowStart && xlRemainder !== 0) {
    const span = spanForLastRowItem(
      index - xlLastRowStart,
      xlRemainder,
      xlCols
    );
    classes.push(colSpanClass(span, "xl"));
  } else {
    classes.push("xl:col-span-1");
  }

  if (index >= mdLastRowStart && mdRemainder !== 0) {
    const span = spanForLastRowItem(
      index - mdLastRowStart,
      mdRemainder,
      MD_COLS
    );
    classes.push(colSpanClass(span, "md"));
  } else {
    classes.push("md:col-span-1");
  }

  return classes.join(" ");
}

export function getDashboardBentoColSpan(index: number, total: number): string {
  return getDashboardRowColSpan(index, total, XL_COLS);
}
