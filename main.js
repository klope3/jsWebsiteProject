//#region Variables & Constants
const collectionMain = document.querySelector("#collection-main");
const collectionFavorites = document.querySelector("#collection-favorites");
const collectionMainSort = document.querySelector("#collectionMainSort");
const collectionFavSort = document.querySelector("#collectionFavSort");
const collectionMainSum = document.querySelector("#collectionMainSum");
const collectionFavSum = document.querySelector("#collectionFavSum");
const asteroids = new Map();
const sortSettings = new Map([
    [collectionMain, false],
    [collectionFavorites, false],
])
let reverseMain = true;
let reverseFavs = false;
//#endregion
//#region Execution
fetch("https://api.le-systeme-solaire.net/rest/bodies?filter[]=bodyType,eq,asteroid&filter[]=meanRadius,gt,0").then(response => response.json()).then(data => buildCollectionMain(data));
collectionMainSort.addEventListener("click", () => {
    let curSetting = sortSettings.get(collectionMain);
    sortSettings.set(collectionMain, !curSetting);
    sortCollection(collectionMain);
});
collectionFavSort.addEventListener("click", () => {
    let curSetting = sortSettings.get(collectionFavorites);
    sortSettings.set(collectionFavorites, !curSetting);
    sortCollection(collectionFavorites);
});
//endregion
//#region Functions
function buildCollectionMain(data)
{
    console.log(data);
    for (let ast of data.bodies)
    {
        let builtEntry = buildEntry(ast);
        asteroids.set(builtEntry, ast);
        collectionMain.appendChild(builtEntry);
    }
    console.log(asteroids);
    sortCollection(collectionMain);
}

function buildEntry(asteroid)
{
    let itemDiv = document.createElement("div");
    itemDiv.classList.add("item");
    itemDiv.addEventListener("click", clickEvent => moveClickedItem(clickEvent));

    let h2 = document.createElement("h2");
    let astName = asteroid.englishName.split(" ");
    astName.shift();
    astName = astName.join();
    astName = astName.replace(",", " ");
    let h2Text = document.createTextNode(astName);
    h2.appendChild(h2Text);
    itemDiv.appendChild(h2);
    itemDiv.dataset.astName = astName;

    let ul = document.createElement("ul");
    itemDiv.appendChild(ul);

    let mass = asteroid.mass;
    let massString = mass == null ? "[Not Found]" : `${asteroid.mass.massValue}x10^${asteroid.mass.massExponent}`;
    ul.appendChild(buildItemDataRow("Mass:", massString));
    ul.appendChild(buildItemDataRow("Mean Radius:", asteroid.meanRadius));
    ul.appendChild(buildItemDataRow("Discovered:", asteroid.discoveryDate));

    return itemDiv;
}

function buildItemDataRow(rowLabel, rowValue)
{
    let li = document.createElement("li");
    
    let strong = document.createElement("strong");
    let strongText = document.createTextNode(rowLabel);
    strong.appendChild(strongText);
    li.appendChild(strong);

    let span = document.createElement("span");
    let spanText = document.createTextNode(rowValue);
    span.appendChild(spanText);
    li.appendChild(span);

    return li;
}

function moveClickedItem(clickEvent)
{
    let target = clickEvent.target;
    target.classList.remove("transition");
    let curParent = target.parentElement;
    let newParent = curParent === collectionMain ? collectionFavorites : collectionMain;
    let startRect = target.getBoundingClientRect();
    newParent.appendChild(target)
    sortCollection(newParent);
    updateSums();
    let endRect = target.getBoundingClientRect();
    let differenceX = startRect.x - endRect.x;
    let differenceY = startRect.y - endRect.y;
    target.style.transform = `translate(${differenceX}px, ${differenceY}px)`;
    setTimeout(() => {
        target.classList.add("transition");
        target.style.transform = "translate(0)";
    }, 1);
}

function updateSums()
{

}

function sortCollection(targetCollection)
{
    let children = targetCollection.childNodes;
    let childrenArr = Array.from(children);
    let reverse = sortSettings.get(targetCollection);
    childrenArr.sort((a, b) => compareStrings(a.dataset.astName, b.dataset.astName, reverse));
    for (let child of childrenArr)
    {
        targetCollection.appendChild(child);
    }
}

function compareStrings(str1, str2, reverse)
{
    if (str1.toLowerCase() < str2.toLowerCase()) 
    { 
        let result = reverse ? 1 : -1;
        return result; 
    }
    if (str1.toLowerCase() > str2.toLowerCase()) 
    { 
        let result = reverse ? -1 : 1;
        return result; 
    }
    return 0;
}
//#endregion