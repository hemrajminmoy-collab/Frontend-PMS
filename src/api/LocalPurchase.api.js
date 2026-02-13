

const addToLocalPurchase = async (rowData) => {
  await fetch("https://backend-pms-three.vercel.app/indent/add-to-localPurchase", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rowData),
  });
};

export { addToLocalPurchase };