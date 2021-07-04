// remember to use the id symbol
const form = document.querySelector('#searchForm')

form.addEventListener('submit', function (e) {
    e.preventDefault();
    const searchTerm = form.elements.query.value.toLowerCase()
    const campgrounds = document.getElementsByClassName('campground')


    for (i = 0; i < campgrounds.length; i++) {
        if (!campgrounds[i].innerHTML.toLowerCase().includes(searchTerm)) {
            campgrounds[i].style.display = "none";
        }
        else {
            campgrounds[i].style.display = "list-item";
        }

    }
})
