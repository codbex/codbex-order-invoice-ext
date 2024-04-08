const viewData = {
    id: 'sales-order-print',
    label: 'Print',
    link: '/services/web/codbex-order-invoice-ext/print/SalesOrder/print-sales-order.html',
    perspective: 'SalesOrder',
    view: 'SalesOrder',
    type: 'entity',
    order: 40
};

if (typeof exports !== 'undefined') {
    exports.getDialogWindow = function () {
        return viewData;
    }
}