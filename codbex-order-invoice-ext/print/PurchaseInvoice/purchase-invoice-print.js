const viewData = {
    id: 'purchase-invoice-print',
    label: 'Print',
    link: '/services/web/codbex-order-invoice-ext/print/PurchaseInvoice/print-purchase-invoice.html',
    perspective: 'purchaseinvoice',
    view: 'PurchaseInvoice',
    type: 'entity',
    order: 10
};

if (typeof exports !== 'undefined') {
    exports.getDialogWindow = function () {
        return viewData;
    }
}