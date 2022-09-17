//#region Classes
class FakeObject
{
    constructor(name, size, color, isPopular)
    {
        this.name = name;
        this.size = size;
        this.color = color;
        this.isPopular = isPopular;
    }
}
//#endregion
//#region Variables & Constants
const dataObjects = 
[
    new FakeObject("Item 1", "15", "Red", "No"),
    new FakeObject("Item 2", "132", "Green", "Yes"),
    new FakeObject("Item 3", "111", "Orange", "Yes"),
    new FakeObject("Item 4", "83", "Purple", "No"),
    new FakeObject("Item 5", "40", "Purple", "No"),
    new FakeObject("Item 6", "69", "Red", "Yes"),
    new FakeObject("Item 7", "12", "Black", "No"),
    new FakeObject("Item 8", "6", "Green", "No"),
];
const collectionMain = document.querySelector("#collection-main");
const collectionFavorites = document.querySelector("#collection-favorites");
const items = buildCollectionMain();
//#endregion
//#region Functions
function buildCollectionMain()
{
    let newItems = [];
    for (let obj of dataObjects)
    {
        let itemFromData = buildItem(obj);
        collectionMain.appendChild(itemFromData);
        newItems.push(itemFromData);
    }
    return newItems;
}

function buildItem(fakeObject)
{
    let itemDiv = document.createElement("div");
    itemDiv.classList.add("item");
    itemDiv.addEventListener("click", clickEvent => moveClickedItem(clickEvent));

    let h2 = document.createElement("h2");
    let h2Text = document.createTextNode(fakeObject.name);
    h2.appendChild(h2Text);
    itemDiv.appendChild(h2);

    let ul = document.createElement("ul");
    itemDiv.appendChild(ul);

    ul.appendChild(buildItemDataRow("Name:", fakeObject.name));
    ul.appendChild(buildItemDataRow("Size:", fakeObject.size));
    ul.appendChild(buildItemDataRow("Color:", fakeObject.color));
    ul.appendChild(buildItemDataRow("Is Popular:", fakeObject.isPopular));

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
    console.log("click");
    let target = clickEvent.target;
    target.classList.remove("transition");
    let curParent = target.parentElement;
    let newParent = curParent === collectionMain ? collectionFavorites : collectionMain;
    let startRect = target.getBoundingClientRect();
    newParent.appendChild(target)
    let endRect = target.getBoundingClientRect();
    let differenceX = startRect.x - endRect.x;
    let differenceY = startRect.y - endRect.y;
    target.style.transform = `translate(${differenceX}px, ${differenceY}px)`;
    setTimeout(() => {
        target.classList.add("transition");
        target.style.transform = "translate(0)";
    }, 1);
}
//#endregion