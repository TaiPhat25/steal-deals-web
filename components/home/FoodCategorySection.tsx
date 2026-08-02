import Link from "next/link";

const categories = [
  { name: "Bakery", count: "12 bags", image: "3.jpg" },
  { name: "Fruits", count: "9 bags", image: "2.jpg" },
  { name: "Vegetables", count: "14 bags", image: "4.jpg" },
  { name: "Prepared Meals", count: "8 bags", image: "1.jpg" },
  { name: "Seafood", count: "6 bags", image: "5.jpg" },
  { name: "Drinks", count: "7 bags", image: "6.jpg" },
  { name: "Dairy & Cheese", count: "5 bags", image: "7.jpg" },
  { name: "Vegetarian", count: "10 bags", image: "8.jpg" },
];

export default function FoodCategorySection() {
  return (
    <section className="home-category-section container" aria-labelledby="category-title">
      <hr className="m-0" />
      <div className="home-category-heading">
        <div>
          <p className="home-category-heading__eyebrow">Find your next rescue meal</p>
          <h2 id="category-title" className="title mb-1">Browse by Category</h2>
          <p className="home-category-heading__description mb-0">
            Explore surprise bags from the food categories you enjoy most.
          </p>
        </div>
        <Link href="/category?sort=random" className="home-category-heading__link">
          Explore random picks
          <i className="icon-angle-right" aria-hidden="true"></i>
        </Link>
      </div>
      <div className="cat-section mt-4 mb-3">
        <div className="row">
          {categories.map((category) => {
            const categoryHref = `/category?category=${encodeURIComponent(category.name)}`;

            return (
              <div key={category.name} className="col-6 col-sm-4 col-md-3 col-xl-8col">
                <div className="cat bg-white pt-1 mb-2">
                  <div className="cat-image d-flex justify-content-center align-items-center">
                    <Link href={categoryHref}>
                      <img
                        src={`/assets/images/demos/demo-28/categories/${category.image}`}
                        width="137"
                        height="137"
                        alt={`${category.name} surprise bags`}
                      />
                    </Link>
                  </div>
                  <div className="cat-content text-center">
                    <Link href={categoryHref} className="cat-title">{category.name}</Link>
                    <h4 className="cat-count letter-spacing-normal d-block font-weight-light">
                      {category.count}
                    </h4>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
