import Link from "next/link";

const wishlistItems = [
  {
    image: "/assets/images/products/table/product-1.jpg",
    title: "Beige knitted elastic runner shoes",
    price: "$84.00",
    stockText: "In stock",
    stockClass: "in-stock",
    action: "options",
  },
  {
    image: "/assets/images/products/table/product-2.jpg",
    title: "Blue utility pinafore denim dress",
    price: "$76.00",
    stockText: "In stock",
    stockClass: "in-stock",
    action: "cart",
  },
  {
    image: "/assets/images/products/table/product-3.jpg",
    title: "Orange saddle lock front chain cross body bag",
    price: "$52.00",
    stockText: "Out of stock",
    stockClass: "out-of-stock",
    action: "disabled",
  },
];

export default function WishlistMain() {
  return (
    <main className="main">
      <div
        className="page-header text-center"
        style={{ backgroundImage: "url('/assets/images/page-header-bg.jpg')" }}
      >
        <div className="container">
          <h1 className="page-title">
            Wishlist<span>Shop</span>
          </h1>
        </div>
      </div>

      <nav aria-label="breadcrumb" className="breadcrumb-nav">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <a href="#">Shop</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Wishlist
            </li>
          </ol>
        </div>
      </nav>

      <div className="page-content">
        <div className="container">
          <table className="table table-wishlist table-mobile">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock Status</th>
                <th></th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {wishlistItems.map((item) => (
                <tr key={item.title}>
                  <td className="product-col">
                    <div className="product">
                      <figure className="product-media">
                        <Link href="/product">
                          <img src={item.image} alt="Product image" />
                        </Link>
                      </figure>

                      <h3 className="product-title">
                        <Link href="/product">{item.title}</Link>
                      </h3>
                    </div>
                  </td>
                  <td className="price-col">{item.price}</td>
                  <td className="stock-col">
                    <span className={item.stockClass}>{item.stockText}</span>
                  </td>
                  <td className="action-col">
                    {item.action === "options" ? (
                      <div className="dropdown">
                        <button
                          className="btn btn-block btn-outline-primary-2"
                          data-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false"
                        >
                          <i className="icon-list-alt"></i>Select Options
                        </button>

                        <div className="dropdown-menu">
                          <a className="dropdown-item" href="#">
                            First option
                          </a>
                          <a className="dropdown-item" href="#">
                            Another option
                          </a>
                          <a className="dropdown-item" href="#">
                            The best option
                          </a>
                        </div>
                      </div>
                    ) : item.action === "cart" ? (
                      <button className="btn btn-block btn-outline-primary-2">
                        <i className="icon-cart-plus"></i>Add to Cart
                      </button>
                    ) : (
                      <button className="btn btn-block btn-outline-primary-2 disabled">
                        Out of Stock
                      </button>
                    )}
                  </td>
                  <td className="remove-col">
                    <button className="btn-remove">
                      <i className="icon-close"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="wishlist-share">
            <div className="social-icons social-icons-sm mb-2">
              <label className="social-label">Share on:</label>
              <a href="#" className="social-icon" title="Facebook" target="_blank">
                <i className="icon-facebook-f"></i>
              </a>
              <a href="#" className="social-icon" title="Twitter" target="_blank">
                <i className="icon-twitter"></i>
              </a>
              <a href="#" className="social-icon" title="Instagram" target="_blank">
                <i className="icon-instagram"></i>
              </a>
              <a href="#" className="social-icon" title="Youtube" target="_blank">
                <i className="icon-youtube"></i>
              </a>
              <a href="#" className="social-icon" title="Pinterest" target="_blank">
                <i className="icon-pinterest"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
