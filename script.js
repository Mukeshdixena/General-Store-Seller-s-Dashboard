document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("myForm");
    const detailsList = document.getElementById("detailsList");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const description = document.getElementById("description").value.trim();
        const quantity = parseInt(document.getElementById("quantity").value.trim());

        if (!name || !description || isNaN(quantity) || quantity <= 0) {
            alert("Please fill in all fields with valid values.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3000/api/postStoreItem", {
                name,
                description,
                quantity,
            });

            addToList(response.data.id, name, description, quantity);
            form.reset();
        } catch (error) {
            console.error("Error posting data:", error);
        }
    });

    async function fetchData() {
        try {
            const response = await axios.get("http://localhost:3000/api/getStoreItem");
            response.data.data.forEach(({ id, name, description, quantity }) => {
                addToList(id, name, description, quantity);
            });
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    function addToList(id, name, description, quantity) {
        const li = document.createElement("li");
        li.dataset.id = id;
        li.dataset.quantity = quantity;
        li.innerHTML = `
            <span>${id} - ${name} - ${description} - <strong>Qty: ${quantity}</strong></span>
            <button class="buy" data-amount="1">Buy 1</button>
            <button class="buy" data-amount="2">Buy 2</button>
            <button class="buy" data-amount="3">Buy 3</button>
        `;
        detailsList.appendChild(li);
    }

    detailsList.addEventListener("click", async (event) => {
        const target = event.target;
        const li = target.closest("li");
        if (!li) return;

        if (target.classList.contains("buy")) {
            const id = li.dataset.id;
            const amount = parseInt(target.dataset.amount);
            let currentQuantity = parseInt(li.dataset.quantity); // Current stock quantity
            const currentName = li.dataset.name; // No need to use parseInt on name
            const currentDescription = li.dataset.description; // No need to use parseInt on description

            if (currentQuantity >= amount) {
                const newQuantity = currentQuantity - amount;

                try {
                    // Send PATCH request to update the store item
                    await axios.patch(`http://localhost:3000/api/updateStoreItem/${id}`, {
                        name: currentName,
                        quantity: newQuantity,
                        description: currentDescription
                    });

                    // Update the UI to reflect the new quantity
                    li.dataset.quantity = newQuantity;
                    li.querySelector("strong").textContent = `Qty: ${newQuantity}`;

                } catch (error) {
                    console.error("Failed to update quantity:", error);
                    alert("Failed to update quantity. Please try again.");
                }
            } else {
                alert("Not enough stock available!");
            }
        }
    });


    fetchData();
});
