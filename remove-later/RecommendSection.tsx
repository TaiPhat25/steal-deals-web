import DragScrollRow from "./DragScrollRow";
import FlashStyleProductCard from "./FlashStyleProductCard";

const recommendProducts = [
  {
    imageSrc: "/assets/images/demos/demo-28/flash/7.jpg",
    imageAlt: "Rye Bread",
    category: "Bakery",
    title: "Rye Bread (800g)",
    price: "$3.99",
    ratingText: "(5 reviews)",
    sold: 31,
    soldPercent: 55,
  },
  {
    imageSrc: "/assets/images/demos/demo-28/flash/8.jpg",
    imageAlt: "Shrimp",
    category: "Seafood",
    title: "Shrimp - Jumbo (5 lb)",
    price: "$38.00",
    ratingText: "(10 reviews)",
    sold: 10,
    soldPercent: 22,
    labelTop: "Top",
  },
  {
    imageSrc: "/assets/images/demos/demo-28/flash/9.jpg",
    imageAlt: "Fresh Mussel",
    category: "Seafood",
    title: "Fresh Mussel (500g)",
    price: "$12.80",
    oldPrice: "$22.90",
    ratingText: "(2 reviews)",
    sold: 24,
    soldPercent: 45,
    labelSale: "Save: 30%",
  },
  {
    imageSrc: "/assets/images/demos/demo-28/flash/10.jpg",
    imageAlt: "Orange Juice",
    category: "Drinks",
    title: "Organic Pure Juice Fresh Pressed Orange - 32 fl oz",
    price: "$4.89",
    ratingText: "(2 reviews)",
    sold: 52,
    soldPercent: 75,
  },
  {
    imageSrc: "/assets/images/demos/demo-28/flash/11.jpg",
    imageAlt: "Soya Chips",
    category: "Vegetables",
    title: "Healthy Fried Soya Stick Chips (100g)",
    price: "$2.59",
    oldPrice: "$10.90",
    ratingText: "(2 reviews)",
    sold: 41,
    soldPercent: 60,
    labelSale: "Save: 30%",
  },
  {
    imageSrc: "/assets/images/demos/demo-28/flash/12.jpg",
    imageAlt: "Apricot",
    category: "Fruits",
    title: "Ripe apricot fruits (540g)",
    price: "$12.99",
    ratingText: "(2 reviews)",
    sold: 24,
    soldPercent: 45,
  },
  {
    imageSrc: "/assets/images/demos/demo-28/flash/12.jpg",
    imageAlt: "Apricot",
    category: "Fruits",
    title: "Ripe apricot fruits (540g)",
    price: "$12.99",
    ratingText: "(2 reviews)",
    sold: 24,
    soldPercent: 45,
  },
];

export default function RecommendSection() {
  return (
    <div className="recommend-section py-2 pb-5 border-0">
      <div className="container">
        <div className="heading">
          <h2 className="title align-self-center letter-spacing-normal text-center text-md-left">
            Recommended For You
          </h2>
        </div>
        <DragScrollRow className="products drag-scroll-row drag-scroll-row--products">
          {recommendProducts.map((product, index) => (
            <FlashStyleProductCard key={`${product.title}-${index}`} {...product} />
          ))}
        </DragScrollRow>
      </div>
    </div>
  );
}
