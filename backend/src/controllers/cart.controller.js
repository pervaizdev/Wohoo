import Cart from "../models/Cart.js";
import Product from "../models/product.js";

// Helper to compute totals
const computeTotals = (cart) => {
  const totalItems = cart.items.reduce((acc, it) => acc + it.qty, 0);
  const subtotal = cart.items.reduce((acc, it) => acc + it.qty * it.price, 0);
  return { totalItems, subtotal };
};

// POST /api/cart/add  { productId or slug, qty?, size? }
export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id; // from protect middleware
    const { productId, slug, qty = 1, size = "" } = req.body;

    if (!productId && !slug) {
      return res.status(400).json({ success: false, message: "productId or slug is required" });
    }

    // Find product by id or slug
    const product = productId
      ? await Product.findById(productId)
      : await Product.findOne({ slug });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Validate size if provided
    if (size && product.sizes?.length && !product.sizes.includes(size)) {
      return res.status(400).json({ success: false, message: "Invalid size selection" });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = await Cart.create({ user: userId, items: [] });

    // If same product+size exists, increment qty; else push
    const idx = cart.items.findIndex(
      (it) => String(it.product) === String(product._id) && it.size === (size || "")
    );

    if (idx > -1) {
      cart.items[idx].qty += Number(qty) || 1;
    } else {
      cart.items.push({
        product: product._id,
        slug: product.slug,
        title: product.title,
        imageUrl: product.imageUrl,
        price: product.price, // snapshot now; you can reprice later at checkout
        size: size || "",
        qty: Number(qty) || 1,
      });
    }

    await cart.save();
    const totals = computeTotals(cart);
    return res.status(200).json({ success: true, cart, ...totals });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/cart  -> current user's cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }) || { items: [] };
    const totals = computeTotals(cart);
    return res.status(200).json({ success: true, cart, ...totals });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// PATCH /api/cart/item/:itemId  { qty?, size? } (size change optional)
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { qty, size } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    if (qty !== undefined) {
      const q = Number(qty);
      if (Number.isNaN(q) || q < 1) {
        return res.status(400).json({ success: false, message: "Invalid qty" });
      }
      item.qty = q;
    }

    if (size !== undefined) {
      // Optional: validate size against Product
      const product = await Product.findById(item.product);
      if (size && product?.sizes?.length && !product.sizes.includes(size)) {
        return res.status(400).json({ success: false, message: "Invalid size selection" });
      }
      item.size = size || "";
    }

    await cart.save();
    const totals = computeTotals(cart);
    return res.status(200).json({ success: true, cart, ...totals });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// DELETE /api/cart/item/:itemId
export const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    item.deleteOne();
    await cart.save();

    const totals = computeTotals(cart);
    return res.status(200).json({ success: true, cart, ...totals });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// POST /api/cart/clear
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(200).json({ success: true, cart: { items: [] }, totalItems: 0, subtotal: 0 });

    cart.items = [];
    await cart.save();
    return res.status(200).json({ success: true, cart, totalItems: 0, subtotal: 0 });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
