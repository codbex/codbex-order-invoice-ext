exports.getAction = function () {
    return {
        id: 'sales-invoice-generate',
        label: 'Generate Sales Invoice',
        perspective: 'SalesOrder',
        view: 'SalesOrder',
        type: 'entity',
        link: '/services/web/codbex-order-invoice-ext/generate/SalesInvoice/generate-sales-invoice.html'
    }
}