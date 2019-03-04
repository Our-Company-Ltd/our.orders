<h1 align="center">

<img src="https://raw.githubusercontent.com/Our-Company-Ltd/our.orders/master/branding/logo/OO_Logo_512x385.png" alt="Our Orders logo" width="192"/>
<br/>
Our Orders ♥
</h1>
<div align="center">
e-shop on .net core
</div>
<div align="center">
 
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/our.orders/blob/master/LICENSE)
[![Twitter](https://img.shields.io/twitter/url/http/shields.io.svg?style=flat&logo=twitter)](https://twitter.com/intent/tweet?hashtags=our-orders,dotnet&text=Our%20Orders%20%E2%99%A5%20E-shop%20on%20.net%20core&url=https%3a%2f%2fgithub.com%2fOur-Company-Ltd%2four.orders)
</div>

### **Our Orders** is a new, fully featured, cross-platform e-Commerce solution running on .Net. 
 
Implement a shop in minutes on an existing website. 
With an easy and intuitive user interface, Our Orders can be used both as a **vending platform** in a **physical shop** and as an **online** sales tool. Aiming to be a full featured tools, it has been designed to be easily extended to fit all possible scenario.

### Features
- Dashboard with clean graphs to understand the sales over time
- Products, subproducts and options.
- Taxes: global and per product included and excluded taxes.
- Multiple shipping methods
- Multiple currencies
- Multiple database format: all supported by Entity Framework (SQL, SQLite, etc...), MongoDB, etc...
- Multiple payment platforms: Cash, [Paypal](https://github.com/Our-Company-Ltd/our.orders/wiki/💰-Payments#paypal), [Stripe](https://github.com/Our-Company-Ltd/our.orders/wiki/💰-Payments#stripe), [PostFinace](https://github.com/Our-Company-Ltd/our.orders/wiki/💰-Payments#postfinance) etc... out of the box and possibility to add custom of your choice
- Dispatch and stock management
- User management, assigned sales and roles support
- One click add to [MailChimp](https://github.com/Our-Company-Ltd/our.orders/wiki/Newsletter-tools#mailchimp), [Campaign monitor](https://github.com/Our-Company-Ltd/our.orders/wiki/Newsletter-tools#campaignmonitor) or [other](https://github.com/Our-Company-Ltd/our.orders/wiki/Newsletter-tools#custom) newsletter services
- Multiple shops and warehouses
- Vouchers management
- Reciept, invoice and other sales documents export using **custom templates**
- HTML5 Web app support, no page reload, optimised for touch screen.
- Web API and cart support

## Installation

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
    services
      .AddOurOrders()
      .UseEntityFramework(options => options.UseSqlite("Data Source=our.orders.db"));
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
  
## Configuration
The configuration can be modified either using the `appsettings.json` file by sending an `IConfiguration` (typicaly injected in the Startup.cs constructor) or using a configuration lambda passed upon adding Our Orders in `ConfigureServices`.

**using appsettings.json**
 ``` json
 // appsettings.json
 {
  "our-orders" : {
   "Path": "my-custom-path",
   "JwtSecret": "my custom secret key"
  }
 }
 ```
 ``` csharp
 // Startup.cs
 public class Startup
 {
   ...
   public IConfiguration Configuration { get; }
   ...
   public Startup(IConfiguration configuration , ...)
   {
     ...
     Configuration = configuration;
     ...
   }
   ...
   public void ConfigureServices(IServiceCollection services)
   {
     ...
     services
        .AddOurOrders(Configuration)
     ...
   }
   ...
 }
 ```
**using lambda**
 ``` csharp
 // Startup.cs
 public class Startup
 {
   ...
   public IConfiguration Configuration { get; }
   ...
   public Startup(IConfiguration configuration , ...)
   {
     ...
     Configuration = configuration;
     ...
   }
   ...
   public void ConfigureServices(IServiceCollection services)
   {
     ...
     services
       .AddOurOrders((settings) => {
         settings.Path = "my-custom-path";
         settings.JwtSecret = "my custom secret key";
       })
     ...
   }
   ...
 }
 ```
## Add newsletter, Paypal, Stripe, custom invoices…
[Check the wiki for documentation about configuring in depth Our Orders…](https://github.com/Our-Company-Ltd/our.orders/wiki)

## Build Status

|             |Master|Develop|
|-------------|:----------:|:-----------:|
|**Linux/Mac**|[![Build Status](https://travis-ci.org/Our-Company-Ltd/our.orders.svg?branch=master)](https://travis-ci.org/Our-Company-Ltd/our.orders)|[![Build Status](https://travis-ci.org/Our-Company-Ltd/our.orders.svg?branch=develop)](https://travis-ci.org/Our-Company-Ltd/our.orders)|

## Screens

<img src="https://raw.githubusercontent.com/Our-Company-Ltd/our.orders/master/branding/OO_screens.gif" alt="Our Order screens" width="100%"/>
