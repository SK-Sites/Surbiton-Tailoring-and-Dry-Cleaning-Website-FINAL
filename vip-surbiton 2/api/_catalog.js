// PRICE LIST (single source for the booking form, the price list and the totals). Prices in PENCE: 995 = £9.95.
// pricesAreFrom: true => every price is shown as "From £X" (never a fixed price). The final price is always confirmed by Nash.
// quote: true  => no price; shown as "Quote After Order Confirmation" and never added to the estimated total.
// pricePence: null (and no quote flag) => "Price to be confirmed".
// VIP is not VAT registered: no VAT is added.
module.exports = {
  confirmed: true,
  pricesAreFrom: true,
  items: [
    { id: "suit-2pc", group: "Suits", name: "Two-piece suit, dry cleaning", pricePence: 1560 },
    { id: "suit-3pc", group: "Suits", name: "Three-piece suit, dry cleaning", pricePence: 2140 },
    { id: "jacket", group: "Suits", name: "Jacket, dry cleaning", pricePence: 990 },
    { id: "trousers", group: "Suits", name: "Trousers, dry cleaning", pricePence: 720 },
    { id: "waistcoat", group: "Suits", name: "Waistcoat, dry cleaning", pricePence: 550 },
    { id: "shirt", group: "Shirts & knitwear", name: "Shirt, wash and press", pricePence: 295 },
    { id: "shirt-dc", group: "Shirts & knitwear", name: "Shirt, dry cleaning", pricePence: 595 },
    { id: "blouse", group: "Shirts & knitwear", name: "Ladies' blouse, dry cleaning", pricePence: 695 },
    { id: "tie", group: "Shirts & knitwear", name: "Tie, dry cleaning", pricePence: 495 },
    { id: "jumper", group: "Shirts & knitwear", name: "Jumper / knitwear, dry cleaning", pricePence: 825 },
    { id: "skirt", group: "Dresses & coats", name: "Skirt, dry cleaning", pricePence: 800 },
    { id: "coat", group: "Dresses & coats", name: "Coat, dry cleaning", pricePence: 1845 },
    { id: "dress", group: "Dresses & coats", name: "Dress, dry cleaning", pricePence: null, quote: true },
    { id: "dress-evening", group: "Dresses & coats", name: "Evening / delicate dress, dry cleaning", pricePence: null, quote: true },
    { id: "wedding-dress", group: "Dresses & coats", name: "Wedding / bridal dress cleaning", pricePence: null, quote: true },
    { id: "alteration", group: "Alterations", name: "Clothing alterations", pricePence: 995 },
    { id: "trouser-hem", group: "Alterations", name: "Hem stitch, pair of trousers", pricePence: 995 },
    { id: "jacket-sleeve", group: "Alterations", name: "Jacket sleeve alteration", pricePence: 3495 },
    { id: "bridal", group: "Bridal & bespoke", name: "Bridal alterations", pricePence: null, quote: true },
    { id: "bespoke", group: "Bridal & bespoke", name: "Bespoke tailoring", pricePence: null, quote: true },
    { id: "duvet", group: "Household", name: "Duvet cleaning", pricePence: null, quote: true },
    { id: "curtains", group: "Household", name: "Curtains", pricePence: null, quote: true },
    { id: "rugs", group: "Household", name: "Rugs", pricePence: null, quote: true },
    { id: "upholstery", group: "Household", name: "Upholstery", pricePence: null, quote: true },
    { id: "shoes", group: "Specialist", name: "Shoe repairs", pricePence: null, quote: true },
    { id: "suede", group: "Specialist", name: "Suede repairs and cleaning", pricePence: null, quote: true },
    { id: "uniform", group: "Specialist", name: "Uniforms and schoolwear", pricePence: null, quote: true },
    { id: "asian", group: "Specialist", name: "Asian clothing", pricePence: null, quote: true },
    { id: "other", group: "Specialist", name: "Any other request", pricePence: null, quote: true },
  ],
};
