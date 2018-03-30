import './scripts/slider';

const modal       = document.getElementById('modal');
const closeButton = document.getElementById('close-button');

/*
    MODAL CONTROLS
*/
function toggleModal() {
    modal.classList.toggle('show-modal');
}
function showModal() {
    modal.classList.add('show-modal');
}
function closeModal() {
    modal.classList.remove('show-modal');

    // TODO: Fix erros thrown here
    modal.addEventListener("transitionend", function() {
        window.parent.postMessage({ 
            modalState: 'dismissed' 
        }, '*');
    });
}
function maskOnClick(event) {
    if (event.target === modal) closeModal();
}

closeButton.addEventListener('click', closeModal);
window.addEventListener('click', maskOnClick);


/*
    MESSAGE RECEIVER
*/
window.addEventListener('message', function(e) {
    if (e.data.showModal) showModal();
});

/*
    MESSAGE SENDER
*/
window.parent.postMessage({ readyState: 'ready' }, '*');