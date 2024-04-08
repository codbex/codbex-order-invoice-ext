const viewData = {
    id: 'purchase-invoice-generate',
    label: 'Generate Purchase Invoice',
    link: '/services/web/codbex-order-invoice-ext/generate/PurchaseInvoice/generate-purchase-invoice.html',
    perspective: 'PurchaseOrder',
    view: 'PurchaseOrder',
    type: 'entity',
    order: 10
};

if (typeof exports !== 'undefined') {
    exports.getDialogWindow = function () {
        return viewData;
    }
}