const app = angular.module('templateApp', ['ideUI', 'ideView']);
app.controller('templateController', ['$scope', '$http', 'ViewParameters', 'messageHub', function ($scope, $http, ViewParameters, messageHub) {
    const params = ViewParameters.get();
    $scope.showDialog = true;

    const salesOrderDataUrl = "/services/ts/codbex-order-invoice-ext/generate/SalesInvoice/api/GenerateSalesInvoiceService.ts/salesOrderData/" + params.id;
    $http.get(salesOrderDataUrl)
        .then(function (response) {
            $scope.SalesOrderData = response.data;
        });

    const salesOrderItemsUrl = "/services/ts/codbex-order-invoice-ext/generate/SalesInvoice/api/GenerateSalesInvoiceService.ts/salesOrderItemsData/" + params.id;
    $http.get(salesOrderItemsUrl)
        .then(function (response) {
            $scope.SalesOrderItemsData = response.data;
        });

    $scope.generateInvoice = function () {
        const invoiceUrl = "/services/ts/codbex-invoices/gen/api/salesinvoice/SalesInvoiceService.ts/";

        $http.post(invoiceUrl, $scope.SalesOrderData)
            .then(function (response) {
                $scope.Invoice = response.data
                if (!angular.equals($scope.OrderItems, {})) {
                    $scope.SalesOrderItemsData.forEach(orderItem => {
                        const salesInvoiceItem = {
                            "SalesInvoice": $scope.Invoice.Id,
                            "Product": orderItem.Product,
                            "Quantity": orderItem.Quantity,
                            "UoM": orderItem.UoM,
                            "Price": orderItem.Price,
                            "Net": orderItem.Net,
                            "VAT": orderItem.VAT,
                            "Gross": orderItem.Gross
                        };
                        let invoiceItemUrl = "/services/ts/codbex-invoices/gen/api/salesinvoice/SalesInvoiceItemService.ts/"
                        $http.post(invoiceItemUrl, salesInvoiceItem);
                    });
                }

                console.log("Invoice created successfully: ", response.data);
                //alert("Invoice created successfully");
                $scope.closeDialog();
            })
            .catch(function (error) {
                console.error("Error creating invoice: ", error);
                //alert("Error creating sales invoice");
                $scope.closeDialog();
            });
    };

    $scope.closeDialog = function () {
        $scope.showDialog = false;
        messageHub.closeDialogWindow("sales-invoice-generate");
    };

    document.getElementById("dialog").style.display = "block";
}]);