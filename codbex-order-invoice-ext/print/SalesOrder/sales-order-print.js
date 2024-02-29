exports.getAction = function () {
    return {
        id: 'sales-order-print',
        label: 'Print',
        perspective: 'SalesOrder',
        view: 'SalesOrder',
        type: 'entity',
        link: '/services/web/codbex-order-invoice-ext/print/SalesOrder/print-sales-order.html'
    }
}