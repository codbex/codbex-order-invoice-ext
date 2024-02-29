exports.getAction = function () {
    return {
        id: 'purchase-invoice-generate',
        label: 'Generate Purchase Invoice',
        perspective: 'PurchaseOrder',
        view: 'PurchaseOrder',
        type: 'entity',
        link: '/services/web/codbex-order-invoice-ext/generate/PurchaseInvoice/generate-purchase-invoice.html'
    }
}