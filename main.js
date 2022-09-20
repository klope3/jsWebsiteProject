//#region Classes
class Collection 
{
    constructor(listDivID)
    {
        //find elements, assign default values
        this.listDiv = document.querySelector(`#${listDivID}`);
        this.sumDiv = document.querySelector(`#${listDivID}-sum`);
        this.sortIcon = document.querySelector(`#${listDivID}-sort-icon`);
        this.massSum = new SciNotNumber(0, 0);
        this.totalEntries = 0;
        this.reverseSort = false;
        //create and setup elements for correctly formatted scientific notation
        this.numberSpan = document.createElement("span");
        this.superscript = document.createElement("sup");
        this.unitSpan = document.createElement("span");
        this.numberSpan.textContent = "0";
        this.unitSpan.textContent = " kg";
        this.sumDiv.appendChild(this.numberSpan);
        this.sumDiv.appendChild(this.superscript);
        this.sumDiv.appendChild(this.unitSpan);
    }

    invertSortSetting = () => {
        this.reverseSort = !this.reverseSort
        this.updateSortIcon();
    };

    updateSortIcon()
    {
        let normalIconClass = "fa-arrow-down-a-z";
        let reversedIconClass = "fa-arrow-down-z-a";
        let classToAdd = this.reverseSort ? reversedIconClass : normalIconClass;
        this.sortIcon.classList.remove(normalIconClass);
        this.sortIcon.classList.remove(reversedIconClass);
        this.sortIcon.classList.add(classToAdd);
    }

    addMass(mass, multiplier = 1)
    {
        if (mass === null) { return; }
        let num = new SciNotNumber(mass.massValue * multiplier, mass.massExponent);
        this.totalEntries += multiplier; //multiplier should only ever be 1 or -1
        this.massSum.add(num);
    }

    updateSumText()
    {
        let roundedMass = new SciNotNumber(this.massSum.coefficient, this.massSum.exponent);
        roundedMass.coefficient = roundedMass.coefficient.toFixed(2);
        let isZero = this.totalEntries === 0;
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
        //convert other number so it has the same exponent
        let incrementor = this.exponent < otherExponent ? -1 : 1;
        let multiplier = this.exponent < otherExponent ? 10 : 0.1;
        while (this.exponent != otherExponent)
        {
            otherExponent += incrementor;
            otherCoefficient *= multiplier;
        }
    
        this.coefficient += otherCoefficient;
        //convert result to correct sci. not. form (coefficient within range 1-10)
        while (this.coefficient > 10)
        {
            this.coefficient /= 10;
            this.exponent++;
        }
        while (this.coefficient > 0 && this.coefficient < 1)
        {
            this.coefficient *= 10;
            this.exponent--;
        }
    }
}
//#endregion
//#region Variables & Constants
const collectionMain = new Collection("collection-main");
const collectionFavorites = new Collection("collection-favorites");
const collectionMainSort = document.querySelector("#collection-main-sort");
const collectionFavSort = document.querySelector("#collection-fav-sort");
const cardObjects = new Map();
//#endregion
//#region Execution
fetch("https://api.le-systeme-solaire.net/rest/bodies?filter[]=bodyType,eq,asteroid&filter[]=meanRadius,gt,0").then(response => response.json()).then(data => {
    document.querySelector("#loading-spinner").style.display = "none";
    buildCollectionMain(data);
});

setupSortButtonFor(collectionMain);
setupSortButtonFor(collectionFavorites);
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
    //create card heading using lightly edited name of asteroid
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
    //not sure why some asteroids have null mass, but it has to be accounted for
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

function setupSortButtonFor(collection)
{
    let sortButton = collection === collectionMain ? collectionMainSort : collectionFavSort;
    sortButton.addEventListener("click", () => {
        collection.invertSortSetting();
        sortCollection(collection);
    });
}

function moveClickedItem(clickEvent)
{
    let clickedCard = clickEvent.target;
    let prevParent = clickedCard.parentElement;
    let prevParentCollection = prevParent === collectionMain.listDiv ? collectionMain : collectionFavorites;
    let newParentCollection = prevParent === collectionMain.listDiv ? collectionFavorites : collectionMain;
    let startRect = clickedCard.getBoundingClientRect(); //get screen position of card BEFORE changing parent
    newParentCollection.listDiv.appendChild(clickedCard)
    sortCollection(newParentCollection);
    updateCollectionMasses(clickedCard, prevParentCollection, newParentCollection);
    doCardMoveAnimation(clickedCard, startRect);
}

function updateCollectionMasses(clickedCard, prevParentCollection, newParentCollection)
{
    let astObject = cardObjects.get(clickedCard);
    let astMass = astObject.mass;
    prevParentCollection.addMass(astMass, -1);
    prevParentCollection.updateSumText();
    newParentCollection.addMass(astMass);
    newParentCollection.updateSumText();
}

function doCardMoveAnimation(clickedCard, startRect)
{
    let endRect = clickedCard.getBoundingClientRect();
    let differenceX = startRect.x - endRect.x;
    let differenceY = startRect.y - endRect.y;
    //snap card instantly to a specific offset from new parent, so it looks like it hasn't moved yet
    clickedCard.classList.remove("transition");
    clickedCard.style.transform = `translate(${differenceX}px, ${differenceY}px)`;
    //wait 1 millisecond for translate to take effect, then reapply transition class, allowing animation to play
    setTimeout(() => {
        clickedCard.classList.add("transition");
        clickedCard.style.transform = "translate(0)";
    }, 1);
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

//utility function for alphabetical sorting
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