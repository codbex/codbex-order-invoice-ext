const app = angular.module('templateApp', ['ideUI', 'ideView'])
    .config(["messageHubProvider", function (messageHubProvider) {
        messageHubProvider.eventIdPrefix = 'codbex-invoices.salesinvoice.SalesInvoice';
    }]);
app.controller('templateController', ['$scope', '$http', 'ViewParameters', 'messageHub', function ($scope, $http, ViewParameters, messageHub) {
    const params = ViewParameters.get();
    $scope.showDialog = true;

    $scope.entity = {};
    $scope.forms = {
        details: {},
    };

    const salesOrderDataUrl = "/services/ts/codbex-order-invoice-ext/generate/SalesInvoice/api/GenerateSalesInvoiceService.ts/salesOrderData/" + params.id;
    const salesOrderItemsUrl = "/services/ts/codbex-order-invoice-ext/generate/SalesInvoice/api/GenerateSalesInvoiceService.ts/salesOrderItemsData/" + params.id;
    const invoiceUrl = "/services/ts/codbex-invoices/gen/codbex-invoices/api/salesinvoice/SalesInvoiceService.ts/";
    const invoiceItemUrl = "/services/ts/codbex-invoices/gen/codbex-invoices/api/salesinvoice/SalesInvoiceItemService.ts/"
    const paymentMethodsUrl = "/services/ts/codbex-methods/gen/codbex-methods/api/Methods/PaymentMethodService.ts/";

    $http.get(salesOrderDataUrl)
        .then(function (response) {
            $scope.SalesOrderData = response.data;
        });

    $http.get(salesOrderItemsUrl)
        .then(function (response) {
            $scope.SalesOrderItemsData = response.data;
        });

    $http.get(paymentMethodsUrl)
        .then(function (response) {
            let paymenMethodOptions = response.data;

            $scope.optionsPaymentMethod = paymenMethodOptions.map(function (value) {
                return {
                    value: value.Id,
                    text: value.Name
                };
            });
        });

    $scope.generateInvoice = function () {

        let invoiceData = $scope.SalesOrderData;
        invoiceData.Date = new Date();
        const dueDate = new Date(invoiceData.Date); // Clone the Date object
        dueDate.setMonth(dueDate.getMonth() + 1); // Add one month
        invoiceData.Due = dueDate;
        invoiceData.PaymentMethod = $scope.entity.PaymentMethod;

        // Check the type of invoice and handle accordingly
        if ($scope.entity.fullInvoice) {
            // Full invoice: use the net amount from the order and transfer all order items
            invoiceData.SalesInvoiceType = 1; // Full Invoice Type

            $http.post(invoiceUrl, invoiceData)
                .then(function (response) {
                    $scope.Invoice = response.data;

                    // Transfer all order items
                    if (!angular.equals($scope.SalesOrderItemsData, {})) {
                        $scope.SalesOrderItemsData.forEach(orderItem => {
                            const salesInvoiceItem = {
                                "SalesInvoice": $scope.Invoice.Id,
                                "Name": orderItem.Product,
                                "Quantity": orderItem.Quantity,
                                "UoM": orderItem.UoM,
                                "Price": orderItem.Price
                            };
                            $http.post(invoiceItemUrl, salesInvoiceItem);
                        });
                    }

                    console.log("Full Invoice created successfully: ", response.data);
                    messageHub.showAlertSuccess("SalesInvoice", "Sales Invoice successfully created");
                    $scope.closeDialog();
                })
                .catch(function (error) {
                    console.error("Error creating full invoice: ", error);
                    $scope.closeDialog();
                });

        } else if ($scope.entity.advanceInvoice || $scope.entity.partialInvoice) {
            // Advance or partial invoice: use the new amount and create only one invoice item
            invoiceData.SalesInvoiceType = $scope.entity.advanceInvoice ? 3 : 2; // Advance = 3, Partial = 2

            // Post the invoice first and wait for the response before creating the invoice item
            $http.post(invoiceUrl, invoiceData)
                .then(function (response) {
                    $scope.Invoice = response.data; // The invoice is created here

                    // Check if PaymentAmount is valid before creating an item
                    if ($scope.entity.PaymentAmount && $scope.entity.PaymentAmount > 0) {

                        // Determine the invoice type for the Name field
                        const invoiceTypeName = $scope.entity.advanceInvoice ? "Advance Payment" : "Partial Payment";

                        // Create one invoice item with the type of the invoice and order number
                        const salesInvoiceItem = {
                            "SalesInvoice": $scope.Invoice.Id,
                            "Name": `${invoiceTypeName} for Order ${$scope.SalesOrderData.Number}`, // Include invoice type in Name
                            "Quantity": 1, // Single item for partial/advance invoice
                            "UoM": 17, // Pieces
                            "Price": $scope.entity.PaymentAmount // The net amount for partial/advance invoice
                        };

                        console.log("Invoice item data: ", salesInvoiceItem);
                        // Post the single invoice item
                        $http.post(invoiceItemUrl, salesInvoiceItem)
                            .then((itemResponse) => {
                                console.log("Invoice item created successfully: ", itemResponse.data);
                                messageHub.showAlertSuccess("SalesInvoice", "Sales Invoice successfully created with item");
                            })
                            .catch(function (error) {
                                console.error("Error creating invoice item: ", error);
                                messageHub.showAlertError("SalesInvoice", "Failed to create invoice item");
                            });

                        $scope.closeDialog();
                    } else {
                        console.error("Payment amount is invalid for partial/advance invoice.");
                        messageHub.showAlertError("SalesInvoice", "Invalid payment amount");
                    }
                })
                .catch(function (error) {
                    console.error("Error creating partial/advance invoice: ", error);
                    $scope.closeDialog();
                });
        }

    };

    $scope.closeDialog = function () {
        $scope.showDialog = false;
        messageHub.closeDialogWindow("sales-invoice-generate");
    };

    document.getElementById("dialog").style.display = "block";
}]);