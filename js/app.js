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
  
  // Agregar título general
  const mainTitle = document.createElement("h1");
  mainTitle.textContent = "Recetas de Maw";
  mainTitle.style.marginTop = "0";
  mainTitle.style.marginBottom = "32px";
  container.appendChild(mainTitle);
  
  index.categories.forEach(category => {
    const section = document.createElement("section");
    section.className = "category";
    
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
  backLink.style.display = show ? "flex" : "none";
}

function fixImagePaths(html) {
  return html.replace(
    /src="\/images\//g,
    'src="images/'
  );
}

async function init() {
  const recipeMarkdown = await loadRecipe();
  
  if (!recipeMarkdown) {
    // Mostrar lista de recetas
    toggleBackLink(false);
    document.getElementById("recipe-container").classList.remove("active");
    document.getElementById("recipe-list").style.display = "block";
    
    // Limpiar contenido de la receta anterior si existe
    document.getElementById("ingredients-container").innerHTML = "";
    document.getElementById("description1").innerHTML = "";
    document.getElementById("description2").innerHTML = "";
    document.getElementById("instructions-container").innerHTML = "";
    document.getElementById("image-container").innerHTML = "";
    
    const index = await loadRecipeIndex();
    renderIndex(index);
    return;
  }
  
  // Mostrar receta individual
  toggleBackLink(true);
  document.getElementById("recipe-list").style.display = "none";
  document.getElementById("recipe-container").classList.add("active");
  
  const recipe = parseRecipe(recipeMarkdown);
  document.title = recipe.title;
  document.getElementById("title").textContent = recipe.title;
  document.getElementById("description1").innerHTML = fixImagePaths(md.render(recipe.description));
  document.getElementById("description2").innerHTML = fixImagePaths(md.render(recipe.description));
  document.getElementById("ingredients-container").innerHTML = md.render(recipe.ingredients);
  document.getElementById("instructions-container").innerHTML = md.render(recipe.instructions);
  
  if (recipe.images) {
    document.getElementById("image-container").innerHTML = fixImagePaths(md.render(recipe.images));
  }
}

init().catch(console.error);