// for keywords popular searches (uses global `popularSearches`)
const hero_searches = document.querySelector('.hero-searches');
const popularSearches=window.popularSearches || [""];

if (hero_searches) {
    let span=document.createElement('span');
    span.textContent="Recherches populaires: ";
    hero_searches.appendChild(span);
    for (const el of popularSearches) {
        let a=document.createElement('a');
        a.href=el|| "#";
        a.textContent=el;
        hero_searches.appendChild(a);
        if (el !== popularSearches[popularSearches.length - 1]) {
            hero_searches.appendChild(document.createTextNode(","));
        }
    }
} else {
    console.warn('No .hero-searches container found in the DOM.');
}