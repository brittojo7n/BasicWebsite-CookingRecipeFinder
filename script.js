const recipeGrid = document.getElementById('recipeGrid');
const favoritesGrid = document.getElementById('favorites');
const modal = document.getElementById('recipeModal');
const modalContent = document.getElementById('modalRecipeDetails');
const modalCloseButton = document.querySelector('.close-button');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

const searchRecipes = async () => {
  const query = searchInput.value.trim();
  if (!query) return;

  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
  const data = await res.json();
  const meals = data.meals;

  recipeGrid.innerHTML = "";

  if (!meals) {
    recipeGrid.innerHTML = `<p style="color:white;">No recipes found. Try a different keyword!</p>`;
    return;
  }

  meals.forEach(meal => {
    const card = createRecipeCard(meal, { showAdd: true, showRemove: false });
    recipeGrid.appendChild(card);
  });
};

const createRecipeCard = (meal, { showAdd = false, showRemove = false } = {}) => {
  const card = document.createElement('div');
  card.className = 'recipe-card';
  card.innerHTML = `
    <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
    <h4>${meal.strMeal}</h4>
    ${showAdd ? `<button onclick="addToFavorites('${meal.idMeal}')">Add to Favorites</button>` : ''}
    ${showRemove ? `<button onclick="removeFromFavorites('${meal.idMeal}')">Remove from Favorites</button>` : ''}
  `;
  
  card.addEventListener('click', (e) => {
    if (e.target.tagName === "BUTTON") return;
    showRecipePopup(meal);
  });

  return card;
};

const showRecipePopup = (meal) => {
  let ingredientsHTML = '<ul>';
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== '') {
      ingredientsHTML += `<li>${measure} ${ingredient}</li>`;
    }
  }
  ingredientsHTML += '</ul>';

  modalContent.innerHTML = `
    <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
    <h2>${meal.strMeal}</h2>
    <h3>Ingredients</h3>
    ${ingredientsHTML}
    <h3>Instructions</h3>
    <p>${meal.strInstructions}</p>
  `;

  modal.style.display = 'block';
};

const addToFavorites = (id) => {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (favorites.includes(id)) {
    alert('Already in favorites!');
    return;
  }
  favorites.push(id);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  loadFavorites();
};

const removeFromFavorites = (id) => {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites = favorites.filter(favId => favId !== id);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  loadFavorites();
};

const loadFavorites = async () => {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favoritesGrid.innerHTML = "";

  if (favorites.length === 0) {
    favoritesGrid.innerHTML = `<p style="color:white;">No favorite recipes added yet.</p>`;
    return;
  }

  for (const id of favorites) {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const data = await res.json();
    const meal = data.meals[0];
    const card = createRecipeCard(meal, { showAdd: false, showRemove: true });
    favoritesGrid.appendChild(card);
  }
};

searchButton.addEventListener('click', searchRecipes);
searchInput.addEventListener('keyup', (e) => e.key === 'Enter' && searchRecipes());
modalCloseButton.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => e.target === modal && (modal.style.display = 'none'));
window.addEventListener('load', loadFavorites);