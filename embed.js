/*
    Create the iFrame container for the walletconnect modal
*/
let container = document.createElement('iframe');
    container.setAttribute('src', 'http://localhost:4444');
    container.setAttribute('style', `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: none;
        z-index: 999999;
    `);

/*
    Look for the walletconnect button provided by the site
    and add click listener to the button.

    TODO: Auto-generate a branded button style.
*/
let button = document.getElementById('walletconnect');
    button.innerText = 'Pay with WalletConnect';
button.addEventListener('click', function() {
    document.body.appendChild(container);
    
    /* 
        Post a message to the modal requesting an the event
    */
    container.contentWindow.postMessage('requestModalEvent', "*");
});