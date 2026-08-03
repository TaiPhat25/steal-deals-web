type FlashStyleProductCardProps = {
  imageSrc: string;
  imageAlt: string;
  category: string;
  title: string;
  price: string;
  oldPrice?: string;
  ratingText: string;
  sold: number;
  soldPercent: number;
  labelTop?: string;
  labelSale?: string;
};

export default function FlashStyleProductCard({
  imageSrc,
  imageAlt,
  category,
  title,
  price,
  oldPrice,
  ratingText,
  sold,
  soldPercent,
  labelTop,
  labelSale,
}: FlashStyleProductCardProps) {
  return (
    <div className="product flash-style-product-card mb-0 rounded-0 w-100">
      <figure className="product-media bg-white ">
        <a href="#">
          {labelTop ? <span className="product-label label-top">{labelTop}</span> : null}
          {labelSale ? <span className="product-label label-sale">{labelSale}</span> : null}
          <img src={imageSrc} width="192" height="192" alt={imageAlt} />
        </a>
        <a
          href="#"
          className="btn-product-zoom btn-quickview"
          data-product-id="260"
          title="Quick view"
        >
          <span>Quick view</span>
        </a>
        {labelTop || labelSale ? <div className="product-labels"></div> : null}
      </figure>
      <div className="product-body position-static bg-transparent">
        <div className="product-cat overflow-hidden my-2 mt-0 font-weight-normal">
          <a href="#">{category}</a>
        </div>
        <a href="#">
          <h3 className="product-title overflow-hidden letter-spacing-normal">{title}</h3>
        </a>
        <div className="product-price font-weight-bold align-items-center d-flex mb-0">
          {oldPrice ? (
            <>
              <h4 className="new-price font-weight-bold mb-0">{price}</h4>
              <h4 className="old-price font-weight-normal mb-0">{oldPrice}</h4>
            </>
          ) : (
            price
          )}
        </div>
        <div className="product-sold position-absolute">
          <div className="product-sold-val" style={{ width: `${soldPercent}%` }}></div>
        </div>
        <span className="sold-text font-weight-normal text-light position-absolute">Sold: {sold}</span>
        <div className="product-footer bg-white rounded-0 d-block position-absolute">
          <div className="ratings-container text-truncate">
            <div className="ratings">
              <div className="ratings-val" style={{ width: "40%" }}></div>
              <a href="product.html" className="ratings-text font-weight-normal">
                {ratingText}
              </a>
            </div>
          </div>
          <div className="product-action d-flex justify-content-center flex-column align-items-center position-relative">
            <a
              href="#"
              className="btn btn-product font-weight-normal text-uppercase text-truncate btn-cart btn-outline-primary-2 btn-outline-primary-2"
            >
              <span>Add To Cart</span>
            </a>
            <a href="#" className="wishlist-link-product px-3 ml-0 font-weight-normal mt-1">
              <i className="icon-heart-o"></i>
              <span>Add to wishlist</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
