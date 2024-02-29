exports.getAction = function () {
    return {
        id: 'purchase-order-print',
        label: 'Print',
        perspective: 'PurchaseOrder',
        view: 'PurchaseOrder',
        type: 'entity',
        link: '/services/web/codbex-order-invoice-ext/print/PurchaseOrder/print-purchase-order.html'
    }
}