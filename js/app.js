const md = window.markdownit();

async function loadRecipe() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("recipe");
  if (!id) return null;

  const res = await fetch(`recipes/${id}.md`);
  return res.text();
}

async function loadRecipeIndex() {
  const res = await fetch("recipes/index.yaml");
  const text = await res.text();
  return jsyaml.load(text);
}

function parseRecipe(markdown) {
  const titleMatch = markdown.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1] : "Receta";

  const sections = markdown.match(/\n## (.|\n)+?(?=\n## |$)/g) || [];

  return {
    title,
    description: markdown.split("##")[0].replace(/^#.+\n/, ""),
    ingredients: sections[0],
    instructions: sections[1],
    images: sections[2]
  };
}

function renderIndex(index) {
  const container = document.getElementById("recipe-list");
  container.innerHTML = "";

  index.categories.forEach(category => {
    const section = document.createElement("section");

    const title = document.createElement("h2");
    title.textContent = category.title;
    section.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "card-grid";

    category.recipes.forEach(recipe => {
      const card = document.createElement("a");
      card.className = "recipe-card";
      card.href = `?recipe=${recipe.id}`;

      card.innerHTML = `
        <img src="images/${recipe.id}.jpg"
             alt="${recipe.title}"
             onerror="this.src='images/placeholder.jpg'">

        <div class="card-title">
          ${recipe.title}
        </div>
      `;

      grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

function toggleBackLink(show) {
  const backLink = document.getElementById("back-link");
  backLink.style.display = show ? "inline-flex" : "none";
}

async function init() {
  const recipeMarkdown = await loadRecipe();

  if (!recipeMarkdown) {
    toggleBackLink(false);

    const index = await loadRecipeIndex();
    renderIndex(index);
    return;
  }

  toggleBackLink(true);

  const recipe = parseRecipe(recipeMarkdown);

  document.title = recipe.title;
  document.getElementById("title").textContent = recipe.title;
  document.getElementById("description").innerHTML = md.render(recipe.description);
  document.getElementById("ingredients-container").innerHTML = md.render(recipe.ingredients);
  document.getElementById("instructions-container").innerHTML = md.render(recipe.instructions);

  if (recipe.images) {
    document.getElementById("image-container").innerHTML = md.render(recipe.images);
  }

  document.getElementById("recipe-container").style.display = "block";
}


init().catch(console.error);
