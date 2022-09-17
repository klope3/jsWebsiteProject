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

const objects = 
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
const testItem = document.querySelector("#test-item");
const items = document.querySelectorAll(".item");
const collectionMain = document.querySelector("#collection-main");
const collectionFavorites = document.querySelector("#collection-favorites");
const rect = testItem.getBoundingClientRect();

for (let item of items)
{
    item.addEventListener("click", clickEvent => moveClickedItem(clickEvent));
}



buildCollection();

function buildCollection()
{
    for (let obj of objects)
    {

    }
}

function buildItem(fakeObject)
{

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