//#region Classes
class Collection 
{
    constructor(listDivID)
    {
        this.listDiv = document.querySelector(`#${listDivID}`);
        this.reverseSort = false;
        this.sumDiv = document.querySelector(`#${listDivID}-sum`);
        this.numberSpan = document.createElement("span");
        this.superscript = document.createElement("sup");
        this.unitSpan = document.createElement("span");
        this.numberSpan.textContent = "0";
        this.unitSpan.textContent = " kg";
        this.sumDiv.appendChild(this.numberSpan);
        this.sumDiv.appendChild(this.superscript);
        this.sumDiv.appendChild(this.unitSpan);
        //this.asteroids = [];
        this.massSum = new SciNotNumber(0, 0);
    }

    invertSortSetting = () => this.reverseSort = !this.reverseSort;

    addMass(mass, multiplier = 1)
    {
        if (mass === null) { return; }
        let num = new SciNotNumber(mass.massValue * multiplier, mass.massExponent);
        this.massSum.add(num);
    }

    updateSumText()
    {
        let roundedMass = new SciNotNumber(this.massSum.coefficient, this.massSum.exponent);
        roundedMass.coefficient = roundedMass.coefficient.toFixed(2);
        let isZero = roundedMass.coefficient <= 0 || roundedMass.exponent < 5; //deal with imprecision by throwing out lower numbers
        this.numberSpan.textContent = isZero ? "0" : `${roundedMass.coefficient}x10`;
        this.superscript.textContent = isZero ? "" : "" + roundedMass.exponent;
    }
    //addMass = (mass) => this.massSum.add(new SciNotNumber(mass.))
}

class SciNotNumber 
{
    constructor(coefficient, exponent)
    {
        this.coefficient = coefficient;
        this.exponent = exponent;
    }

    toString = () => `${this.coefficient}x10^${this.exponent}`;

    add(sciNotNumber)
    {
        let {coefficient: otherCoefficient, exponent: otherExponent} = sciNotNumber;

        let incrementor = this.exponent < otherExponent ? -1 : 1;
        let multiplier = this.exponent < otherExponent ? 10 : 0.1;
        while (this.exponent != otherExponent)
        {
            otherExponent += incrementor;
            otherCoefficient *= multiplier;
        }
    
        this.coefficient += otherCoefficient;
        while (this.coefficient > 10)
        {
            this.coefficient /= 10;
            this.exponent++;
        }
        let safety = 0;
        while (this.coefficient > 0 && this.coefficient < 1 && safety < 9999)
        {
            this.coefficient *= 10;
            this.exponent--;
            safety++;
        }
        if (safety === 9999) { console.log("ERROR: Runaway loop"); }
    }
}
//#endregion
//#region Variables & Constants
const collectionMain = new Collection("collection-main");
const collectionFavorites = new Collection("collection-favorites");
const collectionMainSort = document.querySelector("#collectionMainSort");
const collectionFavSort = document.querySelector("#collectionFavSort");
const cardObjects = new Map();
//#endregion
//#region Execution
fetch("https://api.le-systeme-solaire.net/rest/bodies?filter[]=bodyType,eq,asteroid&filter[]=meanRadius,gt,0").then(response => response.json()).then(data => {
    document.querySelector("#loading-spinner").style.display = "none";
    buildCollectionMain(data);
});
collectionMainSort.addEventListener("click", () => {
    collectionMain.invertSortSetting();
    sortCollection(collectionMain);
});
collectionFavSort.addEventListener("click", () => {
    collectionFavorites.invertSortSetting();
    sortCollection(collectionFavorites);
});
//endregion
//#region Functions
function buildCollectionMain(data)
{
    for (let ast of data.bodies)
    {
        let builtEntry = buildEntry(ast);
        collectionMain.listDiv.appendChild(builtEntry);
        cardObjects.set(builtEntry, ast);
        collectionMain.addMass(ast.mass);
        //collectionMain.asteroids.push(ast);
    }
    collectionMain.updateSumText();
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
    let asteroidCard = clickEvent.target;
    asteroidCard.classList.remove("transition");
    let prevParent = asteroidCard.parentElement;
    let prevParentCollection = prevParent === collectionMain.listDiv ? collectionMain : collectionFavorites;
    let newParentCollection = prevParent === collectionMain.listDiv ? collectionFavorites : collectionMain;
    let startRect = asteroidCard.getBoundingClientRect();
    newParentCollection.listDiv.appendChild(asteroidCard)
    sortCollection(newParentCollection);
    let astObject = cardObjects.get(asteroidCard);
    let astMass = astObject.mass;
    prevParentCollection.addMass(astMass, -1);
    prevParentCollection.updateSumText();
    newParentCollection.addMass(astMass);
    newParentCollection.updateSumText();
    let endRect = asteroidCard.getBoundingClientRect();
    let differenceX = startRect.x - endRect.x;
    let differenceY = startRect.y - endRect.y;
    asteroidCard.style.transform = `translate(${differenceX}px, ${differenceY}px)`;
    setTimeout(() => {
        asteroidCard.classList.add("transition");
        asteroidCard.style.transform = "translate(0)";
    }, 1);
}

function updateSums()
{
    let mainSum = collectionMain.asteroids.reduce((accumulator, item) => {

    })
}

function sortCollection(targetCollection)
{
    let div = targetCollection.listDiv;
    let children = div.childNodes;
    let childrenArr = Array.from(children);
    let reverse = targetCollection.reverseSort;
    childrenArr.sort((a, b) => compareStrings(a.dataset.astName, b.dataset.astName, reverse));
    for (let child of childrenArr)
    {
        div.appendChild(child);
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