export const categories = ["All", "Gift Boxes", "Islamic Frames", "Nikah Gifts", "Eid Specials"];

export const products = [
  {
    id: "1",
    name: "Premium Ayatul Kursi Frame",
    price: 2499,
    category: "Islamic Frames",
    image: "/images/ayatul_kursi.png",
    description: "Elegant Ayatul Kursi frame featuring intricate golden calligraphy on a deep black background. Perfect for home decor or gifting.",
    isFeatured: true
  },
  {
    id: "2",
    name: "Luxury Custom Nikah Hamper",
    price: 4999,
    category: "Nikah Gifts",
    image: "/images/nikah_hamper.png",
    description: "A beautifully curated hamper for the newlyweds including personalized prayer mats, tasbeeh, and attar, elegantly boxed in a premium gold-trimmed case.",
    isFeatured: true
  },
  {
    id: "3",
    name: "Personalized Velvet Quran Set",
    price: 3200,
    category: "Gift Boxes",
    image: "/images/quran_set.png",
    description: "Includes a premium velvet-covered Quran, matching tasbeeh, and a customized golden nameplate on the beautifully crafted box.",
    isFeatured: true
  },
  {
    id: "4",
    name: "Minimalist Sabr Frame",
    price: 1299,
    category: "Islamic Frames",
    image: "/images/sabr_frame.png",
    description: "A sleek and modern abstract frame with 'Sabr' (Patience) written in beautiful Arabic typography.",
    isFeatured: false
  },
  {
    id: "5",
    name: "Eid Special Attar & Dates Box",
    price: 1899,
    category: "Eid Specials",
    image: "/images/eid_attar.png",
    description: "A premium assortment of original Ajwa dates from Madinah and luxurious non-alcoholic attar in an elegant festive box.",
    isFeatured: true
  },
  {
    id: "6",
    name: "Custom Name Acrylic Stand",
    price: 1499,
    category: "Gift Boxes",
    image: "/images/acrylic_stand.png",
    description: "Clear acrylic stand featuring a beautiful 3D mirror-gold customized name in English or Arabic typography.",
    isFeatured: false
  }
];

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};
