import { PurchaseInvoiceRepository as PurchaseInvoiceDao } from "../../../../codbex-invoices/gen/dao/purchaseinvoice/PurchaseInvoiceRepository";
import { PurchaseInvoiceItemRepository as PurchaseInvoiceItemDao } from "../../../../codbex-invoices/gen/dao/purchaseinvoice/PurchaseInvoiceItemRepository";
import { SupplierRepository as SupplierDao } from "../../../../codbex-partners/gen/dao/Suppliers/SupplierRepository";
import { ProductRepository as ProductDao } from "../../../../codbex-products/gen/dao/Products/ProductRepository";
import { CompanyRepository as CompanyDao } from "../../../../codbex-companies/gen/dao/Companies/CompanyRepository";
import { CityRepository as CityDao } from "../../../../codbex-cities/gen/dao/Cities/CityRepository";
import { CountryRepository as CountryDao } from "../../../../codbex-countries/gen/dao/Countries/CountryRepository";
import { PaymentMethodRepository as PaymentMethodDao } from "../../../../codbex-methods/gen/dao/Methods/PaymentMethodRepository";
import { SentMethodRepository as SentMethodDao } from "../../../../codbex-methods/gen/dao/Methods/SentMethodRepository";

import { Controller, Get } from "sdk/http";

@Controller
class PurchaseInvoiceService {

    private readonly purchaseInvoiceDao;
    private readonly purchaseInvoiceItemDao;
    private readonly supplierDao;
    private readonly productDao;
    private readonly companyDao;
    private readonly cityDao;
    private readonly countryDao;
    private readonly paymentMethodDao;
    private readonly sentMethodDao;

    constructor() {
        this.purchaseInvoiceDao = new PurchaseInvoiceDao();
        this.purchaseInvoiceItemDao = new PurchaseInvoiceItemDao();
        this.supplierDao = new SupplierDao();
        this.productDao = new ProductDao();
        this.companyDao = new CompanyDao();
        this.cityDao = new CityDao();
        this.countryDao = new CountryDao();
        this.paymentMethodDao = new PaymentMethodDao();
        this.sentMethodDao = new SentMethodDao();
    }

    @Get("/:purchaseInvoiceId")
    public purchaseInvoiceData(_: any, ctx: any) {
        const purchaseInvoiceId = ctx.pathParameters.purchaseInvoiceId;

        let purchaseInvoice = this.purchaseInvoiceDao.findById(purchaseInvoiceId);
        let paymentMethod = this.paymentMethodDao.findById(purchaseInvoice.PaymentMethod);
        let sentMethod = this.sentMethodDao.findById(purchaseInvoice.SentMethod);

        purchaseInvoice.PaymentMethod = paymentMethod.Name;
        purchaseInvoice.SentMethod = sentMethod.Name;

        let purchaseInvoiceItems = this.purchaseInvoiceItemDao.findAll({
            $filter: {
                equals: {
                    PurchaseInvoice: purchaseInvoice.Id
                }
            }
        });

        purchaseInvoiceItems.forEach((item: any) => {
            let product = this.productDao.findById(item.Product);
            item.Product = product.Name;
        });

        let company;

        if (purchaseInvoice.Company) {
            company = this.companyDao.findById(purchaseInvoice.Company);
            let city = this.cityDao.findById(company.City);
            let country = this.countryDao.findById(company.Country);

            company.CityName = city.Name;
            company.Country = country.Name;
        }

        let supplier = this.supplierDao.findById(purchaseInvoice.Supplier);

        return {
            purchaseInvoice: purchaseInvoice,
            purchaseInvoiceItems: purchaseInvoiceItems,
            supplier: supplier,
            company: company
        }
    }
}