class WalletConnect {
    constructor(config) {
        this.client_id = config.client_id
    }
    init() {
        /*
            Create the iFrame container for the walletconnect modal
        */
        let container = document.createElement('iframe');
        container.setAttribute('src', 'http://localhost:4444');
        container.setAttribute('allowtransparency', true);
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
            container.contentWindow.postMessage('TEST POST MESSAGE', "*");
        });

        /*
            TEMP MESSAGE STUFF
        */
        window.addEventListener('message', function(e) {
            console.log('Got a message', e);
            e.source.window.postMessage('Hi there, nice to meet you', '*');
        });
    }
}
window.WalletConnect = WalletConnect;