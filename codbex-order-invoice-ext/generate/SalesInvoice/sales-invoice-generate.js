const viewData = {
    id: 'sales-invoice-generate',
    label: 'Generate Sales Invoice',
    link: '/services/web/codbex-order-invoice-ext/generate/SalesInvoice/generate-sales-invoice.html',
    perspective: 'SalesOrder',
    view: 'SalesOrder',
    type: 'entity',
    order: 20
};

if (typeof exports !== 'undefined') {
    exports.getDialogWindow = function () {
        return viewData;
    }
}