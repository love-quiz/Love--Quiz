const storageKey = "shoplaunch-products";
let products = JSON.parse(localStorage.getItem(storageKey) || "[]");
let cart = [];

const form = document.getElementById("productForm");
const productsNode = document.getElementById("products");
const cartNode = document.getElementById("cart");
const totalNode = document.getElementById("cartTotal");
const paymentMethod = document.getElementById("paymentMethod");
const paymentDetail = document.getElementById("paymentDetail");
const paymentHint = document.getElementById("paymentHint");

function saveProducts() {
  localStorage.setItem(storageKey, JSON.stringify(products));
}

function clearForm() {
  form.reset();
  document.getElementById("productId").value = "";
}

function renderProducts() {
  productsNode.innerHTML = "";
  const template = document.getElementById("productTemplate");

  if (!products.length) {
    productsNode.innerHTML = "<p>No products yet. Add your first product above.</p>";
    return;
  }

  products.forEach((product) => {
    const clone = template.content.cloneNode(true);
    clone.querySelector(".thumb").src = product.image || "https://placehold.co/600x400?text=No+Image";
    clone.querySelector(".title").textContent = product.name;
    clone.querySelector(".desc").textContent = product.description;
    clone.querySelector(".price").textContent = `KES ${Number(product.price).toLocaleString()}`;

    clone.querySelector(".edit").addEventListener("click", () => {
      document.getElementById("productId").value = product.id;
      document.getElementById("name").value = product.name;
      document.getElementById("price").value = product.price;
      document.getElementById("description").value = product.description;
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    clone.querySelector(".delete").addEventListener("click", () => {
      products = products.filter((p) => p.id !== product.id);
      saveProducts();
      renderProducts();
    });

    clone.querySelector(".add").addEventListener("click", () => {
      cart.push(product);
      renderCart();
    });

    productsNode.appendChild(clone);
  });
}

function renderCart() {
  cartNode.innerHTML = "";
  if (!cart.length) {
    cartNode.innerHTML = "<p>Your cart is empty.</p>";
    totalNode.textContent = "0";
    return;
  }

  let total = 0;
  cart.forEach((item, index) => {
    total += Number(item.price);
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `<span>${item.name}</span><span>KES ${Number(item.price).toLocaleString()}</span>`;
    row.addEventListener("click", () => {
      cart.splice(index, 1);
      renderCart();
    });
    cartNode.appendChild(row);
  });

  totalNode.textContent = total.toLocaleString();
}

function methodLabel(method) {
  if (method === "mpesa") return "Phone Number (M-Pesa)";
  if (method === "airtel") return "Phone Number (Airtel Money)";
  return "Visa Card Number";
}

paymentMethod.addEventListener("change", () => {
  document.getElementById("paymentFieldLabel").firstChild.textContent = `${methodLabel(paymentMethod.value)} `;
  paymentDetail.placeholder = paymentMethod.value === "visa" ? "4111 1111 1111 1111" : "07XXXXXXXX";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const id = document.getElementById("productId").value || crypto.randomUUID();
  const name = document.getElementById("name").value.trim();
  const price = Number(document.getElementById("price").value);
  const description = document.getElementById("description").value.trim();
  const imageInput = document.getElementById("image");

  const upsert = (image) => {
    const payload = { id, name, price, description, image };
    const existing = products.findIndex((p) => p.id === id);
    if (existing === -1) products.push(payload);
    else products[existing] = payload;

    saveProducts();
    renderProducts();
    clearForm();
  };

  if (imageInput.files[0]) {
    const reader = new FileReader();
    reader.onload = () => upsert(reader.result);
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    const existing = products.find((p) => p.id === id);
    upsert(existing?.image || "");
  }
});

document.getElementById("clearBtn").addEventListener("click", clearForm);

document.getElementById("payBtn").addEventListener("click", () => {
  if (!cart.length) {
    paymentHint.textContent = "Add products to cart before paying.";
    return;
  }

  if (!paymentDetail.value.trim()) {
    paymentHint.textContent = "Enter phone or card details to continue.";
    return;
  }

  const method = paymentMethod.value;
  if (method === "mpesa") {
    paymentHint.textContent = "M-Pesa STK push sent. Check your phone to complete payment.";
  } else if (method === "airtel") {
    paymentHint.textContent = "Airtel Money prompt sent. Approve payment on your phone.";
  } else {
    paymentHint.textContent = "Visa payment authorized successfully.";
  }

  cart = [];
  renderCart();
});

renderProducts();
renderCart();
