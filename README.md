<h1 align="center">

<img src="https://raw.githubusercontent.com/Our-Company-Ltd/our.orders/master/branding/logo/logo.192.png" alt="Our Orders logo" width="192"/>
<br/>
Our Orders ♥
</h1>
<div align="center">
e-shop on .net core<br/>
badges
</div>

### **Our Orders** is a new, fully featured, cross-platform e-Comerce solution running on .Net. 
 
Our orders implements a shop in minutes on an existing website. 
With a easy and intuitive user interface, it allows to be used both as a **vending platform** in a **physical shop** and as a sales managing tools. Aiming to be a full featured tools, it has been designed to be easily extended to fit all possible scenario.

### Features
- Dashboard implementing graphs to understand the sales over time
- Products, subproducts and options support.
- General and per product included and excluded taxes.
- Multiple shipping methods
- Multiple currencies
- Multiple database format: all supported by Entity Framework (SQL, SQLite, etc...), MongoDB, etc...
- Multiple payment platforms: Cash, Paypal, Stripe, PostFinace etc... out of the box and possibility to add custom of your choice
- Dispatch and stock management
- User management, assigned sales and roles support
- Multiple Shops and multiple warehouses support
- Vouchers creation and payment support
- Reciept, invoice and other sales documents export using custom templates
- HTML5 Web app support, no page reload, optimised for touch screen.
- Web API and Cart management

### Installation

1. **Install Package**   
  Use the `Our.Orders` NuGet package manager inside Visual Studio, Xamarin Studio, or run the following command:
  Package Manager Console:
  ```
  PM> Install-Package TaxJar
  ```
  .Net CLI:
  ```
  dotnet add package Our.Orders
  ```

2. **Add to startup**

  ``` csharp
  public void ConfigureServices(IServiceCollection services)
  {
    ...
    services.AddOurOrders();
    ...
  }
  
  public void Configure(IApplicationBuilder app, ...)
  {
    ...
    app.UseOurOrders();
    ...
  }
  ```
3. **First run**   
  launch the webiste and access Our Orders on the path `/orders` create the first user and you are good to go !
  
### Configuration

1. setup path, currencies, weight, tax rates, etc...
2. Add newsletter tool...
3. Add payment providers
4. Setup Database
5. Intergate with Website
6. Add random content
