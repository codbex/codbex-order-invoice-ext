const app = angular.module('templateApp', []);
app.controller('templateContoller', function ($scope, $http) {
    let url_string = (window.location.href).toLowerCase();
    let url = new URL(url_string);
    let id = url.searchParams.get("id");
    $scope.showDialog = true;

    const purchaseOrderDataUrl = "/services/ts/codbex-order-invoice-ext/generate/PurchaseInvoice/api/GeneratePurchaseInvoiceService.ts/purchaseOrderData/" + id;
    $http.get(purchaseOrderDataUrl)
        .then(function (response) {
            $scope.PurchaseOrderData = response.data;
        });

    const purchaseOrderItemsUrl = "/services/ts/codbex-order-invoice-ext/generate/PurchaseInvoice/api/GeneratePurchaseInvoiceService.ts/purchaseOrderItemsData/" + id;
    $http.get(purchaseOrderItemsUrl)
        .then(function (response) {
            $scope.PurchaseOrderItemsData = response.data;
        });

    $scope.generateInvoice = function () {
        const invoiceUrl = "/services/ts/codbex-invoices/gen/api/purchaseinvoice/PurchaseInvoiceService.ts/";

        $http.post(invoiceUrl, $scope.PurchaseOrderData)
            .then(function (response) {
                $scope.Invoice = response.data
                if (!angular.equals($scope.OrderItems, {})) {
                    $scope.PurchaseOrderItemsData.forEach(orderItem => {
                        const purchaseInvoiceItem = {
                            "PurchaseInvoice": $scope.Invoice.Id,
                            "Product": orderItem.Product,
                            "Quantity": orderItem.Quantity,
                            "UoM": orderItem.UoM,
                            "Price": orderItem.Price,
                            "Net": orderItem.Net,
                            "VAT": orderItem.VAT,
                            "Gross": orderItem.Gross
                        };
                        let invoiceItemUrl = "/services/ts/codbex-invoices/gen/api/purchaseinvoice/PurchaseInvoiceItemService.ts/"
                        $http.post(invoiceItemUrl, purchaseInvoiceItem);
                    });
                }

                console.log("Invoice created successfully: ", response.data);
                //alert("Invoice created successfully");
            })
            .catch(function (error) {
                console.error("Error creating invoice: ", error);
                //alert("Error creating purchase invoice");
            });

        $scope.closeDialog();
    };

    $scope.closeDialog = function () {
        $scope.showDialog = false;
    };

    document.getElementById("dialog").style.display = "block";
});