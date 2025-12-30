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

function renderIndex(data) {
  const el = document.getElementById("recipe-list");

  el.innerHTML = data.categories.map(cat => `
    <section class="category">
      <h2>${cat.title}</h2>
      <div class="recipe-grid">
        ${cat.recipes.map(r => `
          <a class="recipe-card" href="?recipe=${r.id}">
            ${r.title}
          </a>
        `).join("")}
      </div>
    </section>
  `).join("");

  el.style.display = "block";
}

async function init() {
  const recipeMarkdown = await loadRecipe();

  if (!recipeMarkdown) {
    const index = await loadRecipeIndex();
    renderIndex(index);
    return;
  }

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
