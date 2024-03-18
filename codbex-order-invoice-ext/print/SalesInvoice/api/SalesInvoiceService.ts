import { SalesInvoiceRepository as SalesInvoiceDao } from "../../../../codbex-invoices/gen/dao/salesinvoice/SalesInvoiceRepository";
import { SalesInvoiceItemRepository as SalesInvoiceItemDao } from "../../../../codbex-invoices/gen/dao/salesinvoice/SalesInvoiceItemRepository";
import { CustomerRepository as CustomerDao } from "../../../../codbex-partners/gen/dao/Customers/CustomerRepository";
import { ProductRepository as ProductDao } from "../../../../codbex-products/gen/dao/Products/ProductRepository";
import { CompanyRepository as CompanyDao } from "../../../../codbex-companies/gen/dao/Companies/CompanyRepository";
import { CityRepository as CityDao } from "../../../../codbex-cities/gen/dao/Cities/CityRepository";
import { CountryRepository as CountryDao } from "../../../../codbex-countries/gen/dao/Countries/CountryRepository";
import { PaymentMethodRepository as PaymentMethodDao } from "../../../../codbex-methods/gen/dao/Methods/PaymentMethodRepository";
import { SentMethodRepository as SentMethodDao } from "../../../../codbex-methods/gen/dao/Methods/SentMethodRepository";

import { Controller, Get } from "sdk/http";

@Controller
class SalesInvoiceService {

    private readonly salesInvoiceDao;
    private readonly salesInvoiceItemDao;
    private readonly customerDao;
    private readonly productDao;
    private readonly companyDao;
    private readonly cityDao;
    private readonly countryDao;
    private readonly paymentMethodDao;
    private readonly sentMethodDao;

    constructor() {
        this.salesInvoiceDao = new SalesInvoiceDao();
        this.salesInvoiceItemDao = new SalesInvoiceItemDao();
        this.customerDao = new CustomerDao();
        this.productDao = new ProductDao();
        this.companyDao = new CompanyDao();
        this.cityDao = new CityDao();
        this.countryDao = new CountryDao();
        this.paymentMethodDao = new PaymentMethodDao();
        this.sentMethodDao = new SentMethodDao();
    }

    @Get("/:salesInvoiceId")
    public salesInvoiceData(_: any, ctx: any) {
        const salesInvoiceId = ctx.pathParameters.salesInvoiceId;

        let salesInvoice = this.salesInvoiceDao.findById(salesInvoiceId);
        let paymentMethod = this.paymentMethodDao.findById(salesInvoice.PaymentMethod);
        let sentMethod = this.sentMethodDao.findById(salesInvoice.SentMethod);

        salesInvoice.PaymentMethod = paymentMethod.Name;
        salesInvoice.SentMethod = sentMethod.Name;

        let salesInvoiceItems = this.salesInvoiceItemDao.findAll({
            $filter: {
                equals: {
                    SalesInvoice: salesInvoice.Id
                }
            }
        });

        salesInvoiceItems.forEach((item: any) => {
            let product = this.productDao.findById(item.Product);
            item.Product = product.Name;
        });

        let company;

        if (salesInvoice.Company) {
            company = this.companyDao.findById(salesInvoice.Company);
            let city = this.cityDao.findById(company.City);
            let country = this.countryDao.findById(company.Country);

            company.CityName = city.Name;
            company.Country = country.Name;
        }

        let customer = this.customerDao.findById(salesInvoice.Customer);

        return {
            salesInvoice: salesInvoice,
            salesInvoiceItems: salesInvoiceItems,
            customer: customer,
            company: company
        }
    }
}