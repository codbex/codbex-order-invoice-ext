const viewData = {
    id: 'sales-invoice-print',
    label: 'Print',
    link: '/services/web/codbex-order-invoice-ext/print/SalesInvoice/print-sales-invoice.html',
    perspective: 'salesinvoice',
    view: 'SalesInvoice',
    type: 'entity',
    order: 30
};

if (typeof exports !== 'undefined') {
    exports.getDialogWindow = function () {
        return viewData;
    }
}