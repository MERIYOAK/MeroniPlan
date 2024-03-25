
document.querySelectorAll('input[type="checkbox"][name="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('click', function () {
        const element = this.nextElementSibling;
        this.classList.toggle('checkedbox');
        element.classList.toggle('checked');
    });
});

// Function to toggle the mobile menu
function toggleMenu() {
    var menuItem = document.querySelector('.links');
    menuItem.classList.toggle('show-menu');

}







