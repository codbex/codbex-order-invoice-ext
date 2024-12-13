const app = angular.module('templateApp', ['ideUI', 'ideView'])
app.controller('templateController', ['$scope', '$http', 'ViewParameters', 'messageHub', function ($scope, $http, ViewParameters, messageHub) {
    const params = ViewParameters.get();
    $scope.showDialog = true;

    $scope.entity = {};
    $scope.forms = {
        details: {},
    };

    const salesOrderDataUrl = "/services/ts/codbex-order-invoice-ext/generate/SalesInvoice/api/GenerateSalesInvoiceService.ts/salesOrderData/" + params.id;
    const salesOrderItemsUrl = "/services/ts/codbex-order-invoice-ext/generate/SalesInvoice/api/GenerateSalesInvoiceService.ts/salesOrderItemsData/" + params.id;
    const advanceInvoicesUrl = "/services/ts/codbex-order-invoice-ext/generate/SalesInvoice/api/GenerateSalesInvoiceService.ts/advanceInvoiceData/" + params.id;
    const invoiceUrl = "/services/ts/codbex-invoices/gen/codbex-invoices/api/salesinvoice/SalesInvoiceService.ts/";
    const invoiceItemUrl = "/services/ts/codbex-invoices/gen/codbex-invoices/api/salesinvoice/SalesInvoiceItemService.ts/"
    const paymentMethodsUrl = "/services/ts/codbex-methods/gen/codbex-methods/api/Methods/PaymentMethodService.ts/";
    const deductionUrl = "/services/ts/codbex-invoices/gen/codbex-invoices/api/salesinvoice/DeductionService.ts/"

    $http.get(salesOrderDataUrl)
        .then(function (response) {
            $scope.SalesOrderData = response.data;
        });

    $http.get(salesOrderItemsUrl)
        .then(function (response) {
            $scope.SalesOrderItemsData = response.data;
            console.log($scope.SalesOrderItemsData);
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

    $http.get(advanceInvoicesUrl).then(function (response) {
        $scope.advanceInvoices = response.data;
    });

    $scope.selectedAdvanceInvoices = [];

    $scope.updateSelectedAdvanceInvoices = function (advance) {
        if (advance.selected) {
            $scope.selectedAdvanceInvoices.push(advance);
        } else {
            $scope.selectedAdvanceInvoices = $scope.selectedAdvanceInvoices.filter(function (item) {
                return item.Id !== advance.Id;
            });
        }
    };

    $scope.deductAdvances = function (advanceInvoices, invoiceId) {
        return advanceInvoices.map(advanceInvoice => {
            const date = new Date(advanceInvoice.Date);
            const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`; // Format as DD.MM.YYYY

            return {
                "SalesInvoice": invoiceId,
                "Name": `Advance Invoice ${advanceInvoice.Number} from ${formattedDate}`,
                "Quantity": 1,
                "UoM": 17, // Pieces
                "Price": -advanceInvoice.Net, // Negative for deduction
                "VATRate": (advanceInvoice.VAT / advanceInvoice.Net) * 100, // Calculate VAT rate
                "AdvanceInvoice": advanceInvoice.Id
            };
        });
    };

    $scope.generateInvoice = function () {
        let invoiceData = $scope.SalesOrderData;
        invoiceData.Date = new Date();
        const dueDate = new Date(invoiceData.Date);
        dueDate.setMonth(dueDate.getMonth() + 1);
        invoiceData.Due = dueDate;
        invoiceData.PaymentMethod = $scope.entity.PaymentMethod;
        invoiceData.SalesOrder = params.id;

        if ($scope.entity.fullInvoice) {
            invoiceData.Type = 3;

            $http.post(invoiceUrl, invoiceData)
                .then(function (response) {
                    $scope.Invoice = response.data

                    $scope.SalesOrderItemsData.forEach(orderItem => {
                        const salesInvoiceItem = {
                            "SalesInvoice": $scope.Invoice.Id,
                            "Name": orderItem.ProductName,
                            "Quantity": orderItem.Quantity,
                            "UoM": orderItem.UoM,
                            "Price": orderItem.Price,
                            "Net": orderItem.Net,
                            "VATRate": orderItem.VATRate,
                        };
                        $http.post(invoiceItemUrl, salesInvoiceItem);
                    });

                    const advanceInvoiceItems = $scope.deductAdvances($scope.selectedAdvanceInvoices, $scope.Invoice.Id);
                    advanceInvoiceItems.forEach(advanceInvoiceItem => {
                        $http.post(invoiceItemUrl, advanceInvoiceItem);
                        $http.post(deductionUrl, {
                            "DeductionInvoice": $scope.Invoice.Id,
                            "AdvanceInvoice": advanceInvoiceItem.AdvanceInvoice
                        });
                    });

                    console.log("Invoice created successfully: ", response.data);
                    //alert("Invoice created successfully");
                    $scope.closeDialog();
                })
                .catch(function (error) {
                    console.error("Error creating invoice: ", error);
                    //alert("Error creating sales invoice");
                    $scope.closeDialog();
                });
        } else if ($scope.entity.partialInvoice) {
            invoiceData.Type = 4;

            $http.post(invoiceUrl, invoiceData)
                .then(function (response) {
                    $scope.Invoice = response.data;
                    const partialInvoiceItem = {
                        "SalesInvoice": $scope.Invoice.Id,
                        "Name": "Partial Payment",
                        "Quantity": 1,
                        "UoM": 17, // Pieces
                        "Price": $scope.entity.PaymentAmount,
                        "VATRate": 20
                    };
                    $http.post(invoiceItemUrl, partialInvoiceItem);

                    const advanceInvoiceItems = $scope.deductAdvances($scope.selectedAdvanceInvoices, $scope.Invoice.Id);
                    advanceInvoiceItems.forEach(advanceInvoiceItem => {
                        $http.post(invoiceItemUrl, advanceInvoiceItem);
                        $http.post(deductionUrl, {
                            "DeductionInvoice": $scope.Invoice.Id,
                            "AdvanceInvoice": advanceInvoiceItem.AdvanceInvoice
                        });
                    });

                    console.log("Partial Invoice created successfully: ", response.data);
                    messageHub.showAlertSuccess("SalesInvoice", "Sales Invoice successfully created");
                    $scope.closeDialog();
                })
                .catch(function (error) {
                    console.error("Error creating invoice: ", error);
                });

        } else if ($scope.entity.advanceInvoice) {
            invoiceData.Type = 5;

            if (!$scope.entity.PaymentAmount) {
                console.error("Payment Amount is not defined.");
                return;
            }

            $http.post(invoiceUrl, invoiceData)
                .then(function (response) {
                    $scope.Invoice = response.data;

                    const advanceInvoiceItem = {
                        "SalesInvoice": $scope.Invoice.Id,
                        "Name": "Advance Payment",
                        "Quantity": 1,
                        "UoM": 17, // Pieces
                        "Price": $scope.entity.PaymentAmount,
                        "VATRate": 20
                    };

                    $http.post(invoiceItemUrl, advanceInvoiceItem)
                        .then(function (itemResponse) {
                            console.log("Advance Invoice Item created: ", itemResponse.data);
                        })
                        .catch(function (itemError) {
                            console.error("Error creating advance invoice item: ", itemError);
                        });

                    console.log("Advance Invoice created: ", response.data);
                    messageHub.showAlertSuccess("SalesInvoice", "Sales Invoice successfully created with advance amount deducted");
                    $scope.closeDialog();
                })
                .catch(function (error) {
                    console.error("Error creating advance invoice: ", error);
                });
        }
    };

    $scope.closeDialog = function () {
        $scope.showDialog = false;
        messageHub.closeDialogWindow("sales-invoice-generate");
    };

    document.getElementById("dialog").style.display = "block";
}]);