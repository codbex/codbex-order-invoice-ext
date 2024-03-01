exports.getAction = function () {
    return {
        id: 'purchase-invoice-print',
        label: 'Print',
        perspective: 'purchaseinvoice',
        view: 'PurchaseInvoice',
        type: 'entity',
        link: '/services/web/codbex-order-invoice-ext/print/PurchaseInvoice/print-purchase-invoice.html'
    }
}