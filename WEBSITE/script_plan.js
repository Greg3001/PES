const selectButtons = document.querySelectorAll('.select-button');

selectButtons.forEach(button => {
    button.addEventListener('click', function() {
        const plan = this.parentNode.querySelector('.plan-title').textContent;
        alert(`You have selected the ${plan} plan. Thank you for choosing NIMS!`);
        // In a real application, you would redirect to a checkout or sign-up page.
    });
});