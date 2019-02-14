<h1 align="center">

<img src="https://raw.githubusercontent.com/Our-Company-Ltd/our.orders/master/branding/logo/OO_Logo_512x385.png" alt="Our Orders logo" width="192"/>
<br/>
our orders ♥
</h1>
<div align="center">
e-shop on .net core
</div>

### **Our Orders** is a new, fully featured, cross-platform e-Comerce solution running on .Net. 
 
Implement a shop in minutes on an existing website. 
With an easy and intuitive user interface, Our Orders can be used both as a **vending platform** in a **physical shop** and as an **online** sales tool. Aiming to be a full featured tools, it has been designed to be easily extended to fit all possible scenario.

### Features
- Dashboard implementing graphs to understand the sales over time
- Products, subproducts and options.
- Taxes: global and per product included and excluded taxes.
- Multiple shipping methods
- Multiple currencies
- Multiple database format: all supported by Entity Framework (SQL, SQLite, etc...), MongoDB, etc...
- Multiple payment platforms: Cash, Paypal, Stripe, PostFinace etc... out of the box and possibility to add custom of your choice
- Dispatch and stock management
- User management, assigned sales and roles support
- Multiple shops and warehouses
- Vouchers management
- Reciept, invoice and other sales documents export using **custom templates**
- HTML5 Web app support, no page reload, optimised for touch screen.
- Web API and cart support

### Installation

1. **Install Package**   
  Use the `Our.Orders` NuGet package manager inside Visual Studio, Xamarin Studio, or run the following command:
  Package Manager Console:
  ```
  PM> Install-Package Our.Orders
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
