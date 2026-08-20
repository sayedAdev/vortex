let sdk = null;

// تهيئة ديسكورد SDK
document.addEventListener('DOMContentLoaded', () => {
    try {
        if (typeof DiscordSDK !== 'undefined') {
            const clientId = document.body.getAttribute('data-client-id');
            if (clientId) {
                sdk = new DiscordSDK(clientId);
                sdk.ready().then(() => {
                    console.log("Discord SDK is ready!");
                });
            }
        }
    } catch (e) { 
        console.error("SDK Init Error:", e); 
    }

    // ربط الزر بالدالة
    const watchBtn = document.getElementById('watchBtn');
    if (watchBtn) {
        watchBtn.addEventListener('click', () => {
            const url = watchBtn.getAttribute('data-url');
            if (sdk && sdk.commands) {
                sdk.commands.openExternalLink(url);
            } else {
                window.open(url, '_blank');
            }
        });
    }
});