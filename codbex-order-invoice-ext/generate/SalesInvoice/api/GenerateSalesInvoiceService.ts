import { SalesOrderRepository as SalesOrderDao } from "../../../../codbex-orders/gen/codbex-orders/dao/salesorder/SalesOrderRepository";
import { SalesOrderItemRepository as SalesOrderItemDao } from "../../../../codbex-orders/gen/codbex-orders/dao/salesorder/SalesOrderItemRepository";
import { SalesInvoiceRepository as SalesInvoiceDao } from "../../../../codbex-invoices/gen/codbex-invoices/dao/salesinvoice/SalesInvoiceRepository";

import { Controller, Get } from "sdk/http";

@Controller
class GenerateSalesInvoiceService {

    private readonly salesOrderDao;
    private readonly salesOrderItemDao;
    private readonly salesInvoiceDao;

    constructor() {
        this.salesOrderDao = new SalesOrderDao();
        this.salesOrderItemDao = new SalesOrderItemDao();
        this.salesInvoiceDao = new SalesInvoiceDao();
    }

    @Get("/salesOrderData/:salesOrderId")
    public salesOrderData(_: any, ctx: any) {
        const salesOrderId = ctx.pathParameters.salesOrderId;

        let salesOrder = this.salesOrderDao.findById(salesOrderId);

        return {
            "Number": salesOrder.Number,
            // "Date": salesOrder.Date,
            // "Due": salesOrder.Due,
            "Customer": salesOrder.Customer,
            // "Net": salesOrder.Net,
            "Currency": salesOrder.Currency,
            // "Gross": salesOrder.Gross,
            "Discount": salesOrder.Discount,
            "Taxes": salesOrder.Taxes,
            // "VAT": salesOrder.VAT,
            // "Total": salesOrder.Total,
            "Conditions": salesOrder.Conditions,
            "SentMethod": salesOrder.SentMethod,
            "Company": salesOrder.Company,
            "SalesInvoiceStatus": 1,
            "Operator": salesOrder.Operator,
            "Reference": salesOrder.UUID
        };
    }

    @Get("/salesOrderItemsData/:salesOrderId")
    public salesOrderItemsData(_: any, ctx: any) {
        const salesOrderId = ctx.pathParameters.salesOrderId;

        let salesOrder = this.salesOrderDao.findById(salesOrderId);

        let salesOrderItems = this.salesOrderItemDao.findAll({
            $filter: {
                equals: {
                    SalesOrder: salesOrder.Id
                }
            }
        });

        return salesOrderItems;
    }

    @Get("/advanceInvoiceData/:salesOrderId")
    public advanceInvoiceData(_: any, ctx: any) {
        const salesOrderId = ctx.pathParameters.salesOrderId;

        let advanceInvoiceList = this.salesInvoiceDao.findAll({
            $filter: {
                equals: {
                    SalesOrder: salesOrderId,
                    SalesInvoiceType: 3
                }
            }
        });

        return advanceInvoiceList;
    }
}