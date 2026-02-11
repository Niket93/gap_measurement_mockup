export function formatMm(v: number) {
    // i18n-ready formatting (English only for now)
    const nf = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 3,
        minimumFractionDigits: 0
    });
    return `${nf.format(v)} mm`;
}
