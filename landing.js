const aquantCard = document.getElementById('aquantCard');
const kohlerCard = document.getElementById('kohlerCard');
const toast = document.getElementById('toast');

aquantCard.addEventListener('click', () => {
    // Premium transition feel
    aquantCard.style.transform = 'scale(0.98)';
    setTimeout(() => {
        window.location.href = 'dashboard.html?brand=aquant';
    }, 200);
});

kohlerCard.addEventListener('click', () => {
    kohlerCard.style.transform = 'scale(0.98)';
    setTimeout(() => {
        window.location.href = 'dashboard.html?brand=kohler';
    }, 200);
});

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
