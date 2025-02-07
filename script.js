document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("myForm");
    const detailsList = document.getElementById("detailsList");

    let editMode = false;
    let editItemId = null;

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
            if (editMode) {
                // Update existing item
                await axios.put(`http://localhost:3000/api/updateStoreItem/${editItemId}`, {
                    name,
                    description,
                    quantity,
                });

                updateListItem(editItemId, name, description, quantity);
                editMode = false;
                editItemId = null;
            } else {
                // Create new item
                const { data } = await axios.post("http://localhost:3000/api/postStoreItem", {
                    name,
                    description,
                    quantity,
                });

                addToList(data.id, name, description, quantity);
            }

            form.reset();
        } catch (error) {
            console.error("Error saving data:", error);
        }
    });

    async function fetchData() {
        try {
            const { data } = await axios.get("http://localhost:3000/api/getStoreItem");
            data.forEach(({ id, name, description, quantity }) => addToList(id, name, description, quantity));
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    function addToList(id, name, description, quantity) {
        const li = document.createElement("li");
        li.dataset.id = id;
        li.dataset.quantity = quantity;
        li.dataset.name = name;
        li.dataset.description = description;

        li.innerHTML = `
            <span>${id} - ${name} - ${description} - <strong>Qty: ${quantity}</strong></span>
            <button class="buy" data-amount="1">Buy 1</button>
            <button class="buy" data-amount="2">Buy 2</button>
            <button class="buy" data-amount="3">Buy 3</button>
            <button class="edit">Edit</button>
            <button class="delete">Delete</button>
        `;
        detailsList.appendChild(li);
    }

    function updateListItem(id, name, description, quantity) {
        const li = document.querySelector(`li[data-id="${id}"]`);
        if (li) {
            li.dataset.name = name;
            li.dataset.description = description;
            li.dataset.quantity = quantity;
            li.innerHTML = `
                <span>${id} - ${name} - ${description} - <strong>Qty: ${quantity}</strong></span>
                <button class="buy" data-amount="1">Buy 1</button>
                <button class="buy" data-amount="2">Buy 2</button>
                <button class="buy" data-amount="3">Buy 3</button>
                <button class="edit">Edit</button>
                <button class="delete">Delete</button>
            `;
        }
    }

    detailsList.addEventListener("click", async (event) => {
        const target = event.target;
        const li = target.closest("li");
        if (!li) return;

        if (target.classList.contains("buy")) {
            const storeItemId = li.dataset.id;
            const amount = parseInt(target.dataset.amount);
            let currentQuantity = parseInt(li.dataset.quantity);

            if (currentQuantity < amount) {
                alert("Not enough stock available!");
                return;
            }

            try {
                const newQuantity = currentQuantity - amount;

                await axios.put(`http://localhost:3000/api/updateStoreItem/${storeItemId}`, {
                    name: li.dataset.name,
                    description: li.dataset.description,
                    quantity: newQuantity,
                });

                li.dataset.quantity = newQuantity;
                li.querySelector("strong").textContent = `Qty: ${newQuantity}`;
            } catch (error) {
                console.error("Failed to update quantity:", error);
                alert("Failed to update quantity. Please try again.");
            }
        }

        else if (target.classList.contains("edit")) {
            document.getElementById("name").value = li.dataset.name;
            document.getElementById("description").value = li.dataset.description;
            document.getElementById("quantity").value = li.dataset.quantity;

            editMode = true;
            editItemId = li.dataset.id;
        }

        else if (target.classList.contains("delete")) {
            const storeItemId = li.dataset.id;

            if (confirm("Are you sure you want to delete this item?")) {
                try {
                    await axios.delete(`http://localhost:3000/api/deleteStoreItem/${storeItemId}`);
                    li.remove();
                } catch (error) {
                    console.error("Failed to delete item:", error);
                    alert("Failed to delete item. Please try again.");
                }
            }
        }
    });

    fetchData();
});
