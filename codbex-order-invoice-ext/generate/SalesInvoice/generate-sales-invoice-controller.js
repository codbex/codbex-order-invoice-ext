const app = angular.module('templateApp', []);
app.controller('templateContoller', function ($scope, $http) {
    let url_string = (window.location.href).toLowerCase();
    let url = new URL(url_string);
    let id = url.searchParams.get("id");
    $scope.showDialog = true;

    const salesOrderDataUrl = "/services/ts/codbex-order-invoice-ext/generate/SalesInvoice/api/GenerateSalesInvoiceService.ts/salesOrderData/" + id;
    $http.get(salesOrderDataUrl)
        .then(function (response) {
            $scope.SalesOrderData = response.data;
        });

    const salesOrderItemsUrl = "/services/ts/codbex-order-invoice-ext/generate/SalesInvoice/api/GenerateSalesInvoiceService.ts/salesOrderItemsData/" + id;
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
            })
            .catch(function (error) {
                console.error("Error creating invoice: ", error);
                //alert("Error creating sales invoice");
            });

        $scope.closeDialog();
    };

    $scope.closeDialog = function () {
        $scope.showDialog = false;
    };

    document.getElementById("dialog").style.display = "block";
});