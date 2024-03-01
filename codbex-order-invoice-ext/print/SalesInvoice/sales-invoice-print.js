exports.getAction = function () {
    return {
        id: 'sales-invoice-print',
        label: 'Print',
        perspective: 'salesinvoice',
        view: 'SalesInvoice',
        type: 'entity',
        link: '/services/web/codbex-order-invoice-ext/print/SalesInvoice/print-sales-invoice.html'
    }
}